import React, { useState, useEffect } from "react";
import {
  Eye,
  Download,
  X,
  Filter,
  RotateCcw,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import type { AuditLog } from "../services/auditLogApi";
import {
  getAuditLogs,
  getAuditLogFilters,
  getAuditStats
} from "../services/auditLogApi";

type AuditStatus = "نجح" | "فشل";

interface Filters {
  logId: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  dateFrom: string;
  dateTo: string;
  status: "" | AuditStatus;
}

const colors = {
  primaryDark: "#1F3A5F",
  primaryBlue: "#244A73",
  accentBlue: "#2EA7C9",
  accentOrange: "#F4A623",
  background: "#F4F6F9",
  white: "#FFFFFF",
  border: "#E5E7EB",
  success: "#28A745",
  warning: "#FFC107",
  danger: "#DC3545",
  info: "#17A2B8",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
} as const;

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<Filters>({
    logId: "",
    userName: "",
    role: "",
    action: "",
    module: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    today: 0
  });

  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [moduleOptions, setModuleOptions] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  // Fetch Stats and Options on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, filterData] = await Promise.all([
          getAuditStats(),
          getAuditLogFilters()
        ]);
        setStats(statsData);
        setActionOptions(filterData.actions);
        setModuleOptions(filterData.modules);
        setRoleOptions(filterData.roles);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchData();
  }, []);

  // Fetch Logs when Filters or Page Changes
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await getAuditLogs({
          ...filters,
          page: currentPage,
          limit: itemsPerPage
        });
        setLogs(response.logs);
        setTotalLogs(response.total);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce basic text inputs slightly if needed, but for now direct call
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalLogs / itemsPerPage));

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      logId: "",
      userName: "",
      role: "",
      action: "",
      module: "",
      dateFrom: "",
      dateTo: "",
      status: "",
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const isSuccess = status === "نجح";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: isSuccess ? `${colors.success}15` : `${colors.danger}15`,
          color: isSuccess ? colors.success : colors.danger,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">
          <div
            className="flex flex-col sm:flex-row justify-between items-stretch sm:items-start mb-6 gap-4"
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(20px, 5vw, 28px)",
                  fontWeight: 700,
                  color: colors.primaryDark,
                  margin: "0 0 8px 0",
                }}
              >
                سجل العمليات
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: colors.gray[600],
                  margin: 0,
                }}
              >
                عرض جميع العمليات التي تمت داخل النظام
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  minWidth: "fit-content",
                  padding: "10px 16px",
                  backgroundColor: colors.gray[200],
                  color: colors.gray[700],
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <RotateCcw size={14} />
                مسح الفلاتر
              </button>
              <button
                style={{
                  flex: 1,
                  minWidth: "fit-content",
                  padding: "10px 16px",
                  backgroundColor: colors.accentOrange,
                  color: colors.white,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <Download size={14} />
                تصدير السجل
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {([
              { label: "إجمالي السجلات", value: stats.total, icon: FileText, color: colors.accentBlue },
              { label: "العمليات الناجحة", value: stats.successful, icon: CheckCircle, color: colors.success },
              { label: "العمليات الفاشلة", value: stats.failed, icon: XCircle, color: colors.danger },
              { label: "سجلات اليوم", value: stats.today, icon: Calendar, color: colors.info },
            ] as const).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: `${stat.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: stat.color,
                        marginBottom: "2px",
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: colors.gray[600],
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-border"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Filter size={18} color={colors.primaryDark} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.primaryDark, margin: 0 }}>تصفية السجلات</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: colors.gray[700], marginBottom: "6px" }}>رقم السجل</label>
                <input
                  type="text"
                  value={filters.logId}
                  onChange={(e) => handleFilterChange("logId", e.target.value)}
                  placeholder="مثال: LOG-001"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: colors.gray[700], marginBottom: "6px" }}>اسم المستخدم</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={filters.userName}
                    onChange={(e) => handleFilterChange("userName", e.target.value)}
                    placeholder="ابحث باسم المستخدم"
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 12px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "'Cairo', sans-serif",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                  />
                  <span style={{ position: "absolute", right: 12, top: 11, color: colors.gray[600] }}>
                    <Search size={14} />
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: colors.gray[700], marginBottom: "6px" }}>الدور</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                    backgroundColor: colors.white,
                    cursor: "pointer",
                  }}
                >
                  <option value="">جميع الأدوار</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: colors.gray[700], marginBottom: "6px" }}>العملية</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                    backgroundColor: colors.white,
                    cursor: "pointer",
                  }}
                >
                  <option value="">جميع العمليات</option>
                  {actionOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: colors.gray[700], marginBottom: "6px" }}>القسم</label>
                <select
                  value={filters.module}
                  onChange={(e) => handleFilterChange("module", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                    backgroundColor: colors.white,
                    cursor: "pointer",
                  }}
                >
                  <option value="">جميع الأقسام</option>
                  {moduleOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden max-w-full">
            <div className="overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr style={{ backgroundColor: colors.gray[50], borderBottom: `2px solid ${colors.border}` }}>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>رقم السجل</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>اسم المستخدم</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>الدور</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>العملية</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>القسم</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], minWidth: "200px" }}>الوصف</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>الحالة</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>التاريخ والوقت</th>
                    <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: colors.gray[700], whiteSpace: "nowrap" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "24px", textAlign: "center", color: colors.gray[600] }}>
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "24px", textAlign: "center", color: colors.gray[600] }}>
                        لا توجد سجلات
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        style={{ borderBottom: `1px solid ${colors.border}`, transition: "background-color 0.2s", cursor: "default" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#F0F9FF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td style={{ padding: "16px", fontSize: "14px", color: colors.gray[900], fontWeight: 600 }}>{log.id}</td>
                        <td style={{ padding: "16px", fontSize: "14px", color: colors.gray[900] }}>{log.userName}</td>
                        <td style={{ padding: "16px", fontSize: "13px", color: colors.gray[600] }}>{log.role}</td>
                        <td style={{ padding: "16px", fontSize: "13px", color: colors.gray[900], fontWeight: 500 }}>{log.action}</td>
                        <td style={{ padding: "16px", fontSize: "13px", color: colors.gray[600] }}>{log.module}</td>
                        <td style={{ padding: "16px", fontSize: "13px", color: colors.gray[600], maxWidth: "250px" }}>{log.description}</td>
                        <td style={{ padding: "16px" }}>{getStatusBadge(log.status)}</td>
                        <td style={{ padding: "16px", fontSize: "13px", color: colors.gray[600], direction: "ltr", textAlign: "right" }}>{new Date(log.dateTime).toLocaleString('en-US')}</td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <button
                            onClick={() => handleViewDetails(log)}
                            style={{
                              padding: "8px",
                              backgroundColor: `${colors.accentBlue}15`,
                              color: colors.accentBlue,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.accentBlue;
                              e.currentTarget.style.color = colors.white;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = `${colors.accentBlue}15`;
                              e.currentTarget.style.color = colors.accentBlue;
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 sm:px-6"
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
              <div
                className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ color: colors.gray[600] }}
              >
                {logs.length === 0
                  ? "لا توجد سجلات مطابقة"
                  : `عرض ${(currentPage - 1) * itemsPerPage + 1} إلى ${Math.min(currentPage * itemsPerPage, totalLogs)} من ${totalLogs} سجل`}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                    borderRadius: "6px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronRight size={16} />
                </button>

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
                    <span
                      key={`el-${i}`}
                      style={{
                        padding: "0 4px",
                        color: colors.gray[600],
                        fontSize: "14px",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      style={{
                        padding: "8px 12px",
                        border: `1px solid ${currentPage === p ? colors.accentBlue : colors.border}`,
                        backgroundColor: currentPage === p ? colors.accentBlue : colors.white,
                        color: currentPage === p ? colors.white : colors.gray[700],
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: currentPage === p ? 600 : 400,
                        fontSize: "14px",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  )
                )}


                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                    borderRadius: "6px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedLog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "85vh",
              overflow: "auto",
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, color: colors.primaryDark, fontSize: 18, fontWeight: 700 }}>تفاصيل العملية</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6 }}
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>
            <pre style={{ margin: 0, direction: "ltr", textAlign: "left", background: colors.gray[50], padding: 16, borderRadius: 8, border: `1px solid ${colors.border}` }}>
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
