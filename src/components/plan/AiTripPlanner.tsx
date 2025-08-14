import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

interface AiTripPlannerProps {
  onBack: () => void;
}

const AiTripPlanner = ({ onBack }: AiTripPlannerProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    province: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    travelStyle: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);

  const provinces = ["ยะลา"];

  const travelStyles = [
    { value: "adventure", label: language === "th" ? "ผจญภัย" : "Adventure" },
    {
      value: "relaxation",
      label: language === "th" ? "พักผ่อน" : "Relaxation",
    },
    { value: "cultural", label: language === "th" ? "วัฒนธรรม" : "Cultural" },
    { value: "family", label: language === "th" ? "ครอบครัว" : "Family" },
    { value: "romantic", label: language === "th" ? "โรแมนติก" : "Romantic" },
    { value: "foodie", label: language === "th" ? "ชิมอาหาร" : "Foodie" },
  ];

  const budgetRanges = [
    {
      value: "budget",
      label:
        language === "th"
          ? "ประหยัด (0-2,000 บาท/วัน)"
          : "Budget (0-2,000 THB/day)",
    },
    {
      value: "moderate",
      label:
        language === "th"
          ? "ปานกลาง (2,000-5,000 บาท/วัน)"
          : "Moderate (2,000-5,000 THB/day)",
    },
    {
      value: "luxury",
      label:
        language === "th"
          ? "หรูหรา (5,000+ บาท/วัน)"
          : "Luxury (5,000+ THB/day)",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.province ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.travelStyle ||
      !formData.budget
    ) {
      toast({
        title:
          language === "th"
            ? "กรุณากรอกข้อมูลให้ครบ"
            : "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-trip-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let result;

      try {
        result = await res.json(); // พยายาม parse เป็น JSON
      } catch (err) {
        const text = await res.text(); // ไม่ใช่ JSON → log ข้อความธรรมดา
        console.error("❌ Response is not valid JSON:", text);
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) {
        console.error("❌ Server returned error status:", result);
        throw new Error(result?.error || "Server Error");
      }

      toast({
        title:
          language === "th"
            ? "สร้างแผนการเดินทางสำเร็จ!"
            : "Trip plan generated successfully!",
        description:
          language === "th"
            ? "กำลังนำคุณไปยังแผน..."
            : "Redirecting to your trip plan...",
      });

      navigate("/plan", {
        state: {
          aiGenerated: true,
          tripData: {
            ...formData,
            plan: result.plan,
          },
        },
      });
    } catch (err) {
      console.error("❌ Error generating trip:", err);
      toast({
        title: language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred",
        description:
          language === "th"
            ? "ไม่สามารถสร้างแผนได้ กรุณาลองใหม่"
            : "Unable to generate trip plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // ✅ อยู่ท้ายสุดเหมือนเดิม
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="travel-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {language === "th" ? "วางแผนการเดินทางอัจฉริยะ" : "AI Trip Planner"}
          </CardTitle>
          <p className="text-muted-foreground">
            {language === "th"
              ? "กรุณาข้อมูลดำลำงเพื่อให้ AI สร้างแผนการเดินทางที่เหมาะกับคุณ"
              : "Provide your preferences and let AI create the perfect trip for you"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Province */}
            <div className="space-y-2">
              <Label>
                {language === "th"
                  ? "จังหวัดที่ต้องการเที่ยว"
                  : "Province to Visit"}
              </Label>
              <Select
                value={formData.province}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, province: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === "th" ? "เลือกจังหวัด" : "Select Province"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {language === "th" ? "วันเริ่มต้น" : "Start Date"}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP")
                      ) : (
                        <span>
                          {language === "th"
                            ? "เลือกวันเริ่มต้น"
                            : "Pick start date"}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, startDate: date }))
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{language === "th" ? "วันสิ้นสุด" : "End Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP")
                      ) : (
                        <span>
                          {language === "th"
                            ? "เลือกวันสิ้นสุด"
                            : "Pick end date"}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, endDate: date }))
                      }
                      disabled={(date) =>
                        formData.startDate ? date < formData.startDate : false
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <Label>
                {language === "th" ? "สไตล์การเดินทาง" : "Travel Style"}
              </Label>
              <Select
                value={formData.travelStyle}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, travelStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === "th"
                        ? "เลือกสไตล์การเดินทาง"
                        : "Select travel style"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {travelStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label>
                {language === "th" ? "งบประมาณ (ต่อคน)" : "Budget (per person)"}
              </Label>
              <Select
                value={formData.budget}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, budget: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === "th"
                        ? "เลือกงบประมาณ"
                        : "Select budget range"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((budget) => (
                    <SelectItem key={budget.value} value={budget.value}>
                      {budget.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                {language === "th" ? "ย้อนกลับ" : "Back"}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {language === "th" ? "กำลังสร้าง..." : "Generating..."}
                  </span>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-4 h-4" />
                    {language === "th"
                      ? "สร้างแผนการเดินทาง"
                      : "Generate Trip Plan"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiTripPlanner;
