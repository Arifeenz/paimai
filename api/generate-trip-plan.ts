import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// 🔁 เปลี่ยนจาก edge → nodejs เพื่อให้ใช้ OpenAI SDK ได้
export const config = {
  runtime: 'nodejs',
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const body = await req.json()
  const { province, startDate, endDate, style, budget } = body

  if (!province || !startDate || !endDate || !style || !budget) {
    return new Response(JSON.stringify({ error: 'Missing input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { data: places, error } = await supabase
    .from('places')
    .select('*')
    .eq('province', province)

  if (error) {
    console.error('Supabase Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch places' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const placeList = places?.map(p => p.name).join(', ') || 'ไม่มีข้อมูลสถานที่'

  const prompt = `
คุณเป็นไกด์ท่องเที่ยว AI ผู้เชี่ยวชาญ
โปรดวางแผนเที่ยวจังหวัด ${province} ตั้งแต่วันที่ ${startDate} ถึง ${endDate}
สำหรับกลุ่ม "${style}" งบประมาณ: ${budget} บาท/วัน
สถานที่ที่สามารถเลือกได้: ${placeList}

ช่วยวางแผนรายวันให้เลย เช่น:
วันที่ 1:
- สถานที่...
- เวลา...
- คำแนะนำ...
วันที่ 2: ...
`

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  let aiPlan = '';
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    })
    aiPlan = completion.choices[0].message.content || ''
  } catch (err) {
    console.error("❌ OpenAI error:", err)
    return new Response(JSON.stringify({ error: "AI generation failed" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ plan: aiPlan }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
