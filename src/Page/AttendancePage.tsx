import { useState, useMemo, useEffect, useCallback } from "react";
import { AlertTriangle, ClipboardList, Download, Loader2, Save, X } from "lucide-react";
import type { AttendanceStatus } from "../data/attendanceData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Component/StaffPagesComponents/ui/tabs";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "../Component/StaffPagesComponents/ui/select";
import {
    Table, TableBody, TableHeader,
    TableRow, TableHead, TableCell,
} from "../Component/StaffPagesComponents/ui/table";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "../Component/StaffPagesComponents/ui/dialog";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";

// ─── API shape types ────────────────────────────────────────────────────────
type SportApiItem = { id: number; name_ar: string; name_en: string };
type TeamApiItem = { id: number; name_ar: string; name_en: string };
type MemberApiItem = { id: number; first_name_ar: string; last_name_ar: string; member_code: string };
type AbsenceApiItem = {
    member_id: number; member_name_ar: string; member_code: string;
    sport_id: number; sport_name_ar: string;
    total_absences: number; last_absence_date: string | null;
};

// ─── Local types ────────────────────────────────────────────────────────────
type Member = { id: number; nameAr: string; memberCode: string };

type AbsenceRow = {
    memberId: number;
    memberNameAr: string;
    memberCode: string;
    sportId: number;
    sportNameAr: string;
    totalAbsences: number;
    lastAbsenceDate: string | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const absenceBadgeClass = (n: number) =>
    n === 0
        ? "bg-muted text-muted-foreground border-border"
        : n <= 2
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : n <= 4
                ? "bg-orange-100 text-orange-700 border-orange-200"
                : "bg-rose-100 text-rose-700 border-rose-200";

// ─── AttendanceToggle Component ─────────────────────────────────────────────
const AttendanceToggle = ({
    status,
    onChange,
}: {
    status: AttendanceStatus | null;
    onChange: (s: AttendanceStatus) => void;
}) => (
    <div className="flex rounded-lg overflow-hidden border border-border w-fit">
        <button
            onClick={() => onChange("present")}
            className={`px-5 py-2 text-sm font-bold transition-all min-h-[40px] ${status === "present"
                ? "bg-emerald-500 text-white"
                : "bg-background text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                }`}
        >
            ✓ حاضر
        </button>
        <div className="w-px bg-border" />
        <button
            onClick={() => onChange("absent")}
            className={`px-5 py-2 text-sm font-bold transition-all min-h-[40px] ${status === "absent"
                ? "bg-rose-500 text-white"
                : "bg-background text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                }`}
        >
            ✗ غايب
        </button>
    </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("register");

    // ── Tab 1 state ──────────────────────────────────────────────────────────
    const [sportFilter1, setSportFilter1] = useState("");
    const [sessionFilter, setSessionFilter] = useState("");      // = teamId
    const [localAttendance, setLocalAttendance] =
        useState<Record<number, AttendanceStatus | null>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // ── Tab 2 state ──────────────────────────────────────────────────────────
    const [sportFilter2, setSportFilter2] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [absenceLimitFilter, setAbsenceLimitFilter] = useState("");
    const [playerDetailRow, setPlayerDetailRow] = useState<AbsenceRow | null>(null);

    // ── API state ─────────────────────────────────────────────────────────────
    const [sports, setSports] = useState<{ id: number; nameAr: string }[]>([]);
    const [teams, setTeams] = useState<{ id: number; nameAr: string }[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [absenceRows, setAbsenceRows] = useState<AbsenceRow[]>([]);
    const [absenceLoading, setAbsenceLoading] = useState(false);

    // ─── FIX 1: Load sports from API ─────────────────────────────────────────
    useEffect(() => {
        console.log("[AttendancePage] GET /api/sports");
        api.get<{ data: SportApiItem[] }>("/sports")
            .then(res => {
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                console.log("[AttendancePage] sports loaded:", list.length);
                setSports(list.map(s => ({ id: s.id, nameAr: s.name_ar })));
            })
            .catch(err => console.warn("[AttendancePage] failed to load sports:", err));
    }, []);

    // ─── FIX 2: Load teams when sport changes ────────────────────────────────
    useEffect(() => {
        if (!sportFilter1) { setTeams([]); return; }
        console.log("[AttendancePage] GET /api/teams?sport_id=", sportFilter1);
        setTeamsLoading(true);
        api.get<{ data: TeamApiItem[] }>(`/teams?sport_id=${sportFilter1}`)
            .then(res => {
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                console.log("[AttendancePage] teams loaded:", list.length);
                setTeams(list.map(t => ({ id: t.id, nameAr: t.name_ar })));
            })
            .catch(err => console.warn("[AttendancePage] failed to load teams:", err))
            .finally(() => setTeamsLoading(false));
    }, [sportFilter1]);

    // ─── FIX 3: Load members when team changes ───────────────────────────────
    useEffect(() => {
        if (!sessionFilter) { setMembers([]); setLocalAttendance({}); return; }
        console.log("[AttendancePage] GET /api/teams/", sessionFilter, "/members");
        setMembersLoading(true);
        api.get<{ data: MemberApiItem[] }>(`/teams/${sessionFilter}/members`)
            .then(res => {
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                console.log("[AttendancePage] members loaded:", list.length);
                const mapped: Member[] = list.map(m => ({
                    id: m.id,
                    nameAr: `${m.first_name_ar} ${m.last_name_ar}`.trim(),
                    memberCode: m.member_code,
                }));
                setMembers(mapped);
                // initialise all as null (unmarked)
                const init: Record<number, AttendanceStatus | null> = {};
                mapped.forEach(m => { init[m.id] = null; });
                setLocalAttendance(init);
                setIsDirty(false);
            })
            .catch(err => console.warn("[AttendancePage] failed to load members:", err))
            .finally(() => setMembersLoading(false));
    }, [sessionFilter]);

    // ─── FIX 5: Load absence records (server-side filtered) ──────────────────
    const fetchAbsences = useCallback(() => {
        const params = new URLSearchParams();
        if (sportFilter2 !== "all") params.set("sport_id", sportFilter2);
        if (dateFilter) params.set("date", dateFilter);
        if (absenceLimitFilter) params.set("min_absences", absenceLimitFilter);
        const url = `/attendance/absences?${params.toString()}`;
        console.log("[AttendancePage] GET", url);
        setAbsenceLoading(true);
        api.get<{ data: AbsenceApiItem[] }>(url)
            .then(res => {
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                console.log("[AttendancePage] absences loaded:", list.length);
                setAbsenceRows(list.map(r => ({
                    memberId: r.member_id,
                    memberNameAr: r.member_name_ar,
                    memberCode: r.member_code,
                    sportId: r.sport_id,
                    sportNameAr: r.sport_name_ar,
                    totalAbsences: r.total_absences,
                    lastAbsenceDate: r.last_absence_date,
                })));
            })
            .catch(err => console.warn("[AttendancePage] failed to load absences:", err))
            .finally(() => setAbsenceLoading(false));
    }, [sportFilter2, dateFilter, absenceLimitFilter]);

    useEffect(() => { fetchAbsences(); }, [fetchAbsences]);

    // ─── Tab 1 Derived ───────────────────────────────────────────────────────
    const presentCount = Object.values(localAttendance).filter(v => v === "present").length;
    const absentCount = Object.values(localAttendance).filter(v => v === "absent").length;
    const unmarkedCount = members.length - presentCount - absentCount;
    const attendanceRate = members.length > 0
        ? Math.round((presentCount / members.length) * 100)
        : 0;

    // ─── Tab 2 Derived ───────────────────────────────────────────────────────
    // filtering is server-side, so absenceRows IS filteredAbsenceRows
    const filteredAbsenceRows = absenceRows;

    const topAbsentee = filteredAbsenceRows[0]?.totalAbsences > 0
        ? filteredAbsenceRows[0] : null;

    // ─── FIX 7: Player detail from absenceRows state ─────────────────────────
    const playerDetailSports = useMemo(() => {
        if (!playerDetailRow) return [];
        // deduplicated sports for this member from the absence rows
        const seen = new Map<number, string>();
        absenceRows
            .filter(r => r.memberId === playerDetailRow.memberId)
            .forEach(r => seen.set(r.sportId, r.sportNameAr));
        return [...seen.entries()].map(([id, nameAr]) => ({ id, nameAr }));
    }, [playerDetailRow, absenceRows]);

    // ─── Tab 1 Handlers ──────────────────────────────────────────────────────
    const markAttendance = (memberId: number, status: AttendanceStatus) => {
        setLocalAttendance(prev => ({ ...prev, [memberId]: status }));
        setIsDirty(true);
    };

    const markAll = (status: AttendanceStatus) => {
        const all: Record<number, AttendanceStatus> = {};
        members.forEach(m => { all[m.id] = status; });
        setLocalAttendance(all);
        setIsDirty(true);
    };

    // ─── FIX 4: Real Save ────────────────────────────────────────────────────
    const handleSaveAttendance = async () => {
        setSaveLoading(true);
        const body = {
            team_id: Number(sessionFilter),
            date: new Date().toISOString().split("T")[0],
            records: members.map(m => ({
                member_id: m.id,
                status: localAttendance[m.id] ?? "absent",
            })),
        };
        console.log("[AttendancePage] POST /api/attendance", body);
        try {
            await api.post("/attendance", body);
            const count = Object.values(localAttendance).filter(Boolean).length;
            toast({
                title: "تم حفظ الحضور",
                description: `تم تسجيل حضور ${count} لاعب بنجاح`,
            });
            setIsDirty(false);
        } catch (err) {
            const e = err as { message?: string };
            console.error("[AttendancePage] save attendance failed:", err);
            toast({
                title: "فشل حفظ الحضور",
                description: e?.message ?? "حدث خطأ غير متوقع",
                variant: "destructive",
            });
        } finally {
            setSaveLoading(false);
        }
    };

    // ─── Tab 2 Handlers ──────────────────────────────────────────────────────
    // ─── FIX 6: Real Warning API ─────────────────────────────────────────────
    const handleSendWarning = async (row: AbsenceRow) => {
        console.log("[AttendancePage] POST /api/notifications/warning member_id:", row.memberId);
        try {
            await api.post("/notifications/warning", { member_id: row.memberId });
            toast({
                title: "تم إرسال الإنذار",
                description: `تم إرسال إنذار إلى ${row.memberNameAr}`,
            });
        } catch (err) {
            console.error("[AttendancePage] send warning failed:", err);
            toast({ title: "فشل الإرسال", variant: "destructive" });
        }
    };

    const handleExportPDF = () => {
        const tableRows = filteredAbsenceRows.map((row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${row.memberNameAr} (${row.memberCode})</td>
        <td>${row.sportNameAr}</td>
        <td>${row.totalAbsences}</td>
        <td>${row.lastAbsenceDate
                ? new Date(row.lastAbsenceDate).toLocaleDateString("ar-EG")
                : "—"}</td>
      </tr>
    `).join("");

        const html = `<html dir="rtl"><head><meta charset="UTF-8"/>
      <title>سجل الغيابات</title>
      <style>
        body{font-family:Arial,sans-serif;direction:rtl;padding:24px}
        h2{margin-bottom:4px}p{color:#666;font-size:13px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse}
        th{background:#f1f5f9;padding:10px 12px;text-align:right;
           font-size:12px;color:#475569;border:1px solid #e2e8f0}
        td{padding:10px 12px;border:1px solid #e2e8f0;font-size:13px}
        tr:nth-child(even){background:#f8fafc}
      </style></head>
      <body>
        <h2>سجل الغيابات — نادي حلوان</h2>
        <p>تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}</p>
        <table>
          <thead><tr>
            <th>#</th><th>اللاعب</th><th>الرياضة</th>
            <th>إجمالي الغياب</th><th>آخر غياب</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body></html>`;

        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col overflow-hidden" dir="rtl">

            {/* ── Page Header with segmented-control tabs ── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
                <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-5 h-5 text-primary shrink-0" />
                    <h1 className="text-xl font-bold">إدارة الحضور والانصراف</h1>
                </div>

                {/* Segmented-control Tabs */}
                <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5 gap-0.5">
                    <button
                        onClick={() => setActiveTab("register")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === "register"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        تسجيل الحضور
                    </button>
                    <button
                        onClick={() => setActiveTab("records")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === "records"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        سجل الغيابات
                    </button>
                </div>
            </div>

            {/* Tabs wrapper — TabsList hidden, used only for Radix wiring */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <TabsList className="hidden">
                    <TabsTrigger value="register">تسجيل الحضور</TabsTrigger>
                    <TabsTrigger value="records">سجل الغيابات</TabsTrigger>
                </TabsList>

                {/* ══ Tab 1: تسجيل الحضور ══ */}
                <TabsContent
                    value="register"
                    className="flex-1 overflow-y-auto flex flex-col"
                >
                    {/* ── Compact RTL Filter Toolbar ── */}
                    <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-2.5">
                        <div className="flex items-center gap-3 flex-wrap justify-end">
                            {/* Team/Session selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">الميعاد</span>
                                <Select
                                    value={sessionFilter}
                                    onValueChange={v => { console.log("[AttendancePage] team selected:", v); setSessionFilter(v); }}
                                    disabled={!sportFilter1 || teamsLoading}
                                >
                                    <SelectTrigger className="h-8 w-48 text-sm">
                                        <SelectValue placeholder={
                                            teamsLoading ? "جارٍ التحميل..." :
                                                sportFilter1 ? "اختر الفريق" : "اختر الرياضة أولاً"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.nameAr}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Sport selector — rightmost */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">الرياضة</span>
                                <Select value={sportFilter1} onValueChange={v => {
                                    console.log("[AttendancePage] sport selected:", v);
                                    setSportFilter1(v);
                                    setSessionFilter("");
                                    setMembers([]);
                                    setLocalAttendance({});
                                }}>
                                    <SelectTrigger className="h-8 w-40 text-sm">
                                        <SelectValue placeholder="اختر الرياضة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sports.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* ── Content Area ── */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">

                        {/* Empty state: no sport selected */}
                        {!sportFilter1 && (
                            <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                                <ClipboardList className="w-10 h-10 text-muted-foreground/40" />
                                <p className="text-base font-medium text-muted-foreground">
                                    يرجى اختيار الرياضة والموعد لعرض قائمة الحضور
                                </p>
                                <p className="text-xs text-muted-foreground/60">استخدم الفلاتر أعلاه للبدء</p>
                            </div>
                        )}

                        {/* Empty state: sport selected but no team */}
                        {sportFilter1 && !sessionFilter && !teamsLoading && (
                            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                                <p className="text-sm font-medium text-muted-foreground">اختر الفريق لعرض قائمة الحضور</p>
                            </div>
                        )}

                        {/* Teams loading */}
                        {sportFilter1 && !sessionFilter && teamsLoading && (
                            <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">جارٍ تحميل الفرق...</span>
                            </div>
                        )}

                        {/* Members loading */}
                        {sessionFilter && membersLoading && (
                            <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">جارٍ تحميل الأعضاء...</span>
                            </div>
                        )}

                        {/* Full attendance view */}
                        {sessionFilter && !membersLoading && members.length > 0 && (
                            <div className="space-y-4">

                                {/* Session Context Bar */}
                                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm flex-wrap">
                                    <span className="font-semibold text-foreground">
                                        {sports.find(s => String(s.id) === sportFilter1)?.nameAr}
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">
                                        {teams.find(t => String(t.id) === sessionFilter)?.nameAr}
                                    </span>
                                    <div className="flex items-center gap-2 mr-auto flex-wrap">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">✓ {presentCount} حضر</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-xs font-semibold">✗ {absentCount} غاب</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold">📊 {attendanceRate}%</span>
                                        {unmarkedCount > 0 && <span className="text-xs text-muted-foreground">({unmarkedCount} لم يُسجَّل)</span>}
                                    </div>
                                </div>

                                {/* Toolbar: bulk actions + save */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 text-xs h-8" onClick={() => markAll("present")}>
                                            ✓ تحضير الكل
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5 text-rose-600 border-rose-300 hover:bg-rose-50 text-xs h-8" onClick={() => markAll("absent")}>
                                            ✗ تغييب الكل
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isDirty && <p className="text-xs text-amber-600 font-medium">⚠ يوجد تغييرات غير محفوظة</p>}
                                        <Button onClick={() => void handleSaveAttendance()} disabled={!isDirty || saveLoading} size="sm" className="gap-2 min-w-[120px]">
                                            {saveLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-3.5 h-3.5" />حفظ الحضور</>}
                                        </Button>
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                <div className="rounded-xl border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-12 text-right">#</TableHead>
                                                <TableHead className="text-right">اسم اللاعب</TableHead>
                                                <TableHead className="text-right w-24">الكود</TableHead>
                                                <TableHead className="text-right">الحضور</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {members.map((member, idx) => (
                                                <TableRow
                                                    key={member.id}
                                                    className={`transition-colors ${localAttendance[member.id] === "present"
                                                        ? "bg-emerald-50/40"
                                                        : localAttendance[member.id] === "absent"
                                                            ? "bg-rose-50/40"
                                                            : "hover:bg-muted/30"
                                                        }`}
                                                >
                                                    <TableCell className="text-muted-foreground text-sm py-2.5">{idx + 1}</TableCell>
                                                    <TableCell className="font-medium py-2.5">{member.nameAr}</TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground py-2.5">{member.memberCode}</TableCell>
                                                    <TableCell className="py-2.5">
                                                        <AttendanceToggle
                                                            status={localAttendance[member.id] ?? null}
                                                            onChange={s => markAttendance(member.id, s)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Empty state — team chosen but no members */}
                        {sessionFilter && !membersLoading && members.length === 0 && (
                            <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                                لا يوجد أعضاء مسجلون في هذا الفريق
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ══ Tab 2: سجل الغيابات ══ */}
                <TabsContent
                    value="records"
                    className="flex-1 overflow-y-auto flex flex-col"
                >
                    {/* ── Compact RTL Filter Toolbar ── */}
                    <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-2.5">
                        <div className="flex items-center gap-3 flex-wrap justify-end">
                            {(sportFilter2 !== "all" || dateFilter || absenceLimitFilter) && (
                                <button onClick={() => { setSportFilter2("all"); setDateFilter(""); setAbsenceLimitFilter(""); }} className="text-xs text-primary hover:underline">
                                    مسح الفلاتر ×
                                </button>
                            )}
                            {/* Absence threshold */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">غاب أكثر من</span>
                                <div className="relative">
                                    <Input type="number" min={1} placeholder="عدد" value={absenceLimitFilter} onChange={e => setAbsenceLimitFilter(e.target.value)} className="h-8 w-24 text-sm pl-8" />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">مرة</span>
                                </div>
                            </div>
                            {/* Date filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">يوم غياب</span>
                                <div className="relative">
                                    <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="h-8 w-40 text-sm pl-7" />
                                    {dateFilter && (
                                        <button onClick={() => setDateFilter("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Sport filter — rightmost */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">الرياضة</span>
                                <Select value={sportFilter2} onValueChange={setSportFilter2}>
                                    <SelectTrigger className="h-8 w-40 text-sm"><SelectValue placeholder="كل الرياضات" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">كل الرياضات</SelectItem>
                                        {sports.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* ── Content Area ── */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">

                        {/* Stats + Export Row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-4 text-sm flex-wrap text-muted-foreground">
                                <span>إجمالي اللاعبين: <strong className="text-foreground mr-1">{filteredAbsenceRows.length}</strong></span>
                                {topAbsentee && <span>أكثر غياباً: <strong className="text-amber-600 mr-1">{topAbsentee.memberNameAr} ({topAbsentee.totalAbsences} مرات)</strong></span>}
                            </div>
                            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={handleExportPDF}>
                                <Download className="h-3.5 w-3.5" />
                                تصدير PDF
                            </Button>
                        </div>

                        {/* Absence Table */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-12 text-right">#</TableHead>
                                        <TableHead className="text-right">اسم اللاعب</TableHead>
                                        <TableHead className="text-right">الرياضة</TableHead>
                                        <TableHead className="text-right">إجمالي الغياب</TableHead>
                                        <TableHead className="text-right">آخر غياب</TableHead>
                                        <TableHead className="text-center w-16">إنذار</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Loading skeleton */}
                                    {absenceLoading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i} className="animate-pulse">
                                                <TableCell><div className="h-4 w-6 bg-muted rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-8 bg-muted rounded mx-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredAbsenceRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                                                لا توجد بيانات تطابق الفلاتر المحددة
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAbsenceRows.map((row, idx) => (
                                            <TableRow key={`${row.memberId}-${row.sportId}`} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-muted-foreground text-sm py-2.5">{idx + 1}</TableCell>
                                                <TableCell className="py-2.5">
                                                    <button className="text-right hover:underline font-medium text-primary flex flex-col" onClick={() => setPlayerDetailRow(row)}>
                                                        <span>{row.memberNameAr}</span>
                                                        <span className="text-xs font-mono text-muted-foreground">{row.memberCode}</span>
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-sm py-2.5">{row.sportNameAr}</TableCell>
                                                <TableCell className="py-2.5">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${absenceBadgeClass(row.totalAbsences)}`}>
                                                        {row.totalAbsences} غياب
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground py-2.5">
                                                    {row.lastAbsenceDate ? new Date(row.lastAbsenceDate).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                                                </TableCell>
                                                <TableCell className="text-center py-2.5">
                                                    <button
                                                        title="إرسال إنذار"
                                                        disabled={row.totalAbsences === 0}
                                                        onClick={() => void handleSendWarning(row)}
                                                        className={`p-1.5 rounded-md transition-colors ${row.totalAbsences > 0 ? "text-amber-600 hover:bg-amber-100 cursor-pointer" : "text-muted-foreground/30 cursor-not-allowed"}`}
                                                    >
                                                        <AlertTriangle className="h-4 w-4" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* ── Player Detail Modal — outside TabsContent, inside page root ── */}
            <Dialog
                open={!!playerDetailRow}
                onOpenChange={() => setPlayerDetailRow(null)}
            >
                <DialogContent className="max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>
                            سجل غيابات — {playerDetailRow?.memberNameAr}
                            <span className="mr-2 text-sm font-mono text-muted-foreground">
                                {playerDetailRow?.memberCode}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            تفاصيل الغيابات مقسمة بالرياضة
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {playerDetailSports.map(sport => {
                            // get the absences for this member+sport from state
                            const row = absenceRows.find(
                                r => r.memberId === playerDetailRow?.memberId && r.sportId === sport.id
                            );
                            const count = row?.totalAbsences ?? 0;
                            const lastDate = row?.lastAbsenceDate ?? null;

                            return (
                                <div key={sport.id} className="rounded-lg border border-border p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">{sport.nameAr}</p>
                                        <span className={`text-xs font-bold rounded-full border px-2 py-0.5 ${absenceBadgeClass(count)}`}>
                                            {count} غياب
                                        </span>
                                    </div>
                                    {count === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            لا يوجد غياب في هذه الرياضة
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            آخر غياب: {lastDate
                                                ? new Date(lastDate).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })
                                                : "—"}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                            disabled={!playerDetailRow || playerDetailRow.totalAbsences === 0}
                            onClick={() => {
                                if (playerDetailRow) void handleSendWarning(playerDetailRow);
                                setPlayerDetailRow(null);
                            }}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            إرسال إنذار
                        </Button>
                        <Button variant="outline" onClick={() => setPlayerDetailRow(null)}>
                            إغلاق
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
