import React, { useEffect, useMemo, useRef, useState } from "react";
import type { EnrolledSport } from "../types";
import { useAuth } from "../../../context/AuthContext";
import { Card, Badge, StatChip, ProgressBar } from "../DashboardComponents";
import bookingService from "../../../services/bookingService";
import {
    buildMonthEvents,
    getEffectiveEndDate,
    STATUS_COLORS,
    getDaysInMonth,
    isSameDay,
    getMonthName,
    getDayNameShort,
    localizeDays
} from "../calendarUtils";
import { useTranslation } from "react-i18next";

const statusColor = (s: EnrolledSport["status"], t: any) => {
    const status = String(s || "").toLowerCase();
    if (status === "نشط" || status === "active" || status === t("sports.status.active").toLowerCase()) return "#16A34A";
    if (status === "قيد الانتظار" || status === "pending" || status === t("sports.status.pending").toLowerCase()) return "#3B82F6";
    if (status === "قادم" || status === "upcoming" || status === t("sports.status.upcoming").toLowerCase()) return "#F59E0B";
    return "#8FA3BB";
};

const TrainingCard: React.FC<{ sport: EnrolledSport; delay: number }> = ({ sport, delay }) => {
    const { t, i18n } = useTranslation("team");
    const currentLang = i18n.resolvedLanguage || i18n.language;
    const isRtl = currentLang.startsWith('ar');
    const pct = sport.total > 0 ? Math.round((sport.attended / sport.total) * 100) : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Determine the actual end date for calculation (earliest of endOfMonth, 1-month limit, or sport.endDate)
    const rawStart = sport.startDate || (sport as any).start_date;
    const rawEnd = sport.endDate || (sport as any).end_date;
    const subEndDate = getEffectiveEndDate(rawStart, rawEnd);

    let calcEndDate = subEndDate && subEndDate < endOfMonth ? subEndDate : new Date(endOfMonth);

    let remainingDynamic = 0;
    if (Array.isArray(sport.weekdays) && sport.weekdays.length > 0) {
        for (let d = new Date(today); d <= calcEndDate; d.setDate(d.getDate() + 1)) {
            if (sport.weekdays.includes(d.getDay())) remainingDynamic++;
        }
    } else {
        remainingDynamic = Math.max(0, Math.floor((calcEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return (
        <Card
            className="mb-4 p-4 sm:p-5 animate-fade-up overflow-hidden group"
            style={{ animationDelay: `${delay}ms` }}
            accentColor={sport.color || "#1E6FB9"}
        >
            {/* 1. Header Row: Icon, Title, Status */}
            <div className="flex items-center gap-4 mb-5">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-[30px] overflow-hidden relative shrink-0 shadow-sm border border-black/5"
                    style={{ background: (sport.color || "#1E6FB9") + "15" }}
                >
                    {sport.img ? (
                        <img
                            src={sport.img}
                            alt={sport.name || ""}
                            loading="lazy"
                            decoding="async"
                            width={56}
                            height={56}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <span style={{ color: sport.color }}>{sport.icon || "⚽"}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                        <h3 className="font-black text-xl text-gray-800 tracking-tight truncate">
                            {sport.name}
                        </h3>
                        <Badge label={t(`sports.status.${String(sport.status).toLowerCase() === "نشط" || String(sport.status).toLowerCase() === "active" ? "active" : String(sport.status).toLowerCase() === "قيد الانتظار" || String(sport.status).toLowerCase() === "pending" ? "pending" : "upcoming"}`)} color={statusColor(sport.status, t)} />
                    </div>
                    {(sport.startDate || (sport as any).start_date) && (
                        <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                            <span>🕒 {t("training_card.registration")}</span>
                            <span className="text-gray-600">
                                {(sport.startDate || (sport as any).start_date).split('T')[0]}
                                <span className="mx-1 text-gray-300">←</span>
                                {subEndDate?.toISOString().split('T')[0]}
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {/* 2. Focused Box: Next Session Information */}
            <div
                className="rounded-2xl border-2 border-dashed p-4 mb-5 space-y-3 transition-colors group-hover:bg-opacity-20"
                style={{
                    background: (sport.color || "#1E6FB9") + "08",
                    borderColor: (sport.color || "#1E6FB9") + "20"
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sport.color || "#1E6FB9" }} />
                    <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest">{t("training_card.next_session")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-white/60 p-2.5 rounded-xl border border-black/5">
                        <span className="text-lg opacity-80">📅</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold">{t("training_card.day")}</span>
                            <span className="text-[13px] font-extrabold text-gray-700">{localizeDays(sport.nextDay || "-", isRtl)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/60 p-2.5 rounded-xl border border-black/5">
                        <span className="text-lg opacity-80">⏰</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold">{t("training_card.time")}</span>
                            <span className="text-[13px] font-extrabold text-gray-700">{sport.nextTime || "-"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/60 p-2.5 rounded-xl border border-black/5 sm:col-span-2">
                        <span className="text-lg opacity-80">📍</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold">{t("training_card.location")}</span>
                            <span className="text-[13px] font-extrabold text-gray-700 truncate">{sport.court || "-"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <StatChip icon="🎯" label={t("training_card.attended")} val={sport.attended} color="#16A34A" />
                <StatChip icon="🚫" label={t("training_card.absent")} val={sport.absent} color="#DC2626" />
                <StatChip icon="⏳" label={t("training_card.remaining")} val={remainingDynamic} color="#1F6FD5" />
            </div>

            {/* 4. Progress Section */}
            <div className="pt-2">
                <div className="flex justify-between mb-2 items-end">
                    <div className="flex flex-col">
                        <span className="text-[12px] text-gray-500 font-bold">{t("training_card.attendance_rate")}</span>
                        <span className="text-[11px] text-gray-400 mt-0.5 font-medium">
                            {t("training_card.sessions_completed", { attended: sport.attended, total: sport.total })}
                        </span>
                    </div>
                    <span className="text-2xl font-black italic" style={{ color: sport.color || "#1E6FB9" }}>{pct}%</span>
                </div>
                <ProgressBar value={sport.attended} max={sport.total || 1} color={sport.color || "#1E6FB9"} />
            </div>
        </Card>
    );
};

// ─── Lazy Mount When In View ─────────────────────────────────────────────────
const InView: React.FC<{
    children: React.ReactNode;
    rootMargin?: string;
    minHeight?: number | string;
    once?: boolean;
}> = ({ children, rootMargin = "200px", minHeight = 220, once = true }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!ref.current || visible) return;
        const obs = new IntersectionObserver(
            (entries) => {
                const e = entries[0];
                if (e.isIntersecting) {
                    setVisible(true);
                    if (once) obs.disconnect();
                }
            },
            { rootMargin }
        );
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, [visible, rootMargin, once]);
    return (
        <div ref={ref} style={{ minHeight }}>
            {visible ? children : (
                <div className="rounded-2xl border border-black/5 bg-gray-50 animate-pulse h-full" style={{ minHeight }} />
            )}
        </div>
    );
};

interface DashboardPageProps {
    enrolledSports?: EnrolledSport[];
    totalAttended?: number;
    totalSessions?: number;
    joinDate?: string;
    bookings?: any[]; // optional server-side bookings
}

const DashboardPage: React.FC<DashboardPageProps> = ({
    enrolledSports = [],
    totalAttended: propTotalAttended,
    totalSessions: propTotalSessions,
    joinDate,
    bookings: serverBookings = []
}) => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation("team");

    const currentLang = i18n.resolvedLanguage || i18n.language;
    const isRtl = currentLang.startsWith('ar');
    const today = new Date();
    const displaySports = enrolledSports.length > 0 ? enrolledSports : [];
    const totalAttended = propTotalAttended !== undefined ? propTotalAttended : displaySports.reduce((a, s) => a + s.attended, 0);
    const totalSessions = propTotalSessions !== undefined ? propTotalSessions : displaySports.reduce((a, s) => a + s.total, 0);

    // ── Confirmed Bookings combined (Server + LocalStorage) ──
    const combinedBookings = useMemo(() => {
        try {
            const userId = user?.member_id || user?.team_member_id;
            const local = userId ? JSON.parse(localStorage.getItem(`confirmed_bookings_${userId}`) || "[]") : [];

            // Deduplicate: server bookings take precedence
            const serverMapped = serverBookings.map(b => ({
                id: b.id,
                date: (b.start_time || b.date || "").split('T')[0],
                time: (b.start_time || "").split('T')[1]?.slice(0, 5) || b.time_from || "",
                court: b.field?.name_ar || b.facility_name || t("sports.court"),
                isServer: true
            }));

            const combined = [...serverMapped];
            local.forEach((lb: any) => {
                if (!combined.some(sb => String(sb.id) === String(lb.id))) {
                    combined.push(lb);
                }
            });
            return combined;
        } catch { return []; }
    }, [user, serverBookings]);

    // ── Calendar state ──
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedKey, setSelectedKey] = useState<string | null>(() =>
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    );
    const [filterSport, setFilterSport] = useState<string | number | null>(null);
    const [copyingBookingId, setCopyingBookingId] = useState<string | null>(null);

    // ── Month events (cached for grid) ──
    const events = useMemo(() => buildMonthEvents(viewYear, viewMonth, displaySports, combinedBookings), [viewYear, viewMonth, displaySports, combinedBookings]);
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
        setSelectedKey(null);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
        setSelectedKey(null);
    };

    const selectedEvents = selectedKey
        ? (events.get(selectedKey) ?? []).filter(e => filterSport === null || e.sportId === filterSport)
        : [];

    const monthlySummary = {
        attended: Array.from(events.values()).flat().filter(e => e.status === "حضور" || e.status === "attended" || e.status === t("calendar_utils.status.attended")).length,
        absent: Array.from(events.values()).flat().filter(e => e.status === "غياب" || e.status === "absent" || e.status === t("calendar_utils.status.absent")).length,
        upcoming: Array.from(events.values()).flat().filter(e => e.status === "قادم" || e.status === "upcoming" || e.status === t("calendar_utils.status.upcoming")).length,
    };

    // مجموع المتبقي لكل رياضة حتى نهاية الشهر الحالي
    const totalRemainingDynamic = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        let sum = 0;
        for (const s of displaySports) {
            const rawStart = s.startDate || (s as any).start_date;
            const rawEnd = s.endDate || (s as any).end_date;
            const subEndDate = getEffectiveEndDate(rawStart, rawEnd);

            let calcEndDate = subEndDate && subEndDate < endOfMonth ? subEndDate : new Date(endOfMonth);

            if (Array.isArray(s.weekdays) && s.weekdays.length > 0) {
                for (let d = new Date(today); d <= calcEndDate; d.setDate(d.getDate() + 1)) {
                    if (s.weekdays.includes(d.getDay())) sum++;
                }
            } else {
                sum += Math.max(0, Math.floor((calcEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
            }
        }
        return sum;
    }, [displaySports]);

    const handleCopyBookingInvite = async (bookingId: string) => {
        try {
            setCopyingBookingId(bookingId);
            const details = await bookingService.getBookingDetails(bookingId);
            const token = details.share_token;
            if (!token) {
                // No token available for this booking
                alert(t("dashboard.calendar.no_invite_token"));
                return;
            }
            const url = `${window.location.origin}/bookings/share/${token}`;
            await navigator.clipboard.writeText(url);
            alert(t("dashboard.calendar.copy_success"));
        } catch (err) {
            console.error("Failed to copy invite link:", err);
            alert(t("dashboard.calendar.copy_failed"));
        } finally {
            setCopyingBookingId(null);
        }
    };


    return (
        <div className="animate-fade-up">

            {/* ── PAGE TITLE ── */}
            <div className="mb-3.5 flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-end">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h1 className="text-[24px] sm:text-[28px] font-black text-ds-text-primary">{t("dashboard.page_title")}</h1>
                    <p className="text-ds-text-secondary mt-1 text-sm sm:text-[15px]">
                        {t("dashboard.page_subtitle")}
                    </p>
                </div>
                {joinDate && (
                    <div className="bg-white px-3 py-1.5 rounded-full border border-ds-border shadow-sm flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[10px] text-ds-text-muted font-bold">{t("dashboard.join_date_label")}</span>
                        <span className="text-[12px] sm:text-[13px] font-black text-ds-primary">
                            {new Date(joinDate).toLocaleDateString(isRtl ? "ar-EG" : "en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>

            {/* ── TOP STATS ROW ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3.5">
                {[
                    { label: t("dashboard.stats.attended_sessions"), val: totalAttended, color: "#16A34A", icon: "🎯", bg: "#F0FDF4" },
                    { label: t("dashboard.stats.total_sessions"), val: totalSessions, color: "#1F6FD5", icon: "📊", bg: "#EBF3FF" },
                    { label: t("dashboard.stats.enrolled_sports"), val: displaySports.length, color: "#17A2B8", icon: "🏆", bg: "#E8F8FB" },
                    { label: t("dashboard.stats.attendance_rate"), val: `${totalSessions > 0 ? Math.round(totalAttended / totalSessions * 100) : 0}%`, color: "#111827", icon: "📉", bg: "#F3F4F6" },
                ].map(({ label, val, color, icon, bg }) => (
                    <Card key={label} className="flex items-center gap-2.5 p-2.5 w-full">
                        <div
                            className="w-[44px] h-[44px] rounded-lg flex items-center justify-center text-[18px] shrink-0"
                            style={{ background: bg }}
                        >
                            {icon}
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                            <div className="text-[20px] sm:text-[22px] font-black leading-tight" style={{ color }}>{val}</div>
                            <div className="text-[10px] text-ds-text-muted mt-0.5">{label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_550px] gap-3 sm:gap-4 items-start">

                {/* ────── RIGHT: Training Cards (Grid Layout) ────── */}
                <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px 1200px' }}>
                    <div className={`font-bold text-[14px] sm:text-[15px] text-ds-text-secondary mb-3 flex items-center gap-2 ${isRtl ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
                        <span>🏋️</span> {t("dashboard.my_sports_section")}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {displaySports.map((s, i) => (
                            <InView key={s.id} minHeight={260}>
                                <TrainingCard sport={s} delay={i * 70} />
                            </InView>
                        ))}
                    </div>
                </div>

                {/* ────── LEFT: Calendar + Day Detail (Sticky) ────── */}
                <div className="flex flex-col gap-3.5 xl:sticky xl:top-20" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px 1200px' }}>
                    <div className="grid grid-cols-3 gap-1">
                        {([
                            { label: t("dashboard.calendar.summary.attended"), val: monthlySummary.attended, color: "#16A34A", bg: "#F0FDF4" },
                            { label: t("dashboard.calendar.summary.absent"), val: monthlySummary.absent, color: "#DC2626", bg: "#FEF2F2" },
                            { label: t("dashboard.calendar.summary.upcoming"), val: totalRemainingDynamic, color: "#1F6FD5", bg: "#EBF3FF" },
                        ] as const).map(({ label, val, color, bg }) => (
                            <div key={label} className="flex-1 text-center rounded-lg p-[8px_4px] border border-ds-border" style={{ background: bg, borderColor: color + "25" }}>
                                <div className="text-[17px] font-black" style={{ color }}>{val}</div>
                                <div className="text-[10px] text-ds-text-muted font-semibold">{label}</div>
                            </div>
                        ))}
                    </div>

                    <Card className="p-2.5">
                        <div className="flex items-center justify-between mb-2">
                            <button onClick={isRtl ? nextMonth : prevMonth} className="w-8 h-8 rounded-lg border border-ds-border bg-ds-border/10 cursor-pointer text-[15px] flex items-center justify-center hover:bg-ds-border/20 transition-colors">{isRtl ? '›' : '‹'}</button>
                            <div className="text-center">
                                <span className="font-black text-[15px] text-ds-text-primary">{getMonthName(viewMonth, t)} {viewYear}</span>
                            </div>
                            <button onClick={isRtl ? prevMonth : nextMonth} className="w-8 h-8 rounded-lg border border-ds-border bg-ds-border/10 cursor-pointer text-[15px] flex items-center justify-center hover:bg-ds-border/20 transition-colors">{isRtl ? '‹' : '›'}</button>
                        </div>

                        <div className={`flex gap-1 mb-2 overflow-x-auto pb-1 scrollbar-hide ${isRtl ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
                            <button
                                onClick={() => setFilterSport(null)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border whitespace-nowrap ${filterSport === null ? 'bg-ds-primary text-white border-ds-primary' : 'bg-white text-ds-text-secondary border-ds-border hover:bg-ds-border/10'}`}
                            >
                                {t("dashboard.calendar.filter_all")}
                            </button>
                            {displaySports.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setFilterSport(filterSport === s.id ? null : s.id)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border whitespace-nowrap`}
                                    style={{
                                        background: filterSport === s.id ? s.color + "15" : "white",
                                        color: filterSport === s.id ? s.color : "#4A5568",
                                        borderColor: filterSport === s.id ? s.color : "#DDE5F0"
                                    }}
                                >
                                    {s.icon} {s.name}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-px mb-0.5">
                            {([0, 1, 2, 3, 4, 5, 6] as number[]).map(d => (
                                <div key={d} className="text-center text-[10px] font-extrabold text-ds-text-muted py-1">{getDayNameShort(d, t)}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-px">
                            {Array.from({ length: totalCells }, (_, i) => {
                                const dayNum = i - firstDay + 1;
                                if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="min-h-[72px]" />;
                                const dKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                const dayEvts = (events.get(dKey) ?? []).filter(e => filterSport === null || e.sportId === filterSport);
                                const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && dayNum === today.getDate();
                                const isSel = selectedKey === dKey;
                                const hasEvts = dayEvts.length > 0;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => hasEvts && setSelectedKey(isSel ? null : dKey)}
                                        className={`min-h-[72px] rounded-sm p-[4px_2px] border transition-all cursor-pointer ${isSel ? 'bg-ds-primary-light border-ds-primary' : isToday ? 'bg-ds-teal-light border-ds-teal/70' : 'bg-white border-ds-border'} ${!hasEvts && 'cursor-default'}`}
                                    >
                                        <div className={`w-[18px] h-[18px] rounded-full text-[10px] font-black flex items-center justify-center mb-0.5 ${isToday ? 'bg-ds-teal text-white' : isSel ? 'text-ds-primary' : 'text-ds-text-primary'}`}>{dayNum}</div>
                                        <div className="flex flex-col gap-0.5">
                                            {dayEvts.slice(0, 2).map((ev, ei) => (
                                                <div
                                                    key={ei}
                                                    className={`rounded-[3px] p-[1px_3px] text-[8px] font-bold border-r-2 truncate ${isRtl ? 'text-right' : 'text-left'}`}
                                                    style={{ background: ev.color + "18", borderRightColor: ev.color, color: ev.color }}
                                                >
                                                    {ev.icon} {String(ev.sportId).startsWith("booking-") ? `${t("dashboard.calendar.booking_prefix")} ${ev.name}` : ev.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-2.5">
                        {selectedKey ? (
                            <>
                                <div className={`flex justify-between items-center mb-2 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <span className="font-extrabold text-[13px] text-ds-text-primary">
                                        📅 {new Date(selectedKey + "T12:00:00").toLocaleDateString(isRtl ? "ar-EG" : "en-US", { weekday: "long", day: "numeric", month: "long" })}
                                    </span>
                                </div>
                                {selectedEvents.length === 0 ? (
                                    <div className="text-center text-ds-text-muted py-3.5 text-[11px]">{t("dashboard.calendar.no_sessions")}</div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {selectedEvents.map((ev, i) => {
                                            const sc = STATUS_COLORS[ev.status];
                                            return (
                                                <div key={i} className={`rounded-lg p-[10px_12px] border-r-4 transition-all ${isRtl ? 'text-right' : 'text-left'}`} style={{ background: ev.color + "0C", borderColor: ev.color + "20", borderRightColor: ev.color }}>
                                                    <div className={`flex items-center justify-between mb-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                                        <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                                            <span className="text-[16px]">{ev.icon}</span>
                                                            <span className="font-extrabold text-[13px]" style={{ color: ev.color }}>
                                                                {String(ev.sportId).startsWith("booking-") ? `${t("dashboard.calendar.booking_prefix")} ${ev.name}` : ev.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                                                            {t(`calendar_utils.status.${ev.status}`)}
                                                        </span>
                                                    </div>
                                                    <div className={`flex flex-wrap gap-3 items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                                        <span className="text-[11px] text-ds-text-secondary">⏰ {ev.time}</span>
                                                        <span className="text-[11px] text-ds-text-secondary">📍 {ev.court}</span>
                                                        {ev.price ? (
                                                            <span className="text-[11px] font-bold text-ds-orange">💰 {ev.price.toLocaleString(isRtl ? "ar-EG" : "en-US")} {t("sports.currency")}</span>
                                                        ) : null}
                                                        {String(ev.sportId).startsWith("booking-") && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyBookingInvite(String(ev.sportId).replace("booking-", ""))}
                                                                className={`px-2.5 py-1 rounded-full bg-ds-primary text-white text-[10px] font-bold hover:bg-ds-primary-dark transition-colors ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                                                                disabled={copyingBookingId === String(ev.sportId).replace("booking-", "")}
                                                            >
                                                                {copyingBookingId === String(ev.sportId).replace("booking-", "") ? t("dashboard.calendar.copying") : t("dashboard.calendar.copy_invite")}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <div className="text-[28px] mb-2">📅</div>
                                <div className="font-bold text-[13px] text-ds-text-secondary">{t("dashboard.calendar.select_day")}</div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
