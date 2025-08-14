// Deno runtime (Edge Function)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- ENV ----------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---------- UTILS ----------
function corsHeaders(origin: string | null) {
  const allow =
    origin &&
    (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))
      ? origin
      : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  };
}

function badRequest(body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status: 400,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
function serverError(body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status: 500,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
function ok(body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// ---------- SUPABASE SERVER CLIENT ----------
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------- HANDLER ----------
Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? null;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  try {
    const body = await req.json();
    // ฟรอนต์ส่ง: province, startDate, endDate, travelStyle, budget
    const { province, startDate, endDate, travelStyle, budget } = body || {};

    if (!province || !startDate || !endDate || !travelStyle || !budget) {
      return badRequest({ error: "Missing input" }, origin);
    }

    // ดึงสถานที่จากตาราง places ตามจังหวัด
    const { data: places, error: placesErr } = await supabase
      .from("places")
      .select("*")
      .eq("province", province);

    if (placesErr) {
      console.error("❌ Supabase Error:", placesErr);
      return serverError({ error: "Failed to fetch places" }, origin);
    }

    const placeList =
      places?.map((p: any) => p.name).join(", ") || "ไม่มีข้อมูลสถานที่";

    const prompt = `
คุณเป็นไกด์ท่องเที่ยว AI ผู้เชี่ยวชาญ
โปรดวางแผนเที่ยวจังหวัด ${province} ตั้งแต่วันที่ ${startDate} ถึง ${endDate}
สำหรับสไตล์ "${travelStyle}" งบประมาณ: ${budget} บาท/วัน
สถานที่ที่สามารถเลือกได้: ${placeList}

กรุณาวางแผนรายวัน เช่น:
วันที่ 1:
- สถานที่...
- เวลา...
- คำแนะนำ...
วันที่ 2:
- ...
ให้มีเวลาโดยประมาณ การเดินทางระหว่างจุด และคำแนะนำร้านอาหารท้องถิ่น
`;

    // เรียก OpenAI ด้วย fetch (Deno)
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("❌ OpenAI Error:", text);
      return serverError({ error: "AI generation failed", detail: text }, origin);
    }

    const aiJson = await aiRes.json();
    const plan = aiJson?.choices?.[0]?.message?.content ?? "ไม่สามารถสร้างแผนได้";

    return ok({ plan }, origin);
  } catch (e) {
    console.error("❌ Unexpected Error:", e);
    return serverError({ error: "Unexpected error", detail: String(e) }, origin);
  }
});
