import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Bell,
    Bike,
    CalendarDays,
    Clock,
    CreditCard,
    Dumbbell,
    Info,
    Star,
    Swords,
    Trophy,
    User,
    Volleyball,
    Waves,
    Check,
    CheckCheck,
    MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { AuthService } from "../services/authService";
import { toast, Toaster } from "sonner";
import { resolveFileUrl } from "../utils/fileUrl";

/* ─── helpers ─────────────────────────────────────────────────────── */
function SportIcon({ name }: { name: string }) {
    const n = (name || "").toLowerCase();
    if (n.includes("سباح") || n.includes("swim")) return <Waves className="h-7 w-7" />;
    if (n.includes("كرة") || n.includes("ball")) return <Volleyball className="h-7 w-7" />;
    if (n.includes("دراج") || n.includes("cycl") || n.includes("bike")) return <Bike className="h-7 w-7" />;
    if (n.includes("ملاكم") || n.includes("كاراته") || n.includes("martial") || n.includes("box"))
        return <Swords className="h-7 w-7" />;
    if (n.includes("لياق") || n.includes("gym") || n.includes("fitness")) return <Dumbbell className="h-7 w-7" />;
    return <Trophy className="h-7 w-7" />;
}

const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDateAr(d: Date) {
    return `${WEEKDAYS_AR[d.getDay()]}، ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTimeAr(d: Date) {
    const h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0"), s = String(d.getSeconds()).padStart(2, "0");
    return `${h % 12 || 12}:${m}:${s} ${h >= 12 ? "م" : "ص"}`;
}

const statusBadge = (s: string) => {
    const lc = (s || "").toLowerCase();
    if (lc === "active" || lc === "approved" || lc === "confirmed") return "bg-green-100 text-green-700";
    if (lc === "expired" || lc === "cancelled") return "bg-red-100 text-red-700";
    if (lc === "pending" || lc === "pending_payment") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
};
const statusLabel = (s: string) => {
    const lc = (s || "").toLowerCase();
    if (lc === "active" || lc === "approved") return "نشط";
    if (lc === "confirmed") return "مؤكد";
    if (lc === "expired" || lc === "cancelled") return "ملغي";
    if (lc === "pending" || lc === "pending_payment") return "قيد المراجعة";
    if (lc === "completed") return "منتهي";
    return s || "—";
};

const SPORT_COLORS = ["#1F3A5F", "#2EA7C9", "#1b71bc", "#F4A623", "#214474", "#4A90D9"];

interface MemberInfo {
    nameAr: string; memberType: string; status: string; memberId: number;
    photo?: string;
    joinDate?: string;
    expiryDate?: string;
}

interface SportSub {
    id: string;
    nameAr: string;
    nameEn: string;
    status: string;
    schedule: string;
    endDate?: string;
    color?: string;
}

interface Reservation {
    id: string;
    facilityName: string;
    date: string;
    timeFrom: string;
    timeTo: string;
    status: string;
    price: number;
    shareToken?: string;
}

/* ─── Card wrapper ─────────────────────────────────────────────────── */
function Card({
    title, icon: Icon, delay = 0, children, accent,
}: {
    title: string; icon: React.ElementType; delay?: number; children: React.ReactNode; accent?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden"
        >
            {/* Card header strip */}
            <div
                className="flex items-center justify-between px-5 py-4 border-b border-border"
                style={accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : {}}
            >
                <h2 className="text-sm font-bold text-[#214474]">{title}</h2>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: accent ? `${accent}18` : "#1F3A5F18" }}
                >
                    <Icon className="h-4 w-4" style={{ color: accent ?? "#1F3A5F" }} />
                </div>
            </div>

            {/* Card body */}
            <div className="flex-1 p-5">
                {children}
            </div>
        </motion.div>
    );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function MemberHomePage() {
    const navigate = useNavigate();
    const [now, setNow] = useState(new Date());
    const [info, setInfo] = useState<MemberInfo | null>(null);
    const [sports, setSports] = useState<SportSub[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user } = useAuth();
    const userId = user?.member_id || user?.team_member_id;

    const [readNotifs, setReadNotifs] = useState<number[]>(() => {
        try {
            if (!userId) return [];
            const saved = localStorage.getItem(`read_notifs_${userId}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const handleMarkAsRead = (id: number) => {
        if (!userId) return;
        setReadNotifs(prev => {
            const next = [...prev, id];
            localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(next));
            return next;
        });
    };

    const handleMarkAllAsRead = () => {
        if (!userId) return;
        const allIds = notifications.map(n => n.id);
        const next = Array.from(new Set([...readNotifs, ...allIds]));
        setReadNotifs(next);
        localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(next));
    };

    const [loading, setLoading] = useState(true);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        tickRef.current = setInterval(() => setNow(new Date()), 1000);
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, []);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const meRes = await api.get("/auth/me");
            const me = meRes.data?.data?.user ?? meRes.data?.user ?? meRes.data;
            const memberId: number = me.member_id;

            let d: Record<string, unknown> = me;
            if (memberId) {
                try { const r = await api.get(`/members/${memberId}`); d = r.data?.data ?? r.data; }
                catch { /* fallback to me */ }
            }

            const realStatus = String(d.status ?? "").toLowerCase();
            if (realStatus === "pending") { navigate("/member/pending", { replace: true }); return; }

            setInfo({
                nameAr: `${d.first_name_ar ?? me.name_ar?.split(" ")[0] ?? ""} ${d.last_name_ar ?? me.name_ar?.split(" ").slice(1).join(" ") ?? ""}`.trim(),
                memberType: String(d.member_type ?? me.member_type ?? "—"),
                status: realStatus,
                memberId,
                photo: d.photo ? String(d.photo) : (me.photo ? String(me.photo) : undefined),
                joinDate: d.join_date ? String(d.join_date) : (me.join_date ? String(me.join_date) : undefined),
                expiryDate: d.expiry_date ? String(d.expiry_date) : (me.expiry_date ? String(me.expiry_date) : undefined),
            });

            // ── Load sport subscriptions via attendance-stats (same as MemberSportsPage) ──
            if (memberId) {
                try {
                    const statsRes = await AuthService.getMemberAttendanceStats(memberId);
                    if (statsRes.success && statsRes.data?.sports) {
                        const mappedSports: SportSub[] = statsRes.data.sports
                            .filter((s: any) =>
                                s.status === "approved" || s.status === "active"
                            )
                            .map((s: any, idx: number) => {
                                const firstSched = s.schedules?.[0];
                                const days = firstSched?.days_ar || firstSched?.days_en || "";
                                const time = firstSched
                                    ? `${String(firstSched.start_time || "").slice(0, 5)} — ${String(firstSched.end_time || "").slice(0, 5)}`
                                    : "";
                                const scheduleLabel = [days, time].filter(Boolean).join(" | ");
                                return {
                                    id: String(s.id || idx + 1),
                                    nameAr: String(s.sport_name_ar || s.name_ar || s.sport_name || s.name || "رياضة"),
                                    nameEn: String(s.sport_name || s.name_en || ""),
                                    status: "active",
                                    schedule: scheduleLabel,
                                };
                            });
                        setSports(mappedSports);
                    } else {
                        setSports([]);
                    }
                } catch {
                    setSports([]);
                }

                // ── Load court bookings ──
                try {
                    const bRes = await api.get(`/members/${memberId}/bookings`);
                    const bList: Record<string, unknown>[] = Array.isArray(bRes.data?.data)
                        ? bRes.data.data
                        : Array.isArray(bRes.data) ? bRes.data : [];

                    setReservations(bList.map((r) => {
                        const sportNameAr = String((r as any).sport_name_ar || "");
                        const sportNameEn = String((r as any).sport_name_en || "");
                        const courtNameAr = String((r as any).field_name_ar || (r as any).field?.name_ar || "");
                        const courtNameEn = String((r as any).field_name_en || (r as any).field?.name_en || "");

                        // Build label: "SportName – CourtName" in Arabic, with fallbacks
                        const sportLabel = sportNameAr || sportNameEn;
                        const courtLabel = courtNameAr || courtNameEn;
                        const facilityName = sportLabel && courtLabel
                            ? `${sportLabel} – ${courtLabel}`
                            : courtLabel || sportLabel || String((r as any).facility_name || (r as any).name || "ملعب");

                        return {
                            id: String(r.id ?? Math.random()),
                            facilityName,
                            date: String((r as any).start_time || (r as any).date || (r as any).reservation_date || ""),
                            timeFrom: String((r as any).start_time || (r as any).time_from || ""),
                            timeTo: String((r as any).end_time || (r as any).time_to || ""),
                            status: String((r as any).status ?? "pending"),
                            price: Number((r as any).price || (r as any).total_price || 0),
                            shareToken: (r as any).share_token ? String((r as any).share_token) : undefined,
                        };
                    }));
                } catch {
                    setReservations([]);
                }
            }

            // Calculate notifications dynamically
            const newNotifs: any[] = [];
            let notifId = 1;
            const nowTime = new Date().getTime();

            const joinDateRaw = d.join_date ?? me.join_date;
            if (joinDateRaw) {
                const joinDate = new Date(joinDateRaw as string).getTime();
                const diffDays = (nowTime - joinDate) / (1000 * 3600 * 24);
                if (diffDays <= 7) {
                    newNotifs.push({
                        id: notifId++,
                        icon: Star,
                        color: "#F4A623",
                        title: "مرحباً بك في النادي!",
                        body: "تم تفعيل عضويتك بنجاح. نتمنى لك تجربة رياضية ممتعة.",
                        time: "مؤخراً",
                    });
                }
            }

            const expiryDateRaw = d.expiry_date ?? me.expiry_date;
            if (expiryDateRaw) {
                const expiryDate = new Date(expiryDateRaw as string).getTime();
                const diffDaysExp = (expiryDate - nowTime) / (1000 * 3600 * 24);
                if (diffDaysExp <= 30 && diffDaysExp > 0) {
                    newNotifs.push({
                        id: notifId++,
                        icon: Bell,
                        color: "#2EA7C9",
                        title: "تجديد العضوية",
                        body: "تاريخ انتهاء عضويتك يقترب، يُرجى التواصل مع الإدارة للتجديد ودفع الأقساط.",
                        time: "قريباً",
                    });
                } else if (diffDaysExp <= 0) {
                    newNotifs.push({
                        id: notifId++,
                        icon: Bell,
                        color: "#D93025",
                        title: "عضوية منتهية",
                        body: "انتهت صلاحية عضويتك، يُرجى المبادرة بالتجديد ودفع الأقساط المستحقة لتجنب الغرامات.",
                        time: "منتهي",
                    });
                }
            }

            // Add notifications for expiring sports
            sports.forEach(sport => {
                // 1. Check for "New Join" notification from localStorage
                const joinKey = `new_join_${userId}_${sport.id}`;
                if (localStorage.getItem(joinKey)) {
                    newNotifs.push({
                        id: notifId++,
                        icon: Trophy,
                        color: sport.color || "#16A34A",
                        title: `اشتراك جديد: ${sport.nameAr}`,
                        body: "سيتم ابلاغكم بمعاد بدا التمرين",
                        time: "الآن",
                    });
                }

                if (sport.endDate) {
                    const sportEndDate = new Date(sport.endDate).getTime();
                    const diffDaysSport = (sportEndDate - nowTime) / (1000 * 3600 * 24);
                    if (diffDaysSport <= 3 && diffDaysSport > 0) {
                        newNotifs.push({
                            id: notifId++,
                            icon: Bell,
                            color: sport.color || "#2EA7C9",
                            title: `انتهاء اشتراك ${sport.nameAr}`,
                            body: `اشتراكك في رياضة ${sport.nameAr} سينتهي خلال ${Math.ceil(diffDaysSport)} أيام. يرجى التجديد لتجنب الانقطاع.`,
                            time: "قريباً",
                        });
                    } else if (diffDaysSport <= 0 && sport.status === "نشط") {
                        // Only show if it was active and now expired
                        newNotifs.push({
                            id: notifId++,
                            icon: Bell,
                            color: "#D93025",
                            title: `انتهاء اشتراك ${sport.nameAr}`,
                            body: `انتهى اشتراكك في رياضة ${sport.nameAr}. يرجى التجديد لإعادة الانضمام.`,
                            time: "منتهي",
                        });
                    }
                }
            });

            if (newNotifs.length === 0) {
                newNotifs.push({
                    id: notifId++,
                    icon: Info,
                    color: "#1F3A5F",
                    title: "إشعار عام",
                    body: "يرجى متابعة المواعيد والإشعارات الخاصة بالأنشطة الرياضية.",
                    time: "هذا الأسبوع",
                });
            }

            setNotifications(newNotifs);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { void loadData(); }, [loadData]);

    const initials = info
        ? `${info.nameAr.trim().charAt(0)}${info.nameAr.trim().split(" ").at(-1)?.charAt(0) ?? ""}`
        : "";
    const displayPhoto = resolveFileUrl(info?.photo);

    /* Helper: format booking date/time nicely */
    const formatBookingTime = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return `${WEEKDAYS_AR[d.getDay()]}، ${d.getDate()} ${MONTHS_AR[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        } catch {
            return dateStr;
        }
    };

    const handleCopyLink = () => {
        if (selectedReservation?.shareToken) {
            const link = `${window.location.origin}/bookings/share/${selectedReservation.shareToken}`;
            navigator.clipboard.writeText(link);
            toast.success("تم نسخ الرابط بنجاح!");
        }
    };

    return (
        <div className="space-y-4" dir="rtl">
            <Toaster position="top-center" />

            {/* ── Top bar: date + clock */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{formatDateAr(now)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#214474] font-semibold tabular-nums text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimeAr(now)}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2EA7C9] border-t-transparent" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* ── Card 1: Member info ───────────────────────────── */}
                    <Card title="بياناتي" icon={User} accent="#1b71bc">
                        {/* Avatar + name row */}
                        <div className="flex items-center gap-4 mb-5">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden"
                                style={{ background: "linear-gradient(135deg,#1F3A5F,#2EA7C9)" }}
                            >
                                {displayPhoto ? (
                                    <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    initials || <User className="h-7 w-7" />
                                )}
                            </div>
                            <div>
                                <p className="text-xl font-bold text-foreground">{info?.nameAr}</p>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-xs bg-[#1F3A5F]/10 text-[#1F3A5F] rounded-full px-2.5 py-1 font-medium">
                                        <CreditCard className="h-3 w-3" />{info?.memberType}
                                    </span>
                                    <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${statusBadge(info?.status ?? "")}`}>
                                        {statusLabel(info?.status ?? "")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border my-4" />

                        {/* Quick stats row */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                                { label: "رقم العضو", value: info?.memberId ?? "—" },
                                { label: "الرياضات", value: sports.length },
                                { label: "الحجوزات", value: reservations.length },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-xl bg-muted/40 py-3 px-2">
                                    <p className="text-lg font-bold text-[#1F3A5F]">{stat.value}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* ── Card 2: Sports subscriptions — list with name + next day + time ─ */}
                    <Card title="اشتراكاتي الرياضية" icon={Trophy} accent="#2EA7C9" delay={0.06}>
                        {sports.length > 0 ? (
                            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                                {sports.map((sport, idx) => {
                                    const parts = sport.schedule ? sport.schedule.split("|") : [];
                                    const days = parts[0]?.trim() || "";
                                    const time = parts[1]?.trim() || "";
                                    const color = SPORT_COLORS[idx % SPORT_COLORS.length];
                                    return (
                                        <motion.div
                                            key={sport.id}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.08 + idx * 0.06 }}
                                            className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors"
                                        >
                                            {/* Sport icon */}
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                                                style={{ backgroundColor: color }}
                                            >
                                                <SportIcon name={sport.nameAr} />
                                            </div>

                                            {/* Name + schedule */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground leading-tight">{sport.nameAr}</p>
                                                <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                                    {days && (
                                                        <span
                                                            className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5"
                                                            style={{ backgroundColor: color + "18", color }}
                                                        >
                                                            <CalendarDays className="h-2.5 w-2.5" />
                                                            {days}
                                                        </span>
                                                    )}
                                                    {time && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {time}
                                                        </span>
                                                    )}
                                                    {!days && !time && (
                                                        <span className="text-[10px] text-muted-foreground/60 italic">لا يوجد جدول محدد</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Active dot */}
                                            <div className="w-2 h-2 rounded-full shrink-0 bg-green-500 shadow-sm" title="نشط" />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-6 gap-3 text-center">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: "rgba(46,167,201,0.1)" }}
                                >
                                    <Trophy className="h-8 w-8 text-[#2EA7C9]" />
                                </div>
                                <p className="text-sm font-medium text-foreground">لا توجد اشتراكات رياضية</p>
                                <p className="text-xs text-muted-foreground">
                                    يمكنك الاشتراك في الأنشطة الرياضية للنادي من خلال مكتب التسجيل
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* ── Card 3: Court Reservations ───────────────────── */}
                    <Card title="حجوزات الملاعب" icon={CalendarDays} accent="#F4A623" delay={0.1}>
                        {reservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-6 gap-3 text-center">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: "rgba(244,166,35,0.1)" }}
                                >
                                    <Volleyball className="h-8 w-8 text-[#F4A623]" />
                                </div>
                                <p className="text-sm font-medium text-foreground">لا توجد حجوزات حالياً</p>
                                <p className="text-xs text-muted-foreground">
                                    ستظهر هنا حجوزاتك القادمة للملاعب والمرافق الرياضية
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                                {reservations.map((r) => (
                                    <div 
                                        key={r.id} 
                                        onClick={() => setSelectedReservation(r)}
                                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: "#F4A623" }}>
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{r.facilityName}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {formatBookingTime(r.timeFrom)}
                                                {r.timeTo && r.timeTo !== r.timeFrom && (
                                                    <> — {new Date(r.timeTo).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</>
                                                )}
                                            </p>
                                            {r.price > 0 && (
                                                <p className="text-[11px] font-bold text-ds-orange mt-1">
                                                    💰 {r.price.toLocaleString("ar-EG")} ج.م
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs rounded-full px-2.5 py-1 font-medium shrink-0 ${statusBadge(r.status)}`}>
                                                {statusLabel(r.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* ── Card 4: Notifications ───────────────────────── */}
                    <Card title="الإشعارات" icon={Bell} accent="#1F3A5F" delay={0.14}>
                        <div className="space-y-3">
                            {notifications.length > 0 && notifications.some(n => !readNotifs.includes(n.id)) && (
                                <div className="flex justify-between items-center pb-2 pt-1 mb-2">
                                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded">لديك إشعارات غير مقروءة</span>
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="flex items-center gap-1.5 text-xs font-bold text-[#2EA7C9] hover:text-[#1b71bc] bg-[#2EA7C9]/10 px-3 py-1.5 rounded-lg transition-all hover:bg-[#2EA7C9]/20"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                        تحديد الكل كمقروء
                                    </button>
                                </div>
                            )}

                            {notifications.length > 0 ? (
                                notifications.map((n, idx) => {
                                    const isRead = readNotifs.includes(n.id);
                                    return (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.18 + idx * 0.06 }}
                                            className={`flex items-start gap-4 rounded-xl border px-4 py-3.5 relative overflow-hidden transition-all duration-300 ${isRead ? "bg-muted/10 border-border opacity-70" : "bg-card border-r-4 shadow-sm"}`}
                                            style={{ borderRightColor: isRead ? "transparent" : n.color }}
                                        >
                                            {!isRead && (
                                                <div className="absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rotate-45 opacity-20" style={{ backgroundColor: n.color }}></div>
                                            )}

                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 relative z-10 ${isRead ? 'grayscale opacity-50' : 'shadow-md'}`}
                                                style={{ backgroundColor: n.color }}
                                            >
                                                <n.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 relative z-10">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className={`text-sm font-bold ${isRead ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                                                        {!isRead && (
                                                            <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm bg-red-500 animate-pulse">جديد</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground/60 shrink-0 bg-muted/60 rounded-full px-2 py-0.5">{n.time}</span>
                                                </div>
                                                <p className={`text-xs leading-relaxed ${isRead ? "text-muted-foreground/80" : "text-muted-foreground font-medium"}`}>{n.body}</p>

                                                {!isRead && (
                                                    <div className="mt-2.5 flex justify-end">
                                                        <button
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-emerald-600 transition-colors bg-muted/40 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-emerald-200"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            تحديد كمقروء
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    لا توجد إشعارات حالياً
                                </div>
                            )}

                            {/* "No more" hint */}
                            {notifications.length > 0 && (
                                <div className="flex items-center justify-center gap-2 pt-1">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-[11px] text-muted-foreground/50">لا توجد إشعارات أخرى</span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                            )}
                        </div>
                    </Card>

                </div>
            )}

            {/* Modal for Reservation Link */}
            {selectedReservation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="bg-[#1F3A5F] p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">تفاصيل الحجز والدعوة</h3>
                            <button 
                                onClick={() => setSelectedReservation(null)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                                    ✕
                                </div>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 text-foreground text-sm">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                <p className="font-bold text-base mb-1">{selectedReservation.facilityName}</p>
                                <p className="text-muted-foreground">{formatBookingTime(selectedReservation.timeFrom)}</p>
                            </div>
                            
                            {selectedReservation.shareToken ? (
                                <div className="space-y-3">
                                    <p className="text-muted-foreground font-medium leading-relaxed">
                                        استخدم الرابط أدناه لدعوة أصدقائك أو الفريق للانضمام إلى محفظة هذا الحجز.  
                                        يمكن للأشخاص الذين يمتلكون هذا الرابط تسجيل بياناتهم للانضمام.
                                    </p>
                                    <div className="flex gap-2 items-stretch mt-4">
                                        <button
                                            onClick={handleCopyLink}
                                            className="bg-[#2EA7C9] hover:bg-[#1b71bc] text-white px-4 py-2 rounded-xl transition-colors font-bold whitespace-nowrap"
                                        >
                                            نسخ الرابط
                                        </button>
                                        <div className="bg-muted/50 border border-border px-3 py-2 rounded-xl flex-1 overflow-x-auto text-left text-xs text-muted-foreground scrollbar-hide flex items-center truncate" dir="ltr">
                                            {`${window.location.origin}/bookings/share/${selectedReservation.shareToken}`}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground font-medium">عذراً، لا يوجد رابط دعوة متوفر لهذا الحجز حالياً.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
