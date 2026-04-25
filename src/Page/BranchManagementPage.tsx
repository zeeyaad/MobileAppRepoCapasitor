import React, { useCallback, useEffect, useState, useMemo } from "react";
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../Component/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/StaffPagesComponents/ui/select";
import { Switch } from "../Component/StaffPagesComponents/ui/switch";
import { Plus, Search, RefreshCw, ChevronRight, ChevronLeft, MapPin, Pencil, Trash2, Link, Loader2, Eye, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BranchSport {
    id: number;
    sport_id: number;
    status: 'active' | 'inactive';
    sport?: {
        id: number;
        name_ar: string;
        name_en?: string;
    };
}

export interface Branch {
    id: number;
    code?: string;
    name_ar: string;
    name_en?: string;
    location_ar?: string;
    location_en?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'archived';
    sports_count?: number; 
}

const PAGE_SIZE = 10;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BranchManagementPage() {
    const { toast } = useToast();
    
    // State
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    
    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editBranch, setEditBranch] = useState<Branch | null>(null);
    const [form, setForm] = useState({ code: "", name_ar: "", name_en: "", location_ar: "", location_en: "", phone: "", status: "active" });
    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
    const [saveLoading, setSaveLoading] = useState(false);
    
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [assignBranch, setAssignBranch] = useState<Branch | null>(null);
    const [memberIdForAssign, setMemberIdForAssign] = useState("");
    const [memberName, setMemberName] = useState("");
    const [memberLookupState, setMemberLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
    const [assignLoading, setAssignLoading] = useState(false);

    // Branch Sports Panel State
    const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);
    const [branchSports, setBranchSports] = useState<Record<number, BranchSport[]>>({});
    const [loadingSports, setLoadingSports] = useState<Record<number, boolean>>({});
    
    const [addSportDialogOpen, setAddSportDialogOpen] = useState<number | null>(null);
    const [globalSports, setGlobalSports] = useState<{id: number, nameAr: string}[]>([]);
    const [selectedGlobalSport, setSelectedGlobalSport] = useState<string>("");
    const [addingSport, setAddingSport] = useState(false);
    
    const [deleteBranchSportId, setDeleteBranchSportId] = useState<number | null>(null);
    const [removingSport, setRemovingSport] = useState(false);
    
    // Handlers
    const openAdd = () => {
        setEditBranch(null);
        setForm({ code: "", name_ar: "", name_en: "", location_ar: "", location_en: "", phone: "", status: "active" });
        setFormErrors({});
        setIsAddOpen(true);
    };

    const openEdit = (branch: Branch) => {
        setEditBranch(branch);
        setForm({ 
            code: branch.code || "",
            name_ar: branch.name_ar || "", 
            name_en: branch.name_en || "", 
            location_ar: branch.location_ar || "", 
            location_en: branch.location_en || "",
            phone: branch.phone || "",
            status: branch.status || "active"
        });
        setFormErrors({});
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        setFormErrors({});
        if (!form.name_ar.trim() || !form.location_ar.trim() || (!editBranch && !form.code.trim())) {
            toast({ title: "بيانات ناقصة", description: "يرجى ملء الحقول الإجبارية (الكود والاسم والمكان بالعربية).", variant: "destructive" });
            return;
        }

        setSaveLoading(true);
        try {
            const body = { 
                code: form.code,
                name_ar: form.name_ar, 
                name_en: form.name_en, 
                location_ar: form.location_ar, 
                location_en: form.location_en,
                phone: form.phone,
                status: form.status
            };
            if (editBranch) {
                await api.put(`/branches/${editBranch.id}`, body);
                toast({ title: "تم التحديث", description: "تم تحديث بيانات الفرع بنجاح" });
            } else {
                await api.post("/branches", body);
                toast({ title: "تمت الإضافة", description: "تمت إضافة الفرع بنجاح" });
            }
            setIsAddOpen(false);
            void fetchBranches();
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string, errors?: Record<string, string[]> }, message?: string };
            
            if (e?.responseData?.errors) {
                setFormErrors(e.responseData.errors);
                toast({ title: "أخطاء في الإدخال", description: "يرجى مراجعة الحقول المحددة.", variant: "destructive" });
            } else {
                const msg = e?.responseData?.error || e?.responseData?.message || e?.message || "حدث خطأ غير متوقع عند الحفظ";
                toast({ title: "فشل الحفظ", description: msg, variant: "destructive" });
            }
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/branches/${deleteId}`);
            toast({ title: "تم الحذف", description: "تم حذف الفرع بنجاح" });
            setDeleteId(null);
            void fetchBranches();
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || "حدث خطأ غير متوقع عند الحذف";
            toast({ title: "فشل الحذف", description: msg, variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        const numericId = memberIdForAssign.trim().replace(/\D/g, "");
        if (!numericId) {
            setMemberLookupState("idle");
            setMemberName("");
            return;
        }
        setMemberLookupState("loading");
        const timer = setTimeout(async () => {
            try {
                const res = await api.get<{ data: { name_ar?: string, full_name?: string, first_name_ar?: string, last_name_ar?: string } }>(`/members/${numericId}`);
                const m = res?.data?.data;
                if (m) {
                    const fullName = m.name_ar || m.full_name || [m.first_name_ar, m.last_name_ar].filter(Boolean).join(" ") || "عضو";
                    setMemberName(fullName);
                    setMemberLookupState("found");
                } else {
                    setMemberLookupState("notfound");
                }
            } catch {
                setMemberLookupState("notfound");
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [memberIdForAssign]);

    const handleAssign = async () => {
        if (!assignBranch || !memberIdForAssign.trim()) {
            toast({ title: "بيانات ناقصة", description: "يرجى تحديد العضو المطلوب.", variant: "destructive" });
            return;
        }
        setAssignLoading(true);
        try {
            await api.post(`/branches/${assignBranch.id}/assign-to-member/${memberIdForAssign.trim()}`);
            toast({ title: "تم التعيين", description: "تم ربط العضو بالفرع بنجاح" });
            setAssignBranch(null);
            setMemberIdForAssign("");
            setMemberName("");
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || "حدث خطأ غير متوقع عند التعيين";
            toast({ title: "فشل التعيين", description: msg, variant: "destructive" });
        } finally {
            setAssignLoading(false);
        }
    };

    const loadBranchSports = async (branchId: number) => {
        setLoadingSports(p => ({ ...p, [branchId]: true }));
        try {
            const res = await api.get<{ data: BranchSport[] }>(`/branches/${branchId}/sports`);
            setBranchSports(p => ({ ...p, [branchId]: res?.data?.data || [] }));
        } catch (err) {
            toast({ title: "فشل التحميل", description: "لم نتمكن من جلب الرياضات المرتبطة.", variant: "destructive" });
        } finally {
            setLoadingSports(p => ({ ...p, [branchId]: false }));
        }
    };

    const toggleExpand = (branchId: number) => {
        if (expandedBranchId === branchId) {
            setExpandedBranchId(null);
        } else {
            setExpandedBranchId(branchId);
            if (!branchSports[branchId]) {
                void loadBranchSports(branchId);
            }
        }
    };

    const fetchGlobalSports = async () => {
        try {
            const res = await api.get<{ data: { id: number; name_ar: string; name?: string }[] }>('/sports');
            const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
            setGlobalSports(arr.map(s => ({ id: s.id, nameAr: s.name_ar || s.name || "" })));
        } catch {
            // silent fail
        }
    };

    const openAddSport = (branchId: number) => {
        if (globalSports.length === 0) {
            void fetchGlobalSports();
        }
        setSelectedGlobalSport("");
        setAddSportDialogOpen(branchId);
    };

    const handleAddSport = async () => {
        if (!addSportDialogOpen || !selectedGlobalSport) return;
        setAddingSport(true);
        try {
            await api.post("/branch-sports", { branchId: addSportDialogOpen, sportId: Number(selectedGlobalSport) });
            toast({ title: "تم الإضافة", description: "تم ربط الرياضة بالفرع بنجاح." });
            setAddSportDialogOpen(null);
            void loadBranchSports(addSportDialogOpen);
            void fetchBranches();
        } catch (err) {
            const e = err as any;
            const msg = e?.responseData?.error || e?.responseData?.message || "حدث خطأ أثناء الربط.";
            toast({ title: "فشل الإضافة", description: msg, variant: "destructive" });
        } finally {
            setAddingSport(false);
        }
    };

    const toggleBranchSportStatus = async (branchSportId: number, newState: boolean) => {
        const status = newState ? "active" : "inactive";
        try {
            await api.put(`/branch-sports/${branchSportId}`, { status });
            if (expandedBranchId) {
                setBranchSports(p => {
                    const row = p[expandedBranchId]?.map(item => item.id === branchSportId ? { ...item, status } : item);
                    return { ...p, [expandedBranchId]: row };
                });
            }
        } catch (err) {
            toast({ title: "فشل التحديث", description: "لم نتمكن من تغيير حالة الرياضة.", variant: "destructive" });
            if (expandedBranchId) void loadBranchSports(expandedBranchId);
        }
    };

    const handleRemoveBranchSport = async () => {
        if (!deleteBranchSportId || !expandedBranchId) return;
        setRemovingSport(true);
        try {
            await api.delete(`/branch-sports/${deleteBranchSportId}`);
            toast({ title: "تم الإزالة", description: "تمت إزالة الرياضة بنجاح." });
            setDeleteBranchSportId(null);
            void loadBranchSports(expandedBranchId);
            void fetchBranches();
        } catch (err) {
            toast({ title: "فشل الإزالة", description: "تعذرت الإزالة.", variant: "destructive" });
        } finally {
            setRemovingSport(false);
        }
    };

    // Fetch data
    const fetchBranches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Branch[] }>("/branches");
            const list = res?.data?.data;
            if (Array.isArray(list)) {
                setBranches(list);
            } else {
                setBranches([]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "تعذر تحميل الفروع";
            toast({ title: "فشل التحميل", description: message, variant: "destructive" });
            setBranches([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchBranches();
    }, [fetchBranches]);

    // Derived states
    useEffect(() => { setPage(1); }, [search]); // reset to page 1 on search

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return branches;
        return branches.filter((b) => 
            (b.name_ar && b.name_ar.toLowerCase().includes(q)) || 
            (b.name_en && b.name_en.toLowerCase().includes(q)) || 
            (b.location_ar && b.location_ar.toLowerCase().includes(q))
        );
    }, [branches, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-0 bg-zinc-50/50" dir="rtl">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-200/60 bg-white shrink-0 z-10 shadow-[0_1px_3px_0_rgb(0,0,0,0.01)]">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-zinc-900">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        إدارة الفروع
                    </h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1.5 pr-12">
                        إجمالي الفروع المسجلة: <strong className="text-zinc-800">{branches.length}</strong>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <RoleGuard privilege="CREATE_BRANCH">
                         <Button
                            size="sm"
                            className="gap-2 h-10 px-5 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-900/10 transition-all"
                            onClick={openAdd}
                        >
                            <Plus className="w-4 h-4" />
                            إضافة فرع
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            {/* ── Main area (Table + Toolbar) ── */}
            <div className="flex flex-1 p-6 overflow-hidden">
                <div className="flex flex-col w-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex-1">

                    {/* Toolbar: Search + Refresh + Pagination */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-white shrink-0 flex-wrap">

                        {/* Pagination component */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-zinc-50/80 p-1 rounded-lg border border-zinc-100">
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-500 transition-all disabled:opacity-40"
                                aria-label="الصفحة السابقة"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "…" ? (
                                        <span key={`el-${i}`} className="px-1.5 text-zinc-400 text-xs font-bold">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`min-w-[32px] h-8 rounded-md text-xs font-bold transition-all ${page === p
                                                ? "bg-zinc-900 text-white shadow-sm"
                                                : "hover:bg-white hover:shadow-sm text-zinc-600 hover:text-zinc-900"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                            <button
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-500 transition-all disabled:opacity-40"
                                aria-label="الصفحة التالية"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1" />

                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                            <Input
                                placeholder="بحث بالاسم، أو الموقع..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pr-10 h-10 text-[13px] bg-zinc-50/50 border-zinc-200/80 rounded-xl focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-inner"
                            />
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => { void fetchBranches(); }}
                            disabled={loading}
                            className="p-2.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500 disabled:opacity-40 border border-transparent hover:border-zinc-200"
                            title="تحديث البيانات"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Native HTML Table */}
                    <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                        {loading ? (
                            <div className="py-24 text-center text-zinc-400">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                <p className="text-sm font-medium tracking-wide">جارٍ جلب السجلات...</p>
                            </div>
                        ) : filteredRows.length === 0 ? (
                            <div className="py-24 text-center text-zinc-400 flex flex-col items-center">
                                <div className="rounded-full bg-zinc-50 border border-zinc-100 p-6 mb-5">
                                    <MapPin className="h-10 w-10 text-zinc-300" />
                                </div>
                                <h3 className="text-[15px] font-bold text-zinc-800 mb-1.5">لا يوجد فروع مسجلة</h3>
                                <p className="text-[13px] max-w-sm">
                                    {search ? `لا توجد نتائج مطابقة لـ "${search}"` : "لم يتم إدراج أي فروع بعد. أضف فروعك الآن."}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-right">
                                <thead className="sticky top-0 bg-white z-10 before:absolute before:inset-0 before:border-b before:border-zinc-100 before:pointer-events-none">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle w-12">#</th>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">اسم الفرع</th>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">الكود</th>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">الموقع</th>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">الحالة</th>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle text-center">الرياضات المرتبطة</th>
                                        <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {pagedRows.map((branch, idx) => (
                                        <React.Fragment key={branch.id}>
                                            <tr className="transition-colors hover:bg-zinc-50/80 group">
                                                {/* Serial */}
                                                <td className="px-6 py-3.5 text-[13px] text-zinc-400 font-mono align-middle">
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </td>

                                                {/* Name */}
                                                <td className="px-6 py-3.5 align-middle font-bold text-zinc-900 border-r-2 border-transparent group-hover:border-primary/40 transition-all">
                                                    {branch.name_ar || branch.name_en || "—"}
                                                </td>

                                                {/* Code */}
                                                <td className="px-6 py-3.5 align-middle">
                                                    {branch.code ? (
                                                        <span className="text-[11px] font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{branch.code}</span>
                                                    ) : "—"}
                                                </td>

                                                {/* Location */}
                                                <td className="px-6 py-3.5 align-middle text-zinc-500 font-medium tracking-wide">
                                                    {branch.location_ar || branch.location_en || "—"}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-3.5 align-middle">
                                                    {branch.status ? (
                                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest border ${
                                                            branch.status === 'active' 
                                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                                                : branch.status === 'inactive'
                                                                ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                                                : 'bg-amber-100 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {branch.status === 'active' ? 'نشط' : branch.status === 'inactive' ? 'معطل' : 'مؤرشف'}
                                                        </span>
                                                    ) : "—"}
                                                </td>

                                                {/* Sports Count */}
                                                <td className="px-6 py-3.5 align-middle text-center">
                                                    <span className="bg-zinc-100/80 text-zinc-600 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-200/60 shadow-sm">
                                                        {branch.sports_count ?? "—"}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-3.5 align-middle">
                                                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        
                                                        <RoleGuard privilege="UPDATE_BRANCH">
                                                            <button
                                                                title="تعديل فرع"
                                                                onClick={() => openEdit(branch)}
                                                                className="p-1.5 rounded-lg hover:bg-zinc-900 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-zinc-800"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                        <RoleGuard privilege="ASSIGN_BRANCH_TO_MEMBER">
                                                            <button
                                                                title="تعيين عضو"
                                                                onClick={() => setAssignBranch(branch)}
                                                                className="p-1.5 rounded-lg hover:bg-zinc-900 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-zinc-800"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                        <RoleGuard privilege="CREATE_BRANCH">
                                                            <button
                                                                title="إدارة الرياضات"
                                                                onClick={() => toggleExpand(branch.id)}
                                                                className={`p-1.5 rounded-lg transition-all shadow-sm border border-transparent ${expandedBranchId === branch.id ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-600 hover:text-white text-zinc-500 hover:border-emerald-700'}`}
                                                            >
                                                                <Link className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                        <RoleGuard privilege="DELETE_BRANCH">
                                                            <button
                                                                title="حذف الفرع"
                                                                onClick={() => setDeleteId(branch.id)}
                                                                className="p-1.5 rounded-lg hover:bg-rose-500 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-rose-600"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                    </div>
                                                </td>
                                            </tr>
                                            {/* EXPANDED PANEL HERE */}
                                            {expandedBranchId === branch.id && (
                                                <tr className="bg-zinc-50/80 border-b border-zinc-200/80">
                                                    <td colSpan={7} className="p-0 border-r-4 border-r-emerald-500 shadow-inner">
                                                        <div className="p-6">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="text-[13px] font-bold text-zinc-800 flex items-center gap-2">
                                                                    <Link className="w-4 h-4 text-emerald-600" />
                                                                    الرياضات المرتبطة: {branch.name_ar || branch.name_en}
                                                                </h4>
                                                                <RoleGuard privilege="CREATE_BRANCH">
                                                                    <Button size="sm" onClick={() => openAddSport(branch.id)} className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold rounded-lg px-4">
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                        إضافة رياضة
                                                                    </Button>
                                                                </RoleGuard>
                                                            </div>
                                                            
                                                            {loadingSports[branch.id] ? (
                                                                <div className="flex justify-center py-6 text-zinc-400">
                                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                                </div>
                                                            ) : !branchSports[branch.id]?.length ? (
                                                                <div className="text-center py-6 bg-white rounded-xl border border-zinc-200/60 shadow-sm">
                                                                    <p className="text-xs text-zinc-500 font-medium">لا توجد رياضات مرتبطة بهذا الفرع بعد.</p>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden border-t-0">
                                                                    <table className="w-full text-xs text-right">
                                                                        <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                                                            <tr>
                                                                                <th className="px-5 py-3 font-bold text-zinc-500">اسم الرياضة</th>
                                                                                <th className="px-5 py-3 font-bold text-zinc-500 text-center w-28">الحالة</th>
                                                                                <th className="px-5 py-3 font-bold text-zinc-500 text-center w-24">إجراءات</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-zinc-100">
                                                                            {branchSports[branch.id].map(bs => (
                                                                                <tr key={bs.id} className="hover:bg-zinc-50/30 transition-colors">
                                                                                    <td className="px-5 py-3 font-bold text-zinc-700">{bs.sport?.name_ar || "—"}</td>
                                                                                    <td className="px-5 py-3 text-center">
                                                                                        <RoleGuard privilege="UPDATE_BRANCH" fallback={
                                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bs.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                                                                                                {bs.status === 'active' ? "نشط" : "معطل"}
                                                                                            </span>
                                                                                        }>
                                                                                            <div title="تفعيل / تعطيل الارتباط">
                                                                                                <Switch 
                                                                                                    checked={bs.status === 'active'}
                                                                                                    onCheckedChange={(val) => void toggleBranchSportStatus(bs.id, val)}
                                                                                                />
                                                                                            </div>
                                                                                        </RoleGuard>
                                                                                    </td>
                                                                                    <td className="px-5 py-3 text-center">
                                                                                        <RoleGuard privilege="DELETE_BRANCH">
                                                                                            <div className="flex justify-center">
                                                                                                <button onClick={() => setDeleteBranchSportId(bs.id)} className="p-1.5 rounded-md text-zinc-400 hover:bg-rose-100 hover:text-rose-600 transition-colors" title="إزالة من الفرع">
                                                                                                    <Trash2 className="w-4 h-4" />
                                                                                                </button>
                                                                                            </div>
                                                                                        </RoleGuard>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            </div>
            
            {/* ── Dialogs ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-lg w-[95vw] sm:w-full p-0 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }} dir="rtl">
                    <DialogHeader className="px-4 sm:px-6 py-4 border-b">
                        <DialogTitle className="text-base sm:text-lg">{editBranch ? "تعديل فرع" : "إضافة فرع جديد"}</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {editBranch ? "قم بتعديل بيانات الفرع المحدد." : "أدخل بيانات الفرع الجديد."}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                        <div className="grid gap-3 sm:gap-4">
                            {!editBranch && (
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label htmlFor="code" className="text-xs sm:text-sm">كود الفرع <span className="text-destructive">*</span></Label>
                                    <Input 
                                        id="code"
                                        dir="ltr"
                                        className={`h-9 sm:h-10 text-[13px] sm:text-sm text-left font-mono uppercase ${formErrors.code?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                                        value={form.code}
                                        onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); setFormErrors({...formErrors, code: []}); }}
                                        placeholder="مثال: CAIRO-01"
                                        maxLength={50}
                                    />
                                    <p className="text-[10px] sm:text-[11px] text-zinc-400">كود فريد للفرع (لا يمكن تغييره لاحقاً)</p>
                                    {formErrors.code?.length > 0 && <span className="text-[10px] sm:text-xs text-destructive">{formErrors.code[0]}</span>}
                                </div>
                            )}
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="name_ar" className="text-xs sm:text-sm">الاسم (عربي) <span className="text-destructive">*</span></Label>
                                <Input 
                                    id="name_ar" 
                                    value={form.name_ar} 
                                    onChange={(e) => { setForm({ ...form, name_ar: e.target.value }); setFormErrors({...formErrors, name_ar: []}); }} 
                                    placeholder="مثال: فرع المهندسين" 
                                    className={`h-9 sm:h-10 text-[13px] sm:text-sm ${formErrors.name_ar?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                                />
                                {formErrors.name_ar?.length > 0 && <span className="text-[10px] sm:text-xs text-destructive">{formErrors.name_ar[0]}</span>}
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="name_en" className="text-xs sm:text-sm">الاسم (إنجليزي)</Label>
                                <Input 
                                    id="name_en" 
                                    dir="ltr" 
                                    value={form.name_en} 
                                    onChange={(e) => { setForm({ ...form, name_en: e.target.value }); setFormErrors({...formErrors, name_en: []}); }} 
                                    placeholder="Mohandiseen Branch" 
                                    className={`h-9 sm:h-10 text-[13px] sm:text-sm text-left ${formErrors.name_en?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                                />
                                {formErrors.name_en?.length > 0 && <span className="text-[10px] sm:text-xs text-destructive">{formErrors.name_en[0]}</span>}
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="location_ar" className="text-xs sm:text-sm">الموقع (عربي) <span className="text-destructive">*</span></Label>
                                <Input 
                                    id="location_ar" 
                                    value={form.location_ar} 
                                    onChange={(e) => { setForm({ ...form, location_ar: e.target.value }); setFormErrors({...formErrors, location_ar: []}); }} 
                                    placeholder="مثال: شارع جامعة الدول العربية" 
                                    className={`h-9 sm:h-10 text-[13px] sm:text-sm ${formErrors.location_ar?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                                />
                                {formErrors.location_ar?.length > 0 && <span className="text-[10px] sm:text-xs text-destructive">{formErrors.location_ar[0]}</span>}
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="location_en" className="text-xs sm:text-sm">الموقع (إنجليزي)</Label>
                                <Input 
                                    id="location_en" 
                                    dir="ltr" 
                                    value={form.location_en} 
                                    onChange={(e) => { setForm({ ...form, location_en: e.target.value }); setFormErrors({...formErrors, location_en: []}); }} 
                                    placeholder="Arab League St." 
                                    className={`h-9 sm:h-10 text-[13px] sm:text-sm text-left ${formErrors.location_en?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                                />
                                {formErrors.location_en?.length > 0 && <span className="text-[10px] sm:text-xs text-destructive">{formErrors.location_en[0]}</span>}
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="status" className="text-xs sm:text-sm">الحالة</Label>
                                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as 'active' | 'inactive' | 'archived' })}>
                                    <SelectTrigger id="status" className="h-9 sm:h-10 text-[13px] sm:text-sm">
                                        <SelectValue placeholder="اختر الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active" className="text-[13px] sm:text-sm">نشط</SelectItem>
                                        <SelectItem value="inactive" className="text-[13px] sm:text-sm">معطل</SelectItem>
                                        <SelectItem value="archived" className="text-[13px] sm:text-sm">مؤرشف</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-4 sm:px-6 py-4 border-t flex flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saveLoading} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">إلغاء</Button>
                        <Button onClick={() => void handleSave()} disabled={saveLoading} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
                            {saveLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {saveLoading ? "جارٍ الحفظ..." : "حفظ الفرع"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Modal ── */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="max-w-md w-[95vw] sm:w-full" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-destructive text-base sm:text-lg">تأكيد الحذف</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            هل أنت متأكد من حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء وسيؤثر على السجلات المرتبطة به.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start flex flex-row">
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
                            {deleteLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {deleteLoading ? "جارٍ الحذف..." : "تأكيد الحذف"}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Assign to Member Modal ── */}
            <Dialog open={assignBranch !== null} onOpenChange={(open) => { 
                if (!open) { setAssignBranch(null); setMemberIdForAssign(""); setMemberName(""); } 
            }}>
                <DialogContent className="max-w-md w-[95vw] sm:w-full" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">تعيين عضو في الفرع</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            تحديد العضو المراد ربطه بالفرع: <span className="font-bold underline text-primary">{assignBranch?.name_ar || assignBranch?.name_en}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-3 sm:py-4">
                        <Label htmlFor="memberIdAssign" className="text-xs sm:text-sm">رقم العضو <span className="text-destructive">*</span></Label>
                        <div className="relative mt-2">
                            <Input
                                id="memberIdAssign"
                                dir="ltr"
                                className="h-9 sm:h-10 text-[13px] sm:text-sm text-left font-mono pr-8"
                                placeholder="رقم العضو (مثل: 5049)"
                                value={memberIdForAssign}
                                onChange={(e) => setMemberIdForAssign(e.target.value)}
                            />
                            {memberLookupState === "loading" && (
                                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {memberLookupState === "found" && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 bg-emerald-100 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                            )}
                        </div>
                        {memberLookupState === "notfound" && (
                            <p className="text-[11px] sm:text-[12px] text-destructive flex items-center gap-1 mt-2">
                                <XCircle className="w-3 h-3" />
                                لم يُعثر على عضو يطابق هذا الرقم
                            </p>
                        )}
                        {memberLookupState === "idle" && !memberIdForAssign.trim() && (
                            <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-2">
                                أدخل أرقاماً صحيحة وسيبدأ البحث التلقائي
                            </p>
                        )}
                        {memberLookupState === "found" && (
                            <p className="text-xs sm:text-sm font-medium text-emerald-700 mt-3 p-2 bg-emerald-50 rounded-md border border-emerald-100">
                                الاسم: {memberName}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 flex flex-row">
                        <Button 
                            onClick={() => void handleAssign()} 
                            disabled={assignLoading || memberLookupState !== "found"}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            {assignLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {assignLoading ? "جارٍ الربط..." : "تأكيد التعيين"}
                        </Button>
                        <Button variant="outline" onClick={() => setAssignBranch(null)} disabled={assignLoading} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Add Sport Modal ── */}
            <Dialog open={addSportDialogOpen !== null} onOpenChange={(open) => { if (!open) setAddSportDialogOpen(null); }}>
                <DialogContent className="max-w-md w-[95vw] sm:w-full" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">إضافة رياضة للفرع</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            يرجى اختيار الرياضة المراد توفيرها في هذا الفرع.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-3 sm:py-4">
                        <Label className="text-xs sm:text-sm">الرياضة <span className="text-destructive">*</span></Label>
                        <Select value={selectedGlobalSport} onValueChange={setSelectedGlobalSport}>
                            <SelectTrigger className="w-full mt-2 h-9 sm:h-10 text-[13px] sm:text-sm" dir="rtl">
                                <SelectValue placeholder="-- اختر رياضة --" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                {globalSports.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)} className="text-[13px] sm:text-sm">
                                        {s.nameAr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-start flex flex-row">
                        <Button onClick={() => void handleAddSport()} disabled={addingSport || !selectedGlobalSport} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
                            {addingSport && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {addingSport ? "جارٍ الربط..." : "تأكيد"}
                        </Button>
                        <Button variant="outline" onClick={() => setAddSportDialogOpen(null)} disabled={addingSport} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Branch Sport Modal ── */}
            <Dialog open={deleteBranchSportId !== null} onOpenChange={() => setDeleteBranchSportId(null)}>
                <DialogContent className="max-w-md w-[95vw] sm:w-full" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-destructive text-base sm:text-lg">إزالة الرياضة</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            هل أنت متأكد من إزالة هذه الرياضة من ارتباطات الفرع؟ لن يلغي هذا الرياضة كلياً بل سيفصلها عن الفرع فقط.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start flex flex-row">
                        <Button variant="destructive" onClick={() => void handleRemoveBranchSport()} disabled={removingSport} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
                            {removingSport && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {removingSport ? "جارٍ الإزالة..." : "تأكيد الإزالة"}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteBranchSportId(null)} disabled={removingSport} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
