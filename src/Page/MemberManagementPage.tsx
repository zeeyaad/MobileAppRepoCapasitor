import React, { useCallback, useEffect, useMemo, useState } from "react";




import {

    Search, RefreshCw, ChevronLeft, ChevronRight,

    ChevronUp, ChevronDown, ChevronsUpDown,

    Users, UserCheck, Trophy,

    Pencil, Shield, Eye, Trash2,

    AlertTriangle, CheckCircle,

    XCircle, Clock, Filter, MoreHorizontal,

} from "lucide-react";

import api from "../api/axios";

import { useToast } from "../hooks/use-toast";

import { Button } from "../Component/StaffPagesComponents/ui/button";

import { Input } from "../Component/StaffPagesComponents/ui/input";

import { Label } from "../Component/StaffPagesComponents/ui/label";

import {

    Dialog, DialogContent, DialogHeader, DialogTitle,

    DialogDescription, DialogFooter,

} from "../Component/StaffPagesComponents/ui/dialog";

import {

    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,

} from "../Component/StaffPagesComponents/ui/select";

import {

    Popover,

    PopoverContent,

    PopoverTrigger,

} from "../Component/StaffPagesComponents/ui/popover";

import {

    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,

} from "../Component/StaffPagesComponents/ui/dropdown-menu";

import {

    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,

} from "../Component/StaffPagesComponents/ui/tooltip";

import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";
import {
    PAYMENTS_MAP,
    computePaymentStatus,
    getDaysUntilRenewal,
} from "../data/paymentsData";
import { BACKEND_ORIGIN } from "../config/backend";






// ─── Types ─────────────────────────────────────────────────────────────────



type MemberType = { id: number; name_en?: string; name_ar?: string; code?: string };

type MemberAccount = { email?: string };



type SportItem = {

    id: number;

    name_ar?: string;

    name_en?: string;

    pivot?: {

        level?: string;

        position?: string;

        join_date?: string;

    };

};



type MemberApiItem = {

    id: number;

    first_name_en: string; first_name_ar: string;

    last_name_en: string; last_name_ar: string;

    gender?: string;

    phone?: string;

    nationality?: string;

    birthdate?: string | null;

    national_id: string;

    health_status?: string;

    is_foreign?: boolean;

    address?: string;

    member_type_id: number;

    member_type?: MemberType;

    account?: MemberAccount;

    points_balance?: number;

    status: string;

    created_at?: string;

    updated_at?: string;

    sports?: SportItem[]; // ← ADDED

    photo?: string;

    national_id_front?: string;

    national_id_back?: string;

    medical_report?: string;

};



// ← ADDED: Team Member API response type

type TeamMemberApiItem = {

    id: number;

    firstNameEn?: string;

    lastNameEn?: string;

    firstNameAr?: string;

    lastNameAr?: string;

    first_name_en?: string;

    last_name_en?: string;

    first_name_ar?: string;

    last_name_ar?: string;

    name_en?: string;

    name_ar?: string;

    national_id?: string;

    phone?: string;

    gender?: string;

    nationality?: string;

    birthdate?: string | null;

    address?: string;

    status: string;

    created_at?: string;

    updated_at?: string;

    teams?: Array<{

        name?: string;

        startDate?: string;

        endDate?: string;

        status?: string;

        price?: number;

    }>;

    sports?: Array<{

        id?: number;

        name?: string;

        status?: string;

        start_date?: string;

        end_date?: string;

        price?: number;

    }>;

};



type MemberRow = {

    id: string;

    firstNameAr: string; firstNameEn: string;

    lastNameAr: string; lastNameEn: string;

    email?: string;

    phone?: string;

    nationalId: string;

    gender?: string;

    nationality?: string;

    birthdate?: string | null;

    healthStatus?: string;

    isForeign: boolean;

    address?: string;

    memberTypeId: number;

    memberTypeLabel: string;

    memberTypeCode: string;

    isTeamPlayer: boolean;

    pointsBalance: number;

    status: string;

    createdAt?: string;

    sports: Array<{ // ← ADDED

        id: number;

        name: string;

        level?: string;

        position?: string;

        joinDate?: string;

    }>;

};



type SortField = "name" | "memberType" | "status" | "points" | "createdAt";

type SortDir = "asc" | "desc";

type TabKey = "all" | "members" | "players";



// ─── Constants ───────────────────────────────────────────────────────────────



const TEAM_PLAYER_CODES = new Set([

    "TEAM_MEMBER", "TEAM_PLAYER", "PLAYER", "SPORT_MEMBER",

    "TEAM", "ATHLETE", "SPORT_PLAYER",

]);

const isTeamPlayerType = (t?: MemberType) => {

    if (!t) return false;

    const code = (t.code ?? "").toUpperCase();

    const nameEn = (t.name_en ?? "").toLowerCase();

    const nameAr = (t.name_ar ?? "");

    return (

        TEAM_PLAYER_CODES.has(code) ||

        nameEn.includes("team") ||

        nameEn.includes("player") ||

        nameEn.includes("athlete") ||

        nameAr.includes("لاعب") ||

        nameAr.includes("فريق")

    );

};



const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle; border: string }> = {

    active: { label: "نشط", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },

    suspended: { label: "موقوف", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },

    banned: { label: "محظور", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },

    expired: { label: "منتهي", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: AlertTriangle },

    cancelled: { label: "ملغى", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: XCircle },

    pending: { label: "قيد المراجعة", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Clock },

};



const GENDER_LABELS: Record<string, string> = {

    male: "ذكر", female: "أنثى", other: "أخرى",

};



const PAGE_SIZE = 50;



const palette = [

    "#1F3A5F", "#7C3AED", "#065F46", "#92400E", "#9D174D",

    "#1E40AF", "#0369A1", "#6B21A8", "#0F766E", "#B45309",

];

const getColor = (id: string) => palette[parseInt(id, 10) % palette.length];

const getInitials = (ar: string, en: string) =>

    (ar || en || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();



const fmtDate = (v?: string | null) => {

    if (!v) return "—";

    try { return new Date(v).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }); }

    catch { return v; }

};



const fmtDateShort = (v?: string | null) => {

    if (!v) return "—";

    try { return new Date(v).toLocaleDateString("ar-EG", { year: "2-digit", month: "numeric", day: "numeric" }); }

    catch { return v; }

};



// ─── Status Badge ─────────────────────────────────────────────────────────────



function StatusBadge({ status, compact = false }: { status: string; compact?: boolean }) {

    const cfg = STATUS_CONFIG[status] ?? {

        label: status,

        color: "text-muted-foreground",

        bg: "bg-muted",

        border: "border-muted",

        icon: Clock

    };

    const Icon = cfg.icon;

    return (

        <span className={`inline-flex items-center gap-1 rounded-full font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border} ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}>

            <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />

            {cfg.label}

        </span>

    );

}



// ─── Payment Badge ────────────────────────────────────────────────────────────

function PaymentBadge({
    memberId,
    memberType = "member",
}: {
    memberId: number;
    memberType?: "member" | "team_member";
}) {
    const payment = PAYMENTS_MAP.get(`${memberType}-${memberId}`);
    if (!payment) return null;

    const status = computePaymentStatus(payment.nextRenewalDate);
    if (status === "active") return null;

    const days = getDaysUntilRenewal(payment.nextRenewalDate);

    if (status === "overdue") {
        return (
            <span className="inline-flex items-center rounded-full border border-rose-300 bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 text-[9px] whitespace-nowrap">
                ⚠ متأخر
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 text-[9px] whitespace-nowrap">
            🔔 {days <= 7 ? `${days} أيام` : `${days} يوم`}
        </span>
    );
}



// ─── Sort indicator ───────────────────────────────────────────────────────────



function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {

    if (field !== active) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;

    return dir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

}



// ─── Detail Panel (IMPROVED) ─────────────────────────────────────────────────



type PanelProps = {

    row: MemberRow;

    details: MemberApiItem | null;

    loading: boolean;

    sports: { id: number; team_name: string; status: string }[];

    onClose: () => void;

    onEdit: () => void;

    onChangeStatus: () => void;

    onDelete: () => void;

};



function DetailPanel({ row, details, loading, sports, onEdit, onChangeStatus, onDelete }: PanelProps) {

    const d = details;

    const nameAr = `${row.firstNameAr} ${row.lastNameAr}`.trim();

    const nameEn = `${row.firstNameEn} ${row.lastNameEn}`.trim();

    const [detailTab, setDetailTab] = React.useState<'info' | 'sports' | 'photos'>('info');




    const Field = ({ label, value, ltr = false }: { label: string; value?: string | null; ltr?: boolean }) => (

        <div className="py-2 border-b border-border/50 last:border-0">

            <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">{label}</p>

            <p className="text-sm font-semibold truncate" dir={ltr ? 'ltr' : undefined}>

                {value || <span className="text-muted-foreground/40 font-normal">—</span>}

            </p>

        </div>

    );



    return (

        <div className="flex flex-col" style={{ maxHeight: '88vh' }} dir="rtl">



            {/* ── Header ── */}

            <div className="px-6 pt-5 pb-0 border-b border-border bg-gradient-to-r from-primary/5 to-transparent shrink-0">

                <div className="flex items-start gap-4 pb-4">

                    <div

                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white shadow shrink-0"

                        style={{ background: getColor(row.id) }}

                    >

                        {getInitials(nameAr, nameEn)}

                    </div>

                    <div className="flex-1 min-w-0">

                        <h2 className="text-lg font-bold leading-tight truncate">{nameAr || '—'}</h2>

                        <p className="text-xs text-muted-foreground" dir="ltr">{nameEn}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">

                            <StatusBadge status={row.status} />

                            <Badge variant="secondary" className="text-[10px]">{row.memberTypeLabel}</Badge>

                            {row.isTeamPlayer && (

                                <Badge className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">

                                    <Trophy className="w-3 h-3 mr-1" /> لاعب

                                </Badge>

                            )}

                        </div>

                    </div>

                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-0 -mb-px overflow-x-auto scrollbar-none">
                    {([
                        { key: 'info' as const, label: 'المعلومات الشخصية' },
                        { key: 'sports' as const, label: 'الرياضات' },
                        { key: 'photos' as const, label: '🖼️ الصور والمستندات' },
                    ]).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setDetailTab(t.key)}
                            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                                detailTab === t.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">

                {loading ? (

                    <div className="py-16 text-center">

                        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />

                        <p className="text-sm text-muted-foreground">جارٍ تحميل التفاصيل...</p>

                    </div>

                ) : detailTab === 'info' ? (

                    <div className="grid grid-cols-2 gap-0 divide-x divide-x-reverse divide-border">



                        {/* Left column — personal + contact + extra */}

                        <div className="p-5 space-y-5">

                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">المعلومات الشخصية</p>

                                <div className="space-y-0">

                                    <Field label="رقم العضو" value={`MEM-${String(row.id).padStart(5, '0')}`} ltr />

                                    <Field label="الرقم القومي" value={d?.national_id ?? row.nationalId} ltr />

                                    <Field label="الجنس" value={GENDER_LABELS[d?.gender ?? row.gender ?? ''] || row.gender} />

                                    <Field label="الجنسية" value={d?.nationality ?? row.nationality} />

                                    <Field label="تاريخ الميلاد" value={fmtDate(d?.birthdate ?? row.birthdate)} />

                                    <Field label="التاريخ القومي" value={fmtDate(d?.created_at ?? row.createdAt)} />

                                </div>

                            </div>

                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">معلومات التواصل</p>

                                <div className="space-y-0">

                                    <Field label="البريد الإلكتروني" value={d?.account?.email ?? row.email} ltr />

                                    <Field label="رقم الهاتف" value={d?.phone ?? row.phone} ltr />

                                    <Field label="العنوان" value={d?.address ?? row.address} />

                                </div>

                            </div>

                        </div>



                        {/* Right column — additional + payment */}

                        <div className="p-5 space-y-5">

                            {/* Additional info */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">معلومات إضافية</p>
                                <div className="space-y-0">
                                    <Field label="الحالة الصحية" value={d?.health_status ?? row.healthStatus} />
                                    <Field label="النقاط" value={(d?.points_balance ?? row.pointsBalance).toLocaleString()} />
                                    <Field label="نوع العضوية" value={row.memberTypeLabel} />
                                </div>
                            </div>


                            {/* ─── Payment Info ─── */}
                            {(() => {
                                const mType = (row.isTeamPlayer ? "team_member" : "member") as "member" | "team_member";
                                const payment = PAYMENTS_MAP.get(`${mType}-${Number(row.id)}`);
                                if (!payment) return null;

                                const status = computePaymentStatus(payment.nextRenewalDate);
                                const days = getDaysUntilRenewal(payment.nextRenewalDate);

                                const statusConfig = {
                                    active: { label: "نشط", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                                    expiring: { label: "ينتهي قريباً", cls: "bg-amber-100  text-amber-700  border-amber-200" },
                                    overdue: { label: "متأخر", cls: "bg-rose-100   text-rose-700   border-rose-200" },
                                }[status];

                                return (
                                    <section className="mt-5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                            بيانات الاشتراك والدفع
                                        </p>
                                        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden divide-y divide-border">
                                            <div className="flex items-center justify-between px-4 py-2.5">
                                                <span className="text-[11px] text-muted-foreground">حالة الاشتراك</span>
                                                <span className={`text-[11px] font-bold rounded-full border px-2.5 py-0.5 ${statusConfig.cls}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-2.5">
                                                <span className="text-[11px] text-muted-foreground">نوع الاشتراك</span>
                                                <span className="text-sm font-medium">{payment.subscriptionType}</span>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-2.5">
                                                <span className="text-[11px] text-muted-foreground">آخر دفعة</span>
                                                <div className="text-left" dir="ltr">
                                                    <p className="text-sm font-medium">
                                                        {new Date(payment.lastPaymentDate).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {payment.lastPaymentAmount.toLocaleString("ar-EG")} ج.م
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-2.5">
                                                <span className="text-[11px] text-muted-foreground">التجديد القادم</span>
                                                <div className="text-left" dir="ltr">
                                                    <p className={`text-sm font-medium ${status === "overdue" ? "text-rose-600" :
                                                        status === "expiring" ? "text-amber-600" : ""
                                                        }`}>
                                                        {new Date(payment.nextRenewalDate).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}
                                                    </p>
                                                    {status !== "active" && (
                                                        <p className={`text-[10px] font-semibold ${status === "overdue" ? "text-rose-500" : "text-amber-500"
                                                            }`}>
                                                            {status === "overdue"
                                                                ? `متأخر ${Math.abs(days)} يوم`
                                                                : `فاضل ${days} يوم`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {status !== "active" && (
                                            <div className={`mt-2 rounded-lg border px-3 py-2 text-xs font-medium flex items-center gap-2 ${status === "overdue"
                                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                                : "bg-amber-50 border-amber-200 text-amber-700"
                                                }`}>
                                                {status === "overdue" ? "⚠" : "🔔"}
                                                {status === "overdue"
                                                    ? `تجاوز موعد التجديد منذ ${Math.abs(days)} يوم`
                                                    : `الاشتراك سينتهي خلال ${days} يوم`}
                                            </div>
                                        )}
                                    </section>
                                );
                            })()}

                        </div>

                    </div>

                ) : detailTab === 'sports' ? (

                    <div className="p-5 space-y-5">

                        {/* Sports */}

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                الرياضات
                                {sports.length > 0 && (
                                    <span className="mr-1.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-bold">
                                        {sports.length}
                                    </span>
                                )}
                            </p>
                            {sports.length === 0 ? (
                                <p className="text-xs text-muted-foreground/60 py-2">
                                    {row.isTeamPlayer ? 'لا توجد رياضات مسجّلة' : 'ليس لاعباً رياضياً'}
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {sports.map((s) => (
                                        <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-sm font-semibold">{s.team_name}</span>
                                            </div>
                                            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                                                s.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                                                    : s.status === 'pending' ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-rose-100 text-rose-700'}` }>
                                                {s.status === 'active' ? 'نشط' : s.status === 'pending' ? 'قيد المراجعة' : s.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                ) : (

                    /* Photos tab */
                    <div className="p-5 space-y-4">

                        {/* Personal photo */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                                الصورة الشخصية
                            </h4>
                            <div className="flex justify-center">
                                {getFileUrl(d?.photo) ? (
                                    <a href={getFileUrl(d?.photo)} target="_blank" rel="noreferrer">
                                        <img src={getFileUrl(d?.photo)} alt="الصورة الشخصية" className="h-48 w-auto rounded-xl border-2 border-border shadow-md object-cover cursor-zoom-in hover:opacity-90 transition-opacity" />
                                    </a>
                                ) : (
                                    <div className="h-48 w-36 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Eye className="h-8 w-8 opacity-40" />
                                        <span className="text-xs">لا توجد صورة شخصية</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ID front + back */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {([
                                { label: 'بطاقة الرقم القومي (أمام)', src: d?.national_id_front, color: '#1b71bc' },
                                { label: 'بطاقة الرقم القومي (خلف)', src: d?.national_id_back, color: '#1b71bc' },
                            ] as const).map(doc => (
                                <div key={doc.label} className="space-y-2">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full inline-block" style={{ background: doc.color }} />
                                        {doc.label}
                                    </h4>
                                    <div className="aspect-[1.6/1] w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-hidden flex items-center justify-center group hover:border-primary/50 transition-all">
                                        {getFileUrl(doc.src) ? (
                                            <a href={getFileUrl(doc.src)} target="_blank" rel="noreferrer" className="w-full h-full">
                                                <img src={getFileUrl(doc.src)} alt={doc.label} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                            </a>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Eye className="h-7 w-7 mx-auto text-muted-foreground/40 mb-1" />
                                                <span className="text-xs text-muted-foreground">لم يتم الرفع</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Medical report */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
                                التقرير الطبي
                            </h4>
                            <div className="min-h-[220px] w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-hidden flex items-center justify-center group hover:border-orange-400/60 transition-all">
                                {getFileUrl(d?.medical_report) ? (
                                    <a href={getFileUrl(d?.medical_report)} target="_blank" rel="noreferrer" className="w-full h-full">
                                        <img src={getFileUrl(d?.medical_report)} alt="التقرير الطبي" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                    </a>
                                ) : (
                                    <div className="text-center p-8">
                                        <Eye className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                        <span className="text-sm text-muted-foreground">لم يتم إرفاق تقرير طبي</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                )}

            </div>

            {/* ── Footer ── */}

            <div className="border-t border-border px-5 py-3 bg-muted/20 shrink-0 flex items-center gap-2">
                <RoleGuard privilege="DELETE_MEMBER">
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
                    <Trash2 className="w-4 h-4" /> حذف
                </Button>
                </RoleGuard>

                <div className="flex gap-2 mr-auto">
                    <RoleGuard privilege="MANAGE_MEMBER_BLOCK">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={onChangeStatus}>
                        <Shield className="w-4 h-4" /> تغيير الحالة
                    </Button>
                    </RoleGuard>
                    <RoleGuard privilege="UPDATE_MEMBER">
                    <Button size="sm" className="gap-1.5" onClick={onEdit}>
                        <Pencil className="w-4 h-4" /> تعديل
                    </Button>
                    </RoleGuard>
                </div>
            </div>

        </div>

    );

}



// ─── Main Page ────────────────────────────────────────────────────────────────





// ─── File URL helper ─────────────────────────────────────────────────────────
// Resolve the backend origin dynamically — mirrors the logic in axios.ts.
const getBackendOrigin = (): string => {
    // Hard-coded backend origin for file URLs
    return BACKEND_ORIGIN;
};

const getFileUrl = (f?: string | null): string => {
    if (!f) return "";
    if (f.startsWith("data:")) return f;

    // If backend saved/returned an absolute URL (e.g. http://10.100.104.157/uploads/...),
    // rewrite it to our hard-coded base (localhost:3000) so all images start the same way.
    if (f.startsWith("http://") || f.startsWith("https://")) {
        try {
            const u = new URL(f);
            const pathname = u.pathname.replace(/\\/g, "/");
            const fileBase = getBackendOrigin();
            if (pathname.startsWith("/api/uploads/")) return `${fileBase}${pathname.replace(/^\/api/, "")}`;
            if (pathname.startsWith("/uploads/")) return `${fileBase}${pathname}`;
            return f;
        } catch {
            // If parsing fails, fall through to relative handling below.
        }
    }

    const fileBase = getBackendOrigin();
    const normalized = f.replace(/\\/g, "/");
    const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;

    if (clean.startsWith("/uploads/")) {
        return `${fileBase}${clean}`;
    }
    if (clean.startsWith("/api/uploads/")) {
        // Strip the /api prefix — the file server serves directly under /uploads.
        return `${fileBase}${clean.replace(/^\/api/, "")}`;
    }
    return `${fileBase}/uploads${clean}`;
};

export default function MemberManagementPage() {

    const { toast } = useToast();



    const [allRows, setAllRows] = useState<MemberRow[]>([]);

    const [fetching, setFetching] = useState(false);

    const [lastFetched, setLastFetched] = useState<Date | null>(null);



    const [search, setSearch] = useState("");

    const [tab, setTab] = useState<TabKey>("all");

    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

    const [sortField, setSortField] = useState<SortField>("createdAt");

    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const [page, setPage] = useState(1);



    const [selectedRow, setSelectedRow] = useState<MemberRow | null>(null);

    const [selectedDetail, setSelectedDetail] = useState<MemberApiItem | null>(null);

    const [detailLoading, setDetailLoading] = useState(false);

    // Sports the selected member is subscribed to (from /sports/team-members/user/:id)

    const [memberSports, setMemberSports] = useState<{ id: number; team_name: string; status: string }[]>([]);



    const [editOpen, setEditOpen] = useState(false);

    const [editFirstNameAr, setEditFirstNameAr] = useState("");

    const [editFirstNameEn, setEditFirstNameEn] = useState("");

    const [editLastNameAr, setEditLastNameAr] = useState("");

    const [editLastNameEn, setEditLastNameEn] = useState("");

    const [editGender, setEditGender] = useState("");

    const [editPhone, setEditPhone] = useState("");

    const [editBirthdate, setEditBirthdate] = useState("");

    const [editNationality, setEditNationality] = useState("");

    const [editAddress, setEditAddress] = useState("");

    const [editHealth, setEditHealth] = useState("");

    const [editSaving, setEditSaving] = useState(false);

    // Photo upload state
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const [medicalFile, setMedicalFile] = useState<File | null>(null);

    const [editTab, setEditTab] = useState<'info' | 'docs'>('info');



    const [statusOpen, setStatusOpen] = useState(false);

    const [newStatus, setNewStatus] = useState("");

    const [statusReason, setStatusReason] = useState("");

    const [statusSaving, setStatusSaving] = useState(false);



    const [deleteOpen, setDeleteOpen] = useState(false);

    const [deleteSaving, setDeleteSaving] = useState(false);



    // Map raw API item → row (ADDED SPORTS MAPPING)

    const mapItem = useCallback((item: MemberApiItem): MemberRow => ({

        id: String(item.id),

        firstNameAr: item.first_name_ar,

        firstNameEn: item.first_name_en,

        lastNameAr: item.last_name_ar,

        lastNameEn: item.last_name_en,

        email: item.account?.email,

        phone: item.phone,

        nationalId: item.national_id,

        gender: item.gender,

        nationality: item.nationality,

        birthdate: item.birthdate,

        healthStatus: item.health_status,

        isForeign: item.is_foreign ?? false,

        address: item.address,

        memberTypeId: item.member_type_id,

        memberTypeLabel: item.member_type?.name_ar || item.member_type?.name_en || `#${item.member_type_id}`,

        memberTypeCode: item.member_type?.code ?? "",

        isTeamPlayer: isTeamPlayerType(item.member_type),

        pointsBalance: item.points_balance ?? 0,

        status: item.status,

        createdAt: item.created_at,

        sports: (item.sports ?? []).map(s => ({ // ← ADDED SPORTS MAPPING

            id: s.id,

            name: s.name_ar || s.name_en || `Sport #${s.id}`,

            level: s.pivot?.level,

            position: s.pivot?.position,

            joinDate: s.pivot?.join_date,

        })),

    }), []);



    // ← ADDED: Map team member API item → row

    const mapTeamMemberItem = useCallback((item: TeamMemberApiItem): MemberRow => ({

        id: String(item.id),

        firstNameAr: item.firstNameAr || item.first_name_ar || '',

        firstNameEn: item.firstNameEn || item.first_name_en || '',

        lastNameAr: item.lastNameAr || item.last_name_ar || '',

        lastNameEn: item.lastNameEn || item.last_name_en || '',

        email: undefined,

        phone: item.phone,

        nationalId: item.national_id || '',

        gender: item.gender,

        nationality: item.nationality,

        birthdate: item.birthdate,

        healthStatus: undefined,

        isForeign: false,

        address: item.address,

        memberTypeId: 0,

        memberTypeLabel: "لاعب فريق",

        memberTypeCode: "TEAM_MEMBER",

        isTeamPlayer: true,

        pointsBalance: 0,

        status: item.status,

        createdAt: item.created_at,

        sports: (item.teams ?? []).map((t, idx) => ({

            id: idx,

            name: t.name || `Sport #${idx + 1}`,

            level: undefined,

            position: undefined,

            joinDate: t.startDate,

        })),

    }), []);



    // Fetch all members

    const fetchAll = useCallback(async () => {

        setFetching(true);

        try {

            // Fetch regular members - paginate through all pages

            type MembersRes = { success: boolean; data: MemberApiItem[]; pagination?: { pages: number; total: number } };

            const first = await api.get<MembersRes>("/members", { params: { page: 1, limit: 1 } });

            const totalPages = first.data?.pagination?.pages ?? 1;



            let memberRows: MemberRow[] = [];

            if (totalPages > 0) {

                // Fetch all pages (use a reasonable per-page limit like 100)

                const pageLimit = 100;

                const totalMembers = first.data?.pagination?.total ?? 0;

                const pagesToFetch = Math.ceil(totalMembers / pageLimit);



                console.log(`Fetching members: ${totalMembers} total, ${pagesToFetch} pages at ${pageLimit} per page`);



                for (let page = 1; page <= pagesToFetch; page++) {

                    const res = await api.get<MembersRes>("/members", { params: { page, limit: pageLimit } });

                    if (res.data?.data) {

                        memberRows = memberRows.concat((res.data.data).map(mapItem));

                        console.log(`Fetched page ${page}/${pagesToFetch}, total so far: ${memberRows.length}`);

                    }

                }

            }



            // Fetch team members - Try primary endpoint first, then fallback

            type TeamMembersRes = { success: boolean; data: TeamMemberApiItem[] };

            let teamMemberRows: MemberRow[] = [];

            let teamFetchSuccess = false;



            try {

                console.log('Fetching team members from /team-members...');

                const teamRes = await api.get<TeamMembersRes>("/team-members");

                console.log('Team members API response:', teamRes.data);

                console.log('Team members raw data (first item):', teamRes.data?.data?.[0]);

                if (teamRes.data?.success && teamRes.data?.data) {

                    const teamData = teamRes.data.data;

                    console.log('Team members data received:', teamData.length, 'records');

                    console.log('First team member raw:', JSON.stringify(teamData[0], null, 2));

                    teamMemberRows = teamData.map(mapTeamMemberItem);

                    console.log('Mapped team members rows:', teamMemberRows.length);

                    console.log('First mapped row:', JSON.stringify(teamMemberRows[0], null, 2));

                    teamFetchSuccess = true;

                } else if (teamRes.data) {

                    console.warn('Team members response not successful:', teamRes.data);

                }

            } catch (err: unknown) {

                const errorMsg = err instanceof Error ? err.message : String(err);

                console.error('Primary team members endpoint failed:', errorMsg);



                // Fallback: Try alternative endpoint

                try {

                    console.log('Trying fallback endpoint /register/team-member/review-all...');

                    type ReviewRes = {
                        success: boolean; count?: number; data?: Array<{

                            member_id?: number;

                            id?: number;

                            firstNameEn?: string;

                            lastNameEn?: string;

                            firstNameAr?: string;

                            lastNameAr?: string;

                            first_name_en?: string;

                            last_name_en?: string;

                            first_name_ar?: string;

                            last_name_ar?: string;

                            national_id?: string;

                            phone?: string;

                            status?: string;

                        }>
                    };



                    const fallbackRes = await api.get<ReviewRes>("/register/team-member/review-all");

                    console.log('Fallback endpoint response:', fallbackRes.data);



                    if (fallbackRes.data?.success && fallbackRes.data?.data) {

                        const reviewData = fallbackRes.data.data;

                        console.log('Review data received:', reviewData.length, 'records');



                        // Map review data to TeamMemberApiItem format

                        teamMemberRows = reviewData.map(item => mapTeamMemberItem({

                            id: (item.member_id || item.id || 0) as number,

                            firstNameEn: item.firstNameEn || item.first_name_en || '',

                            lastNameEn: item.lastNameEn || item.last_name_en || '',

                            firstNameAr: item.firstNameAr || item.first_name_ar || '',

                            lastNameAr: item.lastNameAr || item.last_name_ar || '',

                            name_en: `${item.firstNameEn || item.first_name_en || ''} ${item.lastNameEn || item.last_name_en || ''}`.trim(),

                            name_ar: `${item.firstNameAr || item.first_name_ar || ''} ${item.lastNameAr || item.last_name_ar || ''}`.trim(),

                            national_id: item.national_id || '',

                            phone: item.phone,

                            status: item.status || 'pending',

                            teams: []

                        } as TeamMemberApiItem));

                        teamFetchSuccess = true;

                        console.log('Fallback successful. Mapped:', teamMemberRows.length, 'records');

                    }

                } catch (fallbackErr: unknown) {

                    const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);

                    console.error('Fallback endpoint also failed:', fallbackMsg);

                    console.error('Full error:', fallbackErr);

                }

            }



            if (!teamFetchSuccess) {

                console.warn('Could not fetch team members from any endpoint');

            }



            // Combine both (members + team members)

            // Since they're from separate tables, there are no ID conflicts

            const combined = [...memberRows, ...teamMemberRows];



            console.log('Final count - Members:', memberRows.length, 'Team Members:', teamMemberRows.length, 'Combined:', combined.length);

            console.log('Team member IDs available:', teamMemberRows.map(r => `${r.id}(${r.firstNameAr})`).join(', '));

            console.log('Full team member rows (first 3):', teamMemberRows.slice(0, 3).map(r => ({

                id: r.id,

                idType: typeof r.id,

                firstNameAr: r.firstNameAr,

                memberTypeCode: r.memberTypeCode

            })));

            setAllRows(combined);

            setLastFetched(new Date());

        } catch (err) {

            const errorMsg = err instanceof Error ? err.message : 'Unknown error';

            toast({ title: "تعذر تحميل الأعضاء", description: errorMsg, variant: "destructive" });

        } finally {

            setFetching(false);

        }

    }, [mapItem, mapTeamMemberItem, toast]);



    useEffect(() => { void fetchAll(); }, [fetchAll]);



    // Player types filter

    const playerTypes = useMemo(() => {

        const seen = new Map<number, string>();

        allRows.filter((r) => r.isTeamPlayer).forEach((r) => {

            if (!seen.has(r.memberTypeId)) seen.set(r.memberTypeId, r.memberTypeLabel);

        });

        return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));

    }, [allRows]);



    const [filterPlayerType, setFilterPlayerType] = useState<string>("all");



    // Process rows

    const processedRows = useMemo(() => {

        let result = [...allRows];



        if (tab === "members") result = result.filter((r) => !r.isTeamPlayer);

        if (tab === "players") result = result.filter((r) => r.isTeamPlayer);



        if (tab === "players" && filterPlayerType !== "all") {

            result = result.filter((r) => r.memberTypeId === Number(filterPlayerType));

        }



        if (filterStatuses.length > 0) {

            result = result.filter((r) => filterStatuses.includes(r.status));

        }



        if (search.trim()) {

            const q = search.toLowerCase();

            result = result.filter((r) =>

                [

                    `${r.firstNameAr} ${r.lastNameAr}`,

                    `${r.firstNameEn} ${r.lastNameEn}`,

                    r.nationalId,

                    r.email ?? "",

                    r.phone ?? "",

                ].some((v) => v.toLowerCase().includes(q))

            );

        }



        result.sort((a, b) => {

            let cmp = 0;

            if (sortField === "name") cmp = `${a.firstNameAr}${a.lastNameAr}`.localeCompare(`${b.firstNameAr}${b.lastNameAr}`);

            if (sortField === "memberType") cmp = a.memberTypeLabel.localeCompare(b.memberTypeLabel);

            if (sortField === "status") cmp = a.status.localeCompare(b.status);

            if (sortField === "points") cmp = a.pointsBalance - b.pointsBalance;

            if (sortField === "createdAt") cmp = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");

            return sortDir === "asc" ? cmp : -cmp;

        });



        return result;

    }, [allRows, tab, filterStatuses, filterPlayerType, search, sortField, sortDir]);



    const totalFiltered = processedRows.length;

    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

    const pageRows = processedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);



    useEffect(() => { setPage(1); }, [search, tab, filterStatuses, filterPlayerType, sortField, sortDir]);



    const statusCounts = useMemo(() => {

        const base = tab === "members" ? allRows.filter((r) => !r.isTeamPlayer)

            : tab === "players" ? allRows.filter((r) => r.isTeamPlayer)

                : allRows;

        const counts: Record<string, number> = {};

        base.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

        return counts;

    }, [allRows, tab]);



    // Open detail — fetches member details AND sports in parallel

    const openDetail = useCallback(async (row: MemberRow) => {

        setSelectedRow(row);

        setSelectedDetail(null);

        setMemberSports([]);

        setDetailLoading(true);

        try {

            // Check if it's a team player or regular member

            if (row.isTeamPlayer && row.memberTypeCode === "TEAM_MEMBER") {

                // Fetch team member details from /team-members/:member_id

                console.log('Fetching team member details for ID:', row.id);

                console.log('Team member row data:', { id: row.id, firstNameAr: row.firstNameAr, firstNameEn: row.firstNameEn });

                type TeamMemberDetailsRes = { success: boolean; data: TeamMemberApiItem };

                try {

                    const teamRes = await api.get<TeamMemberDetailsRes>(`/team-members/${row.id}`);

                    console.log('Team member details response:', teamRes.data);

                    if (teamRes.data?.success) {

                        const teamData = teamRes.data.data;

                        console.log('Team member data loaded:', teamData);

                        console.log('Sports from API:', teamData.sports || teamData.teams);

                        setSelectedRow(mapTeamMemberItem(teamData));

                        // ── Set selectedDetail so the Photos tab can display images ──
                        // Cast the team-member payload to MemberApiItem so the shared
                        // DetailPanel can read photo / national_id_front / national_id_back
                        // / medical_report fields when the backend starts returning them.
                        const teamAsDetail = {
                            id: teamData.id,
                            first_name_en: teamData.first_name_en ?? teamData.firstNameEn ?? '',
                            first_name_ar: teamData.first_name_ar ?? teamData.firstNameAr ?? '',
                            last_name_en: teamData.last_name_en ?? teamData.lastNameEn ?? '',
                            last_name_ar: teamData.last_name_ar ?? teamData.lastNameAr ?? '',
                            gender: teamData.gender,
                            phone: teamData.phone,
                            nationality: teamData.nationality,
                            birthdate: teamData.birthdate,
                            national_id: teamData.national_id ?? '',
                            address: teamData.address,
                            status: teamData.status,
                            created_at: teamData.created_at,
                            updated_at: teamData.updated_at,
                            member_type_id: 0,
                            // Photo / document fields — populated when the API returns them
                            photo: (teamData as Record<string, unknown>).photo as string | undefined,
                            national_id_front: (teamData as Record<string, unknown>).national_id_front as string | undefined,
                            national_id_back: (teamData as Record<string, unknown>).national_id_back as string | undefined,
                            medical_report: (teamData as Record<string, unknown>).medical_report as string | undefined,
                        } as MemberApiItem;

                        setSelectedDetail(teamAsDetail);

                        // Map sports to display format for consistency

                        const sportsArray = (teamData.sports || teamData.teams || []) as Array<{

                            id?: number;

                            name?: string;

                            status?: string;

                            startDate?: string;

                        }>;

                        const sportsToDisplay = sportsArray.map((s, idx) => ({

                            id: s?.id || idx,

                            team_name: s?.name || '',

                            status: s?.status ?? 'active'

                        }));

                        console.log('Sports mapped for display:', sportsToDisplay);

                        setMemberSports(sportsToDisplay);

                    } else {

                        console.warn('Team member response not successful:', teamRes.data);

                        toast({

                            title: "خطأ في تحميل البيانات",

                            description: `فشل تحميل بيانات لاعب الفريق (ID: ${row.id})`,

                            variant: "destructive"

                        });

                    }

                } catch (detailErr: unknown) {

                    const detailMsg = detailErr instanceof Error ? detailErr.message : String(detailErr);

                    console.error('Team member detail fetch error:', detailMsg);

                    toast({

                        title: "تعذر تحميل التفاصيل",

                        description: `${detailMsg} (ID: ${row.id})`,

                        variant: "destructive"

                    });

                }

            } else {

                // Fetch regular member details

                console.log('Fetching regular member details for ID:', row.id);

                const memberRes = await api.get<{ success: boolean; data: MemberApiItem }>(`/members/${row.id}`);

                if (memberRes.data?.success) {

                    const d = memberRes.data.data;

                    setSelectedDetail(d);

                    setAllRows((prev) => prev.map((r) => r.id === row.id ? mapItem(d) : r));

                    setSelectedRow(mapItem(d));

                }



                // Regular members don't have sports from the team_members table

                // So we just clear the sports array

                setMemberSports([]);

            }

        } catch (err: unknown) {

            const errorMsg = err instanceof Error ? err.message : String(err);

            console.error('Error loading details:', errorMsg);

            toast({ title: "تعذر تحميل التفاصيل", description: errorMsg, variant: "destructive" });

        } finally {

            setDetailLoading(false);

        }

    }, [mapItem, mapTeamMemberItem, toast]);



    // Edit handlers

    const openEdit = (row?: MemberRow) => {

        const target = row || selectedRow;

        if (!target) return;

        const d = selectedRow?.id === target.id ? selectedDetail : null;

        setEditFirstNameAr(d?.first_name_ar ?? target.firstNameAr);

        setEditFirstNameEn(d?.first_name_en ?? target.firstNameEn);

        setEditLastNameAr(d?.last_name_ar ?? target.lastNameAr);

        setEditLastNameEn(d?.last_name_en ?? target.lastNameEn);

        setEditGender(d?.gender ?? target.gender ?? "");

        setEditPhone(d?.phone ?? target.phone ?? "");

        setEditBirthdate(d?.birthdate ? String(d.birthdate).slice(0, 10) : target.birthdate ? String(target.birthdate).slice(0, 10) : "");

        setEditNationality(d?.nationality ?? target.nationality ?? "");

        setEditAddress(d?.address ?? target.address ?? "");

        setEditHealth(d?.health_status ?? target.healthStatus ?? "");

        setEditTab('info');

        setEditOpen(true);

        if (row) setSelectedRow(row);

    };



    // Convert File → base64 and upload to /members/:id/documents
    const uploadDocIfChanged = async (file: File | null, docType: string, memberId: string) => {
        if (!file) return;
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        await api.post(`/members/${memberId}/documents`, {
            document_type: docType,
            document_data: base64,
        });
    };

    const handleSaveEdit = async () => {

        if (!selectedRow) return;

        setEditSaving(true);

        try {

            // Use correct endpoint based on whether it's a team player or regular member

            const endpoint = selectedRow.isTeamPlayer && selectedRow.memberTypeCode === "TEAM_MEMBER"

                ? `/team-members/${selectedRow.id}`

                : `/members/${selectedRow.id}`;



            await api.put(endpoint, {
                first_name_ar: editFirstNameAr.trim() || undefined,
                first_name_en: editFirstNameEn.trim() || undefined,
                last_name_ar: editLastNameAr.trim() || undefined,
                last_name_en: editLastNameEn.trim() || undefined,
                gender: editGender.trim() || undefined,
                phone: editPhone.trim() || undefined,
                birthdate: editBirthdate.trim() || undefined,
                nationality: editNationality.trim() || undefined,
                address: editAddress.trim() || undefined,
                health_status: editHealth.trim() || undefined,
            });

            // Upload changed photos in parallel
            await Promise.allSettled([
                uploadDocIfChanged(photoFile, 'photo', selectedRow.id),
                uploadDocIfChanged(idFrontFile, 'national_id_front', selectedRow.id),
                uploadDocIfChanged(idBackFile, 'national_id_back', selectedRow.id),
                uploadDocIfChanged(medicalFile, 'medical_report', selectedRow.id),
            ]);
            // Reset file pickers
            setPhotoFile(null); setIdFrontFile(null); setIdBackFile(null); setMedicalFile(null);

            toast({ title: "تم التحديث بنجاح" });

            setEditOpen(false);



            // Update the selected row with new values

            const updatedRow = {

                ...selectedRow,

                firstNameAr: editFirstNameAr || selectedRow.firstNameAr,

                firstNameEn: editFirstNameEn || selectedRow.firstNameEn,

                lastNameAr: editLastNameAr || selectedRow.lastNameAr,

                lastNameEn: editLastNameEn || selectedRow.lastNameEn,

                gender: editGender || selectedRow.gender,

                phone: editPhone || selectedRow.phone,

                nationality: editNationality || selectedRow.nationality,

                address: editAddress || selectedRow.address,

                healthStatus: editHealth || selectedRow.healthStatus,

            };



            setSelectedRow(updatedRow);

            setAllRows((prev) => prev.map((r) => r.id === selectedRow.id ? updatedRow : r));

            void openDetail(updatedRow);

        } catch (err) {

            toast({ title: "فشل التحديث", description: err instanceof Error ? err.message : "", variant: "destructive" });

        } finally {

            setEditSaving(false);

        }

    };



    // Status handlers

    const openStatus = (row?: MemberRow) => {

        const target = row || selectedRow;

        if (!target) return;

        setNewStatus(target.status);

        setStatusReason("");

        setStatusOpen(true);

        if (row) setSelectedRow(row);

    };



    const handleChangeStatus = async () => {

        if (!selectedRow || !newStatus) return;

        setStatusSaving(true);

        try {

            await api.patch(`/members/${selectedRow.id}/status`, {

                status: newStatus,

                reason: statusReason.trim() || undefined,

            });

            toast({ title: "تم تغيير الحالة" });

            setStatusOpen(false);

            setAllRows((prev) => prev.map((r) => r.id === selectedRow.id ? { ...r, status: newStatus } : r));

            setSelectedRow((prev) => prev ? { ...prev, status: newStatus } : prev);

        } catch (err) {

            toast({ title: "فشل تغيير الحالة", description: err instanceof Error ? err.message : "", variant: "destructive" });

        } finally {

            setStatusSaving(false);

        }

    };



    // Delete handlers

    const openDelete = (row?: MemberRow) => {

        if (row) setSelectedRow(row);

        setDeleteOpen(true);

    };



    const handleDelete = async () => {

        if (!selectedRow) return;

        setDeleteSaving(true);

        try {

            await api.patch(`/members/${selectedRow.id}/status`, { status: "cancelled", reason: "حُذف بواسطة الإدارة" });

            toast({ title: "تم حذف العضو" });

            setDeleteOpen(false);

            setAllRows((prev) => prev.filter((r) => r.id !== selectedRow.id));

            setSelectedRow(null);

        } catch (err) {

            toast({ title: "فشل الحذف", description: err instanceof Error ? err.message : "", variant: "destructive" });

        } finally {

            setDeleteSaving(false);

        }

    };



    const handleSort = (field: SortField) => {

        if (field === sortField) setSortDir((d) => d === "asc" ? "desc" : "asc");

        else { setSortField(field); setSortDir("asc"); }

    };



    const Th = ({ field, children, center, className = "" }: { field?: SortField; children: React.ReactNode; center?: boolean; className?: string }) => (

        <th

            onClick={() => field && handleSort(field)}

            className={`px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap select-none align-middle

        ${field ? "cursor-pointer hover:text-foreground" : ""}

        ${center ? "text-center" : "text-right"} ${className}`}

        >

            <span className={`inline-flex items-center gap-1 ${center ? "justify-center" : ""}`}>

                {children}

                {field && <SortIcon field={field} active={sortField} dir={sortDir} />}

            </span>

        </th>

    );



    const TAB_CONFIG: { key: TabKey; label: string; icon: typeof Users; count: number }[] = [

        { key: "all", label: "الجميع", icon: Users, count: allRows.length },

        { key: "members", label: "الأعضاء", icon: UserCheck, count: allRows.filter((r) => !r.isTeamPlayer).length },

        { key: "players", label: "اللاعبون", icon: Trophy, count: allRows.filter((r) => r.isTeamPlayer).length },

    ];



    return (

        <TooltipProvider>

            <div className="h-full min-h-0 flex flex-col overflow-hidden" dir="rtl">



                {/* Header */}

                <div className="px-5 py-3 border-b border-border bg-background shrink-0">

                    <div className="flex items-center justify-between">

                        <div>

                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">

                                <Users className="w-5 h-5 text-primary" />

                                إدارة الأعضاء

                            </h1>

                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <p className="text-xs text-muted-foreground">

                                    إجمالي المحملين: <strong>{allRows.length}</strong>

                                    {lastFetched && (

                                        <span className="mr-2 text-[10px] opacity-60">

                                            آخر تحديث: {lastFetched.toLocaleTimeString("ar-EG")}

                                        </span>

                                    )}

                                </p>
                                {(() => {
                                    const alertCount = allRows.filter(r => {
                                        const p = PAYMENTS_MAP.get(`${r.isTeamPlayer ? "team_member" : "member"}-${Number(r.id)}`);
                                        return p ? computePaymentStatus(p.nextRenewalDate) !== "active" : false;
                                    }).length;
                                    return alertCount > 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-0.5 text-xs font-bold">
                                            🔔 {alertCount} تنبيه دفع
                                        </span>
                                    ) : null;
                                })()}
                            </div>

                        </div>



                        <button

                            onClick={() => void fetchAll()}

                            disabled={fetching}

                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-xs sm:text-sm text-muted-foreground disabled:opacity-40"

                        >

                            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${fetching ? "animate-spin" : ""}`} />

                            {fetching ? "جارٍ التحميل..." : "تحديث"}

                        </button>

                    </div>



                    {/* Tabs */}

                    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-2 scrollbar-none">

                        {TAB_CONFIG.map(({ key, label, icon: Icon, count }) => (

                            <button

                                key={key}

                                onClick={() => setTab(key)}

                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${tab === key

                                    ? "bg-primary text-primary-foreground shadow-sm"

                                    : "text-muted-foreground hover:bg-muted"

                                    }`}

                            >

                                <Icon className="w-3.5 h-3.5" />

                                {label}

                                <span className={`text-[10px] rounded-full px-1.5 py-0 font-bold ${tab === key ? "bg-white/20" : "bg-muted text-muted-foreground"

                                    }`}>

                                    {count}

                                </span>

                            </button>

                        ))}



                        {tab === "players" && playerTypes.length > 1 && (

                            <div className="mr-auto flex items-center gap-2">

                                <Trophy className="w-3 h-3 text-muted-foreground" />

                                <Select value={filterPlayerType} onValueChange={setFilterPlayerType}>

                                    <SelectTrigger className="h-7 w-36 text-xs">

                                        <SelectValue placeholder="كل الأنواع" />

                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="all">كل أنواع اللاعبين</SelectItem>

                                        {playerTypes.map(({ id, label }) => (

                                            <SelectItem key={id} value={String(id)}>{label}</SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>

                        )}

                    </div>

                </div>



                {/* Main area */}

                <div className="flex flex-1 min-h-0 overflow-hidden">



                    {/* Table panel */}

                    <div className="flex flex-col w-full min-h-0 overflow-hidden">



                        {/* Toolbar */}

                        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/20 shrink-0 flex-wrap">

                            <div className="relative flex-1 min-w-[160px] max-w-[280px]">

                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />

                                <Input

                                    value={search}

                                    onChange={(e) => setSearch(e.target.value)}

                                    placeholder="بحث في الأعضاء..."

                                    className="pr-9 h-8 text-xs"

                                />

                            </div>



                            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>

                                <PopoverTrigger asChild>

                                    <button className={`flex items-center gap-1.5 h-9 px-3.5 rounded-md border text-xs sm:text-sm transition-colors

                                        ${filterStatuses.length > 0

                                            ? "border-primary bg-primary/5 text-primary"

                                            : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>

                                        <Filter className="w-3.5 h-3.5" />

                                        الحالة

                                        {filterStatuses.length > 0 && (

                                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">

                                                {filterStatuses.length}

                                            </span>

                                        )}

                                    </button>

                                </PopoverTrigger>

                                <PopoverContent align="end" className="w-52 p-0" dir="rtl">

                                    <div className="py-1">

                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {

                                            const checked = filterStatuses.includes(key);

                                            return (

                                                <label

                                                    key={key}

                                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors"

                                                >

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

                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>

                                                        <cfg.icon className="w-3 h-3" />

                                                        {cfg.label}

                                                    </span>

                                                    <span className="mr-auto text-[10px] text-muted-foreground">

                                                        {statusCounts[key] ?? 0}

                                                    </span>

                                                </label>

                                            );

                                        })}

                                    </div>

                                    <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border">

                                        <button

                                            onClick={() => {

                                                setFilterStatuses([]);

                                                setStatusPopoverOpen(false);

                                            }}

                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"

                                        >

                                            مسح

                                        </button>

                                    </div>

                                </PopoverContent>

                            </Popover>



                            <span className="text-xs text-muted-foreground mr-auto">

                                {totalFiltered} نتيجة

                            </span>

                        </div>



                        {/* Table */}

                        <div className="flex-1 min-h-0 overflow-auto" dir="ltr">

                            <table className="w-full min-w-[760px] text-sm" dir="rtl">

                                <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">

                                    <tr>

                                        <Th field="name" className="w-[200px]">العضو</Th>

                                        <Th field="memberType">النوع</Th>

                                        <Th>الهاتف</Th>

                                        <Th field="points" center>النقاط</Th>

                                        <Th field="status" center>الحالة</Th>

                                        <Th field="createdAt" center>التسجيل</Th>

                                        <Th center className="w-[100px]">الإجراءات</Th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-border">

                                    {fetching && allRows.length === 0 ? (

                                        Array.from({ length: 8 }).map((_, i) => (

                                            <tr key={i} className="animate-pulse">

                                                <td className="px-4 py-3">

                                                    <div className="flex items-center gap-2.5">

                                                        <div className="w-7 h-7 rounded-full bg-muted shrink-0" />

                                                        <div className="space-y-1">

                                                            <div className="h-2.5 w-20 bg-muted rounded" />

                                                            <div className="h-2 w-14 bg-muted rounded" />

                                                        </div>

                                                    </div>

                                                </td>

                                                {[1, 2, 3, 4, 5, 6].map(j => <td key={j} className="px-4 py-3"><div className="h-2.5 w-12 bg-muted rounded mx-auto" /></td>)}

                                            </tr>

                                        ))

                                    ) : pageRows.length === 0 ? (

                                        <tr>

                                            <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">

                                                {search ? `لا توجد نتائج مطابقة لـ "${search}"` : "لا يوجد أعضاء في هذه الفئة"}

                                            </td>

                                        </tr>

                                    ) : pageRows.map((row) => {

                                        const nameAr = `${row.firstNameAr} ${row.lastNameAr}`.trim();

                                        const nameEn = `${row.firstNameEn} ${row.lastNameEn}`.trim();

                                        return (

                                            <tr

                                                key={row.id}

                                                className="transition-colors hover:bg-muted/40 group"

                                            >

                                                <td className="px-4 py-3 align-middle">

                                                    <div className="flex items-center gap-2.5">

                                                        <div

                                                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"

                                                            style={{ background: getColor(row.id) }}

                                                        >

                                                            {getInitials(nameAr, nameEn)}

                                                        </div>

                                                        <div className="min-w-0">

                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <p className="font-semibold leading-tight truncate max-w-[160px] text-xs">{nameAr || "-"}</p>
                                                                <PaymentBadge
                                                                    memberId={Number(row.id)}
                                                                    memberType={row.isTeamPlayer ? "team_member" : "member"}
                                                                />
                                                            </div>

                                                            <p className="text-[10px] text-muted-foreground truncate max-w-[160px]" dir="ltr">{nameEn}</p>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap align-middle">

                                                    <div className="flex items-center gap-1">

                                                        {row.isTeamPlayer && <Trophy className="w-3 h-3 text-amber-500 shrink-0" />}

                                                        <span className="truncate max-w-[100px]">{row.memberTypeLabel}</span>

                                                    </div>

                                                </td>

                                                <td className="px-4 py-3 text-xs tabular-nums text-right align-middle">

                                                    <span dir="ltr" className="text-muted-foreground">{row.phone || "—"}</span>

                                                </td>

                                                <td className="px-4 py-3 text-center align-middle">

                                                    <span className={`font-semibold tabular-nums text-xs ${row.pointsBalance > 0 ? "text-amber-600" : "text-muted-foreground"}`}>

                                                        {row.pointsBalance.toLocaleString()}

                                                    </span>

                                                </td>

                                                <td className="px-4 py-3 text-center align-middle">

                                                    <StatusBadge status={row.status} compact />

                                                </td>

                                                <td className="px-4 py-3 text-center text-[10px] text-muted-foreground whitespace-nowrap align-middle">

                                                    {fmtDateShort(row.createdAt)}

                                                </td>

                                                <td className="px-4 py-3 text-center align-middle">

                                                    <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">

                                                        <Tooltip>

                                                            <TooltipTrigger asChild>

                                                                <Button

                                                                    variant="ghost"

                                                                    size="icon"

                                                                    className="h-8 w-8 sm:h-9 sm:w-9"

                                                                    onClick={() => void openDetail(row)}

                                                                >

                                                                    <Eye className="w-4 h-4 text-blue-600" />

                                                                </Button>

                                                            </TooltipTrigger>

                                                            <TooltipContent side="top" className="text-xs">عرض التفاصيل</TooltipContent>

                                                        </Tooltip>



                                                        <RoleGuard privilege="UPDATE_MEMBER">
                                                        <Tooltip>

                                                            <TooltipTrigger asChild>

                                                                <Button

                                                                    variant="ghost"

                                                                    size="icon"

                                                                    className="h-8 w-8 sm:h-9 sm:w-9"

                                                                    onClick={() => openEdit(row)}

                                                                >

                                                                    <Pencil className="w-4 h-4 text-emerald-600" />

                                                                </Button>

                                                            </TooltipTrigger>

                                                            <TooltipContent side="top" className="text-xs">تعديل</TooltipContent>

                                                        </Tooltip>
                                                        </RoleGuard>



                                                        <DropdownMenu>

                                                            <DropdownMenuTrigger asChild>

                                                                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">

                                                                    <MoreHorizontal className="w-4 h-4" />

                                                                </Button>

                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end" className="text-xs">

                                                                <RoleGuard privilege="MANAGE_MEMBER_BLOCK">
                                                                <DropdownMenuItem onClick={() => openStatus(row)} className="gap-2">

                                                                    <Shield className="w-3.5 h-3.5" />

                                                                    تغيير الحالة

                                                                </DropdownMenuItem>
                                                                </RoleGuard>

                                                                <RoleGuard privilege="DELETE_MEMBER">
                                                                <DropdownMenuItem onClick={() => openDelete(row)} className="gap-2 text-red-600 focus:text-red-600">

                                                                    <Trash2 className="w-3.5 h-3.5" />

                                                                    حذف العضو

                                                                </DropdownMenuItem>
                                                                </RoleGuard>

                                                            </DropdownMenuContent>

                                                        </DropdownMenu>

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>



                        {/* Pagination */}

                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 shrink-0 text-xs">

                            <span className="text-muted-foreground text-[11px]">
                                عرض {totalFiltered === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalFiltered)} من {totalFiltered} · صفحة {page} من {totalPages}
                            </span>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-9 sm:h-10 px-3 sm:px-4 gap-1.5 text-xs sm:text-sm"
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    السابق
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="h-9 sm:h-10 px-3 sm:px-4 gap-1.5 text-xs sm:text-sm"
                                >
                                    التالي
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </div>

                        </div>

                    </div>

                </div>



                {/* Detail Modal */}

                <Dialog open={!!selectedRow && !editOpen && !statusOpen && !deleteOpen} onOpenChange={(o) => !o && setSelectedRow(null)}>

                    <DialogContent className="max-w-3xl w-full p-0 overflow-hidden" style={{ maxHeight: '88vh' }} dir="rtl">

                        <DialogHeader className="sr-only">

                            <DialogTitle>تفاصيل {selectedRow?.isTeamPlayer ? 'لاعب الفريق' : 'العضو'}</DialogTitle>

                            <DialogDescription>عرض ملف المعلومات الكامل للعضو أو لاعب الفريق</DialogDescription>

                        </DialogHeader>

                        {selectedRow && (

                            <DetailPanel

                                row={selectedRow}

                                details={selectedDetail}

                                loading={detailLoading}

                                sports={memberSports}

                                onClose={() => setSelectedRow(null)}

                                onEdit={() => openEdit()}

                                onChangeStatus={() => openStatus()}

                                onDelete={() => openDelete()}

                            />

                        )}

                    </DialogContent>

                </Dialog>



                {/* Edit Dialog */}

                <Dialog open={editOpen} onOpenChange={(o) => !o && setEditOpen(false)}>

                    <DialogContent className="max-w-xl" dir="rtl">

                        <DialogHeader>
                            <DialogTitle>تعديل بيانات العضو</DialogTitle>
                            <DialogDescription>تعديل المعلومات الشخصية والتواصل</DialogDescription>
                        </DialogHeader>

                        {/* ── Tab bar ── */}
                        <div className="flex gap-0 border-b border-border -mx-1 overflow-x-auto scrollbar-none">
                            {([
                                { key: 'info', label: '👤 البيانات الشخصية' },
                                { key: 'docs', label: '🖼️ الصور والمستندات' },
                            ] as const).map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setEditTab(tab.key)}
                                    className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0
                                        ${editTab === tab.key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── TAB 1: Personal Info ── */}
                        {editTab === 'info' && (
                            <div className="grid grid-cols-2 gap-3 py-2">
                                <div>
                                    <Label className="text-xs">الاسم الأول (عربي)</Label>
                                    <Input value={editFirstNameAr} onChange={(e) => setEditFirstNameAr(e.target.value)} className="mt-1 h-8 text-xs" placeholder="محمد" />
                                </div>
                                <div>
                                    <Label className="text-xs">الاسم الأخير (عربي)</Label>
                                    <Input value={editLastNameAr} onChange={(e) => setEditLastNameAr(e.target.value)} className="mt-1 h-8 text-xs" placeholder="أحمد" />
                                </div>
                                <div>
                                    <Label className="text-xs">الاسم الأول (إنجليزي)</Label>
                                    <Input value={editFirstNameEn} onChange={(e) => setEditFirstNameEn(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Mohamed" dir="ltr" />
                                </div>
                                <div>
                                    <Label className="text-xs">الاسم الأخير (إنجليزي)</Label>
                                    <Input value={editLastNameEn} onChange={(e) => setEditLastNameEn(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Ahmed" dir="ltr" />
                                </div>
                                <div>
                                    <Label className="text-xs">الجنس</Label>
                                    <Select value={editGender} onValueChange={setEditGender}>
                                        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="اختر" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">ذكر</SelectItem>
                                            <SelectItem value="female">أنثى</SelectItem>
                                            <SelectItem value="other">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">تاريخ الميلاد</Label>
                                    <Input value={editBirthdate} onChange={(e) => setEditBirthdate(e.target.value)} className="mt-1 h-8 text-xs" type="date" dir="ltr" />
                                </div>
                                <div>
                                    <Label className="text-xs">رقم الهاتف</Label>
                                    <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1 h-8 text-xs" placeholder="+201012345678" dir="ltr" type="tel" />
                                </div>
                                <div>
                                    <Label className="text-xs">الجنسية</Label>
                                    <Input value={editNationality} onChange={(e) => setEditNationality(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Egyptian" dir="ltr" />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">العنوان</Label>
                                    <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1 h-8 text-xs" placeholder="القاهرة، مصر" />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">الحالة الصحية</Label>
                                    <Input value={editHealth} onChange={(e) => setEditHealth(e.target.value)} className="mt-1 h-8 text-xs" placeholder="لا توجد أمراض مزمنة" />
                                </div>
                            </div>
                        )}

                        {/* ── TAB 2: Documents & Photos ── */}
                        {editTab === 'docs' && (
                            <div className="py-2">
                                <div className="grid grid-cols-2 gap-4">
                                    {([
                                        { label: 'الصورة الشخصية', file: photoFile, setter: setPhotoFile, existing: selectedDetail?.photo, span: 'col-span-2', height: 'h-36' },
                                        { label: 'البطاقة القومية (أمام)', file: idFrontFile, setter: setIdFrontFile, existing: selectedDetail?.national_id_front, span: '', height: 'h-24' },
                                        { label: 'البطاقة القومية (خلف)', file: idBackFile, setter: setIdBackFile, existing: selectedDetail?.national_id_back, span: '', height: 'h-24' },
                                        { label: 'التقرير الطبي', file: medicalFile, setter: setMedicalFile, existing: selectedDetail?.medical_report, span: 'col-span-2', height: 'h-28' },
                                    ] as { label: string; file: File | null; setter: (f: File | null) => void; existing?: string; span: string; height: string }[]).map(({ label, file, setter, existing, span, height }) => {
                                        const preview = file ? URL.createObjectURL(file) : getFileUrl(existing);
                                        return (
                                            <label key={label} className={`${span} flex flex-col gap-1.5 cursor-pointer group`}>
                                                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                                                <div className={`relative w-full ${height} rounded-xl border-2 border-dashed 
                                                    ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/10'} 
                                                    overflow-hidden flex items-center justify-center 
                                                    group-hover:border-primary/60 transition-colors`}>
                                                    {preview ? (
                                                        <img src={preview} alt={label} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1.5 text-muted-foreground/50">
                                                            <span className="text-2xl">📎</span>
                                                            <span className="text-[11px]">اضغط لرفع صورة</span>
                                                        </div>
                                                    )}
                                                    {file && (
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.preventDefault(); setter(null); }}
                                                            className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full 
                                                                bg-rose-500 text-white text-[10px] flex items-center 
                                                                justify-center hover:bg-rose-600 shadow"
                                                        >✕</button>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => e.target.files?.[0] && setter(e.target.files[0])}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4 gap-2 border-t border-border pt-4">
                            <Button
                                onClick={() => void handleSaveEdit()}
                                disabled={editSaving}
                                className="flex-1 sm:flex-none h-9 sm:h-10 px-6 text-xs sm:text-sm font-bold"
                            >
                                {editSaving ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin ml-2" />
                                        جارٍ الحفظ...
                                    </>
                                ) : "حفظ التغييرات"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                                disabled={editSaving}
                                className="flex-1 sm:flex-none h-9 sm:h-10 px-6 text-xs sm:text-sm"
                            >
                                إلغاء
                            </Button>
                        </DialogFooter>

                    </DialogContent>

                </Dialog>



                {/* Status Dialog */}

                <Dialog open={statusOpen} onOpenChange={(o) => !o && setStatusOpen(false)}>

                    <DialogContent className="max-w-sm" dir="rtl">

                        <DialogHeader>

                            <DialogTitle className="text-sm">تغيير حالة العضو</DialogTitle>

                            <DialogDescription className="text-xs">

                                الحالة الحالية: <StatusBadge status={selectedRow?.status ?? ""} compact />

                            </DialogDescription>

                        </DialogHeader>

                        <div className="space-y-3 py-2">

                            <div>

                                <Label className="text-xs">الحالة الجديدة</Label>

                                <Select value={newStatus} onValueChange={setNewStatus}>

                                    <SelectTrigger className="mt-1 h-8 text-xs">

                                        <SelectValue placeholder="اختر الحالة" />

                                    </SelectTrigger>

                                    <SelectContent>

                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (

                                            <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>

                            <div>

                                <Label className="text-xs">السبب (اختياري)</Label>

                                <Input value={statusReason} onChange={(e) => setStatusReason(e.target.value)}

                                    placeholder="سبب تغيير الحالة" className="mt-1 h-8 text-xs" />

                            </div>

                        </div>

                        <DialogFooter className="gap-2 pt-2 border-t border-border mt-4">

                            <Button

                                onClick={() => void handleChangeStatus()}

                                disabled={statusSaving || !newStatus || newStatus === selectedRow?.status}

                                className="flex-1 sm:flex-none h-9 px-5 text-xs font-bold"

                            >

                                {statusSaving ? "جارٍ التغيير..." : "تأكيد التغيير"}

                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setStatusOpen(false)}
                                disabled={statusSaving}
                                className="flex-1 sm:flex-none h-9 px-5 text-xs"
                            >
                                إلغاء
                            </Button>

                        </DialogFooter>

                    </DialogContent>

                </Dialog>



                {/* Delete Confirm Dialog */}

                <Dialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>

                    <DialogContent className="max-w-sm" dir="rtl">

                        <DialogHeader>

                            <DialogTitle className="text-destructive flex items-center gap-2 text-sm">

                                <Trash2 className="w-4 h-4" /> حذف العضو

                            </DialogTitle>

                            <DialogDescription className="text-xs">

                                هل أنت متأكد من حذف{" "}

                                <strong>{selectedRow ? `${selectedRow.firstNameAr} ${selectedRow.lastNameAr}` : "هذا العضو"}</strong>؟

                                <br />

                                سيتم تغيير حالته إلى &quot;ملغى&quot; ولن يظهر في القائمة.

                            </DialogDescription>

                        </DialogHeader>

                        <DialogFooter className="gap-2 mt-4 pt-2 border-t border-border">

                            <Button
                                variant="destructive"
                                onClick={() => void handleDelete()}
                                disabled={deleteSaving}
                                className="flex-1 sm:flex-none h-9 px-5 text-xs font-bold"
                            >

                                {deleteSaving ? "جارٍ الحذف..." : "تأكيد الحذف"}

                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                                disabled={deleteSaving}
                                className="flex-1 sm:flex-none h-9 px-5 text-xs"
                            >
                                إلغاء
                            </Button>

                        </DialogFooter>

                    </DialogContent>

                </Dialog>

            </div>

        </TooltipProvider>

    );

}
