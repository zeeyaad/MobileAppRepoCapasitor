import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    ClipboardX,
    RefreshCw,
    Loader2,
    Users,
    Award,
} from "lucide-react";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import api from "../api/axios";
import { useToast } from "../hooks/use-toast";
import DateRangeFilter from "../Component/StaffPagesComponents/shared/DateRangeFilter";
import type { DateRange } from "../Component/StaffPagesComponents/shared/DateRangeFilter";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionStatus = "pending" | "approved" | "declined" | "cancelled";

/**
 * MemberTeam (member-subscriptions) returns:
 *   { id, member_id, status, created_at,
 *     member: { id, first_name_ar, last_name_ar, first_name_en, last_name_en, national_id },
 *     team: { id, name_ar, name_en, sport: { name_ar, name_en } } }
 *
 * TeamMemberTeam (sports/subscriptions) returns:
 *   { id, team_member_id, team_id, status, created_at,
 *     team_member: { id, first_name_ar, last_name_ar, first_name_en, last_name_en },
 *     team?: { id, name_ar, name_en, sport: { name_ar, name_en } } }
 */
interface SportSubscription {
    id: number;
    status: SubscriptionStatus | string;
    created_at: string;
    requesterType: "member" | "team_member";

    // member-subscriptions shape (MemberTeam entity)
    member_id?: number;
    member?: {
        id?: number;
        first_name_ar?: string; last_name_ar?: string;
        first_name_en?: string; last_name_en?: string;
        national_id?: string;
    };
    team?: {
        id?: string;
        name_ar?: string;
        name_en?: string;
        sport?: {
            id?: number;
            name_ar?: string;
            name_en?: string;
        };
    };

    // sports/subscriptions shape (TeamMemberTeam entity)
    team_member_id?: number;
    team_id?: string;
    team_member?: {
        id?: number;
        first_name_ar?: string; last_name_ar?: string;
        first_name_en?: string; last_name_en?: string;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(sub: SportSubscription): string {
    // member-subscriptions: nested member object
    if (sub.member) {
        const ar = [sub.member.first_name_ar, sub.member.last_name_ar].filter(Boolean).join(" ");
        if (ar) return ar;
        const en = [sub.member.first_name_en, sub.member.last_name_en].filter(Boolean).join(" ");
        if (en) return en;
    }
    // sports/subscriptions: nested team_member object
    if (sub.team_member) {
        const ar = [sub.team_member.first_name_ar, sub.team_member.last_name_ar].filter(Boolean).join(" ");
        if (ar) return ar;
        const en = [sub.team_member.first_name_en, sub.team_member.last_name_en].filter(Boolean).join(" ");
        if (en) return en;
    }
    return "—";
}

function getSportName(sub: SportSubscription): string {
    // Both member-subscriptions and team-member subscriptions should have team.sport
    if (sub.team?.sport) {
        return sub.team.sport.name_ar ?? sub.team.sport.name_en ?? "—";
    }
    // Fallback: if no sport but team exists, show team name
    if (sub.team) {
        return sub.team.name_ar ?? sub.team.name_en ?? "—";
    }
    return "—";
}

function getTeamName(sub: SportSubscription): string {
    if (sub.team?.name_ar) return sub.team.name_ar;
    if (sub.team?.name_en) return sub.team.name_en;
    return "—";
}

function getMemberId(sub: SportSubscription): string {
    if (sub.requesterType === "member") {
        const id = sub.member_id ?? sub.member?.id;
        return id != null ? `MEM-${String(id).padStart(3, "0")}` : "—";
    }
    const id = sub.team_member_id ?? sub.team_member?.id;
    return id != null ? `TM-${String(id).padStart(3, "0")}` : "—";
}

function formatArabicDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("ar-EG");
    } catch {
        return dateStr;
    }
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    accentClass = "",
}: {
    label: string;
    value: number | string;
    accentClass?: string;
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-lg border bg-card px-4 py-2 shadow-sm gap-0.5 ${accentClass}`}
        >
            <span className="text-lg font-bold leading-tight">{value}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SportsRequestsPage() {
    const { toast } = useToast();

    const [records, setRecords] = useState<SportSubscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "member" | "team_member">("all");
    const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

    // Per-row action loading
    const [actionId, setActionId] = useState<string | null>(null);

    // ── Fetch from both endpoints in parallel ─────────────────────────────────
    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            // Fetch all subscriptions (not just pending)
            // Remove '/pending' to get all records, or add query params for filtering
            const [memberRes, teamRes] = await Promise.allSettled([
                api.get("/member-subscriptions/pending?limit=100"), // Reduced from 1000 to 100
                api.get("/sports/subscriptions/pending?limit=100"),
            ]);

            // Helper: extract the data array from the API response
            const extractArray = (raw: unknown, label: string): SportSubscription[] => {
                console.log(`[SportsRequestsPage] ${label} raw response:`, raw);
                if (Array.isArray(raw)) return raw as SportSubscription[];
                if (raw && typeof raw === "object") {
                    const obj = raw as Record<string, unknown>;
                    // Standard backend response: { success: true, data: [...], pagination: {...} }
                    if (Array.isArray(obj.data)) return obj.data as SportSubscription[];
                }
                console.warn(`[SportsRequestsPage] ${label}: unrecognized shape:`, raw);
                return [];
            };

            let memberSubs: SportSubscription[] = [];
            if (memberRes.status === "fulfilled") {
                const data = extractArray(memberRes.value.data, "member-subscriptions");
                memberSubs = data.map((item) => ({ ...item, requesterType: "member" as const }));
            } else {
                console.error("[SportsRequestsPage] member-subscriptions failed:", memberRes.reason);
            }

            let teamSubs: SportSubscription[] = [];
            if (teamRes.status === "fulfilled") {
                const data = extractArray(teamRes.value.data, "sports/subscriptions");
                teamSubs = data.map((item) => ({ ...item, requesterType: "team_member" as const }));
            } else {
                console.error("[SportsRequestsPage] sports/subscriptions failed:", teamRes.reason);
            }

            const combined = [...memberSubs, ...teamSubs].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            console.log(`[SportsRequestsPage] total records loaded:`, combined.length, combined);
            setRecords(combined);
        } catch (error) {
            console.error("[SportsRequestsPage] Error fetching records:", error);
            toast({
                title: "خطأ",
                description: "فشل تحميل طلبات الاشتراك",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Stats (from full dataset) ─────────────────────────────────────────────
    const totalCount = records.length;
    const memberCount = records.filter((r) => r.requesterType === "member").length;
    const teamCount = records.filter((r) => r.requesterType === "team_member").length;

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filtered = records.filter((r) => {
        const name = getDisplayName(r);
        const sport = getSportName(r);
        const memberId = getMemberId(r);
        const matchesSearch =
            search.trim() === "" ||
            name.includes(search.trim()) ||
            sport.includes(search.trim()) ||
            memberId.toLowerCase().includes(search.trim().toLowerCase());
        const matchesType = typeFilter === "all" || r.requesterType === typeFilter;
        // Date filter: compare created_at (normalized to YYYY-MM-DD) against the range
        const day = r.created_at ? r.created_at.split("T")[0] : "";
        const matchesDate =
            (!dateRange.from || day >= dateRange.from) &&
            (!dateRange.to || day <= dateRange.to);
        return matchesSearch && matchesType && matchesDate;
    });

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleAction = async (
        sub: SportSubscription,
        action: "approve" | "decline"
    ) => {
        const key = `${sub.requesterType}-${sub.id}-${action}`;
        setActionId(key);
        try {
            if (sub.requesterType === "member") {
                // Endpoint: PATCH /api/member-subscriptions/:subscriptionId/approve  OR  /decline
                await api.patch(`/member-subscriptions/${sub.id}/${action}`, {});
            } else {
                // Endpoint: PATCH /api/sports/subscriptions/:subscriptionId/approve  OR  /decline
                await api.patch(`/sports/subscriptions/${sub.id}/${action}`, {});
            }

            const label = action === "approve" ? "قبول" : "رفض";
            toast({ title: `تم ${label} الطلب بنجاح` });

            // Optimistically remove from list after a brief moment
            setTimeout(() => {
                setRecords((prev) => prev.filter((r) => !(r.id === sub.id && r.requesterType === sub.requesterType)));
            }, 400);
        } catch (error) {
            console.error("[SportsRequestsPage] Error handling action:", error);
            toast({
                title: "خطأ",
                description: "فشل تنفيذ الإجراء، حاول مرة أخرى",
                variant: "destructive",
            });
        } finally {
            setActionId(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col" dir="rtl">

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <ClipboardX className="w-6 h-6 text-primary" />
                                طلبات الاشتراك في الرياضات
                            </h1>
                        </div>
                        <button
                            onClick={() => void fetchRecords()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            تحديث
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* ── Stats Row ── */}
            <div className="px-6 py-3 border-b border-border bg-muted/10 shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
                    <StatCard label="إجمالي الطلبات" value={totalCount} />
                    <StatCard label="أعضاء اجتماعيين" value={memberCount} accentClass="border-blue-200" />
                    <StatCard label="لاعبو الفريق" value={teamCount} accentClass="border-amber-200" />
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="بحث بالاسم، رقم العضو، أو الرياضة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9 h-9"
                    />
                </div>

                {/* Date range filter */}
                <DateRangeFilter
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="فلترة بتاريخ الطلب"
                />

                {/* Type filter tabs */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    {(
                        [
                            { value: "all", label: "الكل" },
                            { value: "member", label: "أعضاء" },
                            { value: "team_member", label: "أعضاء فريق" },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setTypeFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${typeFilter === tab.value
                                ? "bg-white shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Badge variant="outline" className="text-xs text-muted-foreground">
                    {filtered.length} نتيجة
                </Badge>
            </div>

            {/* ── Table ── */}
            <div
                className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {isLoading ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                        <p className="text-sm">جارٍ التحميل...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
                            <ClipboardX className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">
                            {search || typeFilter !== "all"
                                ? "لا توجد نتائج مطابقة"
                                : "لا توجد طلبات حالياً"}
                        </h3>
                        <p className="text-sm">
                            {search
                                ? `لا توجد نتائج مطابقة لـ "${search}"`
                                : "لم يتم العثور على طلبات اشتراك جديدة قيد الانتظار"}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                            <tr>
                                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle w-10">#</th>
                                <th className="text-right pr-4 pl-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">اسم عضو نادي</th>
                                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">رقم العضو</th>
                                <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">النوع</th>
                                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الرياضة</th>
                                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الفريق المطلوب</th>
                                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">تاريخ الطلب</th>
                                <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((sub, idx) => {
                                const approveKey = `${sub.requesterType}-${sub.id}-approve`;
                                const declineKey = `${sub.requesterType}-${sub.id}-decline`;
                                const isActing = actionId === approveKey || actionId === declineKey;
                                const isTeam = sub.requesterType === "team_member";

                                return (
                                    <tr
                                        key={`${sub.requesterType}-${sub.id}`}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        {/* # */}
                                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono align-middle">
                                            {idx + 1}
                                        </td>

                                        {/* Name */}
                                        <td className="px-4 py-3 align-middle font-semibold leading-tight">
                                            {getDisplayName(sub)}
                                        </td>

                                        {/* Member ID */}
                                        <td className="px-4 py-3 font-mono text-xs align-middle text-right">
                                            <span dir="ltr">{getMemberId(sub)}</span>
                                        </td>

                                        {/* Type badge */}
                                        <td className="px-4 py-3 text-center align-middle">
                                            {isTeam ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                                    <Award className="w-3 h-3" />
                                                    لاعب فريق
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                                                    <Users className="w-3 h-3" />
                                                    عضو اجتماعي
                                                </span>
                                            )}
                                        </td>

                                        {/* Sport */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                                                {getSportName(sub)}
                                            </span>
                                        </td>

                                        {/* Team */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                                                {getTeamName(sub)}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums align-middle">
                                            {formatArabicDate(sub.created_at)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                                                    onClick={() => void handleAction(sub, "approve")}
                                                    disabled={isActing}
                                                >
                                                    {actionId === approveKey ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                    )}
                                                    {actionId === approveKey ? "جارٍ..." : "قبول"}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 gap-1.5 border-red-400/50 text-red-600 hover:bg-red-50 disabled:opacity-40"
                                                    onClick={() => void handleAction(sub, "decline")}
                                                    disabled={isActing}
                                                >
                                                    {actionId === declineKey ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    )}
                                                    {actionId === declineKey ? "جارٍ..." : "رفض"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
