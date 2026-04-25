import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../Component/StaffPagesComponents/ui/table";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "../Component/StaffPagesComponents/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Component/StaffPagesComponents/ui/select";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../Component/StaffPagesComponents/ui/popover";
import { Plus, Pencil, Check, X, Search, Loader2, Filter } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
    getAllFields,
    createField,
    updateField,
    updateFieldStatus,
    updateBookingSettings,
    type Field
} from "../services/fieldsApi";
import { fetchActiveSports, type Sport } from "../services/sportsApi";
import { Switch } from "../Component/StaffPagesComponents/ui/switch";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = () => ({
    name_ar: "",
    name_en: "",
    sportId: "" as string | number,
    capacity: "",
    status: "active" as "active" | "inactive" | "maintenance",
    isAvailableForBooking: true,
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourtsManagementPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [filterSports, setFilterSports] = useState<number[]>([]);
    const [sportPopoverOpen, setSportPopoverOpen] = useState(false);
    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editField, setEditField] = useState<Field | null>(null);
    const [form, setForm] = useState(emptyForm());

    const { toast } = useToast();

    // ─── Load Data ────────────────────────────────────────────────────────────

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [fieldsData, sportsData] = await Promise.all([
                    getAllFields(),
                    fetchActiveSports(),
                ]);
                setFields(fieldsData);
                setSports(sportsData);
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: "خطأ",
                    description: "فشل تحميل البيانات. يرجى المحاولة مرة أخرى.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [toast]);

    // ─── Derived / Filtered ───────────────────────────────────────────────────

    const uniqueSports = Array.from(
        new Map(fields.map((f) => [f.sport_id, f.sport?.name_ar || ''])).entries()
    ).map(([id, nameAr]) => ({ id, nameAr }));

    const filtered = fields.filter((f) => {
        const matchSearch = search
            ? f.name_ar.includes(search) ||
            f.name_en.includes(search) ||
            (f.sport?.name_ar || '').includes(search)
            : true;
        const matchSport =
            filterSports.length === 0 ? true : filterSports.includes(f.sport_id);
        const matchStatus =
            filterStatuses.length === 0 ? true : filterStatuses.includes(f.status);
        return matchSearch && matchSport && matchStatus;
    });

    // ─── Stats ────────────────────────────────────────────────────────────────

    const totalCount = fields.length;
    const activeCount = fields.filter((f) => f.status === 'active').length;
    const bookingCount = fields.filter((f) => f.is_available_for_booking).length;

    // ─── Dialog Handlers ──────────────────────────────────────────────────────

    const openAdd = () => {
        setEditField(null);
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (field: Field) => {
        setEditField(field);
        setForm({
            name_ar: field.name_ar,
            name_en: field.name_en,
            sportId: field.sport_id,
            capacity: String(field.capacity || ""),
            status: field.status,
            isAvailableForBooking: field.is_available_for_booking,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name_ar.trim()) {
            toast({
                title: "بيانات ناقصة",
                description: "الاسم بالعربي مطلوب.",
                variant: "destructive"
            });
            return;
        }
        if (!form.name_en.trim()) {
            toast({
                title: "بيانات ناقصة",
                description: "الاسم بالإنجليزي مطلوب.",
                variant: "destructive"
            });
            return;
        }
        if (!form.sportId) {
            toast({
                title: "بيانات ناقصة",
                description: "يرجى اختيار الرياضة.",
                variant: "destructive"
            });
            return;
        }
        if (form.capacity && Number(form.capacity) < 1) {
            toast({
                title: "بيانات ناقصة",
                description: "يرجى إدخال سعة صحيحة.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSaving(true);

            if (editField) {
                // Update existing field
                const updated = await updateField(editField.id, {
                    name_ar: form.name_ar.trim(),
                    name_en: form.name_en.trim(),
                    sport_id: Number(form.sportId),
                    capacity: form.capacity ? Number(form.capacity) : undefined,
                    status: form.status,
                });

                // Update booking settings separately
                await updateBookingSettings(editField.id, {
                    is_available_for_booking: form.isAvailableForBooking,
                });

                setFields((prev) =>
                    prev.map((f) => (f.id === editField.id ? { ...updated, is_available_for_booking: form.isAvailableForBooking } : f))
                );

                toast({
                    title: "تم التحديث",
                    description: `تم تحديث "${form.name_ar}" بنجاح.`
                });
            } else {
                // Create new field
                const newField = await createField({
                    name_ar: form.name_ar.trim(),
                    name_en: form.name_en.trim(),
                    sport_id: Number(form.sportId),
                    capacity: form.capacity ? Number(form.capacity) : undefined,
                    status: form.status,
                    is_available_for_booking: form.isAvailableForBooking,
                });

                setFields((prev) => [...prev, newField]);

                toast({
                    title: "تمت الإضافة",
                    description: `تمت إضافة "${form.name_ar}" بنجاح.`
                });
            }

            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving field:', error);
            const message = error instanceof Error ? error.message : 'فشل حفظ الملعب';
            toast({
                title: "خطأ",
                description: message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (id: string) => {
        try {
            const field = fields.find((f) => f.id === id);
            if (!field) return;

            const newStatus = field.status === 'active' ? 'inactive' : 'active';
            const updated = await updateFieldStatus(id, newStatus);

            setFields((prev) =>
                prev.map((f) => (f.id === id ? updated : f))
            );

            toast({
                title: newStatus === 'active' ? "تم التفعيل" : "تم التعطيل",
                description: `"${field.name_ar}" ${newStatus === 'active' ? "نشط الآن" : "معطّل الآن"}.`,
            });
        } catch (error) {
            console.error('Error toggling status:', error);
            const message = error instanceof Error ? error.message : 'فشل تحديث الحالة';
            toast({
                title: "خطأ",
                description: message,
                variant: "destructive",
            });
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="h-full overflow-y-auto p-6 pb-8 space-y-6" dir="rtl">
            {/* ─── Header ──────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">إدارة الملاعب والفيلدات</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        إجمالي الملاعب:{" "}
                        <span className="font-semibold text-foreground">{totalCount}</span>
                    </p>
                </div>
                <RoleGuard privilege="CREATE_FIELD">
                    <Button onClick={openAdd} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        إضافة ملعب
                    </Button>
                </RoleGuard>
            </div>

            {/* ─── Stats Row ────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="إجمالي الملاعب" value={totalCount} color="default" />
                <StatCard label="ملاعب نشطة" value={activeCount} color="green" />
                <StatCard label="تحتاج حجز" value={bookingCount} color="blue" />
            </div>

            {/* ─── Filter Bar ───────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        dir="rtl"
                        placeholder="بحث باسم الملعب أو الرياضة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9"
                    />
                </div>

                {/* Sport filter */}
                <Popover open={sportPopoverOpen} onOpenChange={setSportPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-10 px-3 rounded-md border text-sm transition-colors
                            ${filterSports.length > 0
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-input bg-background text-muted-foreground hover:bg-muted"}`}>
                            كل الرياضات
                            {filterSports.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                    {filterSports.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-0" dir="rtl">
                        <div className="py-1 max-h-64 overflow-y-auto">
                            {uniqueSports.map((s) => {
                                const checked = filterSports.includes(Number(s.id));
                                const count = fields.filter(f => f.sport_id === Number(s.id)).length;
                                return (
                                    <label key={s.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setFilterSports(prev =>
                                                    prev.includes(Number(s.id))
                                                        ? prev.filter(id => id !== Number(s.id))
                                                        : [...prev, Number(s.id)]
                                                );
                                            }}
                                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                                        />
                                        <span className="text-xs font-medium">{s.nameAr}</span>
                                        <span className="mr-auto text-[10px] text-muted-foreground">{count}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {filterSports.length > 0 && (
                            <div className="flex justify-end px-3 py-2 border-t border-border">
                                <button
                                    onClick={() => { setFilterSports([]); setSportPopoverOpen(false); }}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    مسح
                                </button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Status filter */}
                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-10 px-3 rounded-md border text-sm transition-colors
                            ${filterStatuses.length > 0
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-input bg-background text-muted-foreground hover:bg-muted"}`}>
                            <Filter className="w-3.5 h-3.5" />
                            الحالة
                            {filterStatuses.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                    {filterStatuses.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-0" dir="rtl">
                        <div className="py-1">
                            {([
                                { key: "active", label: "نشط", color: "text-emerald-700" },
                                { key: "inactive", label: "معطّل", color: "text-rose-700" },
                                { key: "maintenance", label: "صيانة", color: "text-amber-700" },
                            ] as const).map(({ key, label, color }) => {
                                const checked = filterStatuses.includes(key);
                                const count = fields.filter(f => f.status === key).length;
                                return (
                                    <label key={key} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setFilterStatuses(prev =>
                                                    prev.includes(key)
                                                        ? prev.filter(s => s !== key)
                                                        : [...prev, key]
                                                );
                                            }}
                                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                                        />
                                        <span className={`text-xs font-medium ${color}`}>{label}</span>
                                        <span className="mr-auto text-[10px] text-muted-foreground">{count}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {filterStatuses.length > 0 && (
                            <div className="flex justify-end px-3 py-2 border-t border-border">
                                <button
                                    onClick={() => { setFilterStatuses([]); setStatusPopoverOpen(false); }}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    مسح
                                </button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* ─── Table ────────────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shadow-sm rounded-lg overflow-hidden border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10 text-center">#</TableHead>
                            <TableHead>اسم الملعب</TableHead>
                            <TableHead>الرياضة</TableHead>
                            <TableHead className="text-center">السعة</TableHead>
                            <TableHead className="text-center">يحتاج حجز</TableHead>
                            <TableHead className="text-center">الحالة</TableHead>
                            <TableHead className="text-center">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>جاري التحميل...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                        لا توجد ملاعب تطابق معايير البحث
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((field, index) => {
                                    const isActive = field.status === 'active';
                                    return (
                                        <motion.tr
                                            key={field.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-border transition-colors duration-200 hover:bg-accent/10"
                                        >
                                            {/* # */}
                                            <TableCell className="text-center text-muted-foreground text-sm font-mono">
                                                {index + 1}
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell className="font-medium">{field.name_ar}</TableCell>

                                            {/* Sport */}
                                            <TableCell className="text-muted-foreground">{field.sport?.name_ar || '-'}</TableCell>

                                            {/* Capacity */}
                                            <TableCell className="text-center font-mono">{field.capacity || '-'}</TableCell>

                                            {/* Requires Booking */}
                                            <TableCell className="text-center">
                                                {field.is_available_for_booking ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 gap-1">
                                                        <Check className="h-3 w-3" /> نعم
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground gap-1">
                                                        <X className="h-3 w-3" /> لا
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                {isActive ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                                                        نشط
                                                    </Badge>
                                                ) : field.status === 'maintenance' ? (
                                                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
                                                        صيانة
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                                                        معطّل
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <RoleGuard privilege="UPDATE_FIELD">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEdit(field)}
                                                            className="gap-1 text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                                                        >
                                                            <Pencil className="h-3 w-3" /> تعديل
                                                        </Button>
                                                    </RoleGuard>
                                                    <RoleGuard privilege="MANAGE_FIELD_STATUS">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => toggleActive(field.id)}
                                                            className={
                                                                isActive
                                                                    ? "gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                                    : "gap-1 text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white"
                                                            }
                                                        >
                                                            {isActive ? (
                                                                <><X className="h-3 w-3" /> تعطيل</>
                                                            ) : (
                                                                <><Check className="h-3 w-3" /> تفعيل</>
                                                            )}
                                                        </Button>
                                                    </RoleGuard>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </motion.div>

            {/* ─── Add/Edit Dialog ──────────────────────────────────────────────── */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) setDialogOpen(false);
                }}
            >
                <DialogContent className="w-[95vw] max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{editField ? "تعديل ملعب" : "إضافة ملعب جديد"}</DialogTitle>
                        <DialogDescription>
                            {editField ? "قم بتعديل بيانات الملعب" : "أدخل بيانات الملعب الجديد"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-1">
                        {/* Name Arabic */}
                        <div className="space-y-1">
                            <Label htmlFor="field-name-ar" className="text-xs">اسم الملعب (عربي) <span className="text-destructive">*</span></Label>
                            <Input
                                id="field-name-ar"
                                placeholder='مثال: "ملعب بادل 1"'
                                value={form.name_ar}
                                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Name English */}
                        <div className="space-y-1">
                            <Label htmlFor="field-name-en" className="text-xs">اسم الملعب (إنجليزي) <span className="text-destructive">*</span></Label>
                            <Input
                                id="field-name-en"
                                placeholder='e.g. "Padel Court 1"'
                                value={form.name_en}
                                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                                dir="ltr"
                                className="text-left h-9 text-sm"
                            />
                        </div>

                        {/* Sport */}
                        <div className="space-y-1">
                            <Label htmlFor="field-sport" className="text-xs">الرياضة <span className="text-destructive">*</span></Label>
                            <Select
                                value={form.sportId ? String(form.sportId) : ""}
                                onValueChange={(val) => setForm({ ...form, sportId: Number(val) })}
                            >
                                <SelectTrigger id="field-sport" className="w-full h-9 text-sm">
                                    <SelectValue placeholder="اختر الرياضة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)} className="text-sm">
                                            {s.name_ar}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-1">
                            <Label htmlFor="field-capacity" className="text-xs">السعة (عدد اللاعبين)</Label>
                            <Input
                                id="field-capacity"
                                type="number"
                                min={1}
                                placeholder="مثال: 22"
                                value={form.capacity}
                                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                dir="ltr"
                                className="text-left h-9 text-sm"
                            />
                        </div>

                        {/* Availability for Booking Toggle */}
                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="field-booking" className="cursor-pointer font-medium text-xs">
                                    متاح للحجز
                                </Label>
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    {form.isAvailableForBooking ? "يمكن للأعضاء حجز هذا الملعب أونلاين" : "غير متاح للحجز الإلكتروني"}
                                </span>
                            </div>
                            <Switch
                                id="field-booking"
                                dir="ltr"
                                checked={form.isAvailableForBooking}
                                onCheckedChange={(val) => setForm({ ...form, isAvailableForBooking: val })}
                                className="shrink-0 scale-90"
                            />
                        </div>

                        {/* Status Switch */}
                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="field-status" className="cursor-pointer font-medium text-xs">
                                    الحالة
                                </Label>
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    {form.status === 'active' ? "الملعب نشط ومتاح" : form.status === 'maintenance' ? "صيانة" : "الملعب معطّل وغير متاح"}
                                </span>
                            </div>
                            <Select
                                value={form.status}
                                onValueChange={(val: 'active' | 'inactive' | 'maintenance') => setForm({ ...form, status: val })}
                            >
                                <SelectTrigger id="field-status" className="w-28 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active" className="text-xs">نشط</SelectItem>
                                    <SelectItem value="inactive" className="text-xs">معطّل</SelectItem>
                                    <SelectItem value="maintenance" className="text-xs">صيانة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 flex-row-reverse sm:justify-start">
                        <Button onClick={handleSave} className="gap-1" disabled={saving}>
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</>
                            ) : (
                                <><Check className="h-4 w-4" /> {editField ? "حفظ التعديلات" : "إضافة الملعب"}</>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={saving}
                        >
                            إلغاء
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: "default" | "green" | "blue";
}) {
    const colorMap = {
        default: "bg-muted/40 border-border text-foreground",
        green: "bg-emerald-50 border-emerald-200 text-emerald-700",
        blue: "bg-blue-50 border-blue-200 text-blue-700",
    };

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[color]}`}>
            <span className="text-xs font-medium opacity-70">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
        </div>
    );
}
