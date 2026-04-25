import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Search, RefreshCw, Shield, ChevronRight, ChevronLeft, Loader2,
    Users, ArrowRight, Trash2, RotateCcw, AlertTriangle, Filter, List,
} from "lucide-react";
import api from "../api/axios";
import { StaffService } from "../services/staffService";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import { useToast } from "../hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffApiItem = {
    id: number;
    first_name_ar?: string;
    last_name_ar?: string;
    first_name_en?: string;
    last_name_en?: string;
    national_id?: string;
    role?: string;
    staff_type?: string;
    staff_type_id?: number;
    status?: string;
    employment_start_date?: string;
    created_at?: string;
    start_date?: string;
};

type StaffRow = {
    id: number;
    nameAr: string;
    nameEn: string;
    nationalId: string;
    role: string;
    status: string;
    startDate: string;
};

type GrantedPrivilege = {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    module: string;
    source: "direct" | "package" | "default"; // NEW
    can_revoke: boolean; // NEW
    package_id?: number; // NEW
    package_code?: string; // NEW
    reason?: string; // NEW
    markedForRevocation: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

const PALETTE = [
    "#1b71bc", "#e05c2a", "#2a9d60", "#7c3aed",
    "#0891b2", "#be185d", "#ca8a04", "#475569",
];
const getColor = (id: number) => PALETTE[id % PALETTE.length];
const getInitials = (ar?: string, en?: string) =>
    (ar || en || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const formatDate = (v?: string | null) => {
    if (!v) return "—";
    try { return new Date(v).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return v; }
};

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "مدير النظام",
    SPORTS_DIRECTOR: "مدير الرياضة",
    SPORTS_OFFICER: "موظف رياضي",
    FINANCIAL_DIRECTOR: "المدير المالي",
    REGISTRATION_STAFF: "موظف تسجيل",
    TEAM_MANAGER: "مدير فريق",
    SUPPORT: "الدعم الفني",
    AUDITOR: "المدقق المالي",
    STAFF: "موظف",
};

// Source labels and colors
const SOURCE_LABELS: Record<string, { ar: string; color: string }> = {
    direct: { ar: "مباشر", color: "emerald" },
    package: { ar: "من حزمة", color: "blue" },
    default: { ar: "افتراضي", color: "amber" },
};

const parseGrantedPrivileges = (response: unknown): Omit<GrantedPrivilege, "markedForRevocation">[] => {
    const out: Omit<GrantedPrivilege, "markedForRevocation">[] = [];
    if (!isRecord(response)) return out;

    const payload = response.data ?? response;
    const arr: unknown[] = Array.isArray((payload as Record<string, unknown>).privileges)
        ? (payload as Record<string, unknown>).privileges as unknown[]
        : Array.isArray(payload)
            ? payload as unknown[]
            : Array.isArray((payload as Record<string, unknown>).data)
                ? (payload as Record<string, unknown>).data as unknown[]
                : [];

    const parseSource = (v: unknown): GrantedPrivilege["source"] => {
        const raw = String(v ?? "").toLowerCase();
        if (raw === "direct" || raw === "package" || raw === "default") return raw;
        return "direct";
    };

    arr.forEach((item) => {
        if (!isRecord(item)) return;
        const id = Number(item.id);
        const code = String(item.code ?? "").trim();
        if (!Number.isFinite(id) || id <= 0 || !code) return;
        out.push({
            id,
            code,
            nameAr: String(item.name_ar ?? ""),
            nameEn: String(item.name_en ?? ""),
            module: String(item.module ?? "General"),
            source: parseSource(item.source), // NEW
            can_revoke: item.can_revoke !== false, // NEW - default to true if not present
            package_id: Number(item.package_id) || undefined, // NEW
            package_code: String(item.package_code ?? "") || undefined, // NEW
            reason: String(item.reason ?? ""), // NEW
        });
    });
    return out;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RevokePrivilegesPage() {
    const { toast } = useToast();

    // ── VIEW STATE ──────────────────────────────────────────────────────────────
    const [step, setStep] = useState<"table" | "revoke">("table");
    const [selectedStaff, setSelectedStaff] = useState<StaffRow | null>(null);
    const [activeTab, setActiveTab] = useState<"filters" | "list">("list");

    // ── STEP 1: Staff Table ─────────────────────────────────────────────────────
    const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchStaff = useCallback(
        async (page: number, q: string, role: string, from: string, to: string) => {
            setIsLoading(true);
            try {
                const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
                if (role) params.role = role;
                const res = await api.get("/staff", { params });
                const raw = res.data;
                const data: StaffApiItem[] = Array.isArray(raw)
                    ? raw : Array.isArray(raw?.data) ? raw.data : [];
                const total: number = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? data.length;

                const trim = q.trim().toLowerCase();
                let filtered = trim
                    ? data.filter((s) =>
                        `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.includes(q.trim()) ||
                        `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.toLowerCase().includes(trim) ||
                        (s.national_id ?? "").includes(trim)
                    )
                    : data;

                if (from || to) {
                    const fromMs = from ? new Date(from).setHours(0, 0, 0, 0) : -Infinity;
                    const toMs = to ? new Date(to).setHours(23, 59, 59, 999) : Infinity;
                    filtered = filtered.filter((s) => {
                        const rawDate = s.employment_start_date ?? s.start_date ?? s.created_at;
                        if (!rawDate) return false;
                        const ms = new Date(rawDate).getTime();
                        return ms >= fromMs && ms <= toMs;
                    });
                }

                const rows: StaffRow[] = filtered.map((s) => ({
                    id: s.id,
                    nameAr: `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.trim(),
                    nameEn: `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.trim(),
                    nationalId: s.national_id ?? "",
                    role: String(s.role ?? s.staff_type ?? "STAFF").toUpperCase(),
                    status: String(s.status ?? "").toLowerCase(),
                    startDate: s.employment_start_date ?? s.start_date ?? s.created_at ?? "",
                }));

                setStaffRows(rows);
                setTotalCount(trim || from || to ? rows.length : total);
            } catch {
                toast({ title: "خطأ", description: "فشل تحميل قائمة الموظفين", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    useEffect(() => { void fetchStaff(currentPage, search, roleFilter, dateFrom, dateTo); }, [currentPage, search, roleFilter, dateFrom, dateTo]);

    const handleSearchChange = (value: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setSearch(value); setCurrentPage(1); }, 300);
    };

    const handleRoleFilter = (role: string) => { setRoleFilter(role); setCurrentPage(1); };
    const clearDateFilter = () => { setDateFrom(""); setDateTo(""); setCurrentPage(1); };
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // ── STEP 2: Revoke state ────────────────────────────────────────────────────
    const [grantedPrivileges, setGrantedPrivileges] = useState<GrantedPrivilege[]>([]);
    const [loadingPrivileges, setLoadingPrivileges] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState<Array<{ privilege_id: number; error: string; code: string }>>([]);

    const fetchPrivileges = useCallback(async (staffId: number) => {
        setLoadingPrivileges(true);
        setFailedAttempts([]);
        try {
            const res = await StaffService.getPrivileges(staffId);
            const parsed = parseGrantedPrivileges(res);
            setGrantedPrivileges(parsed.map((p) => ({ ...p, markedForRevocation: false })));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message 
                || error?.response?.data?.error 
                || error?.message 
                || "فشل تحميل صلاحيات الموظف";
            
            console.error('Error fetching privileges:', error);
            
            toast({ 
                title: "خطأ", 
                description: errorMessage, 
                variant: "destructive" 
            });
            setGrantedPrivileges([]);
        } finally {
            setLoadingPrivileges(false);
        }
    }, [toast]);

    const openRevoke = (staff: StaffRow) => {
        setSelectedStaff(staff);
        setSearchQuery("");
        setStep("revoke");
    };

    useEffect(() => {
        if (step === "revoke" && selectedStaff) {
            void fetchPrivileges(selectedStaff.id);
        }
    }, [step, selectedStaff, fetchPrivileges]);

    // ── Revoke logic ────────────────────────────────────────────────────────────
    const toggleRevoke = (code: string) => {
        setGrantedPrivileges((prev) =>
            prev.map((p) => p.code === code ? { ...p, markedForRevocation: !p.markedForRevocation } : p)
        );
    };

    const markAll = () => setGrantedPrivileges((prev) =>
        prev.map((p) => ({ ...p, markedForRevocation: !p.markedForRevocation }))
    );
    const clearAll = () => setGrantedPrivileges((prev) => prev.map((p) => ({ ...p, markedForRevocation: false })));

    const markedIds = useMemo(
        () => grantedPrivileges.filter((p) => p.markedForRevocation).map((p) => p.id),
        [grantedPrivileges]
    );

    const handleRevoke = async () => {
        if (!selectedStaff || markedIds.length === 0) return;
        setIsSaving(true);
        setFailedAttempts([]);
        try {
            const result = await StaffService.revokePrivileges(selectedStaff.id, markedIds, "Revoked from revoke-privileges page");

            if (result.failed_attempts && result.failed_attempts.length > 0) {
                setFailedAttempts(result.failed_attempts);
                const successCount = result.successful_revokes || 0;
                toast({
                    title: "تم سحب البعض",
                    description: `تم سحب ${successCount} صلاحية بنجاح. ${result.failed_revokes} صلاحية لم يمكن سحبها مباشرة.`,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "تم سحب الصلاحيات",
                    description: `تم سحب ${markedIds.length} صلاحية من ${selectedStaff.nameAr || selectedStaff.nameEn} بنجاح.`,
                });
            }

            // Re-fetch to reflect changes
            await fetchPrivileges(selectedStaff.id);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء سحب الصلاحيات";
            toast({ title: "فشل السحب", description: errorMessage, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Grouped + filtered view ─────────────────────────────────────────────────
    const filteredGroups = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const map = new Map<string, GrantedPrivilege[]>();
        grantedPrivileges.forEach((p) => {
            if (q && !(p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))) return;
            map.set(p.module, [...(map.get(p.module) ?? []), p]);
        });
        return Array.from(map.entries())
            .map(([module, items]) => ({ module, items: [...items].sort((a, b) => (a.nameAr || a.code).localeCompare(b.nameAr || b.code)) }))
            .sort((a, b) => a.module.localeCompare(b.module));
    }, [grantedPrivileges, searchQuery]);

    // ─── STEP 1 RENDER: Staff Table ────────────────────────────────────────────
    if (step === "table") {
        return (
            <div className="h-[calc(100dvh-4rem)] flex flex-col overflow-hidden" dir="rtl">

                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-background shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
                                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 shrink-0" />
                                سحب صلاحيات الموظفين
                            </h1>
                            <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 truncate">
                                اختر موظفاً لعرض صلاحياته الحالية وسحب ما تريده
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={() => void fetchStaff(currentPage, search, roleFilter, dateFrom, dateTo)}
                                disabled={isLoading}
                                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border hover:bg-muted transition-colors text-[10px] sm:text-sm text-muted-foreground disabled:opacity-40"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? "animate-spin" : ""}`} />
                                <span className="hidden xs:inline">تحديث</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Tab Switcher */}
                    <div className="flex sm:hidden items-center gap-2 bg-muted/50 p-1 rounded-xl mt-3 w-full overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-1 flex-1 min-w-[220px]">
                            <button
                                onClick={() => setActiveTab("list")}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "list"
                                    ? "bg-background text-rose-600 shadow-sm ring-1 ring-border"
                                    : "text-muted-foreground hover:bg-background/50"
                                    }`}
                            >
                                <List className="w-3.5 h-3.5" />
                                قائمة الموظفين
                            </button>
                            <button
                                onClick={() => setActiveTab("filters")}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "filters"
                                    ? "bg-background text-rose-600 shadow-sm ring-1 ring-border"
                                    : "text-muted-foreground hover:bg-background/50"
                                    }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                الفلاتر
                            </button>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {(() => {
                                        const pages = Array.from(new Set([1, currentPage, totalPages]))
                                            .filter((p) => p >= 1 && p <= totalPages)
                                            .sort((a, b) => a - b);

                                        const out: (number | "…")[] = [];
                                        for (let i = 0; i < pages.length; i++) {
                                            const p = pages[i];
                                            if (i > 0 && p - (pages[i - 1] as number) > 1) out.push("…");
                                            out.push(p);
                                        }
                                        return out;
                                    })().map((p, i) =>
                                        p === "…" ? (
                                            <span key={`m-el-${i}`} className="px-0.5 text-muted-foreground text-[10px]">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p as number)}
                                                className={`min-w-[28px] h-7 rounded-md text-[10px] font-bold transition-colors border ${currentPage === p
                                                    ? "bg-rose-500 text-white border-rose-500"
                                                    : "border-border hover:bg-muted text-foreground"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Role filter tabs - Desktop/Filters Tab */}
                    <div className={`${activeTab === "filters" ? "flex" : "hidden sm:flex"} items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide`}>
                    {[
                        { value: "", label: "الكل" },
                        { value: "ADMIN", label: "مدير" },
                        { value: "SPORTS_DIRECTOR", label: "مدير رياضة" },
                        { value: "SPORTS_OFFICER", label: "موظف رياضي" },
                        { value: "FINANCIAL_DIRECTOR", label: "مالي" },
                        { value: "REGISTRATION_STAFF", label: "تسجيل" },
                        { value: "TEAM_MANAGER", label: "مدير فريق" },
                        { value: "SUPPORT", label: "دعم فني" },
                        { value: "AUDITOR", label: "مدقق" },
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => handleRoleFilter(f.value)}
                            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-sm font-medium transition-all whitespace-nowrap ${roleFilter === f.value
                                ? "bg-rose-500 text-white shadow-sm"
                                : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className={`${activeTab === "filters" ? "flex" : "hidden sm:flex"} flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-b border-border bg-muted/20 shrink-0`}>
                <div className="relative w-full sm:w-64 lg:w-72">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="ابحث بالاسم أو الرقم القومي..."
                        defaultValue={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pr-9 h-9 sm:h-10 text-xs sm:text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap">من:</span>
                            <input
                                type="date"
                                value={dateFrom}
                                max={dateTo || undefined}
                                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                                className="h-8 sm:h-10 px-2 sm:px-3 text-[10px] sm:text-sm border-2 border-border rounded-lg sm:rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-background text-foreground shrink-0"
                            />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap">إلى:</span>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                                className="h-8 sm:h-10 px-2 sm:px-3 text-[10px] sm:text-sm border-2 border-border rounded-lg sm:rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-background text-foreground shrink-0"
                            />
                        </div>
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={clearDateFilter}
                                className="h-8 sm:h-10 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-rose-600 border-2 border-rose-200 rounded-lg sm:rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
                            >
                                مسح التاريخ
                            </button>
                        )}
                    </div>

                    <Badge variant="outline" className="text-[10px] sm:text-xs text-muted-foreground shrink-0 w-fit">
                        {totalCount} موظف
                    </Badge>

                    <div className="hidden sm:block flex-1" />

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-0">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-1.5 sm:p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                            >
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {(() => {
                                    const pages = Array.from(new Set([1, currentPage, totalPages]))
                                        .filter((p) => p >= 1 && p <= totalPages)
                                        .sort((a, b) => a - b);

                                    const out: (number | "…")[] = [];
                                    for (let i = 0; i < pages.length; i++) {
                                        const p = pages[i];
                                        if (i > 0 && p - (pages[i - 1] as number) > 1) out.push("…");
                                        out.push(p);
                                    }
                                    return out;
                                })().map((p, i) =>
                                    p === "…" ? (
                                        <span key={`el-${i}`} className="px-1 text-muted-foreground text-[10px] sm:text-xs">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            className={`min-w-[28px] sm:min-w-[36px] h-7 sm:h-9 rounded-md text-[10px] sm:text-xs font-medium transition-colors border ${currentPage === p
                                                ? "bg-rose-500 text-white border-rose-500"
                                                : "border-border hover:bg-muted text-foreground"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-1.5 sm:p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div 
                    className={`${activeTab === "list" ? "flex" : "hidden sm:flex"} flex-1 overflow-auto overscroll-contain scrollbar-hide`} 
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-20 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin mb-3" />
                            <p className="text-xs sm:text-sm">جارٍ تحميل الموظفين...</p>
                        </div>
                    ) : staffRows.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-20 text-muted-foreground">
                            <div className="rounded-full bg-muted/30 p-4 sm:p-6 mb-4 w-fit mx-auto">
                                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">لا يوجد موظفون</h3>
                            <p className="text-[10px] sm:text-sm px-4 text-center">{search || roleFilter ? "لا توجد نتائج مطابقة" : "لم يتم العثور على موظفين"}</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                                <tr>
                                    <th className="text-right px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10">#</th>
                                    <th className="text-right px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-[10px] sm:text-xs text-muted-foreground">الموظف</th>
                                    <th className="hidden sm:table-cell text-right px-4 py-3 font-bold text-xs text-muted-foreground">الرقم القومي</th>
                                    <th className="text-center px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-[10px] sm:text-xs text-muted-foreground">الوظيفة</th>
                                    <th className="hidden md:table-cell text-right px-4 py-3 font-bold text-xs text-muted-foreground">بداية العمل</th>
                                    <th className="text-center px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-[10px] sm:text-xs text-muted-foreground">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {staffRows.map((staff, idx) => (
                                    <tr key={staff.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-muted-foreground font-mono text-[10px] sm:text-xs">
                                            {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                        </td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div
                                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shrink-0"
                                                    style={{ backgroundColor: getColor(staff.id) }}
                                                >
                                                    {getInitials(staff.nameAr, staff.nameEn)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold leading-tight text-[11px] sm:text-sm truncate">{staff.nameAr || staff.nameEn || "—"}</p>
                                                    {staff.nameEn && staff.nameAr && (
                                                        <p className="text-[9px] sm:text-[11px] text-muted-foreground/70 italic truncate" dir="ltr">{staff.nameEn}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs">
                                            <span dir="ltr">{staff.nationalId || "—"}</span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-rose-100 text-rose-700 whitespace-nowrap">
                                                {ROLE_LABELS[staff.role] ?? staff.role}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 text-xs tabular-nums">{formatDate(staff.startDate)}</td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 border-rose-300 text-rose-600 hover:bg-rose-50 text-[10px] sm:text-xs font-bold"
                                                onClick={() => openRevoke(staff)}
                                            >
                                                <span className="hidden xs:inline">سحب</span>
                                                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
    }

    // ─── STEP 2 RENDER: Revoke Privileges ──────────────────────────────────────
    return (
        <div className="h-[calc(100dvh-4rem)] flex flex-col overflow-hidden" dir="rtl">

            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-background shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <button
                        onClick={() => setStep("table")}
                        className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-muted"
                    >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        العودة
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <div className="min-w-0 flex-1 sm:flex-none">
                        <h1 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 truncate">
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
                            سحب: {selectedStaff?.nameAr || selectedStaff?.nameEn}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                            {selectedStaff && (ROLE_LABELS[selectedStaff.role] ?? selectedStaff.role)}
                        </p>
                    </div>
                </div>

                {/* Stats row */}
                {!loadingPrivileges && grantedPrivileges.length > 0 && (
                    <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 overflow-x-auto scrollbar-hide pb-1">
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                            <span>إجمالي:</span>
                            <span className="font-bold text-foreground">{grantedPrivileges.length}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                            <span>سحب:</span>
                            <span className={`font-bold ${markedIds.length > 0 ? "text-rose-600" : "text-foreground"}`}>
                                {markedIds.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Privilege list body */}
            <div className="flex-1 overflow-hidden flex flex-col">

                {/* Search + quick actions bar */}
                <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-border bg-muted/10 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن صلاحية..."
                            className="w-full pr-9 pl-8 py-1.5 sm:py-2 border-2 border-border rounded-lg sm:rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-[11px] sm:text-sm bg-background"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">✕</button>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={markAll}
                            disabled={loadingPrivileges || grantedPrivileges.length === 0}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border-2 border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 whitespace-nowrap"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            تحديد الكل
                        </button>
                        <button
                            onClick={clearAll}
                            disabled={markedIds.length === 0}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border-2 border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 whitespace-nowrap"
                        >
                            <RotateCcw className="w-3 h-3" />
                            تراجع
                        </button>
                    </div>
                </div>

                {/* Privilege cards */}
                <div 
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain scrollbar-hide" 
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    {loadingPrivileges ? (
                        <div className="flex justify-center py-10 sm:py-20">
                            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-rose-400" />
                        </div>
                    ) : grantedPrivileges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl sm:rounded-2xl">
                            <Shield className="h-10 w-10 sm:h-12 sm:w-12 mb-3 text-muted-foreground/30" />
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 text-center px-4">لا توجد صلاحيات ممنوحة</h3>
                            <p className="text-[10px] sm:text-sm text-center px-4">هذا الموظف لا يملك أي صلاحيات حالياً</p>
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl sm:rounded-2xl">
                            <Search className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-muted-foreground/30" />
                            <p className="text-xs sm:text-sm">لا توجد نتائج مطابقة للبحث</p>
                        </div>
                    ) : (
                        filteredGroups.map((group) => (
                            <div key={group.module} className="rounded-xl border-2 border-border overflow-hidden">
                                <div className="bg-muted/50 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border flex items-center justify-between">
                                    <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[70%]">{group.module}</p>
                                    <span className="text-[9px] sm:text-[11px] text-muted-foreground whitespace-nowrap">{group.items.length} صلاحية</span>
                                </div>
                                <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {group.items.map((priv) => {
                                        const marked = priv.markedForRevocation;

                                        return (
                                            <button
                                                key={priv.code}
                                                type="button"
                                                onClick={() => toggleRevoke(priv.code)}
                                                className={`w-full text-right flex items-start gap-2 rounded-lg sm:rounded-xl border-2 px-2.5 py-2 sm:py-2.5 transition-all cursor-pointer group ${
                                                    marked
                                                        ? "bg-rose-50 border-rose-300 shadow-sm"
                                                        : "bg-background border-border hover:border-rose-200 hover:bg-rose-50/40"
                                                }`}
                                            >
                                                {/* Checkbox/Icon */}
                                                <div className={`mt-0.5 shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all ${
                                                    marked
                                                        ? "bg-rose-500 text-white"
                                                        : "bg-emerald-100 text-emerald-600 group-hover:bg-rose-100 group-hover:text-rose-500"
                                                }`}>
                                                    {marked
                                                        ? <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        : <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[11px] sm:text-xs font-bold leading-tight truncate ${
                                                        marked ? "text-rose-800 line-through" : "text-foreground"
                                                    }`}>
                                                        {priv.nameAr || priv.nameEn || priv.code}
                                                    </p>
                                                    <p className={`text-[9px] font-mono mt-0.5 truncate ${
                                                        marked ? "text-rose-500 line-through" : "text-muted-foreground"
                                                    }`}>
                                                        {priv.code}
                                                    </p>

                                                    {/* Source badge */}
                                                    <div className="mt-1.5 flex items-center gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[8px] h-4 sm:h-5 px-1 sm:px-1.5 ${
                                                                priv.source === "direct"
                                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                                                    : priv.source === "package"
                                                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                                                        : "bg-amber-100 text-amber-700 border-amber-300"
                                                            }`}
                                                        >
                                                            {SOURCE_LABELS[priv.source]?.ar || priv.source}
                                                        </Badge>

                                                        {priv.source === "package" && priv.package_code && (
                                                            <span className="text-[8px] text-muted-foreground truncate">
                                                                ({priv.package_code})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Failed attempts warning */}
                {failedAttempts.length > 0 && (
                    <div className="mx-4 sm:mx-6 mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-red-50 border-2 border-red-200">
                        <p className="text-[10px] sm:text-xs font-bold text-red-800 mb-1 sm:mb-2">⚠️ لم يمكن سحب {failedAttempts.length} صلاحية:</p>
                        <ul className="space-y-0.5">
                            {failedAttempts.map((attempt, idx) => (
                                <li key={idx} className="text-[9px] sm:text-[11px] text-red-700">
                                    • <span className="font-mono">{attempt.error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-border bg-background px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                    {markedIds.length > 0
                        ? <><strong className="text-rose-600">{markedIds.length}</strong> محدد</>
                        : "لم يتم تحديد أي شيء"}
                </p>
                <Button
                    variant="destructive"
                    onClick={() => void handleRevoke()}
                    disabled={isSaving || markedIds.length === 0}
                    className="h-9 sm:h-10 gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold"
                >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {isSaving ? "جاري..." : "تأكيد السحب"}
                </Button>
            </div>
        </div>
    );
}
