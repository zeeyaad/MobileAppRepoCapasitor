import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../Component/StaffPagesComponents/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../Component/StaffPagesComponents/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { StaffService } from "../services/staffService";
import {
    Search, Eye, Pencil, Trash2, ChevronRight, ChevronLeft,
    Users, Mail, Phone, MapPin, Calendar, Package, Hash,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffType = {
    id: number;
    code?: string;
    name_ar?: string;
    name_en?: string;
    title_ar?: string;
    title_en?: string;
};

type StaffRow = {
    id: string;
    firstNameEn?: string;
    firstNameAr?: string;
    lastNameEn?: string;
    lastNameAr?: string;
    email?: string;
    nationalId: string;
    phone: string;
    address?: string;
    staffTypeId: number;
    staffTypeLabel: string;
    status?: string;
    createdAt?: string;
    employmentStartDate?: string;
    employmentEndDate?: string | null;
};

type StaffApiItem = {
    id: number;
    first_name_en?: string;
    first_name_ar?: string;
    last_name_en?: string;
    last_name_ar?: string;
    email?: string;
    national_id?: string;
    phone?: string;
    address?: string;
    staff_type_id?: number | string;
    staff_type?: string;
    status?: string;
    created_at?: string;
    employment_start_date?: string;
    employment_end_date?: string | null;
};

type StaffListResponse = {
    success: boolean;
    data: StaffApiItem[];
    pagination?: { page: number; limit: number; total: number; pages: number };
};

type StaffDetailsData = {
    id: number;
    first_name_en?: string;
    first_name_ar?: string;
    last_name_en?: string;
    last_name_ar?: string;
    email?: string;
    national_id?: string;
    phone?: string;
    address?: string;
    staff_type_id?: number | string;
    employment_start_date?: string;
    employment_end_date?: string | null;
    status?: string;
    assigned_packages?: Array<{ id: number; code: string; name_en?: string; name_ar?: string }>;
};

type StaffDetailsResponse = { success: boolean; data: StaffDetailsData };

// ─── Static fallback staff types ──────────────────────────────────────────────

const STATIC_STAFF_TYPES: StaffType[] = [
    { id: 1, code: "ADMIN", name_en: "Admin", name_ar: "المسئول" },
    { id: 2, code: "CEO", name_en: "Executive Director", name_ar: "المدير التنفيذى" },
    { id: 3, code: "DEPUTY_CEO", name_en: "Deputy Executive Director", name_ar: "نائب المدير التنفيذى" },
    { id: 4, code: "EVENTS_MANAGER", name_en: "Events and Activities Manager", name_ar: "مدير الفاعليات والاحداث" },
    { id: 5, code: "EXEC_SECRETARY_MANAGER", name_en: "Executive Secretariat Manager", name_ar: "مدير السكرتارية التنفيذىة" },
    { id: 6, code: "MEDIA_CENTER_MANAGER", name_en: "Media Center Manager", name_ar: "مدير المركز الاعلامى" },
    { id: 7, code: "SPORT_ACTIVITY_SPECIALIST", name_en: "Sports Activity Specialist", name_ar: "اخصائى النشاط الرياضى" },
    { id: 8, code: "FINANCE_MANAGER", name_en: "Finance Manager", name_ar: "مدير الشئون المالية" },
    { id: 9, code: "HR_MEMBERSHIP_MANAGER", name_en: "HR and Membership Affairs Manager", name_ar: "مدير الموارد البشرية وشئون العضوية" },
    { id: 10, code: "CONTRACTS_MANAGER", name_en: "Contracts Manager", name_ar: "مدير التعاقدات" },
    { id: 11, code: "MAINTENANCE_MANAGER", name_en: "Maintenance Manager", name_ar: "مدير الصيانة" },
    { id: 12, code: "SPORT_ACTIVITY_MANAGER", name_en: "Sports Activity Manager", name_ar: "مدير النشاط الرياضى" },
    { id: 13, code: "SOCIAL_ACTIVITY_MANAGER", name_en: "Social Activity Manager", name_ar: "مدير النشاط الاجتماعى" },
    { id: 14, code: "PR_MANAGER", name_en: "Public Relations Manager", name_ar: "مدير العلاقات العامة" },
    { id: 15, code: "MEDIA_CENTER_SPECIALIST", name_en: "Media Center Specialist", name_ar: "اخصائى المركز الاعلامى" },
    { id: 16, code: "MAINTENANCE_OFFICER", name_en: "Maintenance Officer", name_ar: "مسئول الصيانة" },
    { id: 17, code: "ADMIN_OFFICER", name_en: "Administrative Affairs Officer", name_ar: "مسئول الشئون الادارية" },
    { id: 18, code: "SUPPORT_SERVICES", name_en: "Support Services", name_ar: "خدمات معاونة" },
    { id: 19, code: "SPORT_MANAGER", name_en: "Sport Activity Manager", name_ar: "مدير الأنشطة الرياضية" },
    { id: 20, code: "SPORT_SPECIALIST", name_en: "Sport Activity Specialist", name_ar: "أخصائي الأنشطة الرياضية" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("ar-EG", {
            year: "numeric", month: "long", day: "numeric",
        });
    } catch {
        return value;
    }
};

const PALETTE = [
    "#1b71bc", "#e05c2a", "#2a9d60", "#7c3aed",
    "#0891b2", "#be185d", "#ca8a04", "#475569",
];
const getColor = (id: string) => PALETTE[parseInt(id, 10) % PALETTE.length];

const getInitials = (nameAr?: string, nameEn?: string) => {
    const src = nameAr || nameEn || "";
    const words = src.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return src.slice(0, 2).toUpperCase() || "?";
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
    const isActive = status === "active";
    return (
        <Badge
            className={
                isActive
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[11px]"
                    : "bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 text-[11px]"
            }
        >
            {isActive ? "نشط" : (status || "غير نشط")}
        </Badge>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StaffListPage() {
    const { toast } = useToast();

    // List state
    const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
    const [staffPage, setStaffPage] = useState(1);
    const [staffLimit] = useState(10);
    const [staffTotal, setStaffTotal] = useState(0);
    const [staffPages, setStaffPages] = useState(1);
    const [staffLoading, setStaffLoading] = useState(false);
    const [search, setSearch] = useState("");

    // View details state
    const [showDetails, setShowDetails] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffRow | null>(null);
    const [selectedStaffDetails, setSelectedStaffDetails] = useState<StaffDetailsData | null>(null);
    const [staffDetailsLoading, setStaffDetailsLoading] = useState(false);

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);

    // Edit state
    const [editTarget, setEditTarget] = useState<StaffRow | null>(null);
    const [editFirstNameEn, setEditFirstNameEn] = useState("");
    const [editFirstNameAr, setEditFirstNameAr] = useState("");
    const [editLastNameEn, setEditLastNameEn] = useState("");
    const [editLastNameAr, setEditLastNameAr] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Staff types
    const [staffTypes, setStaffTypes] = useState<StaffType[]>(STATIC_STAFF_TYPES);

    useEffect(() => {
        const loadStaffTypes = async () => {
            try {
                const res = await StaffService.getStaffTypes();
                if (res.success && Array.isArray(res.data)) setStaffTypes(res.data);
            } catch { /* keep static fallback */ }
        };
        void loadStaffTypes();
    }, []);

    const staffTypeLabelById = useMemo(() => {
        const map = new Map<number, string>();
        staffTypes.forEach((t) => {
            map.set(t.id, t.name_ar || t.title_ar || t.name_en || t.title_en || `#${t.id}`);
        });
        return map;
    }, [staffTypes]);

    // ── Fetch staff list ────────────────────────────────────────────────────

    const fetchStaffList = useCallback(async (page: number) => {
        setStaffLoading(true);
        try {
            const res = await api.get<StaffListResponse>("/staff", { params: { page, limit: staffLimit } });
            const payload = res.data;

            const rows: StaffRow[] = (payload?.data ?? []).map((item) => {
                const typeId = Number.isFinite(Number(item.staff_type_id)) ? Number(item.staff_type_id) : 0;
                return {
                    id: String(item.id),
                    firstNameEn: item.first_name_en,
                    firstNameAr: item.first_name_ar,
                    lastNameEn: item.last_name_en,
                    lastNameAr: item.last_name_ar,
                    email: item.email,
                    nationalId: item.national_id || "—",
                    phone: item.phone || "—",
                    address: item.address,
                    staffTypeId: typeId,
                    staffTypeLabel: staffTypeLabelById.get(typeId) || item.staff_type || (typeId ? String(typeId) : "—"),
                    status: item.status,
                    createdAt: item.created_at,
                    employmentStartDate: item.employment_start_date,
                    employmentEndDate: item.employment_end_date ?? null,
                };
            });

            setStaffRows(rows);
            setStaffTotal(payload?.pagination?.total ?? 0);
            setStaffPages(payload?.pagination?.pages ?? 1);
        } catch (err) {
            toast({
                title: "تعذر تحميل قائمة الموظفين",
                description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
                variant: "destructive",
            });
            setStaffRows([]);
            setStaffTotal(0);
            setStaffPages(1);
        } finally {
            setStaffLoading(false);
        }
    }, [staffLimit, staffTypeLabelById, toast]);

    useEffect(() => { void fetchStaffList(staffPage); }, [fetchStaffList, staffPage]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return staffRows;
        return staffRows.filter((r) => {
            const name = `${r.firstNameAr || ""} ${r.lastNameAr || ""} ${r.firstNameEn || ""} ${r.lastNameEn || ""}`.toLowerCase();
            return (
                name.includes(q) ||
                r.nationalId.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q) ||
                r.staffTypeLabel.toLowerCase().includes(q)
            );
        });
    }, [staffRows, search]);

    // ── View dialog ─────────────────────────────────────────────────────────

    const handleViewStaff = async (row: StaffRow) => {
        setSelectedStaff(row);
        setSelectedStaffDetails(null);
        setShowDetails(true);
        setStaffDetailsLoading(true);
        try {
            const res = await api.get<StaffDetailsResponse>(`/staff/${row.id}`);
            if (res.data?.success && res.data?.data) setSelectedStaffDetails(res.data.data);
        } catch {
            toast({ title: "فشل تحميل التفاصيل", description: "حدث خطأ أثناء تحميل تفاصيل الموظف", variant: "destructive" });
        } finally {
            setStaffDetailsLoading(false);
        }
    };

    // ── Edit dialog ─────────────────────────────────────────────────────────

    const openEditDialog = (row: StaffRow) => {
        setEditTarget(row);
        setEditFirstNameEn(row.firstNameEn ?? "");
        setEditFirstNameAr(row.firstNameAr ?? "");
        setEditLastNameEn(row.lastNameEn ?? "");
        setEditLastNameAr(row.lastNameAr ?? "");
        setEditPhone(row.phone === "—" ? "" : row.phone);
        setEditAddress(row.address ?? "");
    };

    const closeEditDialog = () => {
        setEditTarget(null);
        setEditFirstNameEn(""); setEditFirstNameAr("");
        setEditLastNameEn(""); setEditLastNameAr("");
        setEditPhone(""); setEditAddress("");
    };

    const handleUpdateStaff = async () => {
        if (!editTarget) return;
        setEditSubmitting(true);
        try {
            await api.put(`/staff/${editTarget.id}`, {
                first_name_en: editFirstNameEn.trim() || undefined,
                first_name_ar: editFirstNameAr.trim() || undefined,
                last_name_en: editLastNameEn.trim() || undefined,
                last_name_ar: editLastNameAr.trim() || undefined,
                phone: editPhone.trim() || undefined,
                address: editAddress.trim() || undefined,
            });
            toast({ title: "تم التحديث", description: "تم تحديث بيانات الموظف بنجاح" });
            closeEditDialog();
            void fetchStaffList(staffPage);
        } catch (err) {
            toast({
                title: "فشل التحديث",
                description: err instanceof Error ? err.message : "حدث خطأ أثناء تحديث بيانات الموظف",
                variant: "destructive",
            });
        } finally {
            setEditSubmitting(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="h-full flex flex-col" dir="rtl">

            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">إدارة الموظفين</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {staffTotal > 0 ? `${staffTotal} موظف مسجل` : "قائمة الموظفين"}
                    </p>
                </div>
            </div>

            {/* ── Search bar ── */}
            <div className="px-6 py-3 border-b border-border shrink-0">
                <div className="relative max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث بالاسم، الهاتف، الوظيفة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 text-right"
                        dir="rtl"
                    />
                </div>
            </div>

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead>الوظيفة</TableHead>
                                <TableHead>رقم الهاتف</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>تاريخ التوظيف</TableHead>
                                <TableHead className="text-center w-[220px]">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            جارٍ التحميل...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                                        <Users className="mx-auto mb-3 h-10 w-10 opacity-20" />
                                        {search ? "لا توجد نتائج مطابقة" : "لا يوجد موظفون مسجلون"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map((row) => {
                                    const nameAr = `${row.firstNameAr || ""} ${row.lastNameAr || ""}`.trim();
                                    const nameEn = `${row.firstNameEn || ""} ${row.lastNameEn || ""}`.trim();
                                    return (
                                        <TableRow key={row.id} className="hover:bg-accent/10 border-b border-border">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                        style={{ background: getColor(row.id) }}
                                                    >
                                                        {getInitials(nameAr, nameEn)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold truncate">{nameAr || "—"}</p>
                                                        {nameEn && <p className="text-xs text-muted-foreground truncate" dir="ltr">{nameEn}</p>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{row.staffTypeLabel}</TableCell>
                                            <TableCell dir="ltr" className="text-left text-sm tabular-nums">{row.phone}</TableCell>
                                            <TableCell><StatusBadge status={row.status} /></TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(row.employmentStartDate)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Button
                                                        size="sm" variant="outline"
                                                        className="gap-1 h-8"
                                                        onClick={() => { void handleViewStaff(row); }}
                                                    >
                                                        <Eye className="h-3 w-3" /> عرض
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="outline"
                                                        className="gap-1 h-8 text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => openEditDialog(row)}
                                                    >
                                                        <Pencil className="h-3 w-3" /> تعديل
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="outline"
                                                        className="gap-1 h-8 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                        onClick={() => setDeleteTarget(row)}
                                                    >
                                                        <Trash2 className="h-3 w-3" /> تعطيل
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>

            {/* ── Pagination ── */}
            <div className="border-t border-border px-6 py-3 flex items-center justify-between shrink-0">
                <p className="text-sm text-muted-foreground">
                    الصفحة {staffPage} من {staffPages} · الإجمالي: {staffTotal}
                </p>
                <div className="flex items-center gap-1">
                    <Button
                        size="sm" variant="outline"
                        disabled={staffLoading || staffPage <= 1}
                        onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm" variant="outline"
                        disabled={staffLoading || staffPage >= staffPages}
                        onClick={() => setStaffPage((p) => Math.min(staffPages, p + 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                View Detail Modal — MemberMembershipPage card style
            ══════════════════════════════════════════════════════ */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-2xl w-full p-0 overflow-hidden" style={{ maxHeight: "90vh" }} dir="rtl">
                    {staffDetailsLoading ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                            جارٍ تحميل التفاصيل...
                        </div>
                    ) : (() => {
                        const d = selectedStaffDetails;
                        const fb = selectedStaff;
                        if (!d && !fb) return null;

                        const nameAr = [d?.first_name_ar, d?.last_name_ar].filter(Boolean).join(" ") ||
                            [fb?.firstNameAr, fb?.lastNameAr].filter(Boolean).join(" ");
                        const nameEn = [d?.first_name_en, d?.last_name_en].filter(Boolean).join(" ") ||
                            [fb?.firstNameEn, fb?.lastNameEn].filter(Boolean).join(" ");
                        const role = (() => {
                            const id = Number(d?.staff_type_id ?? fb?.staffTypeId ?? 0);
                            return staffTypeLabelById.get(id) || fb?.staffTypeLabel || "—";
                        })();
                        const isActive = (d?.status ?? fb?.status) === "active";

                        return (
                            <div className="flex flex-col overflow-y-auto" style={{ maxHeight: "90vh" }}>

                                {/* Gradient top stripe — matches MemberMembershipPage */}
                                <div className="h-2 w-full shrink-0" style={{ background: "linear-gradient(90deg, #1F3A5F, #2EA7C9)" }} />

                                {/* Avatar + name header */}
                                <div className="px-6 pt-5 pb-5 border-b border-border shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0"
                                            style={{ background: getColor(fb?.id ?? "0") }}
                                        >
                                            {getInitials(nameAr, nameEn)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">الموظف الحالي</p>
                                            <h2 className="text-xl font-bold text-[#214474] truncate">{nameAr || "—"}</h2>
                                            {nameEn && (
                                                <span className="text-xs text-muted-foreground font-mono" dir="ltr">{nameEn}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <StatusBadge status={isActive ? "active" : "inactive"} />
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">{role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable body */}
                                <div className="p-6 space-y-6">

                                    {/* Contact info tiles */}
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                                            بيانات التواصل
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { Icon: Mail, label: "البريد الإلكتروني", value: d?.email ?? fb?.email, ltr: true },
                                                { Icon: Phone, label: "رقم الهاتف", value: d?.phone ?? fb?.phone, ltr: true },
                                                { Icon: Hash, label: "الرقم القومي", value: d?.national_id ?? fb?.nationalId, ltr: true },
                                                { Icon: MapPin, label: "العنوان", value: d?.address ?? fb?.address, ltr: false },
                                            ].map(({ Icon, label, value, ltr }) => (
                                                <div key={label} className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Icon className="h-3.5 w-3.5" />
                                                        {label}
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground truncate" dir={ltr ? "ltr" : undefined}>
                                                        {value || "—"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Employment tiles — same card style as MemberMembershipPage date tiles */}
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                                            بيانات التوظيف
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    بداية التوظيف
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {formatDate(d?.employment_start_date ?? fb?.employmentStartDate)}
                                                </p>
                                            </div>
                                            {/* Matches the orange-accented "رسوم التجديد" tile in MemberMembershipPage */}
                                            <div className="rounded-xl border border-[#F4A623]/30 bg-[#FFF8EC] p-4 flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-[#d98f1a]">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    نهاية التوظيف
                                                </div>
                                                <p className="text-sm font-bold text-[#1F3A5F]">
                                                    {formatDate(d?.employment_end_date ?? fb?.employmentEndDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Packages */}
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                                            حزم الصلاحيات
                                            {d?.assigned_packages && d.assigned_packages.length > 0 && (
                                                <span className="mr-1.5 bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-bold normal-case text-[10px]">
                                                    {d.assigned_packages.length}
                                                </span>
                                            )}
                                        </p>
                                        {!d ? (
                                            <p className="text-xs text-muted-foreground/60">جارٍ التحميل...</p>
                                        ) : (d.assigned_packages ?? []).length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                                                <Package className="h-8 w-8 mx-auto mb-2 opacity-25" />
                                                لا توجد حزم صلاحيات مخصصة لهذا الموظف
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {d.assigned_packages?.map((pkg) => (
                                                    <span
                                                        key={pkg.id}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/8 text-primary px-3 py-1.5 text-xs font-semibold"
                                                    >
                                                        <Package className="h-3 w-3" />
                                                        {pkg.name_ar || pkg.name_en || pkg.code}
                                                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded mr-0.5">
                                                            {pkg.code}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-border px-6 py-4 bg-muted/20 shrink-0 flex items-center gap-2 justify-end">
                                    <Button
                                        variant="outline" size="sm"
                                        className="gap-1.5"
                                        onClick={() => {
                                            setShowDetails(false);
                                            if (selectedStaff) openEditDialog(selectedStaff);
                                        }}
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> تعديل
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                                        إغلاق
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* ════════════════════════════ Edit Dialog ════════════════════════════ */}
            <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
                <DialogContent className="max-w-xl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل بيانات الموظف</DialogTitle>
                        <DialogDescription>تعديل البيانات الشخصية للموظف</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>الاسم الأول (عربي)</Label>
                            <Input value={editFirstNameAr} onChange={(e) => setEditFirstNameAr(e.target.value)} placeholder="محمد" />
                        </div>
                        <div>
                            <Label>الاسم الأخير (عربي)</Label>
                            <Input value={editLastNameAr} onChange={(e) => setEditLastNameAr(e.target.value)} placeholder="أحمد" />
                        </div>
                        <div>
                            <Label>الاسم الأول (EN)</Label>
                            <Input value={editFirstNameEn} onChange={(e) => setEditFirstNameEn(e.target.value)} placeholder="Mohamed" dir="ltr" className="text-left" />
                        </div>
                        <div>
                            <Label>الاسم الأخير (EN)</Label>
                            <Input value={editLastNameEn} onChange={(e) => setEditLastNameEn(e.target.value)} placeholder="Ahmed" dir="ltr" className="text-left" />
                        </div>
                        <div>
                            <Label>رقم الهاتف</Label>
                            <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+201012345678" dir="ltr" className="text-left" type="tel" />
                        </div>
                        <div>
                            <Label>العنوان</Label>
                            <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="القاهرة، مصر" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={() => void handleUpdateStaff()} disabled={editSubmitting}>
                            {editSubmitting ? "جارٍ الحفظ..." : "حفظ"}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeEditDialog} disabled={editSubmitting}>
                            إلغاء
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ════════════════════════ Deactivate Confirm ════════════════════════ */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد إلغاء التفعيل</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد أنك تريد إلغاء تفعيل هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={async () => {
                                if (!deleteTarget) return;
                                const id = deleteTarget.id;
                                try {
                                    await api.patch(`/staff/${id}/deactivate`);
                                    setStaffRows((prev) => prev.filter((r) => r.id !== id));
                                    setDeleteTarget(null);
                                    toast({ title: "تم إلغاء التفعيل", description: "تم إلغاء تفعيل الموظف بنجاح" });
                                } catch {
                                    toast({ title: "فشل", description: "حدث خطأ أثناء إلغاء تفعيل الموظف", variant: "destructive" });
                                }
                            }}
                        >
                            إلغاء التفعيل
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                            تراجع
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
