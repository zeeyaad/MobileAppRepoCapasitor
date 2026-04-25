/**
 * SportManagementPage.tsx  (الأعضاء بالرياضة)
 *
 * Dynamic page — shows team members filtered by sport.
 *
 * Layout matches SportsMembersPage:
 *   Left panel (280px) : sport cards  → GET /sports
 *   Right panel (flex) : members table → GET /sports/team-members[/sport/:name]
 *
 * Default sort: created_at DESC (newest first)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Trophy, Users, Search, RefreshCw, Filter,
    ChevronUp, ChevronDown, ChevronsUpDown,
    ChevronLeft, ChevronRight, Loader2, UserCheck,
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../Component/StaffPagesComponents/ui/use-toast";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../Component/StaffPagesComponents/ui/select";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sport = {
    id: number;
    nameAr: string;
    nameEn: string;
    membersCount: number;
};

type SportApiItem = {
    id: number;
    name?: string;
    name_ar?: string;
    name_en?: string;
    membersCount?: number;
    members_count?: number;
    price?: number | string;
};

type TeamMemberTeamItem = {
    id: number;
    team_name: string;
    status: string;
};

type ApiMember = {
    id: number;
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
    phone?: string | null;
    national_id: string;
    status: string;
    created_at: string;
    team_member_teams?: TeamMemberTeamItem[];
};

const PAGE_SIZE = 50;

type SortField = "name" | "status" | "created_at";
type SortDir = "asc" | "desc";

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    active: { label: "نشط", cls: "bg-emerald-100 text-emerald-700" },
    approved: { label: "مقبول", cls: "bg-emerald-100 text-emerald-700" },
    inactive: { label: "غير نشط", cls: "bg-rose-100 text-rose-700" },
    rejected: { label: "مرفوض", cls: "bg-rose-100 text-rose-700" },
    suspended: { label: "موقوف", cls: "bg-orange-100 text-orange-700" },
    pending: { label: "قيد الانتظار", cls: "bg-amber-100 text-amber-800" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fullNameAr = (m: ApiMember) =>
    [m.first_name_ar, m.last_name_ar].filter(Boolean).join(" ");

const sportTags = (m: ApiMember) =>
    m.team_member_teams ?? [];

// ─── Sport Card (left panel) ──────────────────────────────────────────────────

function SportCard({
    sport,
    count,
    selected,
    onClick,
}: {
    sport: Sport | null;   // null = "All"
    count: number;
    selected: boolean;
    onClick: () => void;
}) {
    const isAll = sport === null;
    return (
        <button
            onClick={onClick}
            className={`
        w-[140px] md:w-full text-right rounded-xl border p-3 md:p-4 transition-all duration-150
        flex items-start gap-2 md:gap-3 shrink-0
        ${selected
                    ? "border-[#214474] bg-[#214474] text-white shadow-md"
                    : "border-border bg-card hover:bg-muted/50 hover:border-[#214474]/40"
                }
      `}
        >
            <div className={`mt-0.5 flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg
        ${selected ? "bg-white/20" : "bg-muted"}`}>
                {isAll
                    ? <Users className={`h-3.5 w-3.5 md:h-4 md:w-4 ${selected ? "text-white" : "text-muted-foreground"}`} />
                    : <Trophy className={`h-3.5 w-3.5 md:h-4 md:w-4 ${selected ? "text-white" : "text-muted-foreground"}`} />
                }
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 md:gap-2">
                    <p className={`text-[11px] md:text-sm font-bold leading-tight truncate ${selected ? "text-white" : "text-foreground"}`}>
                        {isAll ? "الكل" : sport.nameAr}
                    </p>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold
            ${selected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                        {count}
                    </span>
                </div>
                {!isAll && sport && (
                    <p className={`mt-0.5 text-[9px] md:text-[11px] ${selected ? "text-white/70" : "text-muted-foreground"} truncate`} dir="ltr">
                        {sport.nameEn}
                    </p>
                )}
            </div>
        </button>
    );
}

// ─── Sort header helper ───────────────────────────────────────────────────────

function Th({
    field,
    children,
    center,
    sortField,
    sortDir,
    onSort,
    className = "",
}: {
    field?: SortField;
    children: React.ReactNode;
    center?: boolean;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
    className?: string;
}) {
    return (
        <th
            onClick={() => field && onSort(field)}
            className={`
        ${center ? "text-center" : "text-right"}
        px-2 py-2 md:px-4 md:py-3 text-[10px] md:text-xs font-semibold text-muted-foreground
        whitespace-nowrap select-none align-middle
        ${field ? "cursor-pointer hover:text-foreground" : ""}
        ${className}
      `}
        >
            <span className="inline-flex items-center gap-1">
                {children}
                {field && (
                    sortField === field
                        ? sortDir === "asc"
                            ? <ChevronUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                            : <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                        : <ChevronsUpDown className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-40" />
                )}
            </span>
        </th>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SportManagementPage() {
    const { toast } = useToast();

    // ── Sports ──────────────────────────────────────────────────────────────────
    const [sports, setSports] = useState<Sport[]>([]);
    const [sportsLoading, setSportsLoading] = useState(true);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null); // null = All

    // ── Members ─────────────────────────────────────────────────────────────────
    const [members, setMembers] = useState<ApiMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);

    // ── Table state ─────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState<SortField>("created_at");  // default: date
    const [sortDir, setSortDir] = useState<SortDir>("desc");           // newest first
    const [page, setPage] = useState(1);

    // ── Map API sport ────────────────────────────────────────────────────────────
    const mapSport = (item: SportApiItem): Sport => ({
        id: item.id,
        nameAr: item.name_ar || item.name || "",
        nameEn: item.name_en || item.name || "",
        membersCount: item.membersCount ?? item.members_count ?? 0,
    });

    // ── Fetch sports ─────────────────────────────────────────────────────────────
    const fetchSports = useCallback(async () => {
        setSportsLoading(true);
        try {
            const res = await api.get<{ data?: SportApiItem[] }>("/sports");
            setSports(Array.isArray(res?.data?.data) ? res.data.data.map(mapSport) : []);
        } catch (err) {
            toast({ title: "تعذر تحميل الرياضات", description: err instanceof Error ? err.message : "خطأ", variant: "destructive" });
        } finally {
            setSportsLoading(false);
        }
    }, [toast]);

    useEffect(() => { void fetchSports(); }, [fetchSports]);

    // ── Fetch members ────────────────────────────────────────────────────────────
    const fetchMembers = useCallback(async (sport: Sport | null) => {
        setMembersLoading(true);
        try {
            const url = sport
                ? `/sports/team-members/sport/${encodeURIComponent(sport.nameEn || sport.nameAr)}`
                : "/sports/team-members";
            const res = await api.get<{ data?: ApiMember[] }>(url);
            setMembers(Array.isArray(res?.data?.data) ? res.data.data : []);
        } catch (err) {
            setMembers([]);
            toast({ title: "تعذر تحميل الأعضاء", description: err instanceof Error ? err.message : "خطأ", variant: "destructive" });
        } finally {
            setMembersLoading(false);
        }
    }, [toast]);

    useEffect(() => { void fetchMembers(selectedSport); }, [selectedSport, fetchMembers]);

    // ── Handle sport selection ───────────────────────────────────────────────────
    const handleSelectSport = (sport: Sport | null) => {
        setSelectedSport(sport);
        setSearch("");
        setFilterStatus("all");
        setPage(1);
    };

    // ── Sort ──────────────────────────────────────────────────────────────────────
    const handleSort = (f: SortField) => {
        if (f === sortField) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortField(f); setSortDir(f === "created_at" ? "desc" : "asc"); }
    };

    // ── Processed list ────────────────────────────────────────────────────────────
    const processed = useMemo(() => {
        let r = [...members];

        if (filterStatus !== "all") r = r.filter((m) => m.status === filterStatus);

        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter((m) =>
                [fullNameAr(m), m.first_name_en, m.last_name_en, m.national_id, m.phone ?? ""]
                    .some((v) => v.toLowerCase().includes(q))
            );
        }

        r.sort((a, b) => {
            let cmp = 0;
            if (sortField === "name") cmp = fullNameAr(a).localeCompare(fullNameAr(b));
            if (sortField === "national_id") cmp = a.national_id.localeCompare(b.national_id);
            if (sortField === "status") cmp = a.status.localeCompare(b.status);
            if (sortField === "created_at") cmp = a.created_at.localeCompare(b.created_at);
            return sortDir === "asc" ? cmp : -cmp;
        });

        return r;
    }, [members, search, filterStatus, sortField, sortDir]);

    useEffect(() => { setPage(1); }, [search, filterStatus, sortField, sortDir, selectedSport]);

    const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const pageRows = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const thProps = { sortField, sortDir, onSort: handleSort };

    // ─────────────────────────────────────────────────────────────────────────────

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-background" dir="rtl">

            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 px-4 py-3 md:px-6 md:py-4 border-b border-border bg-background"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-[#214474]/10 shrink-0">
                            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-[#214474]" />
                        </div>
                        <div>
                            <h1 className="text-base md:text-xl font-bold tracking-tight text-foreground">
                                الأعضاء بالرياضة
                            </h1>
                            <p className="mt-0.5 text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                                إجمالي: <strong className="text-foreground">{processed.length}</strong> عضو
                                {membersLoading && <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { void fetchSports(); void fetchMembers(selectedSport); }}
                        disabled={membersLoading || sportsLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className={`h-3 w-3 md:h-3.5 md:w-3.5 ${(membersLoading || sportsLoading) ? "animate-spin" : ""}`} />
                        تحديث
                    </button>
                </div>
            </motion.div>

            {/* ── Body: two-panel ── */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                {/* ── Left — Sport Cards ── */}
                <aside className="flex w-full md:w-[280px] shrink-0 flex-col border-b md:border-b-0 md:border-l border-border overflow-hidden">
                    <div className="shrink-0 px-4 pt-3 pb-1 md:pt-4 md:pb-2">
                        <p className="text-[9px] md:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            {sportsLoading && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                            الرياضات
                        </p>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 px-3 pb-3 md:pb-6 overflow-x-auto md:overflow-y-auto scrollbar-none">
                        {/* All card */}
                        <SportCard
                            sport={null}
                            count={selectedSport ? 0 : members.length}
                            selected={selectedSport === null}
                            onClick={() => handleSelectSport(null)}
                        />
                        {/* Per-sport cards */}
                        {sports.map((sport) => (
                            <SportCard
                                key={sport.id}
                                sport={sport}
                                count={selectedSport?.id === sport.id ? members.length : sport.membersCount}
                                selected={selectedSport?.id === sport.id}
                                onClick={() => handleSelectSport(sport)}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Right — Members ── */}
                <main className="flex flex-1 flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 py-2 md:px-5 md:py-3 border-b border-border bg-muted/20">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="بحث..."
                                className="pr-8 md:pr-9 h-8 md:h-9 text-xs md:text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="flex-1 sm:w-40 h-8 md:h-9 text-xs md:text-sm">
                                    <SelectValue placeholder="كل الحالات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs md:text-sm">كل الحالات</SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <SelectItem key={k} value={k} className="text-xs md:text-sm">{v.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto scrollbar-thin pb-10">
                        {membersLoading ? (
                            <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
                                <p className="text-sm">جارٍ تحميل الأعضاء...</p>
                            </div>
                        ) : pageRows.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <UserCheck className="h-12 w-12 opacity-20 mx-auto mb-3" />
                                <p className="text-sm">
                                    {search || filterStatus !== "all"
                                        ? "لا توجد نتائج تطابق البحث"
                                        : selectedSport
                                            ? `لا يوجد أعضاء في رياضة ${selectedSport.nameAr}`
                                            : "لا يوجد أعضاء"}
                                </p>
                            </div>
                        ) : (
                            <div className="min-w-full inline-block align-middle">
                                 <table className="min-w-[700px] w-full text-[10px] md:text-sm border-collapse">
                                     <thead className="sticky top-0 bg-muted/90 backdrop-blur border-b border-border z-10">
                                         <tr>
                                             <Th field="name"       {...thProps}>العضو</Th>
                                             <Th                    {...thProps}>رقم الهاتف</Th>
                                             <Th field="national_id"{...thProps}>الرقم القومي</Th>
                                             <Th                    {...thProps}>الرياضات</Th>
                                             <Th field="created_at" {...thProps}>تاريخ الاشتراك</Th>
                                             <Th field="status"     {...thProps} center>الحالة</Th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-border">
                                         {pageRows.map((m) => (
                                             <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                                                 <td className="px-2 py-2 md:px-4 md:py-3 font-semibold align-middle">
                                                     <div className="truncate max-w-[120px] md:max-w-none">{fullNameAr(m)}</div>
                                                     {(m.first_name_en || m.last_name_en) && (
                                                         <div className="text-[9px] md:text-xs text-muted-foreground font-normal truncate max-w-[120px] md:max-w-none" dir="ltr">
                                                             {[m.first_name_en, m.last_name_en].filter(Boolean).join(" ")}
                                                         </div>
                                                     )}
                                                 </td>
                                                 <td className="px-2 py-2 md:px-4 md:py-3 tabular-nums text-right align-middle">
                                                     <span dir="ltr" className="whitespace-nowrap">{m.phone ?? "—"}</span>
                                                 </td>
                                                 <td className="px-2 py-2 md:px-4 md:py-3 font-mono text-[10px] md:text-xs text-right align-middle">
                                                     <span dir="ltr" className="whitespace-nowrap">{m.national_id}</span>
                                                 </td>
                                                 <td className="px-2 py-2 md:px-4 md:py-3 align-middle">
                                                     <div className="flex flex-wrap gap-1 min-w-[60px]">
                                                         {sportTags(m).length > 0
                                                             ? sportTags(m).map((t) => (
                                                                 <span key={t.id}
                                                                     className="inline-flex items-center gap-1 text-[8px] md:text-xs bg-[#214474]/10 text-[#214474] rounded-full px-1 py-0.5 md:px-1.5 md:py-0.5 font-medium whitespace-nowrap"
                                                                 >
                                                                     <Trophy className="h-2 w-2 md:h-3 md:w-3" />
                                                                     {t.team_name}
                                                                 </span>
                                                             ))
                                                             : <span className="text-muted-foreground text-[9px] md:text-xs">—</span>
                                                         }
                                                     </div>
                                                 </td>
                                                 <td className="px-2 py-2 md:px-4 md:py-3 text-[10px] md:text-xs text-muted-foreground tabular-nums text-right align-middle">
                                                     <span dir="ltr" className="whitespace-nowrap">
                                                         {m.created_at
                                                             ? new Date(m.created_at).toLocaleDateString("ar-EG")
                                                             : "—"}
                                                     </span>
                                                 </td>
                                                 <td className="px-2 py-2 md:px-4 md:py-3 text-center align-middle">
                                                     <span className={`inline-flex text-[8px] md:text-[11px] font-semibold rounded-full px-1.5 py-0.5 md:px-2.5 md:py-0.5 whitespace-nowrap
                                                       ${STATUS_CONFIG[m.status]?.cls ?? "bg-muted text-muted-foreground"}`}>
                                                         {STATUS_CONFIG[m.status]?.label ?? m.status}
                                                     </span>
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!membersLoading && processed.length > PAGE_SIZE && (
                        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 text-sm">
                            <span className="text-muted-foreground text-xs">
                                صفحة {page} من {totalPages} · {processed.length} نتيجة
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = page <= 3 ? i + 1
                                        : page >= totalPages - 2 ? totalPages - 4 + i
                                            : page - 2 + i;
                                    if (pg < 1 || pg > totalPages) return null;
                                    return (
                                        <button
                                            key={pg}
                                            onClick={() => setPage(pg)}
                                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                        ${pg === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                                        >
                                            {pg}
                                        </button>
                                    );
                                })}
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
