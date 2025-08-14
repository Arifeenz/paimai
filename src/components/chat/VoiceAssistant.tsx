import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mic, MicOff, Send, X, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useItinerary } from "@/contexts/ItineraryContext";
import { supabase } from "@/lib/supabase";

/** Types */
interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  searchResults?: SearchResults;
  isTyping?: boolean;
}
interface SearchResults {
  destinations: any[];
  activities: any[];
  hotels: any[];
  places: any[];
  restaurants: any[];
}

/** OpenAI config (แนะนำย้ายไปฝั่ง server ในโปรดักชัน) */
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/** กันค้างเวลารอ API นานเกินไป */
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/** ส่งประวัติให้โมเดลเท่าที่พอ */
const MAX_HISTORY_SENT = 8;

/** คีย์เวิร์ดแบบง่าย ๆ เอาไว้เดาว่า “ผู้ใช้กำลังขอคำแนะนำ” ไหม */
const RECO_KEYWORDS = [
  "แนะนำ",
  "recommend",
  "ไปไหนดี",
  "ที่เที่ยว",
  "เที่ยว",
  "กิจกรรม",
  "โรงแรม",
  "ที่พัก",
  "ร้านอาหาร",
  "กินอะไร",
  "ที่ไหน",
  "plan",
  "itinerary",
  "hotel",
  "activity",
  "restaurant",
  "place",
  "destination",
];

/** system prompt: ผู้เชี่ยวชาญด้านท่องเที่ยว */
const systemPrompt = `
คุณคือผู้เชี่ยวชาญด้านการท่องเที่ยว พูดไทยเป็นหลัก (คุยอังกฤษได้เมื่อผู้ใช้เริ่มก่อน)
โทน: เป็นมิตร สุภาพ กระชับ เข้าใจง่าย เหมือนเพื่อนที่เก่งเรื่องทริป

หน้าที่:
- คุยเล่น/ทักทาย/เก็บบริบทความชอบได้เป็นธรรมชาติ
- เมื่อให้ "คำแนะนำ" เกี่ยวกับสถานที่/กิจกรรม/โรงแรม/ร้านอาหาร:
  • อ้างอิงจากข้อมูลฐาน (ที่จะถูกแนบให้) เป็นหลัก
  • ถ้าข้อมูลฐานไม่พอ ให้ถามต่อเพื่อจำกัดโจทย์ (เมือง/วันที่/งบ/สไตล์) หรือบอกว่าไม่พบในฐาน
  • ห้ามเดามั่ว/แต่งข้อมูลที่ไม่อยู่ในฐาน

การนำเสนอ:
- สรุปเป็นหัวข้อสั้น ๆ อ่านเร็ว (เช่น bullet/ลำดับ)
- ใส่เหตุผล/จุดเด่นสั้น ๆ หากเหมาะสม
`.trim();

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const navigate = useNavigate();
  const { addItemToItinerary } = useItinerary();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Speech recognition */
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "th-TH"; // ใช้ทีละภาษา
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleChat(transcript);
      };
      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description:
            event.error === "network"
              ? "ตรวจอินเทอร์เน็ต/ใช้ https หรือ localhost และอนุญาตไมค์"
              : "โปรดลองใหม่หรือพิมพ์แทนครับ",
          variant: "destructive",
        });
      };
      setRecognition(rec);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ค้น Supabase แบบ keyword */
  const searchSupabaseData = async (query: string): Promise<SearchResults> => {
    try {
      const [
        { data: destinations },
        { data: activities },
        { data: hotels },
        { data: places },
        { data: restaurants },
      ] = await Promise.all([
        supabase
          .from("destinations")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,country.ilike.%${query}%`)
          .limit(6),
        supabase
          .from("activities")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(6),
        supabase
          .from("hotels")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(6),
        supabase
          .from("places")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(6),
        supabase
          .from("restaurants")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(6),
      ]);
      return {
        destinations: destinations || [],
        activities: activities || [],
        hotels: hotels || [],
        places: places || [],
        restaurants: restaurants || [],
      };
    } catch (e) {
      console.error("Supabase search error:", e);
      return { destinations: [], activities: [], hotels: [], places: [], restaurants: [] };
    }
  };

  /** helper: ตรวจเจตนาขอแนะนำ */
  function isRecommendationIntent(text: string) {
    const t = text.toLowerCase();
    return RECO_KEYWORDS.some((k) => t.includes(k.toLowerCase()));
  }

  /** รวม messages: system(ผู้เชี่ยวชาญ) → history → user → system(db context + ALLOWED_NAMES) */
  function buildMessagesForModel(history: Message[], userMessage: string, searchResults: SearchResults | null) {
    const historyForModel = history.slice(-MAX_HISTORY_SENT).map((m) => ({ role: m.type, content: m.content }));

    // ALLOWED รายชื่อที่อนุญาตให้กล่าวถึง
    const ALLOWED = searchResults
      ? {
          destinations: searchResults.destinations?.map((d) => d.name) ?? [],
          activities: searchResults.activities?.map((a) => a.name) ?? [],
          hotels: searchResults.hotels?.map((h) => h.name) ?? [],
          places: searchResults.places?.map((p) => p.name) ?? [],
          restaurants: searchResults.restaurants?.map((r) => r.name) ?? [],
        }
      : null;

    const dbContextMsg =
      searchResults &&
      ({
        role: "system",
        content:
          [
            "ข้อมูลที่เกี่ยวข้องจากฐาน (JSON แบบย่อ):",
            JSON.stringify(
              {
                destinations: searchResults.destinations?.map((d) => ({ id: d.id, name: d.name, country: d.country })),
                activities: searchResults.activities?.map((a) => ({ id: a.id, name: a.name })),
                hotels: searchResults.hotels?.map((h) => ({ id: h.id, name: h.name })),
                places: searchResults.places?.map((p) => ({ id: p.id, name: p.name })),
                restaurants: searchResults.restaurants?.map((r) => ({ id: r.id, name: r.name })),
              },
              null,
              0
            ),
            "",
            "ALLOWED_NAMES (รายชื่อที่อนุญาตให้กล่าวถึงเท่านั้น):",
            JSON.stringify(ALLOWED),
            "",
            "ข้อกำชับเข้มงวด:",
            "- ห้ามกล่าวถึงชื่อสถานที่/ที่พัก/กิจกรรม/ร้านอาหารที่ไม่อยู่ใน ALLOWED_NAMES",
            '- หากไม่มีชื่อที่ตรง ให้ตอบว่า "ไม่พบในฐานข้อมูล" และ/หรือถามต่อเพื่อจำกัดโจทย์',
            "- ห้ามเดา/ห้ามแต่งข้อมูลใหม่",
          ].join("\n"),
      } as const);

    return [{ role: "system", content: systemPrompt }, ...historyForModel, { role: "user", content: userMessage }, ...(dbContextMsg ? [dbContextMsg] : [])];
  }

  /** เรียก OpenAI ด้วย messages ทั้งก้อน */
  const callOpenAI = async (fullMessages: { role: string; content: string }[]) => {
    if (!OPENAI_API_KEY) {
      toast({
        title: "Missing OpenAI API key",
        description: "โปรดตั้งค่า VITE_OPENAI_API_KEY ใน .env.local แล้วรันใหม่",
        variant: "destructive",
      });
      throw new Error("Missing OPENAI API key");
    }
    const res = await fetchWithTimeout(
      OPENAI_API_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: fullMessages,
          max_tokens: 600,
          temperature: 0.2, // เคร่งขึ้น ลดการเผลอเดา
        }),
      },
      20000
    );
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "…";
  };

  /** แชทหลัก—มี Guard 3 ชั้น */
  const handleChat = async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), type: "user", content: userInput, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const typingId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: typingId, type: "assistant", content: "", timestamp: new Date(), isTyping: true }]);

    try {
      const recoIntent = isRecommendationIntent(userInput);

      // 1) ค้นฐานก่อน
      const searchResults = await searchSupabaseData(userInput);
      const total =
        (searchResults.destinations?.length ?? 0) +
        (searchResults.activities?.length ?? 0) +
        (searchResults.hotels?.length ?? 0) +
        (searchResults.places?.length ?? 0) +
        (searchResults.restaurants?.length ?? 0);

      // 2) Guard เข้ม: ถ้าเป็นคำขอแนะนำ แต่ฐาน "ว่าง" → ไม่เรียก LLM
      if (recoIntent && total === 0) {
        setMessages((prev) => prev.filter((m) => !m.isTyping));
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: "assistant",
            content:
              "ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูลนะครับ ลองระบุเพิ่มได้ไหม เช่น เมือง/ช่วงเวลา/งบประมาณ/สไตล์ที่ต้องการ แล้วผมจะค้นหาให้อีกครั้ง",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // 3) ประกอบ messages แล้วเรียก LLM
      const fullMessages = buildMessagesForModel(messages, userInput, total > 0 ? searchResults : null);
      const aiResponse = await callOpenAI(fullMessages);

      // 4) อัปเดต UI (แนบการ์ดเฉพาะตอนมีผลฐาน)
      setMessages((prev) => prev.filter((m) => !m.isTyping));
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "assistant",
          content: aiResponse,
          timestamp: new Date(),
          searchResults: total > 0 ? searchResults : undefined,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => prev.filter((m) => !m.isTyping));
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "assistant",
          content: "ขอโทษครับ เกิดข้อผิดพลาดในการประมวลผล ลองใหม่อีกครั้งได้นะครับ 😅",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Voice controls */
  const startListening = () => {
    if (!recognition) {
      toast({ title: "Voice not supported", description: "เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง", variant: "destructive" });
      return;
    }
    try {
      recognition.abort?.();
    } catch {}
    setIsListening(true);
    recognition.start();
  };
  const stopListening = () => {
    try {
      recognition?.stop();
    } catch {}
    setIsListening(false);
  };

  /** Submit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleChat(inputValue);
  };

  /** Add to itinerary */
  const addToItinerary = (item: any, type: string) => {
    addItemToItinerary(item, type, 1);
    toast({ title: "เพิ่มลงในแผนการเดินทางแล้ว", description: `${item.name} ถูกเพิ่มลงในแผนการเดินทางของคุณแล้ว` });
    setTimeout(() => navigate("/plan"), 1000);
  };

  /** Result card */
  const renderResultCard = (item: any, type: string) => (
    <Card key={`${type}-${item.id}`} className="mb-3 travel-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <Badge variant="outline" className="text-xs">{type}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {item.description || `${type} in ${item.destination?.name || item.country || ""}`}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {item.destination?.name || item.country}
            {item.price && <span className="ml-2 font-semibold">${item.price}</span>}
          </div>
          <Button size="sm" variant="outline" onClick={() => addToItinerary(item, type)} className="h-6 px-2 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            เพิ่ม
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  /** UI */
  if (!isOpen) {
    return (
      <Button className="floating-action w-14 h-14" onClick={() => setIsOpen(true)}>
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-end p-4">
      <Card className="w-full md:w-96 h-[80vh] md:h-[600px] md:mr-4 md:mb-4 flex flex-col">
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">🤖 AI Travel Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-2">สวัสดีครับ! ผมเป็นผู้เชี่ยวชาญด้านท่องเที่ยว คุยเล่นก็ได้ หรือขอคำแนะนำก็ได้เลย ✈️</p>
              <p className="text-xs">เวลาแนะนำ ผมจะอิงข้อมูลจากฐานที่มีให้ก่อนเสมอครับ</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.isTyping ? (
                    <div className="flex items-center space-x-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังคิด...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>

              {message.searchResults && (
                <div className="mt-3 ml-4">
                  {message.searchResults.destinations.map((item) => renderResultCard(item, "destination"))}
                  {message.searchResults.activities.map((item) => renderResultCard(item, "activity"))}
                  {message.searchResults.hotels.map((item) => renderResultCard(item, "hotel"))}
                  {message.searchResults.places.map((item) => renderResultCard(item, "place"))}
                  {message.searchResults.restaurants.map((item) => renderResultCard(item, "restaurant"))}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='คุยกับผมได้เลย เช่น “แนะนำที่เที่ยวในยะลา/เบตง งบ 3 พัน ไป 2 วัน 1 คืน”'
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className="w-full"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    หยุดบันทึกเสียง
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    🎤 พูดกับ AI
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
