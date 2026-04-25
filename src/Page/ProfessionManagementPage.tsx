import { useCallback, useEffect, useState, useMemo } from "react";
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../Component/StaffPagesComponents/ui/dialog";
import { Plus, Loader2, Pencil, Eye, Trash2, Search, RefreshCw, ChevronRight, ChevronLeft, Briefcase, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profession {
    id: number;
    code: string;
    name_ar: string;
    name_en: string;
}

const PAGE_SIZE = 10;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfessionManagementPage() {
    const { toast } = useToast();

    // ── Data state ──────────────────────────────────────────────────────────
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Search & pagination ─────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // ── Fetch ───────────────────────────────────────────────────────────────
    const fetchProfessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Profession[] }>("/professions");
            const list = res?.data?.data;
            if (Array.isArray(list)) {
                setProfessions(list);
            } else {
                setProfessions([]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "تعذر تحميل المهن";
            toast({ title: "فشل التحميل", description: message, variant: "destructive" });
            setProfessions([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchProfessions();
    }, [fetchProfessions]);

    // ── Reset page on search change ─────────────────────────────────────────
    useEffect(() => { setPage(1); }, [search]);

    // ── Derived: filtered + paged rows ──────────────────────────────────────
    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return professions;
        return professions.filter((p) =>
            p.name_ar.toLowerCase().includes(q) ||
            p.name_en.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q)
        );
    }, [professions, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Create / Edit modal state ────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editProfession, setEditProfession] = useState<Profession | null>(null);
    const [form, setForm] = useState({ code: "", name_ar: "", name_en: "" });
    const [saveLoading, setSaveLoading] = useState(false);

    const openAdd = () => {
        setEditProfession(null);
        setForm({ code: "", name_ar: "", name_en: "" });
        setIsAddOpen(true);
    };

    const openEdit = (profession: Profession) => {
        setEditProfession(profession);
        setForm({ code: profession.code, name_ar: profession.name_ar, name_en: profession.name_en });
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name_ar.trim() || !form.name_en.trim()) {
            toast({ title: "بيانات ناقصة", description: "يرجى ملء جميع الحقول المطلوبة.", variant: "destructive" });
            return;
        }
        setSaveLoading(true);
        try {
            const body = { code: form.code, name_ar: form.name_ar, name_en: form.name_en };
            if (editProfession) {
                await api.put(`/professions/${editProfession.id}`, body);
                toast({ title: "تم التحديث", description: "تم تحديث بيانات المهنة بنجاح" });
            } else {
                await api.post("/professions", body);
                toast({ title: "تمت الإضافة", description: "تمت إضافة المهنة بنجاح" });
            }
            setIsAddOpen(false);
            void fetchProfessions();
        } catch (err) {
            const e = err as { status?: number; responseData?: { message?: string; error?: string }; message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || "حدث خطأ غير متوقع عند الحفظ";
            toast({ title: "فشل الحفظ", description: msg, variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Delete state + handler ────────────────────────────────────────────
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/professions/${deleteId}`);
            toast({ title: "تم الحذف", description: "تم حذف المهنة بنجاح" });
            setDeleteId(null);
            void fetchProfessions();
        } catch (err) {
            const e = err as { status?: number; responseData?: { message?: string; error?: string }; message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || "حدث خطأ غير متوقع عند الحذف";
            toast({ title: "فشل الحذف", description: msg, variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Assign-to-member state + handler ─────────────────────────────────
    const [assignProfession, setAssignProfession] = useState<Profession | null>(null);
    const [memberIdForAssign, setMemberIdForAssign] = useState("");
    const [memberName, setMemberName] = useState("");
    const [memberLookupState, setMemberLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
    const [assignLoading, setAssignLoading] = useState(false);

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
                const res = await api.get<{ data: { name_ar?: string; full_name?: string; first_name_ar?: string; last_name_ar?: string } }>(`/members/${numericId}`);
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
        if (!assignProfession || !memberIdForAssign.trim()) {
            toast({ title: "بيانات ناقصة", description: "يرجى تحديد العضو المطلوب.", variant: "destructive" });
            return;
        }
        setAssignLoading(true);
        try {
            await api.post(`/professions/${assignProfession.id}/assign-to-member/${memberIdForAssign.trim()}`);
            toast({ title: "تم التعيين", description: "تم ربط العضو بالمهنة بنجاح" });
            setAssignProfession(null);
            setMemberIdForAssign("");
            setMemberName("");
        } catch (err) {
            const e = err as { status?: number; responseData?: { message?: string; error?: string }; message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || "حدث خطأ غير متوقع عند التعيين";
            toast({ title: "فشل التعيين", description: msg, variant: "destructive" });
        } finally {
            setAssignLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <div className="h-[calc(100vh-4rem)] flex flex-col gap-0 bg-zinc-50/50" dir="rtl">

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-200/60 bg-white shrink-0 z-10 shadow-[0_1px_3px_0_rgb(0,0,0,0.01)]">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-zinc-900">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            إدارة المهن
                        </h1>
                        <p className="text-[13px] font-medium text-zinc-500 mt-1.5 pr-12">
                            إجمالي المهن المسجلة: <strong className="text-zinc-800">{professions.length}</strong>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RoleGuard privilege="CREATE_PROFESSION">
                            <Button
                                size="sm"
                                className="gap-2 h-10 px-5 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-900/10 transition-all"
                                onClick={openAdd}
                            >
                                <Plus className="w-4 h-4" />
                                إضافة مهنة
                            </Button>
                        </RoleGuard>
                    </div>
                </div>

                {/* ── Main area ── */}
                <div className="flex flex-1 p-6 overflow-hidden">
                    <div className="flex flex-col w-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex-1">

                        {/* Toolbar: Pagination + Search + Refresh */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-white shrink-0 flex-wrap">

                            {/* Pagination */}
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

                            {/* Search */}
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                <Input
                                    placeholder="بحث بالاسم أو الكود..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-10 h-10 text-[13px] bg-zinc-50/50 border-zinc-200/80 rounded-xl focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-inner"
                                />
                            </div>

                            {/* Refresh */}
                            <button
                                onClick={() => { void fetchProfessions(); }}
                                disabled={loading}
                                className="p-2.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500 disabled:opacity-40 border border-transparent hover:border-zinc-200"
                                title="تحديث البيانات"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        {/* Table area */}
                        <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                            {loading ? (
                                <div className="py-24 text-center text-zinc-400">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                    <p className="text-sm font-medium tracking-wide">جارٍ جلب السجلات...</p>
                                </div>
                            ) : filteredRows.length === 0 ? (
                                <div className="py-24 text-center text-zinc-400 flex flex-col items-center">
                                    <div className="rounded-full bg-zinc-50 border border-zinc-100 p-6 mb-5">
                                        <Briefcase className="h-10 w-10 text-zinc-300" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-zinc-800 mb-1.5">لا توجد مهن مسجلة</h3>
                                    <p className="text-[13px] max-w-sm">
                                        {search ? `لا توجد نتائج مطابقة لـ "${search}"` : "لم يتم إدراج أي مهن بعد. أضف مهنك الآن."}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-right">
                                    <thead className="sticky top-0 bg-white z-10 before:absolute before:inset-0 before:border-b before:border-zinc-100 before:pointer-events-none">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle w-12">#</th>
                                            <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">الكود المرجعي</th>
                                            <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">المهنة (عربي)</th>
                                            <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle">المهنة (إنجليزي)</th>
                                            <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 whitespace-nowrap align-middle text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {pagedRows.map((profession, idx) => (
                                            <tr key={profession.id} className="transition-colors hover:bg-zinc-50/80 group">

                                                {/* Serial */}
                                                <td className="px-6 py-3.5 text-[13px] text-zinc-400 font-mono align-middle">
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </td>

                                                {/* Code */}
                                                <td className="px-6 py-3.5 align-middle">
                                                    <span className="bg-zinc-100/80 text-zinc-600 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-200/60 shadow-sm">
                                                        {profession.code}
                                                    </span>
                                                </td>

                                                {/* Name (AR) */}
                                                <td className="px-6 py-3.5 align-middle font-bold text-zinc-900 border-r-2 border-transparent group-hover:border-primary/40 transition-all">
                                                    {profession.name_ar}
                                                </td>

                                                {/* Name (EN) */}
                                                <td className="px-6 py-3.5 align-middle text-zinc-500 font-medium tracking-wide" dir="ltr">
                                                    {profession.name_en || "—"}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-3.5 align-middle">
                                                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">

                                                        <RoleGuard privilege="UPDATE_PROFESSION">
                                                            <button
                                                                title="تعديل"
                                                                onClick={() => openEdit(profession)}
                                                                className="p-1.5 rounded-lg hover:bg-zinc-900 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-zinc-800"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                        <RoleGuard privilege="ASSIGN_PROFESSION_TO_MEMBER">
                                                            <button
                                                                title="تعيين لعضو"
                                                                onClick={() => { setAssignProfession(profession); setMemberIdForAssign(""); setMemberName(""); setMemberLookupState("idle"); }}
                                                                className="p-1.5 rounded-lg hover:bg-zinc-900 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-zinc-800"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                        <RoleGuard privilege="DELETE_PROFESSION">
                                                            <button
                                                                title="حذف المهنة"
                                                                onClick={() => setDeleteId(profession.id)}
                                                                className="p-1.5 rounded-lg hover:bg-rose-500 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-rose-600"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Create / Edit Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{editProfession ? "تعديل مهنة" : "إضافة مهنة جديدة"}</DialogTitle>
                        <DialogDescription>
                            {editProfession
                                ? "قم بتعديل بيانات المهنة المحددة."
                                : "أدخل بيانات المهنة الجديدة. الكود يستخدم للتعريف السريع."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="prof-code">الكود (Code) <span className="text-destructive">*</span></Label>
                            <Input
                                id="prof-code"
                                dir="ltr"
                                className="text-left font-mono uppercase"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="ENG"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prof-name-ar">الاسم (عربي) <span className="text-destructive">*</span></Label>
                            <Input
                                id="prof-name-ar"
                                value={form.name_ar}
                                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                                placeholder="مثال: مهندس"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prof-name-en">الاسم (إنجليزي) <span className="text-destructive">*</span></Label>
                            <Input
                                id="prof-name-en"
                                dir="ltr"
                                className="text-left"
                                value={form.name_en}
                                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                                placeholder="Engineer"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saveLoading}>إلغاء</Button>
                        <Button onClick={() => void handleSave()} disabled={saveLoading} className="w-full sm:w-auto">
                            {saveLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {saveLoading ? "جارٍ الحفظ..." : "حفظ المهنة"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف هذه المهنة؟ لا يمكن التراجع عن هذا الإجراء وسيؤثر على السجلات المرتبطة بها.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
                            {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {deleteLoading ? "جارٍ الحذف..." : "تأكيد الحذف"}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Assign to Member Dialog ── */}
            <Dialog open={assignProfession !== null} onOpenChange={(open) => {
                if (!open) { setAssignProfession(null); setMemberIdForAssign(""); setMemberName(""); }
            }}>
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعيين عضو في المهنة</DialogTitle>
                        <DialogDescription>
                            تحديد العضو المراد ربطه بمهنة: <span className="font-bold underline text-primary">{assignProfession?.name_ar}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Label htmlFor="memberIdAssign">رقم العضو <span className="text-destructive">*</span></Label>
                        <div className="relative mt-2">
                            <Input
                                id="memberIdAssign"
                                dir="ltr"
                                className="text-left font-mono pr-8"
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
                            <p className="text-[12px] text-destructive flex items-center gap-1 mt-2">
                                <XCircle className="w-3 h-3" />
                                لم يُعثر على عضو يطابق هذا الرقم
                            </p>
                        )}
                        {memberLookupState === "idle" && !memberIdForAssign.trim() && (
                            <p className="text-[12px] text-muted-foreground mt-2">
                                أدخل أرقاماً صحيحة وسيبدأ البحث التلقائي
                            </p>
                        )}
                        {memberLookupState === "found" && (
                            <p className="text-sm font-medium text-emerald-700 mt-3 p-2 bg-emerald-50 rounded-md border border-emerald-100">
                                الاسم: {memberName}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            onClick={() => void handleAssign()}
                            disabled={assignLoading || memberLookupState !== "found"}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                        >
                            {assignLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {assignLoading ? "جارٍ الربط..." : "تأكيد التعيين"}
                        </Button>
                        <Button variant="outline" onClick={() => setAssignProfession(null)} disabled={assignLoading}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
