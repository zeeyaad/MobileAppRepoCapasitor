import { DS } from "./DesignSystem";
import type { SessionEvent } from "./types";

export const getMonthName = (month: number, t: any) => {
    const months = t("calendar_utils.months", { returnObjects: true });
    return months[month];
};

export const getDayNameShort = (day: number, t: any) => {
    const days = t("calendar_utils.days.short", { returnObjects: true });
    return days[day];
};

export const getDayNameLong = (day: number, t: any) => {
    const days = t("calendar_utils.days.long", { returnObjects: true });
    return days[day];
};

export const localizeDays = (daysStr: string, isRtl: boolean): string => {
    if (!daysStr || daysStr === "-") return "-";
    
    const dayMap: Record<string, string> = {
        "السبت": "Saturday",
        "الأحد": "Sunday",
        "الاثنين": "Monday",
        "الثلاثاء": "Tuesday",
        "الأربعاء": "Wednesday",
        "الخميس": "Thursday",
        "الجمعة": "Friday",
        "Saturday": "السبت",
        "Sunday": "الأحد",
        "Monday": "الاثنين",
        "Tuesday": "الثلاثاء",
        "Wednesday": "الأربعاء",
        "Thursday": "الخميس",
        "Friday": "الجمعة"
    };

    const days = daysStr.split(/[\s،,]+/).filter(Boolean);
    const localized = days.map(d => {
        const trimmed = d.trim();
        if (isRtl) {
            if (/^[a-zA-Z]+$/.test(trimmed)) return dayMap[trimmed] || trimmed;
            return trimmed;
        } else {
            if (/^[\u0600-\u06FF]+$/.test(trimmed)) return dayMap[trimmed] || trimmed;
            return trimmed;
        }
    });

    return localized.join(isRtl ? "، " : ", ");
};

// All sports now coming from backend. Mock config removed.

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "حضور": { bg: DS.colors.successLight, text: DS.colors.success, border: DS.colors.success + "40" },
    "غياب": { bg: DS.colors.errorLight, text: DS.colors.error, border: DS.colors.error + "40" },
    "قادم": { bg: DS.colors.primaryLight, text: DS.colors.primary, border: DS.colors.primary + "40" },
    // English counterparts for direct mapping
    "attended": { bg: DS.colors.successLight, text: DS.colors.success, border: DS.colors.success + "40" },
    "absent": { bg: DS.colors.errorLight, text: DS.colors.error, border: DS.colors.error + "40" },
    "upcoming": { bg: DS.colors.primaryLight, text: DS.colors.primary, border: DS.colors.primary + "40" },
};

export const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

/**
 * Calculates the effective end date for a subscription.
 * Strictly enforces that a subscription is limited to the calendar month of its start date.
 */
export function getEffectiveEndDate(startDate: string | Date | undefined | null, _endDate?: string | Date | undefined | null): Date | null {
    if (!startDate || startDate === "-") return null;
    const sDate = new Date(startDate);
    if (isNaN(sDate.getTime())) return null;

    // Strict 1-Month policy: Enforce the end of the SAME calendar month as the start date
    // (e.g., if joins March 10, end date is March 31)
    return new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0);
}

export function buildMonthEvents(year: number, month: number, sports?: any[], bookings?: any[]): Map<string, SessionEvent[]> {
    const map = new Map<string, SessionEvent[]>();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // If no sports provided, return empty map
    const config = sports || [];

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dow = date.getDay();
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const evts: SessionEvent[] = [];

        // Regular Sports sessions
        config.forEach(cfg => {
            if (cfg.status !== "نشط") return;

            // Date filtering: enforce strict 1-month range
            const rawStart = cfg.startDate || cfg.start_date;

            const checkDate = new Date(year, month, d);
            checkDate.setHours(0, 0, 0, 0);

            const sDateRaw = (rawStart && rawStart !== "-") ? new Date(rawStart) : (cfg.createdAt || cfg.created_at ? new Date(cfg.createdAt || cfg.created_at) : null);

            // If no date and not active, hide. 
            // If active but no date at all, default to "this month" to avoid disappearing.
            if (!sDateRaw || isNaN(sDateRaw.getTime())) {
                if (cfg.status === "نشط") {
                    // Fallback: use first day of current VIEWED month if looking at this month, or current date's month
                    const now = new Date();
                    if (now.getFullYear() === year && now.getMonth() === month) {
                        // We are looking at current month, allow it to show
                    } else {
                        return; // Don't show in other months if no start date
                    }
                } else {
                    return;
                }
            }

            // Enforce that "Month" means ONLY the calendar month in which it started.
            let sDate, eDate;
            if (sDateRaw && !isNaN(sDateRaw.getTime())) {
                sDate = new Date(sDateRaw.getFullYear(), sDateRaw.getMonth(), 1);
                eDate = new Date(sDateRaw.getFullYear(), sDateRaw.getMonth() + 1, 0);
            } else {
                sDate = new Date(year, month, 1);
                eDate = new Date(year, month + 1, 0);
            }

            sDate.setHours(0, 0, 0, 0);
            eDate.setHours(23, 59, 59, 999);

            if (checkDate < sDate || checkDate > eDate) return;

            const sid = cfg.id || cfg.sportId;
            const weekdays = cfg.weekdays || [];
            if (weekdays.length > 0 && !weekdays.includes(dow)) return;

            let status: SessionEvent["status"] = "upcoming";

            // If the date is in the past, default to "absent" if no record exists
            if (checkDate < today) {
                status = "absent";
            }

            if (cfg.records && Array.isArray(cfg.records)) {
                const record = cfg.records.find((r: any) => isSameDay(new Date(r.date), checkDate));
                if (record) {
                    status = record.attended ? "attended" : "absent";
                }
            }

            evts.push({
                sportId: sid,
                name: cfg.name,
                icon: cfg.icon || "🏅",
                color: cfg.color || "#1E6FB9",
                time: cfg.time || cfg.nextTime || "-",
                court: cfg.court || "-",
                status
            });
        });

        // Confirmed Bookings (from localStorage)
        if (bookings && Array.isArray(bookings)) {
            bookings.forEach(b => {
                if (b.date === key) {
                    const checkDate = new Date(year, month, d);
                    checkDate.setHours(0, 0, 0, 0);

                    // If it's in the past and no attendance data exists, don't call it "upcoming"
                    const bookingStatus: SessionEvent["status"] = checkDate < today ? "absent" : "upcoming";

                    evts.push({
                        sportId: `booking-${b.id}`,
                        name: `${b.court}`, // Prefix added in UI layer via translation
                        icon: "🏟️",
                        color: "#F59E0B", // Orange for bookings
                        time: b.time || "-",
                        court: b.court || "-",
                        status: bookingStatus,
                        price: Number(b.price || b.total_price || 0)
                    });
                }
            });
        }

        if (evts.length) map.set(key, evts);
    }
    return map;
}
