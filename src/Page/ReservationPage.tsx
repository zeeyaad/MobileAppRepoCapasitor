import React, { useState, useCallback, useEffect } from "react";
import { generateId } from "../utils/id";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/use-toast";

import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../Component/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/StaffPagesComponents/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../Component/StaffPagesComponents/ui/popover";
import { Loader2, CalendarCheck, Clock, Lock } from "lucide-react";

// --- Types ---
interface ApiField {
  id: string;
  name?: string;
  name_ar?: string;
  name_en?: string;
  sport_id?: number;
  status?: string;
  is_active?: boolean;
}

interface ApiBookableSport {
  sport_id: number;
  sport_name_ar?: string;
  sport_name_en?: string;
  fields: ApiField[];
}

interface ApiCalendarSlot {
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "training" | "blocked";
  actual_booking_start?: string;
  actual_booking_end?: string;
}

interface ApiCalendarDay {
  date: string;
  slots: ApiCalendarSlot[];
}

type Booking = {
  id: string;
  courtId: string;
  date: string;
  from: string;
  to: string;
  status: string;
};

// --- Helpers ---
function toArabicNumerals(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

function formatHour(slot: string): string {
  const h = parseInt(slot.split(":")[0], 10);
  const suffix = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${toArabicNumerals(h12)}${suffix}`;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDisplayDate(date: Date): string {
  return `${toArabicNumerals(date.getDate())} ${AR_MONTHS[date.getMonth()]}`;
}

function dayOfWeekLabel(date: Date): string {
  return AR_DAYS[date.getDay()];
}

const HOUR_SLOTS: string[] = Array.from({ length: 17 }, (_, i) => {
  const h = 6 + i;
  return `${String(h).padStart(2, "0")}:00`;
});

const TIME_OPTIONS: { value: string; label: string }[] = Array.from({ length: 36 }, (_, i) => {
  const totalMins = 360 + i * 30; // Starts at 06:00
  const h24 = Math.floor(totalMins / 60);
  const min = totalMins % 60;
  const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  const period = h24 < 12 ? "ص" : "م";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const label = `${h12}:${String(min).padStart(2, "0")} ${period}`;
  return { value, label };
});

const hasConflict = (
  bookings: Booking[],
  date: string,
  from: string,
  to: string
): boolean => {
  return bookings.some(
    (b) =>
      b.date === date &&
      b.status !== "available" &&
      b.status !== "cancelled" &&
      b.from < to &&
      b.to > from
  );
};

function addMinutesStr(timeStr: string, minutes: number): string {
  const total = timeToMinutes(timeStr) + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

// --- TimePicker Component ---
function TimeSlotPicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = TIME_OPTIONS.find((t) => t.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all shadow-sm w-full outline-none
                        ${selected
              ? "border-[#0b2f8f] bg-[#0b2f8f] text-white"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
        >
          <Clock className="h-4 w-4 shrink-0" />
          {selected ? selected.label : <span className="opacity-60">{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[17rem] p-4 rounded-2xl" align="start" side="bottom" dir="ltr">
        <div className="grid grid-cols-3 gap-2 max-h-[16rem] overflow-y-auto">
          {TIME_OPTIONS.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => { onChange(slot.value); setOpen(false); }}
              className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all
                                ${slot.value === value
                  ? "border-[#0b2f8f] bg-[#0b2f8f] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-[#0b2f8f] hover:text-white"
                }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Main Page ---
export default function ReservationPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // The calendar always shows 7 days starting from Today for members
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [sports, setSports] = useState<ApiBookableSport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);

  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");

  const [calendarLoading, setCalendarLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: "", from: "", to: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Sports
  const fetchCourts = useCallback(async () => {
    setSportsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: ApiBookableSport[] }>("/members/bookings/sports");
      const data = (Array.isArray(res?.data?.data) ? res.data.data : []).filter(s => s.fields && s.fields.length > 0);
      setSports(data);
      if (data.length > 0) {
        const firstSport = data[0];
        setSelectedSportId(String(firstSport.sport_id));
        const activeFields = firstSport.fields.filter(f => f.status === "active" || f.is_active !== false);
        if (activeFields.length > 0) {
          setSelectedFieldId(activeFields[0].id);
        }
      }
    } catch (err) {
      toast({ title: "فشل", description: "تعذر تحميل الأنشطة المتاحة", variant: "destructive" });
    } finally {
      setSportsLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchCourts(); }, [fetchCourts]);

  // Handle Sport Change -> Reset Field
  useEffect(() => {
    if (!sportsLoading && selectedSportId) {
      const sport = sports.find(s => String(s.sport_id) === selectedSportId);
      if (sport) {
        const activeFields = sport.fields.filter(f => f.status === "active" || f.is_active !== false);
        if (!activeFields.find(f => f.id === selectedFieldId)) {
          setSelectedFieldId(activeFields[0]?.id || "");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSportId, sportsLoading, sports]);

  // Fetch Calendar
  const fetchCalendar = useCallback(async () => {
    if (!selectedFieldId) {
      setBookings([]);
      return;
    }
    setCalendarLoading(true);
    const end = addDays(today, 6);
    const startStr = toISODate(today);
    const endStr = toISODate(end);

    try {
      const res = await api.get<{ success: boolean; data: { days: ApiCalendarDay[] } }>(
        `/members/bookings/fields/${selectedFieldId}/calendar`,
        { params: { start_date: startStr, end_date: endStr } }
      );
      const days = res?.data?.data?.days ?? [];
      const raw: Booking[] = [];
      for (const day of days) {
        for (const slot of day.slots) {
          if (slot.status !== "available") { // available times implicitly empty
            const fromTime = slot.actual_booking_start ? slot.actual_booking_start.slice(0, 5) : slot.start_time.slice(0, 5);
            const toTime = slot.actual_booking_end ? slot.actual_booking_end.slice(0, 5) : slot.end_time.slice(0, 5);
            raw.push({
              id: generateId(), // Uniquely tracking blocks for display
              courtId: selectedFieldId,
              date: day.date.split("T")[0], // YYYY-MM-DD
              from: fromTime,
              to: toTime,
              status: slot.status,
            });
          }
        }
      }

      setBookings(raw);

    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : '';
      if (!m.toLowerCase().includes('not available')) {
        toast({ title: "فشل", description: "تعذر تحميل توافر الملعب", variant: "destructive" });
      }
      setBookings([]);
    } finally {
      setCalendarLoading(false);
    }
  }, [selectedFieldId, today, toast]);

  useEffect(() => { void fetchCalendar(); }, [fetchCalendar]);

  // Derived Data
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const activeSport = sports.find(s => String(s.sport_id) === selectedSportId);
  const activeFields = activeSport?.fields.filter(f => f.status === "active" || f.is_active !== false) || [];

  // Form Submit
  const handleSaveReservation = async () => {
    if (!bookingForm.date || !bookingForm.from || !bookingForm.to) {
      toast({ title: "بيانات ناقصة", description: "يرجى تحديد وقت البداية والنهاية للحجز.", variant: "destructive" });
      return;
    }
    if (bookingForm.from >= bookingForm.to) {
      toast({ title: "توقيت خاطئ", description: "وقت النهاية يجب أن يكون بعد وقت البداية.", variant: "destructive" });
      return;
    }

    // 30 min checks
    const fMins = timeToMinutes(bookingForm.from);
    const tMins = timeToMinutes(bookingForm.to);
    if (tMins - fMins < 30) {
      toast({ title: "مدة قصيرة", description: "الحد الأدنى لمدة الحجز هو 30 دقيقة.", variant: "destructive" });
      return;
    }

    if (hasConflict(bookings, bookingForm.date, bookingForm.from, bookingForm.to)) {
      toast({ title: "تعارض", description: "هذا الوقت محجوز أو غير متاح.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        memberId: user?.member_id,
        sport_id: Number(selectedSportId),
        field_id: selectedFieldId,
        start_time: `${bookingForm.date}T${bookingForm.from}:00`,
        end_time: `${bookingForm.date}T${bookingForm.to}:00`,
        expected_participants: 1,
      };

      await api.post("/members/bookings/book", payload);
      toast({ title: "تم حجز الملعب!", description: "تم طلب الحجز ويجب استكمال الدفع لتأكيده.", className: "bg-emerald-50 border-emerald-200 text-emerald-800" });
      setDialogOpen(false);
      void fetchCalendar(); // Refresh automatically
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string, message?: string } }, message?: string };
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "فشل تأكيد الحجز";
      toast({ title: "فشل إنشاء الحجز", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Open booking modal by clicking on grid cell
  const openBookingForSlot = (dateStr: string, slotTime: string) => {
    if (hasConflict(bookings, dateStr, slotTime, addMinutesStr(slotTime, 30))) {
      toast({ title: "العذر", description: "هذا الوقت غير متاح، يرجى اختيار وقت آخر.", variant: "destructive" });
      return;
    }
    setBookingForm({
      date: dateStr,
      from: slotTime,
      // default to 1 hour reserve
      to: addMinutesStr(slotTime, 60)
    });
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">حجز الملاعب</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          اختر الملاعب والأنشطة بكل سهولة بناءً على الأوقات المتاحة لهذا الأسبوع. الدقّة بنصف ساعة متاحة!
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-8">

        {/* Controls Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
          <div>
            <Label className="mb-3 block text-sm font-bold text-gray-700">النشاط الرياضي</Label>
            <Select value={selectedSportId} onValueChange={(v) => { setSelectedSportId(v); }}>
              <SelectTrigger className="w-full h-14 rounded-2xl border-gray-200 bg-white text-base shadow-sm">
                <SelectValue placeholder={sportsLoading ? "جاري التحميل..." : "اختر النشاط"} />
              </SelectTrigger>
              <SelectContent>
                {sports.map(s => (
                  <SelectItem key={s.sport_id} value={String(s.sport_id)}>
                    {s.sport_name_ar || s.sport_name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-3 block text-sm font-bold text-gray-700">الملعب / الصالة</Label>
            <Select value={selectedFieldId} onValueChange={setSelectedFieldId} disabled={!activeFields.length}>
              <SelectTrigger className="w-full h-14 rounded-2xl border-gray-200 bg-white text-base shadow-sm">
                <SelectValue placeholder={activeFields.length ? "اختر الملعب" : "لا توجد ملاعب نشطة"} />
              </SelectTrigger>
              <SelectContent>
                {activeFields.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name_ar || f.name_en || f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0 bg-[#0b2f8f]/5 px-4 py-2.5 rounded-2xl border border-[#0b2f8f]/10">
            <CalendarCheck className="h-5 w-5 text-[#0b2f8f]" />
            <h3 className="text-[15px] font-bold text-[#0b2f8f]">الأوقات المتاحة من (اليوم)</h3>
            {calendarLoading && <Loader2 className="h-4 w-4 animate-spin text-[#0b2f8f] mr-2" />}
          </div>

          <div className="flex items-center gap-5 text-[13px] font-semibold text-gray-500 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white border border-gray-300 shadow-inner"></span> متاح (اختر للبدء)</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></span> غير متاح</span>
          </div>
        </div>

        {/* Grid Calendar container */}
        <div className="relative rounded-3xl border border-gray-200 overflow-x-auto shadow-inner bg-gray-50 scrollbar-hide">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div className="grid border-b border-gray-200 bg-white sticky top-0 z-20" style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}>
              <div className="border-l border-gray-100 bg-gray-50" />
              {weekDays.map((day) => {
                const isToday = toISODate(day) === toISODate(today);
                return (
                  <div key={toISODate(day)} className={`py-4 px-1 text-center border-l border-gray-100 ${isToday ? "bg-[#0b2f8f]/5" : ""}`}>
                    <div className={`text-[15px] font-bold ${isToday ? "text-[#0b2f8f]" : "text-gray-700"}`}>{dayOfWeekLabel(day)}</div>
                    <div className={`text-xs font-medium mt-1 ${isToday ? "text-[#0b2f8f]/80" : "text-gray-500"}`}>
                      {formatDisplayDate(day)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div className="grid bg-white" style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}>
              {/* Time sidebar */}
              <div className="border-l border-gray-100 bg-white sticky right-0 z-10 shadow-[1px_0_5px_rgba(0,0,0,0.02)]">
                {HOUR_SLOTS.map((slot) => (
                  <div key={slot} className="flex items-start justify-center pt-2 border-b border-gray-100 text-[11px] font-bold text-gray-400" style={{ height: 60 }}>
                    {formatHour(slot)}
                  </div>
                ))}
              </div>

              {/* Days content */}
              {weekDays.map((day) => {
                const dateStr = toISODate(day);
                const dayBookings = bookings.filter(b => b.date === dateStr);
                const isToday = dateStr === toISODate(today);

                return (
                  <div key={dateStr} className={`relative border-l border-gray-100 ${isToday ? "bg-[#0b2f8f]/[0.02]" : "bg-white"}`} style={{ height: HOUR_SLOTS.length * 60 }}>

                    {/* Underlying clickable slots */}
                    {HOUR_SLOTS.map((slot, idx) => (
                      <div
                        key={idx}
                        className="border-b border-gray-100/70 hover:bg-[#0b2f8f]/10 cursor-pointer transition-colors relative group"
                        style={{ height: 60, boxSizing: "border-box" }}
                        onClick={() => openBookingForSlot(dateStr, slot)}
                      >
                        <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                          <span className="text-[11px] font-bold bg-[#0b2f8f] text-white px-3 py-1.5 rounded-lg shadow-md opacity-90 scale-animation">+ احجز هنا</span>
                        </div>
                      </div>
                    ))}

                    {/* Overlay blocks (Booked / Training / Blocked) */}
                    {dayBookings.map((b) => {
                      const fromMin = timeToMinutes(b.from);
                      const toMin = timeToMinutes(b.to);
                      const duration = toMin - fromMin;
                      // The grid starts at HOUR_SLOTS[0] i.e '06:00' -> 360mins
                      const topOffset = ((fromMin - 360) / 60) * 60;
                      const heightPx = (duration / 60) * 60;

                      return (
                        <div
                          key={b.id}
                          style={{ top: topOffset, height: heightPx }}
                          className="absolute left-1 right-1 rounded-xl bg-gray-200/95 border border-gray-300 flex items-center justify-center opacity-100 overflow-hidden shadow-sm z-10 cursor-not-allowed"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({ title: "مغلق", description: "الوقت محجوز مسبقاً ولا يمكن اختياره." });
                          }}
                        >
                          <span className="text-[11px] text-gray-500 font-bold whitespace-nowrap bg-white/60 px-2.5 py-1 rounded-full flex gap-1.5 items-center">
                            <Lock className="w-3.5 h-3.5" />
                            غير متاح
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl" dir="rtl">
          <DialogHeader className="p-7 pb-5 bg-gray-50 border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-900">تأكيد الحجز</DialogTitle>
            <DialogDescription className="text-[15px] font-medium text-gray-500 mt-2">
              اختر الوقت المناسب لك. (متاح الحجز بالنصف ساعة!)
            </DialogDescription>
          </DialogHeader>

          <div className="p-7 space-y-7">
            {/* Display Information */}
            <div className="bg-white border text-[15px] font-semibold border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">النشاط</span>
                <span className="text-gray-900">{activeSport?.sport_name_ar || activeSport?.sport_name_en}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">الملعب</span>
                <span className="text-[#0b2f8f] font-bold">{activeFields.find(f => f.id === selectedFieldId)?.name_ar}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-500">التاريخ</span>
                <span className="text-gray-900" dir="ltr">{bookingForm.date}</span>
              </div>
            </div>

            {/* Pickers */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <Label className="text-gray-700 font-bold text-sm">من الساعة</Label>
                <TimeSlotPicker
                  value={bookingForm.from}
                  onChange={(v) => setBookingForm(prev => ({ ...prev, from: v }))}
                  placeholder="وقت البداية"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-gray-700 font-bold text-sm">إلى الساعة</Label>
                <TimeSlotPicker
                  value={bookingForm.to}
                  onChange={(v) => setBookingForm(prev => ({ ...prev, to: v }))}
                  placeholder="وقت النهاية"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-7 pt-0 border-none bg-white gap-3 flex-row-reverse sm:justify-start">
            <Button
              className="bg-[#0b2f8f] hover:bg-[#08246b] text-white w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-[#0b2f8f]/20 transition-all hover:scale-[1.02]"
              onClick={handleSaveReservation}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "تقديم طلب الحجز"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl text-gray-600 border-gray-200 font-bold text-base hover:bg-gray-50"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
                .scale-animation {
                    animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
    </div>
  );
}
