import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  DollarSign,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import {
  PAYMENT_ALERTS,
  computePaymentStatus,
  getDaysUntilRenewal,
} from "../data/paymentsData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "../Component/StaffPagesComponents/StatCard";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Component/StaffPagesComponents/ui/table";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

type SectionKey = "members" | "sports" | "plans" | "tasks" | "audit" | "privileges";

interface DashboardSectionAccess {
  members: boolean;
  sports: boolean;
  plans: boolean;
  tasks: boolean;
  audit: boolean;
  privileges: boolean;
}

interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  otherMembers: number;
  totalSports: number;
  activeSports: number;
  pendingSports: number;
  totalPlans: number;
  activePlans: number;
  totalTasks: number;
  pendingTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  auditTotal: number;
  auditToday: number;
  estimatedSportsRevenue: number;
  averageSportPrice: number;
}

interface DashboardTask {
  id: number;
  title: string;
  type: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

interface DashboardSport {
  id: number;
  name: string;
  status: string;
  isActive: boolean;
  price: number;
  membersCount: number;
  createdAt: string;
}

interface DashboardPrivilegeModule {
  module: string;
  count: number;
}

interface DashboardState {
  access: DashboardSectionAccess;
  summary: DashboardSummary;
  recentTasks: DashboardTask[];
  recentSports: DashboardSport[];
  topSportsChart: Array<{ name: string; members: number }>;
  privilegeModules: DashboardPrivilegeModule[];
  privilegeCount: number;
  sectionErrors: Partial<Record<SectionKey, string>>;
}

const CHART_COLORS = ["#1F3A5F", "#244A73", "#2EA7C9", "#F4A623", "#4A90D9", "#6BB5D9"];

const INITIAL_STATE: DashboardState = {
  access: {
    members: false,
    sports: false,
    plans: false,
    tasks: false,
    audit: false,
    privileges: false,
  },
  summary: {
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    otherMembers: 0,
    totalSports: 0,
    activeSports: 0,
    pendingSports: 0,
    totalPlans: 0,
    activePlans: 0,
    totalTasks: 0,
    pendingTasks: 0,
    approvedTasks: 0,
    rejectedTasks: 0,
    auditTotal: 0,
    auditToday: 0,
    estimatedSportsRevenue: 0,
    averageSportPrice: 0,
  },
  recentTasks: [],
  recentSports: [],
  topSportsChart: [],
  privilegeModules: [],
  privilegeCount: 0,
  sectionErrors: {},
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? (value as unknown[]) : []);

const getPayload = (result: PromiseSettledResult<unknown>): unknown => {
  if (result.status !== "fulfilled") return null;
  const response = result.value as Record<string, unknown> | null;
  if (!response) return null;
  return "data" in response ? response.data : response;
};

const getErrorMessage = (result: PromiseSettledResult<unknown>): string | null => {
  if (result.status !== "rejected") return null;
  const reason = result.reason as { message?: string } | string | null;
  if (reason && typeof reason === "object" && typeof reason.message === "string") {
    return reason.message;
  }
  if (typeof reason === "string") return reason;
  return "Failed to load";
};

const getTotal = (payload: unknown): number => {
  if (typeof payload === "object" && payload !== null) {
    const p = payload as Record<string, unknown>;
    if (typeof p.pagination === "object" && p.pagination !== null) {
      const pag = p.pagination as Record<string, unknown>;
      if (typeof pag.total === "number") return pag.total;
    }
    if (typeof p.count === "number") return p.count;
    if (typeof p.total === "number") return p.total;
    if (Array.isArray(p.data)) return p.data.length;
  }
  return 0;
};

const normalizeStatus = (value: unknown): string => String(value || "unknown").toLowerCase();

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const { hasPrivilege, user } = useAuth();
  const { t } = useTranslation(["DashboardPage", "common"]);
  const { language } = useLanguage();
  const [dashboard, setDashboard] = useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const access: DashboardSectionAccess = {
          members: hasPrivilege("VIEW_MEMBERS"),
          sports: hasPrivilege("VIEW_SPORTS"),
          plans: hasPrivilege("VIEW_MEMBERSHIP_PLANS"),
          tasks: hasPrivilege("VIEW_TASKS"),
          audit: hasPrivilege("audit.view"),
          privileges: Boolean(user?.staff_id),
        };

        const requests: Array<Promise<unknown>> = [
          access.members
            ? api.get("/members", { params: { page: 1, limit: 6 } })
            : Promise.resolve(null),
          access.members
            ? api.get("/members", { params: { page: 1, limit: 1, status: "active" } })
            : Promise.resolve(null),
          access.members
            ? api.get("/members", { params: { page: 1, limit: 1, status: "pending" } })
            : Promise.resolve(null),
          access.sports ? api.get("/sports") : Promise.resolve(null),
          access.plans
            ? api.get("/membership-plans", { params: { page: 1, limit: 50 } }) // Reduced from 200 to 50
            : Promise.resolve(null),
          access.tasks ? api.get("/tasks") : Promise.resolve(null),
          access.audit ? api.get("/audit-logs/stats") : Promise.resolve(null),
          access.privileges && user?.staff_id
            ? api.get(`/staff/${user.staff_id}/final-privileges`)
            : Promise.resolve(null),
        ];

        const [
          membersResult,
          activeMembersResult,
          pendingMembersResult,
          sportsResult,
          plansResult,
          tasksResult,
          auditResult,
          privilegesResult,
        ] = await Promise.allSettled(requests);

        const membersPayload = getPayload(membersResult);
        const activeMembersPayload = getPayload(activeMembersResult);
        const pendingMembersPayload = getPayload(pendingMembersResult);
        const sportsPayload = getPayload(sportsResult);
        const plansPayload = getPayload(plansResult);
        const tasksPayload = getPayload(tasksResult);
        const auditPayload = getPayload(auditResult);
        const privilegesPayload = getPayload(privilegesResult);

        const totalMembers = getTotal(membersPayload);
        const activeMembers = getTotal(activeMembersPayload);
        const pendingMembers = getTotal(pendingMembersPayload);
        const otherMembers = Math.max(totalMembers - activeMembers - pendingMembers, 0);

        const sportsPayloadObj = sportsPayload as Record<string, unknown> | null;
        const sportsRaw = toArray(sportsPayloadObj?.data ?? sportsPayload) as Array<Record<string, unknown>>;
        const sports = sportsRaw.map((sport) => {
          const price = toNumber(sport?.price);
          const name = language === 'ar' ? (sport?.name_ar || sport?.name_en || sport?.name) : (sport?.name_en || sport?.name_ar || sport?.name);
          return {
            id: toNumber(sport?.id),
            name: String(name || t("unnamedSport")),
            status: normalizeStatus(sport?.status),
            isActive: Boolean(sport?.is_active),
            price,
            membersCount: toNumber(sport?.members_count ?? sport?.membersCount),
            createdAt: String(sport?.created_at || ""),
          };
        });

        const totalSports = sports.length;
        const activeSports = sports.filter((sport) => sport.isActive && sport.status !== "rejected").length;
        const pendingSports = sports.filter((sport) => sport.status === "pending").length;
        const averageSportPrice =
          sports.length > 0
            ? sports.reduce((sum, sport) => sum + sport.price, 0) / sports.length
            : 0;
        const estimatedSportsRevenue = sports.reduce(
          (sum, sport) => sum + sport.price * Math.max(sport.membersCount, 0),
          0
        );

        const recentSports = [...sports]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        const topSportsChart = [...sports]
          .sort((a, b) => b.membersCount - a.membersCount)
          .slice(0, 5)
          .map((sport) => ({ name: sport.name, members: sport.membersCount }));

        const plansPayloadObj = plansPayload as Record<string, unknown> | null;
        const plansRaw = toArray(plansPayloadObj?.data ?? plansPayload) as Array<Record<string, unknown>>;
        const totalPlans = getTotal(plansPayload);
        const activePlans = plansRaw.filter((plan) => Boolean(plan?.is_active)).length;

        const tasksPayloadObj = tasksPayload as Record<string, unknown> | null;
        const tasksRaw = toArray(tasksPayloadObj?.data ?? tasksPayload) as Array<Record<string, unknown>>;
        const tasks = tasksRaw.map((task) => ({
          id: toNumber(task?.id),
          title: String(task?.title || t("untitledTask")),
          type: String(task?.type || "GENERAL"),
          status: normalizeStatus(task?.status),
          createdBy: String(task?.created_by || t("system")),
          createdAt: String(task?.created_at || ""),
        }));

        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter((task) => task.status === "pending").length;
        const approvedTasks = tasks.filter((task) => task.status === "approved").length;
        const rejectedTasks = tasks.filter((task) => task.status === "rejected").length;
        const recentTasks = [...tasks]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        const auditPayloadObj = auditPayload as Record<string, unknown> | null;
        const auditTotal = toNumber(auditPayloadObj?.total);
        const auditToday = toNumber(auditPayloadObj?.today);

        const privilegesRaw = toArray(
          typeof privilegesPayload === "object" && privilegesPayload !== null
            ? (privilegesPayload as Record<string, unknown>).privileges ||
            (privilegesPayload as Record<string, unknown>).data ||
            privilegesPayload
            : privilegesPayload
        ) as Array<Record<string, unknown>>;

        const moduleMap = new Map<string, number>();
        for (const privilege of privilegesRaw) {
          const moduleName = String(privilege?.module || "General");
          moduleMap.set(moduleName, (moduleMap.get(moduleName) || 0) + 1);
        }

        const privilegeModules = Array.from(moduleMap.entries())
          .map(([module, count]) => ({ module, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const sectionErrors: Partial<Record<SectionKey, string>> = {};
        const membersError = getErrorMessage(membersResult);
        const sportsError = getErrorMessage(sportsResult);
        const plansError = getErrorMessage(plansResult);
        const tasksError = getErrorMessage(tasksResult);
        const auditError = getErrorMessage(auditResult);
        const privilegesError = getErrorMessage(privilegesResult);

        if (membersError) sectionErrors.members = membersError;
        if (sportsError) sectionErrors.sports = sportsError;
        if (plansError) sectionErrors.plans = plansError;
        if (tasksError) sectionErrors.tasks = tasksError;
        if (auditError) sectionErrors.audit = auditError;
        if (privilegesError) sectionErrors.privileges = privilegesError;

        const fullFailure =
          Object.values(access).some(Boolean) &&
          Object.keys(sectionErrors).length === Object.values(access).filter(Boolean).length;

        if (fullFailure) {
          setError(t("dataLoadError"));
        }

        setDashboard({
          access,
          summary: {
            totalMembers,
            activeMembers,
            pendingMembers,
            otherMembers,
            totalSports,
            activeSports,
            pendingSports,
            totalPlans,
            activePlans,
            totalTasks,
            pendingTasks,
            approvedTasks,
            rejectedTasks,
            auditTotal,
            auditToday,
            estimatedSportsRevenue,
            averageSportPrice,
          },
          recentTasks,
          recentSports,
          topSportsChart,
          privilegeModules,
          privilegeCount: privilegesRaw.length,
          sectionErrors,
        });

        setLastUpdated(new Date());
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unexpected dashboard error";
        setError(message);
      } finally {
        if (mode === "initial") {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasPrivilege, user?.staff_id]
  );

  useEffect(() => {
    void loadDashboard("initial");
  }, [loadDashboard]);

  const memberStatusChart = useMemo(
    () => [
      { name: t("status.active"), value: dashboard.summary.activeMembers },
      { name: t("status.pending"), value: dashboard.summary.pendingMembers },
      { name: t("status.other"), value: dashboard.summary.otherMembers },
    ].filter((item) => item.value > 0),
    [dashboard.summary.activeMembers, dashboard.summary.pendingMembers, dashboard.summary.otherMembers]
  );

  // Still keeping taskStatusChart because we removed the <BarChart> but recentTasks table still uses status styling logic
  const taskStatusLabel = (status: string) => {
    if (status === "approved") return t("status.approved");
    if (status === "rejected") return t("status.rejected");
    return t("status.pending");
  };

  const taskStatusClassName = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-3 sm:p-6 pb-8 space-y-6">
        <h1 className="text-2xl font-bold">لوحة تحكم الموظفين</h1>
        <div className="rounded-lg border bg-card p-4 sm:p-6 text-sm text-muted-foreground">جاري تحميل بيانات لوحة التحكم...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 pb-8 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#214474]">
            {t("welcomeMessage", { name: user?.fullName || "Staff Member" })}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              آخر تحديث: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            className="w-full sm:w-auto h-10 sm:h-11 px-6 gap-2 bg-[#1b71bc] text-white hover:bg-[#155a96] text-sm sm:text-base font-semibold"
            onClick={() => void loadDashboard("refresh")}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? t("refreshingBtn") : t("refreshBtn")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <StatCard
            title={t("stats.totalMembers")}
            value={dashboard.summary.totalMembers}
            icon={Users}
            subtitle={dashboard.access.members ? t("stats.connectedToServer") : t("stats.noAccess")}
            tone="blue"
            emphasis="primary"
          />
        </div>
        <div className="lg:col-span-6">
          <StatCard
            title={t("stats.activeMembers")}
            value={dashboard.summary.activeMembers}
            icon={CheckCircle2}
            subtitle={t("stats.pendingApprovals", { count: dashboard.summary.pendingMembers })}
            tone="cyan"
            emphasis="primary"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title={t("stats.totalSports")}
            value={dashboard.summary.totalSports}
            icon={Trophy}
            subtitle={t("stats.activeAndPending", { active: dashboard.summary.activeSports, pending: dashboard.summary.pendingSports })}
            tone="orange"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title={t("stats.sportsRevenue")}
            value={currencyFormatter.format(dashboard.summary.estimatedSportsRevenue)}
            icon={DollarSign}
            subtitle={t("stats.avgSportFee", { fee: currencyFormatter.format(dashboard.summary.averageSportPrice) })}
            tone="blue"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title={t("stats.tasksList")}
            value={dashboard.summary.totalTasks}
            icon={ListChecks}
            subtitle={t("stats.pendingActions", { count: dashboard.summary.pendingTasks })}
            tone="cyan"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title={t("stats.membershipPlans")}
            value={dashboard.summary.totalPlans}
            icon={ShieldCheck}
            subtitle={t("stats.activePlans", { count: dashboard.summary.activePlans })}
            tone="orange"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title={t("stats.auditLogsToday")}
            value={dashboard.summary.auditToday}
            icon={Clock3}
            subtitle={t("stats.totalLogs", { count: dashboard.summary.auditTotal })}
            tone="blue"
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title={t("stats.myPrivileges")}
            value={dashboard.privilegeCount}
            icon={ShieldCheck}
            subtitle={t("stats.visibleModules", { count: dashboard.privilegeModules.length })}
            tone="cyan"
          />
        </div>
      </div>

      {/* Charts Section - 2 Columns Full Width */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {/* Member Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-card p-6 shadow-sm border h-full min-h-[350px]"
        >
          <h2 className="text-lg font-bold mb-4 text-[#214474]">{t("charts.memberDistribution")}</h2>
          {dashboard.access.members ? (
            memberStatusChart.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("charts.noMemberData")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={memberStatusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    label
                  >
                    {memberStatusChart.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            <p className="text-sm text-muted-foreground">{t("charts.noMemberAccess")}</p>
          )}
        </motion.div>

        {/* Top Sports Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-card p-6 shadow-sm border h-full min-h-[350px]"
        >
          <h2 className="text-lg font-bold mb-4 text-[#214474]">{t("charts.topSports")}</h2>
          {dashboard.access.sports ? (
            dashboard.topSportsChart.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("charts.noSportsData")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboard.topSportsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="members" fill="#2EA7C9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <p className="text-sm text-muted-foreground">{t("charts.noSportsAccess")}</p>
          )}
        </motion.div>
      </div>

      {/* ─── Payment Alerts Widget ─── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">

        {/* Widget Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{t("alerts.title")}</p>
              <p className="text-[11px] text-muted-foreground">
                {t("alerts.needsAttention", { count: PAYMENT_ALERTS.length })}
              </p>
            </div>
          </div>
          <a
            href="/staff/dashboard/finance/subscriptions"
            className="text-xs text-primary hover:underline"
          >
            {t("alerts.viewAll")}
          </a>
        </div>

        {/* Alert List — show max 5 */}
        <div className="space-y-2">
          {PAYMENT_ALERTS.slice(0, 5).map(p => {
            const status = computePaymentStatus(p.nextRenewalDate);
            const days = getDaysUntilRenewal(p.nextRenewalDate);
            return (
              <div
                key={`${p.memberType}-${p.memberId}`}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${status === "overdue"
                    ? "bg-rose-50 border-rose-200"
                    : "bg-amber-50 border-amber-200"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{status === "overdue" ? "⚠" : "🔔"}</span>
                  <div>
                    <p className="text-xs font-semibold">{p.memberCode}</p>
                    <p className="text-[10px] text-muted-foreground">{p.subscriptionType}</p>
                  </div>
                </div>
                <div className="text-left" dir="ltr">
                  <p className={`text-xs font-bold ${status === "overdue" ? "text-rose-600" : "text-amber-600"
                    }`}>
                    {status === "overdue"
                      ? t("alerts.overdue", { days: Math.abs(days) })
                      : t("alerts.dueIn", { days })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* If more than 5 alerts */}
        {PAYMENT_ALERTS.length > 5 && (
          <p className="text-xs text-center text-muted-foreground">
            {t("alerts.moreAlerts", { count: PAYMENT_ALERTS.length - 5 })}
          </p>
        )}

        {/* Empty state */}
        {PAYMENT_ALERTS.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {t("alerts.allValid")}
          </div>
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">المهام الأخيرة</h2>
          {!dashboard.access.tasks ? (
            <p className="text-sm text-muted-foreground">{t("tables.noTasksAccess")}</p>
          ) : dashboard.recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("tables.noTasksFound")}</p>
          ) : (
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tables.columns.taskName")}</TableHead>
                  <TableHead>{t("tables.columns.status")}</TableHead>
                  <TableHead>{t("tables.columns.createdBy")}</TableHead>
                  <TableHead>{t("tables.columns.createdAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={taskStatusClassName(task.status)}>{taskStatusLabel(task.status)}</Badge>
                    </TableCell>
                    <TableCell>{task.createdBy}</TableCell>
                    <TableCell>{task.createdAt ? new Date(task.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">الرياضات الأخيرة</h2>
          {!dashboard.access.sports ? (
            <p className="text-sm text-muted-foreground">{t("tables.noSportsAccess")}</p>
          ) : dashboard.recentSports.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("tables.noSportsFound")}</p>
          ) : (
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tables.columns.sportName")}</TableHead>
                  <TableHead>{t("tables.columns.status")}</TableHead>
                  <TableHead>{t("tables.columns.members")}</TableHead>
                  <TableHead>{t("tables.columns.price")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentSports.map((sport) => (
                  <TableRow key={sport.id}>
                    <TableCell className="font-medium">{sport.name}</TableCell>
                    <TableCell>
                      <Badge className={sport.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {sport.status === "active" ? t("status.active") : t("status.pending")}
                      </Badge>
                    </TableCell>
                    <TableCell>{sport.membersCount}</TableCell>
                    <TableCell>{currencyFormatter.format(sport.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
