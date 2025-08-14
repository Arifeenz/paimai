// ✅ Serverless (Node.js) API สำหรับ Vercel
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'

// ใช้ require() ไม่ได้ เพราะเป็น ESM ดังนั้นเขียนแบบนี้

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { province, startDate, endDate, style, budget } = req.body

  if (!province || !startDate || !endDate || !style || !budget) {
    return res.status(400).json({ error: 'Missing input' })
  }

  const { data: places, error } = await supabase
    .from('places')
    .select('*')
    .eq('province', province)

  if (error) {
    console.error('Supabase Error:', error)
    return res.status(500).json({ error: 'Failed to fetch places' })
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

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    })

    const aiPlan = completion.choices[0].message.content

    return res.status(200).json({ plan: aiPlan })
  } catch (err) {
    console.error("❌ OpenAI Error:", err)
    return res.status(500).json({ error: 'AI generation failed' })
  }
}
