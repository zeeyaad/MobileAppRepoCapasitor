import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  AlertCircle,
  PieChart,
  CreditCard,
  Key,
  XCircle,
  CheckCircle2,
  Timer,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../api/axios";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membersSummary, setMembersSummary] = useState({ total: 0, active: 0, pending: 0, other: 0 });
  const [auditSummary, setAuditSummary] = useState({ total: 0, today: 0 });

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [members, active, pending, audit] = await Promise.allSettled([
          api.get("/members", { params: { page: 1, limit: 1 } }),
          api.get("/members", { params: { page: 1, limit: 1, status: "active" } }),
          api.get("/members", { params: { page: 1, limit: 1, status: "pending" } }),
          api.get("/audit-logs/stats"),
        ]);
        const getTotal = (res: PromiseSettledResult<{ data?: { pagination?: { total?: number }; total?: number; data?: unknown[] } }>) => {
          if (res.status !== "fulfilled") return 0;
          const value = res.value;
          const data = value?.data;
          if (typeof data?.pagination?.total === "number") return data.pagination.total;
          if (typeof data?.total === "number") return data.total;
          if (Array.isArray(data?.data)) return data.data.length;
          return 0;
        };
        const total = getTotal(members);
        const activeCount = getTotal(active);
        const pendingCount = getTotal(pending);
        const other = Math.max(total - activeCount - pendingCount, 0);
        setMembersSummary({ total, active: activeCount, pending: pendingCount, other });
        const getAudit = () => {
          if (audit.status !== "fulfilled") return { total: 0, today: 0 };
          const d = audit.value?.data || {};
          return { total: Number(d.total || 0), today: Number(d.today || 0) };
        };
        setAuditSummary(getAudit());
      } catch (error: unknown) {
        const e = error as { message?: string };
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renewalRate = useMemo(() => {
    const denom = membersSummary.total || 1;
    return Math.round((membersSummary.active / denom) * 1000) / 10;
  }, [membersSummary]);

  const churnRate = useMemo(() => {
    const denom = membersSummary.total || 1;
    return Math.round((membersSummary.other / denom) * 1000) / 10;
  }, [membersSummary]);

  const membershipData = {
    activeOverTime: [
      { month: "يناير", value: 850 },
      { month: "فبراير", value: 920 },
      { month: "مارس", value: 980 },
      { month: "أبريل", value: 1050 },
      { month: "مايو", value: 1120 },
      { month: "يونيو", value: 1234 },
    ],
    newVsRenewed: {
      new: [120, 140, 130, 150, 160, 180],
      renewed: [200, 220, 240, 250, 260, 280],
      expired: [30, 25, 35, 40, 35, 30],
    },
    renewalRate,
    avgDuration: "8.2",
    distribution: [
      { type: "نشط", value: membersSummary.active, color: "#0A1A44" },
      { type: "معلق", value: membersSummary.pending, color: "#FDBF00" },
      { type: "أخرى", value: membersSummary.other, color: "#CD7F32" },
    ],
    churnRate,
  };

  const attendanceData = {
    dailyCheckins: [
      { day: "السبت", value: 145 },
      { day: "الأحد", value: 180 },
      { day: "الاثنين", value: 165 },
      { day: "الثلاثاء", value: 195 },
      { day: "الأربعاء", value: 170 },
      { day: "الخميس", value: 210 },
      { day: "الجمعة", value: 160 },
    ],
    peakHours: [
      { hour: "6-8 ص", value: 45 },
      { hour: "8-10 ص", value: 120 },
      { hour: "10-12 ظ", value: 95 },
      { hour: "12-2 ظ", value: 80 },
      { hour: "2-4 ظ", value: 110 },
      { hour: "4-6 م", value: 180 },
      { hour: "6-8 م", value: 195 },
      { hour: "8-10 م", value: 140 },
    ],
    deniedEntries: 23,
    gateUsage: { entry: 1245, exit: 1230 },
  };

  const financialData = {
    monthlyRevenue: [
      { month: "يناير", value: 75000 },
      { month: "فبراير", value: 82000 },
      { month: "مارس", value: 88000 },
      { month: "أبريل", value: 95000 },
      { month: "مايو", value: 102000 },
      { month: "يونيو", value: 89450 },
    ],
    revenueByType: [
      { type: "شهري", value: 45000 },
      { type: "سنوي", value: 35000 },
      { type: "VIP", value: 9440 },
    ],
    serviceRevenue: 12500,
    outstandingPayments: 12500,
    topServices: [
      { name: "خزائن", revenue: 4500 },
      { name: "معدات رياضية", revenue: 3800 },
      { name: "جلسات تدريب", revenue: 2500 },
      { name: "ملاعب", revenue: 1200 },
      { name: "حمام سباحة", revenue: 500 },
    ],
  };

  const facilityData = {
    usageRate: [
      { facility: "صالة الأوزان", rate: 85 },
      { facility: "حمام السباحة", rate: 72 },
      { facility: "ملاعب التنس", rate: 68 },
      { facility: "صالة الكارديو", rate: 90 },
      { facility: "صالة الفنون القتالية", rate: 55 },
    ],
    mostBooked: [
      { service: "خزانة 42", bookings: 145 },
      { service: "جهاز المشي", bookings: 132 },
      { service: "ملعب تنس 1", bookings: 98 },
      { service: "جلسة تدريب", bookings: 87 },
    ],
    cancellationRate: 12.5,
    avgDuration: "2.5",
  };

  const staffData = {
    tasksCompleted: 245,
    tasksPending: 35,
    avgCompletionTime: "4.2",
    topPerformers: [
      { name: "أحمد محمد", tasks: 45, rating: 4.8 },
      { name: "سارة علي", tasks: 42, rating: 4.9 },
      { name: "محمود حسن", tasks: 38, rating: 4.7 },
    ],
    taskDistribution: [
      { category: "صيانة", count: 85 },
      { category: "تنظيف", count: 120 },
      { category: "إدارة", count: 45 },
      { category: "أخرى", count: 30 },
    ],
  };

  const maxValue = (arr: number[]) => Math.max(...arr, 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-gray-600">إجمالي الأعضاء</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{membersSummary.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-gray-600">الأعضاء النشطون</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{membersSummary.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-gray-600">سجلات اليوم</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{auditSummary.today}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-gray-600">إجمالي السجلات</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{auditSummary.total}</p>
        </div>
      </div>
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">التحليلات الشاملة</h2>
          <p className="text-sm font-normal text-gray-500 leading-relaxed">نظرة شاملة على أداء النادي</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          {["Week", "Month", "Quarter", "Year"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors leading-none ${selectedPeriod === period
                  ? "bg-[#0A1A44] text-white"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {period === "Week" ? "أسبوع" : period === "Month" ? "شهري" : period === "Quarter" ? "ربع سنوي" : "سنوي"}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Membership Analytics */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggleSection("membership")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle section"
            >
              {collapsedSections.membership ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">تحليلات العضويات</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">تتبع النمو والاحتفاظ وسلوك الأعضاء</p>
            </div>
          </div>
          {loading && <div className="text-xs text-gray-500">تحميل البيانات...</div>}
          {error && <div className="text-xs text-red-600">{error}</div>}
        </div>

        {!collapsedSections.membership && (
          <div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Active Members Over Time */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">الأعضاء النشطين بمرور الوقت</h4>
                <div className="h-48 flex items-end justify-between gap-2">
                  {membershipData.activeOverTime.map((item, i) => {
                    const max = maxValue(membershipData.activeOverTime.map(d => d.value));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-[#0A1A44] rounded-t-md hover:bg-[#0A1A44]/80 transition-all cursor-pointer"
                          style={{ height: `${(item.value / max) * 100}%` }}
                          title={`${item.month}: ${item.value}`}
                        ></div>
                        <span className="text-xs font-medium text-gray-600 leading-tight">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* New vs Renewed vs Expired */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">جديد مقابل متجدد مقابل منتهي</h4>
                <div className="h-48 flex items-end justify-between gap-1">
                  {membershipData.activeOverTime.map((_, i) => {
                    const max = maxValue([
                      ...membershipData.newVsRenewed.new,
                      ...membershipData.newVsRenewed.renewed,
                      ...membershipData.newVsRenewed.expired,
                    ]);
                    const newVal = membershipData.newVsRenewed.new[i];
                    const renewedVal = membershipData.newVsRenewed.renewed[i];
                    const expiredVal = membershipData.newVsRenewed.expired[i];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col-reverse gap-0.5">
                          <div
                            className="w-full bg-[#0A1A44] rounded-t-sm"
                            style={{ height: `${(newVal / max) * 100}%` }}
                          ></div>
                          <div
                            className="w-full bg-[#FDBF00] rounded-t-sm"
                            style={{ height: `${(renewedVal / max) * 100}%` }}
                          ></div>
                          <div
                            className="w-full bg-red-500 rounded-t-sm"
                            style={{ height: `${(expiredVal / max) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 leading-tight">
                          {membershipData.activeOverTime[i].month.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#0A1A44] rounded"></div>
                    <span className="text-xs font-medium text-gray-600">جديد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#FDBF00] rounded"></div>
                    <span className="text-xs font-medium text-gray-600">متجدد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-xs font-medium text-gray-600">منتهي</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">معدل التجديد</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{membershipData.renewalRate}%</p>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">متوسط مدة العضوية</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{membershipData.avgDuration} شهر</p>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">التوزيع حسب النوع</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {membershipData.distribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-medium text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-gray-600">معدل الفقد</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{membershipData.churnRate}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Attendance & Access Analytics */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggleSection("attendance")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle section"
            >
              {collapsedSections.attendance ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">تحليلات الحضور والوصول</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">فهم كيفية استخدام المرافق</p>
            </div>
          </div>
        </div>

        {!collapsedSections.attendance && (
          <div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Check-ins */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">الحضور اليومي</h4>
                <div className="h-48 flex items-end justify-between gap-2">
                  {attendanceData.dailyCheckins.map((item, i) => {
                    const max = maxValue(attendanceData.dailyCheckins.map(d => d.value));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-[#0A1A44] rounded-t-md hover:bg-[#0A1A44]/80 transition-all cursor-pointer"
                          style={{ height: `${(item.value / max) * 100}%` }}
                          title={`${item.day}: ${item.value}`}
                        ></div>
                        <span className="text-xs font-medium text-gray-600 leading-tight">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Peak Hours */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">ساعات الذروة</h4>
                <div className="space-y-2">
                  {attendanceData.peakHours.map((item, i) => {
                    const max = maxValue(attendanceData.peakHours.map(d => d.value));
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 w-16 leading-tight">{item.hour}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-[#FDBF00] rounded-full transition-all"
                            style={{ width: `${(item.value / max) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-12 text-left leading-tight">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Access Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-gray-600">الدخول المرفوض</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{attendanceData.deniedEntries}</p>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">دخول</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{attendanceData.gateUsage.entry}</p>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">خروج</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{attendanceData.gateUsage.exit}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Financial Analytics */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggleSection("financial")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle section"
            >
              {collapsedSections.financial ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">التحليلات المالية</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">مراقبة مصادر الدخل وأنماط الإيرادات</p>
            </div>
          </div>
        </div>

        {!collapsedSections.financial && (
          <div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly Revenue Trend */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">اتجاه الإيرادات الشهرية</h4>
                <div className="h-48 flex items-end justify-between gap-2">
                  {financialData.monthlyRevenue.map((item, i) => {
                    const max = maxValue(financialData.monthlyRevenue.map(d => d.value));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-[#0A1A44] to-[#0A1A44]/60 rounded-t-md hover:from-[#0A1A44] hover:to-[#0A1A44]/80 transition-all cursor-pointer"
                          style={{ height: `${(item.value / max) * 100}%` }}
                          title={`${item.month}: ${item.value.toLocaleString()} ج.م`}
                        ></div>
                        <span className="text-xs font-medium text-gray-600 leading-tight">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue by Membership Type */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">الإيرادات حسب نوع العضوية</h4>
                <div className="h-48 flex items-end justify-between gap-4">
                  {financialData.revenueByType.map((item, i) => {
                    const max = maxValue(financialData.revenueByType.map(d => d.value));
                    const colors = ["#0A1A44", "#FDBF00", "#CD7F32"];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-md hover:opacity-80 transition-all cursor-pointer"
                          style={{
                            height: `${(item.value / max) * 100}%`,
                            backgroundColor: colors[i]
                          }}
                          title={`${item.type}: ${item.value.toLocaleString()} ج.م`}
                        ></div>
                        <span className="text-xs font-medium text-gray-600 leading-tight text-center">{item.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">إيرادات الخدمات</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{financialData.serviceRevenue.toLocaleString()} ج.م</p>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-gray-600">المدفوعات المستحقة</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{financialData.outstandingPayments.toLocaleString()} ج.م</p>
              </div>
            </div>

            {/* Top 5 Services */}
            <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">أفضل 5 خدمات حسب الدخل</h4>
              <div className="space-y-3">
                {financialData.topServices.map((service, i) => {
                  const max = maxValue(financialData.topServices.map(s => s.revenue));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-600 w-24 leading-tight">{service.name}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-[#0A1A44] rounded-full transition-all"
                          style={{ width: `${(service.revenue / max) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-900 w-20 text-left leading-tight">{service.revenue.toLocaleString()} ج.م</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Service & Facility Utilization */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggleSection("facility")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle section"
            >
              {collapsedSections.facility ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">استخدام الخدمات والمرافق</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">قياس فعالية استخدام مرافق النادي</p>
            </div>
          </div>
        </div>

        {!collapsedSections.facility && (
          <div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Facility Usage Rate */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">معدل استخدام المرافق (%)</h4>
                <div className="space-y-3">
                  {facilityData.usageRate.map((facility, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-600 w-32 leading-tight">{facility.facility}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-[#0A1A44] rounded-full transition-all"
                          style={{ width: `${facility.rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-900 w-12 text-left leading-tight">{facility.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Booked Services */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">أكثر الخدمات حجزاً</h4>
                <div className="space-y-3">
                  {facilityData.mostBooked.map((service, i) => {
                    const max = maxValue(facilityData.mostBooked.map(s => s.bookings));
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 w-28 leading-tight">{service.service}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-[#FDBF00] rounded-full transition-all"
                            style={{ width: `${(service.bookings / max) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-12 text-left leading-tight">{service.bookings}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Facility Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-gray-600">معدل الإلغاء</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{facilityData.cancellationRate}%</p>
              </div>
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">متوسط مدة الحجز</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{facilityData.avgDuration} ساعة</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Staff & Task Performance */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggleSection("staff")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle section"
            >
              {collapsedSections.staff ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">أداء الموظفين والمهام</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">تقييم الإنتاجية والأعباء</p>
            </div>
          </div>
        </div>

        {!collapsedSections.staff && (
          <div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Tasks Completed vs Pending */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">المهام المكتملة مقابل المعلقة</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-600">مكتملة</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 leading-tight">{staffData.tasksCompleted}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full transition-all"
                        style={{ width: `${(staffData.tasksCompleted / (staffData.tasksCompleted + staffData.tasksPending)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-gray-600">معلقة</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 leading-tight">{staffData.tasksPending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all"
                        style={{ width: `${(staffData.tasksPending / (staffData.tasksCompleted + staffData.tasksPending)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Distribution */}
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">توزيع المهام حسب الفئة</h4>
                <div className="space-y-3">
                  {staffData.taskDistribution.map((task, i) => {
                    const max = maxValue(staffData.taskDistribution.map(t => t.count));
                    const colors = ["#0A1A44", "#FDBF00", "#CD7F32", "#C0C0C0"];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 w-20 leading-tight">{task.category}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(task.count / max) * 100}%`,
                              backgroundColor: colors[i]
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-12 text-left leading-tight">{task.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Staff Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-[#0A1A44]" />
                  <span className="text-xs font-medium text-gray-600">متوسط وقت الإكمال</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{staffData.avgCompletionTime} ساعة</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-[#F4F6FA] rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-4 leading-tight">أفضل الموظفين أداءً</h4>
              <div className="space-y-3">
                {staffData.topPerformers.map((performer, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0A1A44] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {performer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{performer.name}</p>
                        <p className="text-xs font-normal text-gray-600 leading-relaxed">مهام: {performer.tasks} | تقييم: {performer.rating}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-[#FDBF00]" />
                      <span className="text-xs font-bold text-gray-900 leading-tight">{performer.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
