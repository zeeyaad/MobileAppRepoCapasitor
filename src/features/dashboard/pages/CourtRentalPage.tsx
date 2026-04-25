import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { generateId } from "../../../utils/id";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import bookingService from "../../../services/bookingService";
import { useNavigate } from "react-router-dom";
import type { ToastType } from "../types";

import { Button } from "../../../Component/StaffPagesComponents/ui/button";
import { Label } from "../../../Component/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../Component/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Component/StaffPagesComponents/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../../Component/StaffPagesComponents/ui/popover";
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
    hourly_rate?: number | string;
}

interface ApiBookableSport {
    id: number;
    name_en?: string;
    name_ar?: string;
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

const getLocalizedFieldName = (
    field: ApiField | undefined,
    isRtl: boolean,
    fallback = "-"
) => {
    if (!field) return fallback;
    return isRtl
        ? field.name_ar || field.name_en || field.name || fallback
        : field.name_en || field.name_ar || field.name || fallback;
};

// --- Helpers ---
function formatHour(slot: string, isRtl: boolean, t: any): string {
    const h = parseInt(slot.split(":")[0], 10);
    const suffix = h < 12 ? t("notifications.time.am") : t("notifications.time.pm");
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}${suffix}`;
}

const toTranslatedTime = (time: string, isRtl: boolean, t: any) => {
    if (!time) return "";
    const [hh, mm] = time.split(":");
    const h = Number(hh);
    const suffix = h < 12 ? t("notifications.time.am") : t("notifications.time.pm");
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mm ?? "00"} ${suffix}`;
};

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

function formatDisplayDate(date: Date, isRtl: boolean, t: any): string {
    const months = t("calendar_utils.months", { returnObjects: true });
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

function dayOfWeekLabel(date: Date, isRtl: boolean, t: any): string {
    const days = t("calendar_utils.days.long", { returnObjects: true });
    return days[date.getDay()];
}

const HOUR_SLOTS: string[] = Array.from({ length: 17 }, (_, i) => {
    const h = 6 + i;
    return `${String(h).padStart(2, "0")}:00`;
});

const getTIME_OPTIONS = (isRtl: boolean, t: any) => Array.from({ length: 36 }, (_, i) => {
    const totalMins = 360 + i * 30; // Starts at 06:00
    const h24 = Math.floor(totalMins / 60);
    const min = totalMins % 60;
    const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const period = h24 < 12 ? t("notifications.time.am") : t("notifications.time.pm");
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

const getErrorMessage = (error: unknown, fallback: string): string => {
    const err = error as {
        message?: string;
        response?: { data?: { message?: string; error?: string } };
        original?: { response?: { data?: { message?: string; error?: string } } };
    };

    return (
        err?.original?.response?.data?.message ||
        err?.original?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        fallback
    );
};

// --- TimePicker Component ---
const TimeSlotPicker = React.memo(({
    value,
    onChange,
    placeholder,
    minMinutes = 0,
    isRtl,
    t
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    minMinutes?: number;
    isRtl: boolean;
    t: any;
}) => {
    const [open, setOpen] = useState(false);
    const TIME_OPTIONS = getTIME_OPTIONS(isRtl, t);
    const validOptions = TIME_OPTIONS.filter((t) => timeToMinutes(t.value) >= minMinutes);
    const selected = validOptions.find((t) => t.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all shadow-sm w-full outline-none
                        ${selected
                            ? "border-ds-primary bg-ds-primary text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <Clock className="h-4 w-4 shrink-0" />
                    {selected ? selected.label : <span className="opacity-60">{placeholder}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[17rem] p-4 rounded-2xl" align="start" side="bottom" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="grid grid-cols-3 gap-2 max-h-[16rem] overflow-y-auto custom-scrollbar">
                    {validOptions.map((slot) => (
                        <button
                            key={slot.value}
                            type="button"
                            onClick={() => { onChange(slot.value); setOpen(false); }}
                            className={`py-2 px-1 rounded-[10px] border text-xs font-bold transition-all
                                ${slot.value === value
                                    ? "border-ds-primary bg-ds-primary text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-ds-primary hover:text-white"
                                }`}
                        >
                            {slot.label}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
});

// --- Main Page ---
const CourtRentalPage: React.FC<{ showToast: (msg: string, t: ToastType) => void }> = React.memo(({ showToast }) => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation("team");
    const navigate = useNavigate();

    const currentLang = i18n.resolvedLanguage || i18n.language;
    const isRtl = currentLang.startsWith('ar');

    // The calendar always shows 7 days starting from Today for members
    const [today] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [sports, setSports] = useState<ApiBookableSport[]>([]);
    const [sportsLoading, setSportsLoading] = useState(true);

    const [selectedSportId, setSelectedSportId] = useState<string>("");

    const [fields, setFields] = useState<ApiField[]>([]);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState<string>("");

    const [calendarLoading, setCalendarLoading] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [bookingForm, setBookingForm] = useState({ date: "", from: "", to: "" });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Sports
    const loadSports = useCallback(async () => {
        try {
            setSportsLoading(true);
            const sportsRes = await api.get("/members/bookings/sports");
            const sportsPayload = (sportsRes.data?.data ?? sportsRes.data) as any[];
            // Filter only sports that have fields
            const filteredSports = sportsPayload
                .filter(s => s.fields && s.fields.length > 0)
                .map(s => ({
                    id: s.sport_id,
                    name_ar: s.sport_name_ar,
                    name_en: s.sport_name_en
                }));
            
            setSports(filteredSports);
            if (filteredSports.length > 0) {
                setSelectedSportId(String(filteredSports[0].id));
            }
        } catch (error) {
            console.error("Failed to load sports", error);
            showToast(getErrorMessage(error, t("court_rental.alerts.load_sports_fail")), "error");
        } finally {
            setSportsLoading(false);
        }
    }, [showToast, t]);

    useEffect(() => { void loadSports(); }, [loadSports]);

    // Fetch Fields for Selected Sport
    const loadFieldsForSport = useCallback(async () => {
        if (!selectedSportId) return;

        try {
            setFieldsLoading(true);
            // Only show fields that are explicitly available for booking
            const res = await api.get(`/members/bookings/fields/${selectedSportId}`);
            const payload = (res.data?.data ?? res.data) as ApiField[];
            const fieldsRes = Array.isArray(payload) ? payload : [];
            setFields(fieldsRes);
            if (fieldsRes.length > 0) {
                setSelectedFieldId(String(fieldsRes[0].id));
            } else {
                setSelectedFieldId("");
            }
        } catch (error) {
            console.error("Failed to load fields", error);
            showToast(getErrorMessage(error, t("court_rental.alerts.load_fields_fail")), "error");
            setFields([]);
            setSelectedFieldId("");
        } finally {
            setFieldsLoading(false);
        }
    }, [selectedSportId, showToast, t]);

    useEffect(() => { void loadFieldsForSport(); }, [loadFieldsForSport]);

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
                `/bookings/fields/${selectedFieldId}/calendar`,
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
                // Ignore standard empty calendar errors safely
            }
            setBookings([]);
        } finally {
            setCalendarLoading(false);
        }
    }, [selectedFieldId, today]);

    useEffect(() => { void fetchCalendar(); }, [fetchCalendar]);

    // Derived Data
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    const activeSport = sports.find(s => String(s.id) === selectedSportId);
    const activeField = fields.find(f => String(f.id) === selectedFieldId);
    const currentMins = new Date().getHours() * 60 + new Date().getMinutes();

    const hourlyRate = activeField ? Number(activeField.hourly_rate || 0) : 0;
    const computedPrice = (() => {
        if (!bookingForm.from || !bookingForm.to) return 0;
        const [h1, m1] = bookingForm.from.split(":").map(Number);
        const [h2, m2] = bookingForm.to.split(":").map(Number);
        const durationHours = (h2 + m2 / 60) - (h1 + m1 / 60);
        return Math.max(0, durationHours * hourlyRate);
    })();


    // Form Submit
    const handleSaveReservation = async () => {
        if (!bookingForm.date || !bookingForm.from || !bookingForm.to) {
            showToast(t("court_rental.alerts.specify_times"), "error");
            return;
        }
        if (bookingForm.from >= bookingForm.to) {
            showToast(t("court_rental.alerts.end_after_start"), "error");
            return;
        }

        // 30 min checks
        const fMins = timeToMinutes(bookingForm.from);
        const tMins = timeToMinutes(bookingForm.to);
        if (tMins - fMins < 30) {
            showToast(t("court_rental.alerts.min_duration"), "error");
            return;
        }

        if (hasConflict(bookings, bookingForm.date, bookingForm.from, bookingForm.to)) {
            showToast(t("court_rental.alerts.conflict"), "error");
            return;
        }

        const userId = user?.member_id || user?.team_member_id;
        const userType = user?.member_id ? "member" : "team_member";

        if (!userId) {
            showToast(t("court_rental.alerts.login_required"), "error");
            return;
        }

        setIsSaving(true);
        try {
            const dateStr = bookingForm.date;
            const start_time = `${dateStr}T${bookingForm.from}:00`;
            const end_time = `${dateStr}T${bookingForm.to}:00`;

            const booking = await bookingService.createBooking({
                userId: Number(userId),
                userType: userType as any,
                sport_id: Number(selectedSportId),
                field_id: selectedFieldId,
                start_time,
                end_time,
                language: isRtl ? "ar" : "en",
            });

            showToast(t("court_rental.alerts.success"), "success");

            // Redirect to payment
            const params = new URLSearchParams({
                bookingId: booking.id,
                amount: String(booking.price || computedPrice),
                sportName: (isRtl ? activeSport?.name_ar : activeSport?.name_en) || t("sports.court_booking"),
                courtName: getLocalizedFieldName(activeField, isRtl, t("sports.court")),
                date: dateStr,
                time: `${toTranslatedTime(bookingForm.from, isRtl, t)} - ${toTranslatedTime(bookingForm.to, isRtl, t)}`,
            });

            if (userType === "member") {
                navigate(`/member/payment?${params.toString()}&type=booking`);
            } else {
                navigate(`/team-member/payment?${params.toString()}&type=booking`);
            }

            setDialogOpen(false);
        } catch (error) {
            console.error("Failed to create booking", error);
            showToast(getErrorMessage(error, t("court_rental.alerts.fail")), "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Open booking modal by clicking on grid cell
    const openBookingForSlot = (dateStr: string, slotTime: string) => {
        let finalSlotTime = slotTime;
        const todayStr = toISODate(new Date());

        if (dateStr === todayStr) {
            const now = new Date();
            const slotMins = timeToMinutes(slotTime);

            if (slotMins < currentMins) {
                if (slotMins + 30 >= currentMins) {
                    finalSlotTime = addMinutesStr(slotTime, 30);
                } else {
                    showToast(t("court_rental.calendar.select_future_time"), "error");
                    return;
                }
            }
        }

        if (hasConflict(bookings, dateStr, finalSlotTime, addMinutesStr(finalSlotTime, 30))) {
            showToast(t("court_rental.calendar.time_conflict"), "error");
            return;
        }
        setBookingForm({
            date: dateStr,
            from: finalSlotTime,
            // default to 1 hour reserve
            to: addMinutesStr(finalSlotTime, 60)
        });
        setDialogOpen(true);
    };

    return (
        <div className="animate-fade-up max-w-7xl mx-auto pt-4 sm:pt-6 lg:pt-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1 className="text-[24px] sm:text-[28px] font-black">{t("court_rental.title")}</h1>
                <p className="text-ds-text-secondary text-sm sm:text-[15px] mt-1">{t("court_rental.subtitle")}</p>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-ds-border p-4 sm:p-6 md:p-8">

                {/* Controls Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8 bg-ds-border/10 p-3 sm:p-5 rounded-[20px] sm:rounded-[24px] border border-ds-border/50">
                    <div>
                        <Label className={`mb-2.5 block text-[13px] font-bold text-ds-text-secondary ${isRtl ? 'text-right' : 'text-left'}`}>{t("court_rental.controls.activity")}</Label>
                        <Select value={selectedSportId} onValueChange={(v) => { setSelectedSportId(v); }}>
                            <SelectTrigger className="w-full h-[52px] rounded-[16px] border-ds-border bg-white text-[15px] shadow-sm font-bold" dir={isRtl ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={sportsLoading ? t("court_rental.controls.loading") : t("court_rental.controls.select_activity")} />
                            </SelectTrigger>
                            <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                                {sports.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)} className="font-bold">
                                        {isRtl ? s.name_ar : s.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className={`mb-2.5 block text-[13px] font-bold text-ds-text-secondary ${isRtl ? 'text-right' : 'text-left'}`}>{t("court_rental.controls.field")}</Label>
                        <Select value={selectedFieldId} onValueChange={setSelectedFieldId} disabled={!fields.length || fieldsLoading}>
                            <SelectTrigger className="w-full h-[52px] rounded-[16px] border-ds-border bg-white text-[15px] shadow-sm font-bold" dir={isRtl ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={fieldsLoading ? t("court_rental.controls.loading") : fields.length ? t("court_rental.controls.select_field") : t("court_rental.controls.no_active_fields")} />
                            </SelectTrigger>
                            <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                                {fields.map(f => (
                                    <SelectItem key={f.id} value={String(f.id)} className="font-bold">
                                        {getLocalizedFieldName(f, isRtl)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Calendar Header */}
                <div className={`flex flex-col md:flex-row items-center justify-between mb-5 ${isRtl ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="flex items-center gap-2 mb-4 md:mb-0 bg-ds-teal/10 px-4 py-2 rounded-[14px] border border-ds-teal/20">
                        <CalendarCheck className="h-[18px] w-[18px] text-ds-teal" />
                        <h3 className="text-[14px] font-bold text-ds-teal">{t("court_rental.calendar.available_times")}</h3>
                        {calendarLoading && <Loader2 className={`h-[14px] w-[14px] animate-spin text-ds-teal ${isRtl ? 'mr-2' : 'ml-2'}`} />}
                    </div>

                    <div className="flex items-center flex-wrap gap-3 sm:gap-5 text-[11px] sm:text-[12px] font-bold text-ds-text-muted">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white border border-ds-border shadow-inner"></span> {t("court_rental.calendar.legend_available")}</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-ds-border/40 border border-ds-border/60"></span> {t("court_rental.calendar.legend_unavailable")}</span>
                    </div>
                </div>

                {/* Grid Calendar container */}
                <div className="relative rounded-[20px] border border-ds-border overflow-auto max-h-[420px] sm:max-h-[500px] md:max-h-[600px] shadow-sm bg-ds-border/10 custom-scrollbar">
                    <div className="min-w-[720px]">
                        {/* Day headers */}
                        <div className="grid border-b border-ds-border bg-white sticky top-0 z-20" style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}>
                            <div className="border-l border-ds-border/50 bg-ds-border/10" />
                            {weekDays.map((day) => {
                                const isToday = toISODate(day) === toISODate(today);
                                return (
                                    <div key={toISODate(day)} className={`py-3.5 px-1 text-center border-l border-ds-border/50 ${isToday ? "bg-ds-teal/5" : ""}`}>
                                        <div className={`text-[14px] font-black ${isToday ? "text-ds-teal" : "text-ds-text-primary"}`}>{dayOfWeekLabel(day, isRtl, t)}</div>
                                        <div className={`text-[11px] font-bold mt-1 ${isToday ? "text-ds-teal/70" : "text-ds-text-muted"}`}>
                                            {formatDisplayDate(day, isRtl, t)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Body */}
                        <div className="grid bg-white" style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}>
                            {/* Time sidebar */}
                            <div className={`border-l border-ds-border/50 bg-white sticky ${isRtl ? 'right-0' : 'left-0'} z-10 shadow-[1px_0_5px_rgba(0,0,0,0.02)]`}>
                                {HOUR_SLOTS.map((slot) => (
                                    <div key={slot} className="flex items-start justify-center pt-2.5 border-b border-ds-border/60 text-[10px] font-black text-ds-text-muted" style={{ height: 60 }}>
                                        {formatHour(slot, isRtl, t)}
                                    </div>
                                ))}
                            </div>

                            {/* Days content */}
                            {weekDays.map((day) => {
                                const dateStr = toISODate(day);
                                const dayBookings = bookings.filter(b => b.date === dateStr);
                                const isToday = dateStr === toISODate(today);

                                return (
                                    <div key={dateStr} className={`relative border-l border-ds-border/50 ${isToday ? "bg-ds-teal/[0.03]" : "bg-white"}`} style={{ height: HOUR_SLOTS.length * 60 }}>

                                        {/* Underlying clickable slots */}
                                        {HOUR_SLOTS.map((slot, idx) => {
                                            const isPast = isToday && (timeToMinutes(slot) + 60 <= currentMins);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`border-b border-ds-border/40 transition-colors relative group ${isPast ? 'bg-gray-100/40 cursor-not-allowed' : 'hover:bg-ds-teal/10 cursor-pointer'}`}
                                                    style={{ height: 60, boxSizing: "border-box" }}
                                                    onClick={() => !isPast && openBookingForSlot(dateStr, slot)}
                                                >
                                                    {!isPast && (
                                                        <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                                                            <span className="text-[11px] font-black bg-ds-teal text-white px-3 py-1.5 rounded-lg shadow-sm opacity-90 scale-animation">{t("court_rental.calendar.book_now")}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}

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
                                                    className="absolute left-1 right-1 rounded-[12px] bg-ds-border/40 border border-ds-border flex items-center justify-center opacity-100 overflow-hidden shadow-sm z-10 cursor-not-allowed"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showToast(t("court_rental.calendar.time_reserved_alert"), "error");
                                                    }}
                                                >
                                                    <span className="text-[10px] text-ds-text-secondary font-black whitespace-nowrap bg-white/70 px-2 py-0.5 rounded flex gap-1 items-center">
                                                        <Lock className="w-3 h-3" />
                                                        {t("court_rental.calendar.not_available")}
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
                <DialogContent className="max-w-md w-[95vw] rounded-[24px] sm:rounded-[28px] p-0 overflow-hidden border-0 shadow-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
                    <DialogHeader className="p-4 sm:p-6 pb-4 bg-ds-border/10 border-b border-ds-border/50">
                        <DialogTitle className={`text-[20px] font-black text-ds-text-primary ${isRtl ? 'text-right' : 'text-left'}`}>{t("court_rental.dialog.title")}</DialogTitle>
                        <DialogDescription className={`text-[13px] font-bold text-ds-text-muted mt-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                            {t("court_rental.dialog.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                        {/* Display Information */}
                        <div className="bg-white border text-[14px] font-bold border-ds-border/50 shadow-sm rounded-[16px] p-3 flex flex-col gap-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 gap-2 sm:gap-4">
                                <span className="text-ds-text-muted shrink-0">{t("court_rental.dialog.activity")}</span>
                                <span className={`text-ds-text-primary flex-1 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? activeSport?.name_ar : activeSport?.name_en}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 gap-2 sm:gap-4">
                                <span className="text-ds-text-muted shrink-0">{t("court_rental.dialog.field")}</span>
                                <span className={`text-ds-teal font-black flex-1 ${isRtl ? 'text-left' : 'text-right'}`}>{getLocalizedFieldName(activeField, isRtl)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-3 bg-ds-border/10 rounded-[12px] mt-1 gap-2 sm:gap-4">
                                <span className="text-ds-text-muted shrink-0">{t("court_rental.dialog.date")}</span>
                                <span className={`text-ds-text-primary uppercase flex-1 ${isRtl ? 'text-left' : 'text-right'}`} dir="ltr">{bookingForm.date}</span>
                            </div>
                        </div>

                        {/* Pickers & Cost */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label className={`text-ds-text-secondary font-black text-[12px] block ${isRtl ? 'text-right' : 'text-left'}`}>{t("court_rental.dialog.from_time")}</Label>
                                    <TimeSlotPicker
                                        value={bookingForm.from}
                                        onChange={(v) => {
                                            setBookingForm(prev => ({ ...prev, from: v }));
                                            if (timeToMinutes(v) >= timeToMinutes(bookingForm.to || "00:00")) {
                                                setBookingForm(prev => ({ ...prev, to: addMinutesStr(v, 60) }));
                                            }
                                        }}
                                        placeholder={t("court_rental.dialog.placeholder_start")}
                                        minMinutes={bookingForm.date === toISODate(new Date()) ? currentMins : 0}
                                        isRtl={isRtl}
                                        t={t}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className={`text-ds-text-secondary font-black text-[12px] block ${isRtl ? 'text-right' : 'text-left'}`}>{t("court_rental.dialog.to_time")}</Label>
                                    <TimeSlotPicker
                                        value={bookingForm.to}
                                        onChange={(v) => setBookingForm(prev => ({ ...prev, to: v }))}
                                        placeholder={t("court_rental.dialog.placeholder_end")}
                                        minMinutes={Math.max(timeToMinutes(bookingForm.from || "00:00") + 30, bookingForm.date === toISODate(new Date()) ? currentMins : 0)}
                                        isRtl={isRtl}
                                        t={t}
                                    />
                                </div>
                            </div>

                            {hourlyRate > 0 && computedPrice > 0 && (
                                <div className={`flex items-center justify-between pt-4 border-t border-ds-border/50 mt-4 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <span className="text-[13px] font-medium text-ds-text-muted">{t("court_rental.dialog.total_cost")}</span>
                                    <span className="text-[18px] font-black text-ds-primary underline decoration-ds-primary/30 underline-offset-4">{computedPrice.toLocaleString(isRtl ? "ar-EG" : "en-US")} {t("sports.currency")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className={`p-4 sm:p-6 pt-0 border-none gap-2.5 flex flex-col-reverse sm:flex-row sm:justify-start ${isRtl ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                        <Button
                            className="bg-ds-primary hover:bg-ds-primary-dark text-white w-full h-[50px] sm:h-[52px] rounded-[16px] font-black text-[16px] shadow-sm transition-all"
                            onClick={handleSaveReservation}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("court_rental.dialog.confirm_button")}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-[50px] sm:h-[52px] rounded-[16px] text-ds-text-muted border-ds-border font-bold text-[14px] hover:bg-ds-border/10"
                            onClick={() => setDialogOpen(false)}
                            disabled={isSaving}
                        >
                            {t("court_rental.dialog.cancel_button")}
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
});

export default CourtRentalPage;
