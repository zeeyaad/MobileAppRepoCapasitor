import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";
import {
    Table, TableHeader, TableBody,
    TableRow, TableHead, TableCell,
} from "../Component/StaffPagesComponents/ui/table";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from "../Component/StaffPagesComponents/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "../Component/StaffPagesComponents/ui/select";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "../Component/StaffPagesComponents/ui/popover";
import {
    Pencil, Trash2, Plus, Loader2, X, Clock, Users, Filter,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sport = { id: number; name_ar: string; name_en: string };
type Field = { id: string; name_ar: string; name_en: string };

type DayPair = { ar: string; en: string };
const DAYS: DayPair[] = [
    { ar: "السبت", en: "Saturday" },
    { ar: "الأحد", en: "Sunday" },
    { ar: "الاثنين", en: "Monday" },
    { ar: "الثلاثاء", en: "Tuesday" },
    { ar: "الأربعاء", en: "Wednesday" },
    { ar: "الخميس", en: "Thursday" },
    { ar: "الجمعة", en: "Friday" },
];

type TeamStatus = "active" | "inactive" | "suspended" | "archived";

interface ApiTeam {
    id: string;
    name_ar: string;
    name_en: string;
    sport_id: number;
    sport?: Sport;
    max_participants: number;
    status: TeamStatus;
    training_schedules?: {
        id: string;
        days_ar: string;
        days_en: string;
        start_time: string;
        end_time: string;
        field_id?: string;
        training_fee?: number;
    }[];
}

type TeamTraining = {
    selectedDays: string[];
    startTime: string;
    endTime: string;
    fieldId: string;
    trainingFee: string;
};

type TeamFormState = {
    nameAr: string;
    nameEn: string;
    sportId: string;
    maxParticipants: string;
    status: "active" | "inactive";
    training: TeamTraining;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyTraining = (): TeamTraining => ({
    selectedDays: [], startTime: "", endTime: "", fieldId: "", trainingFee: "",
});

const emptyForm = (): TeamFormState => ({
    nameAr: "", nameEn: "", sportId: "", maxParticipants: "", status: "active",
    training: emptyTraining(),
});

const isArabicOnly = (s: string) => /^[\u0600-\u06FF\s\-.,;:!?()«»]*$/.test(s);
const isEnglishOnly = (s: string) => /^[a-zA-Z0-9\s\-.,;:!?()]*$/.test(s);

const statusLabel = (s: TeamStatus) => {
    switch (s) {
        case "active": return "نشط";
        case "inactive": return "غير نشط";
        case "suspended": return "موقوف";
        case "archived": return "مؤرشف";
    }
};

const statusClass = (s: TeamStatus) => {
    switch (s) {
        case "active": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "inactive": return "bg-rose-50 text-rose-700 border-rose-200";
        case "suspended": return "bg-amber-50 text-amber-700 border-amber-200";
        case "archived": return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

const isValidTimeRange = (start: string, end: string) => start < end;

// ─── TimeSlotPicker (copied from SportsPage) ─────────────────────────────────

const TIME_SLOTS: { value: string; label: string }[] = Array.from({ length: 26 }, (_, i) => {
    const totalMins = 600 + i * 30;
    const h24 = Math.floor(totalMins / 60);
    const min = totalMins % 60;
    const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const period = h24 < 12 ? "AM" : "PM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const label = `${h12}:${String(min).padStart(2, "0")} ${period}`;
    return { value, label };
});

const TimeSlotPicker = ({
    value, onChange, placeholder, lockedValue,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    lockedValue?: string;
}) => {
    const [open, setOpen] = useState(false);
    const selected = TIME_SLOTS.find(s => s.value === value);
    const title = placeholder === "من" ? "وقت البداية" : "وقت النهاية";
    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 shadow-sm
            ${selected
                            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-primary/30 bg-background text-primary hover:bg-primary/10"
                        }`}
                >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {selected ? selected.label : <span className="opacity-60">{placeholder}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[17rem] p-4 rounded-2xl bg-popover border border-border" align="start" side="bottom" dir="ltr">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">{title}</span>
                    <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto"
                    onWheelCapture={e => e.stopPropagation()}
                    onTouchMoveCapture={e => e.stopPropagation()}
                >
                    {TIME_SLOTS.map(slot => {
                        const isActive = slot.value === value;
                        const isLocked = slot.value === lockedValue;
                        return (
                            <button key={slot.value} type="button" disabled={isLocked}
                                onClick={() => { if (!isLocked) { onChange(slot.value); setOpen(false); } }}
                                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all duration-200
                  ${isLocked
                                        ? "border-border bg-muted text-muted-foreground opacity-40 cursor-not-allowed line-through"
                                        : isActive
                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                            : "border-primary/30 bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                    }`}
                            >
                                {slot.label}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamsManagementPage() {
    const { toast } = useToast();

    // ── Data ────────────────────────────────────────────────────────────────────
    const [teams, setTeams] = useState<ApiTeam[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Filters ─────────────────────────────────────────────────────────────────
    const [filterSports, setFilterSports] = useState<number[]>([]);
    const [sportPopoverOpen, setSportPopoverOpen] = useState(false);
    const [filterStatuses, setFilterStatuses] = useState<TeamStatus[]>([]);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
    const [search, setSearch] = useState("");

    // ── Form/modal state ────────────────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTeam, setEditTeam] = useState<ApiTeam | null>(null);
    const [form, setForm] = useState<TeamFormState>(emptyForm());
    const [formError, setFormError] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);

    // ── Delete ──────────────────────────────────────────────────────────────────
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Load sports & fields ────────────────────────────────────────────────────
    useEffect(() => {
        api.get<{ data: Sport[] }>("/sports")
            .then(res => setSports(Array.isArray(res?.data?.data) ? res.data.data : []))
            .catch(() => toast({ title: "تحذير", description: "فشل تحميل الرياضات", variant: "destructive" }));
        api.get<{ data: Field[] }>("/fields")
            .then(res => setFields(Array.isArray(res?.data?.data) ? res.data.data : []))
            .catch(() => { /* non-fatal */ });
    }, [toast]);

    // ── Fetch teams ─────────────────────────────────────────────────────────────
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ data: ApiTeam[] }>("/teams");
            setTeams(Array.isArray(res?.data?.data) ? res.data.data : []);
        } catch {
            toast({ title: "خطأ", description: "فشل تحميل الفرق", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { void fetchTeams(); }, [fetchTeams]);

    // ── Filtered list (client-side status + search) ──────────────────────────────
    const filtered = teams.filter(t => {
        const matchStatus = filterStatuses.length === 0 || filterStatuses.includes(t.status);
        const matchSport = filterSports.length === 0 || filterSports.includes(t.sport_id);
        const q = search.trim().toLowerCase();
        const matchSearch = !q || t.name_ar.includes(search.trim()) || t.name_en.toLowerCase().includes(q);
        return matchStatus && matchSport && matchSearch;
    });

    // ── Open add ────────────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTeam(null);
        setForm(emptyForm());
        setFormError("");
        setIsAddOpen(true);
    };

    // ── Open edit — pre-fill entire form ────────────────────────────────────────
    const openEdit = (team: ApiTeam) => {
        setEditTeam(team);
        const sched = team.training_schedules?.[0];
        setForm({
            nameAr: team.name_ar,
            nameEn: team.name_en,
            sportId: String(team.sport_id),
            maxParticipants: String(team.max_participants),
            status: team.status === "active" ? "active" : "inactive",
            training: sched ? {
                selectedDays: (sched.days_ar ?? "").split(", ").filter(Boolean),
                startTime: (sched.start_time ?? "").slice(0, 5),
                endTime: (sched.end_time ?? "").slice(0, 5),
                fieldId: sched.field_id ?? "",
                trainingFee: String(sched.training_fee ?? ""),
            } : emptyTraining(),
        });
        setFormError("");
        setIsAddOpen(true);
    };

    // ── Validation ───────────────────────────────────────────────────────────────
    const validate = (): string => {
        if (!form.nameAr.trim()) return "اسم الفريق بالعربية مطلوب";
        if (!form.nameEn.trim()) return "اسم الفريق بالإنجليزية مطلوب";
        if (!editTeam && !form.sportId) return "يجب اختيار الرياضة";
        if (!form.maxParticipants || Number(form.maxParticipants) <= 0) return "الحد الأقصى للمشاركين مطلوب ويجب أن يكون أكبر من صفر";
        if (form.training.selectedDays.length === 0) return "يجب اختيار يوم تدريب واحد على الأقل";
        if (!form.training.startTime) return "وقت البداية مطلوب";
        if (!form.training.endTime) return "وقت النهاية مطلوب";
        if (!isValidTimeRange(form.training.startTime, form.training.endTime)) return "وقت النهاية يجب أن يكون بعد وقت البداية";
        if (!form.training.trainingFee.trim()) return "رسوم التدريب مطلوبة";
        return "";
    };

    // ── Save (create or update) ──────────────────────────────────────────────────
    const handleSave = async () => {
        const err = validate();
        if (err) { setFormError(err); return; }
        setFormError("");
        setSaveLoading(true);
        const trainingBody = {
            days_ar: form.training.selectedDays.join(", "),
            days_en: form.training.selectedDays.map(ar => DAYS.find(d => d.ar === ar)?.en ?? ar).join(", "),
            start_time: form.training.startTime + ":00",
            end_time: form.training.endTime + ":00",
            field_id: form.training.fieldId || undefined,
            training_fee: Number(form.training.trainingFee),
        };
        try {
            if (editTeam) {
                await api.put(`/teams/${editTeam.id}`, {
                    name_ar: form.nameAr,
                    name_en: form.nameEn,
                    max_participants: Number(form.maxParticipants),
                    status: form.status,
                    training: trainingBody,
                });
                toast({ title: "✓ تم التحديث", description: "تم تحديث الفريق بنجاح" });
            } else {
                await api.post("/teams", {
                    sport_id: Number(form.sportId),
                    name_ar: form.nameAr,
                    name_en: form.nameEn,
                    max_participants: Number(form.maxParticipants),
                    status: form.status,
                    training: trainingBody,
                });
                toast({ title: "✓ تمت الإضافة", description: "تم إضافة الفريق بنجاح" });
            }
            setIsAddOpen(false);
            setEditTeam(null);
            setForm(emptyForm());
            await fetchTeams();
        } catch (err) {
            const e = err as { message?: string };
            toast({ title: "فشل الحفظ", description: e?.message ?? "حدث خطأ غير متوقع", variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/teams/${deleteId}`);
            toast({ title: "✓ تم الحذف", description: "تم حذف الفريق بنجاح" });
            setDeleteId(null);
            await fetchTeams();
        } catch {
            toast({ title: "فشل الحذف", variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    const toggleDay = (day: string) =>
        setForm(prev => ({
            ...prev,
            training: {
                ...prev.training,
                selectedDays: prev.training.selectedDays.includes(day)
                    ? prev.training.selectedDays.filter(d => d !== day)
                    : [...prev.training.selectedDays, day],
            },
        }));

    const timeErr = form.training.startTime && form.training.endTime
        && !isValidTimeRange(form.training.startTime, form.training.endTime);

    const isEdit = !!editTeam;
    const hasFilters = filterSports.length > 0 || filterStatuses.length > 0 || search.trim() !== "";

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="h-full overflow-y-auto p-6 pb-8 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    إدارة الفرق
                </h1>
                <RoleGuard privilege="CREATE_TEAM">
                    <Button onClick={openAdd} className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة فريق
                    </Button>
                </RoleGuard>
            </div>

            {/* ── Filter bar ── */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Status checkbox popover */}
                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs transition-colors
                            ${filterStatuses.length > 0
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                            <Filter className="w-3 h-3" />
                            الحالة
                            {filterStatuses.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                    {filterStatuses.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-52 p-0" dir="rtl">
                        <div className="py-1">
                            {([
                                { key: "active" as TeamStatus, label: "نشط", color: "text-emerald-700" },
                                { key: "inactive" as TeamStatus, label: "غير نشط", color: "text-rose-700" },
                                { key: "suspended" as TeamStatus, label: "موقوف", color: "text-amber-700" },
                                { key: "archived" as TeamStatus, label: "مؤرشف", color: "text-slate-600" },
                            ]).map(({ key, label, color }) => {
                                const checked = filterStatuses.includes(key);
                                const count = teams.filter(t => t.status === key).length;
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

                {/* Sport filter */}
                <Popover open={sportPopoverOpen} onOpenChange={setSportPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs transition-colors
                            ${filterSports.length > 0
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                            الرياضة
                            {filterSports.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                    {filterSports.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-52 p-0" dir="rtl">
                        <div className="py-1 max-h-64 overflow-y-auto">
                            {sports.map(s => {
                                const checked = filterSports.includes(s.id);
                                const count = teams.filter(t => t.sport_id === s.id).length;
                                return (
                                    <label key={s.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setFilterSports(prev =>
                                                    prev.includes(s.id)
                                                        ? prev.filter(id => id !== s.id)
                                                        : [...prev, s.id]
                                                );
                                            }}
                                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                                        />
                                        <span className="text-xs font-medium">{s.name_ar}</span>
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

                {/* Search */}
                <div className="relative">
                    <Input
                        placeholder="ابحث عن فريق..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-8 w-48 text-xs pl-7"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {hasFilters && (
                    <button
                        onClick={() => { setFilterSports([]); setFilterStatuses([]); setSearch(""); void fetchTeams(); }}
                        className="text-xs text-primary hover:underline"
                    >
                        مسح الفلاتر ×
                    </button>
                )}
            </div>

            {/* ── Table — same motion wrapper + row style as SportsPage ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">#</TableHead>
                            <TableHead>اسم الفريق</TableHead>
                            <TableHead>الرياضة</TableHead>
                            <TableHead>مواعيد التدريب</TableHead>
                            <TableHead>الحد الأقصى</TableHead>
                            <TableHead className="whitespace-nowrap">الحالة</TableHead>
                            <TableHead className="w-[200px] text-center">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Skeleton rows
                            [1, 2, 3].map(i => (
                                <TableRow key={i} className="animate-pulse border-b border-border">
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j}><div className="h-4 bg-muted rounded w-20" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-16">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="w-8 h-8 opacity-30" />
                                        <span className="text-sm">{hasFilters ? "لا توجد فرق تطابق الفلاتر المحددة" : "لا توجد فرق مسجلة بعد"}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((team, idx) => {
                                    const sched = team.training_schedules?.[0];
                                    const schedStr = sched
                                        ? `${sched.days_ar} • ${sched.start_time?.slice(0, 5)} → ${sched.end_time?.slice(0, 5)}`
                                        : "—";
                                    return (
                                        <motion.tr
                                            key={team.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-border transition-colors duration-200 hover:bg-accent/10"
                                        >
                                            <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                <span>{team.name_ar}</span>
                                                {team.name_en && (
                                                    <span className="block text-[11px] text-muted-foreground/70 italic">{team.name_en}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{team.sport?.name_ar ?? "—"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                                                <span className="line-clamp-2">{schedStr}</span>
                                            </TableCell>
                                            <TableCell>{team.max_participants}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass(team.status)}`}>
                                                    {statusLabel(team.status)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <RoleGuard privilege="UPDATE_TEAM">
                                                        <Button
                                                            size="sm" variant="outline"
                                                            className="gap-1 text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                                                            onClick={() => openEdit(team)}
                                                        >
                                                            <Pencil className="h-3 w-3" /> تعديل
                                                        </Button>
                                                    </RoleGuard>
                                                    <RoleGuard privilege="DELETE_TEAM">
                                                        <Button
                                                            size="sm" variant="outline"
                                                            className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => setDeleteId(team.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" /> حذف
                                                        </Button>
                                                    </RoleGuard>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </TableBody>
                </Table>
            </motion.div>

            {/* ══ Add / Edit Dialog — same structure as SportsPage dialog ══ */}
            <Dialog
                open={isAddOpen}
                onOpenChange={open => { if (!saveLoading) { setIsAddOpen(open); if (!open) setEditTeam(null); } }}
            >
                <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] p-0 flex flex-col overflow-hidden" dir="rtl">
                    <div className="flex min-h-0 flex-1 flex-col p-6 overflow-hidden">
                        <DialogHeader className="shrink-0">
                            <DialogTitle>{isEdit ? "تعديل فريق" : "إضافة فريق جديد"}</DialogTitle>
                            <DialogDescription>
                                {isEdit ? "قم بتعديل بيانات الفريق — جميع الحقول قابلة للتعديل" : "أدخل بيانات الفريق الجديد"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">

                            {/* Sport selector — shown on create only */}
                            {!isEdit && (
                                <div>
                                    <Label>الرياضة <span className="text-destructive">*</span></Label>
                                    <Select value={form.sportId} onValueChange={v => setForm(p => ({ ...p, sportId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="اختر الرياضة" /></SelectTrigger>
                                        <SelectContent>
                                            {sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name_ar}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Name row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>اسم الفريق (AR) <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={form.nameAr}
                                        placeholder="مثال: فريق تحت 18 سنة"
                                        maxLength={100}
                                        onChange={e => {
                                            const v = e.target.value;
                                            if (v === "" || isArabicOnly(v)) setForm(p => ({ ...p, nameAr: v }));
                                            else toast({ title: "تنبيه", description: "الاسم العربي يقبل عربي فقط", variant: "destructive" });
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label>Team Name (EN) <span className="text-destructive">*</span></Label>
                                    <Input
                                        dir="ltr" className="text-left"
                                        value={form.nameEn}
                                        placeholder="e.g. Under 18 Team"
                                        maxLength={100}
                                        onChange={e => {
                                            const v = e.target.value;
                                            if (v === "" || isEnglishOnly(v)) setForm(p => ({ ...p, nameEn: v }));
                                            else toast({ title: "تنبيه", description: "English name only", variant: "destructive" });
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Max participants + Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>الحد الأقصى للمشاركين <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="number" min={1} placeholder="20"
                                        value={form.maxParticipants}
                                        onChange={e => setForm(p => ({ ...p, maxParticipants: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>الحالة</Label>
                                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as "active" | "inactive" }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">نشط</SelectItem>
                                            <SelectItem value="inactive">غير نشط</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Training block — same card style as SportsPage */}
                            <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                                <span className="text-sm font-semibold text-primary">مواعيد التدريب</span>

                                {/* Day chips */}
                                <div>
                                    <Label className="text-xs mb-1.5 block">أيام التدريب <span className="text-destructive">*</span></Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {DAYS.map(day => {
                                            const on = form.training.selectedDays.includes(day.ar);
                                            return (
                                                <button key={day.ar} type="button" onClick={() => toggleDay(day.ar)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150
                            ${on
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-background text-foreground border-border hover:border-primary/60"
                                                        }`}
                                                >
                                                    {day.ar}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time pickers */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">من</Label>
                                    <TimeSlotPicker
                                        value={form.training.startTime}
                                        placeholder="من"
                                        lockedValue={form.training.endTime}
                                        onChange={v => setForm(p => ({ ...p, training: { ...p.training, startTime: v } }))}
                                    />
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">إلى</Label>
                                    <TimeSlotPicker
                                        value={form.training.endTime}
                                        placeholder="إلى"
                                        lockedValue={form.training.startTime}
                                        onChange={v => setForm(p => ({ ...p, training: { ...p.training, endTime: v } }))}
                                    />
                                </div>
                                {timeErr && <p className="text-[11px] text-destructive">وقت النهاية يجب أن يكون بعد وقت البداية</p>}

                                {/* Field selector */}
                                <div>
                                    <Label className="text-xs mb-1 block">الملعب <span className="text-destructive">*</span></Label>
                                    {fields.length === 0 ? (
                                        <p className="text-xs text-amber-600 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2">
                                            لا توجد ملاعب محملة من API — تأكد من اتصال الخادم
                                        </p>
                                    ) : (
                                        <Select
                                            value={form.training.fieldId || "none"}
                                            onValueChange={val => setForm(p => ({ ...p, training: { ...p.training, fieldId: val === "none" ? "" : val } }))}
                                        >
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="اختر ملعب" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-xs text-muted-foreground">اختر ملعب</SelectItem>
                                                {fields.map(f => (
                                                    <SelectItem key={f.id} value={f.id} className="text-xs">
                                                        {f.name_ar}{f.name_en ? ` (${f.name_en})` : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Training fee */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs whitespace-nowrap shrink-0">رسوم التدريب (ج.م) <span className="text-destructive">*</span></Label>
                                    <input
                                        type="number" min={0} placeholder="200"
                                        value={form.training.trainingFee}
                                        onChange={e => setForm(p => ({ ...p, training: { ...p.training, trainingFee: e.target.value } }))}
                                        className="w-24 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            {/* Inline error */}
                            {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
                        </div>

                        <DialogFooter className="mt-4 border-t pt-4">
                            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditTeam(null); }} disabled={saveLoading}>
                                إلغاء
                            </Button>
                            <Button onClick={() => void handleSave()} disabled={saveLoading}>
                                {saveLoading ? <><Loader2 className="w-4 h-4 animate-spin ml-1" />جارٍ الحفظ...</> : "حفظ"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ══ Delete Confirmation Dialog ══ */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>هل أنت متأكد من حذف هذا الفريق؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>إلغاء</Button>
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
                            {deleteLoading ? "جارٍ الحذف..." : "حذف"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
