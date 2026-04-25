import { useEffect, useMemo, useState } from "react";
import { ChevronDown, X, Search, CheckSquare, Square } from "lucide-react";
import api from "../api/axios";
import { useToast } from "../hooks/use-toast";

// ─── Brand tokens (unchanged) ────────────────────────────────────────────────
const theme = {
  primaryDark: "#1F3A5F",
  accentBlue: "#2EA7C9",
  background: "#F4F6F9",
  border: "#E5E7EB",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type PrivilegeItem = { id: number; name: string };
type ModuleItem = { id: string; name: string; privileges: PrivilegeItem[] };

// ─── Fallback mock data ───────────────────────────────────────────────────────
const mockModules: ModuleItem[] = [
  { id: "members", name: "إدارة الأعضاء", privileges: [{ id: -1, name: "إضافة عضو" }, { id: -2, name: "تعديل بيانات عضو" }, { id: -3, name: "حذف عضو" }, { id: -4, name: "طباعة بطاقة عضو" }] },
  { id: "teams", name: "إدارة الفرق", privileges: [{ id: -5, name: "إضافة فريق" }, { id: -6, name: "تعديل فريق" }, { id: -7, name: "حذف فريق" }] },
  { id: "media", name: "الوسائط", privileges: [{ id: -8, name: "إضافة وسائط" }, { id: -9, name: "حذف وسائط" }] },
  { id: "finance", name: "إدارة المالية", privileges: [{ id: -10, name: "عرض البيانات المالية" }, { id: -11, name: "إنشاء معاملة" }, { id: -12, name: "تعديل معاملة" }, { id: -13, name: "حذف معاملة" }] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toModuleId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const moduleNameTranslations: Record<string, string> = {
  members: "الأعضاء", member: "العضو", member_types: "أنواع الأعضاء",
  team_members: "أعضاء الفريق", membership_plans: "خطط العضوية",
  staff: "الموظفون", staff_types: "أنواع الموظفين", finance: "الشؤون المالية",
  events: "الفعاليات", sports: "الأنشطة الرياضية", maintenance: "الصيانة",
  media: "الوسائط", media_center: "المركز الإعلامي", mediagallery: "معرض الوسائط",
  faculties: "الكليات", professions: "المهن", admin: "الإدارة",
  privilege_management: "إدارة الصلاحيات", package_management: "إدارة الحزم",
  general: "عام", teams: "الفرق", reports: "التقارير", tasks: "المهام",
  audit: "سجلات التدقيق",
};

const getArabicModuleName = (name: string): string => {
  const key = name.toLowerCase().trim().replace(/[-\s]/g, "_");
  return moduleNameTranslations[key] ?? moduleNameTranslations[name.toLowerCase().trim()] ?? name;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrivilegePackageAdminPage() {
  const { toast } = useToast();

  // Form fields
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Privilege data
  const [modules, setModules] = useState<ModuleItem[]>(mockModules);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selectedPrivileges, setSelectedPrivileges] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // UX state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [globalSearch, setGlobalSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "selected" | "unselected">("all");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "privileges" | "selected">("form");

  // ── Load privileges from API ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ data?: Record<string, unknown[]> }>("/staff/privileges");
        const grouped = res?.data?.data;
        if (!grouped || Array.isArray(grouped) || typeof grouped !== "object") return;

        const apiModules: ModuleItem[] = Object.entries(grouped as Record<string, unknown[]>)
          .map(([moduleName, list]) => ({
            id: toModuleId(moduleName),
            name: getArabicModuleName(moduleName),
            privileges: Array.isArray(list)
              ? list
                .map((item) => {
                  const priv = item as Record<string, unknown>;
                  const id = Number(priv?.id);
                  const name = String(priv?.name_ar || priv?.name_en || priv?.code || priv?.id || "").trim();
                  return { id, name };
                })
                .filter((p) => Number.isFinite(p.id) && p.id > 0 && p.name)
              : [],
          }))
          .filter((m) => m.privileges.length > 0);

        if (apiModules.length > 0) {
          setModules(apiModules);
          // Default: expand the first module
          setExpandedModules(new Set([apiModules[0].id]));
        }
      } catch {
        // keep fallback
        setExpandedModules(new Set([mockModules[0].id]));
      } finally {
        setLoadingModules(false);
      }
    };
    void load();
  }, []);

  // ── Computed values ────────────────────────────────────────────────────────

  const totalPrivileges = useMemo(() => modules.reduce((s, m) => s + m.privileges.length, 0), [modules]);
  const selectedCount = selectedPrivileges.size;


  // Filtered modules for center column
  const filteredModules = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return modules
      .map((m) => {
        let privs = m.privileges;
        if (q) privs = privs.filter((p) => p.name.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
        if (viewFilter === "selected") privs = privs.filter((p) => selectedPrivileges.has(p.id));
        if (viewFilter === "unselected") privs = privs.filter((p) => !selectedPrivileges.has(p.id));
        return { ...m, privileges: privs };
      })
      .filter((m) => m.privileges.length > 0);
  }, [modules, globalSearch, viewFilter, selectedPrivileges]);

  // Sidebar: selected items grouped by module, filtered by sidebarSearch
  const sidebarGroups = useMemo(() => {
    const sq = sidebarSearch.trim().toLowerCase();
    return modules
      .map((m) => ({
        moduleId: m.id,
        moduleName: m.name,
        items: m.privileges.filter(
          (p) => selectedPrivileges.has(p.id) && (!sq || p.name.toLowerCase().includes(sq))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [modules, selectedPrivileges, sidebarSearch]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const togglePrivilege = (id: number) => {
    setSelectedPrivileges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleModule = (moduleId: string) => {
    const m = modules.find((x) => x.id === moduleId);
    if (!m) return;
    setSelectedPrivileges((prev) => {
      const next = new Set(prev);
      const allSel = m.privileges.every((p) => next.has(p.id));
      if (allSel) m.privileges.forEach((p) => next.delete(p.id));
      else m.privileges.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const toggleExpand = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  const handleReset = () => {
    setPackageName(""); setDescription(""); setSelectedPrivileges(new Set()); setError(""); setSidebarSearch(""); setGlobalSearch(""); setViewFilter("all");
  };

  const handleSave = async () => {
    setError("");
    if (!packageName.trim()) { setError("اسم الباقة مطلوب"); return; }
    if (selectedPrivileges.size === 0) { setError("يجب تحديد صلاحية واحدة على الأقل"); return; }
    const privilegeIds = Array.from(selectedPrivileges);
    if (privilegeIds.some((id) => id < 0)) {
      setError("الصلاحيات لم تُحمَّل من الخادم بعد. يرجى الانتظار أو تحديث الصفحة.");
      return;
    }
    setIsSaving(true);
    try {
      const code = packageName.trim().toUpperCase()
        .replace(/[\u0600-\u06FF\s]+/g, "_").replace(/[^A-Z0-9_]/g, "")
        .replace(/^_+|_+$/g, "") || `PKG_${Date.now()}`;
      await api.post("/staff/packages", {
        code, name_en: packageName.trim(), name_ar: packageName.trim(),
        description: description.trim() || undefined, privilege_ids: privilegeIds,
      });
      toast({ title: "تم الحفظ", description: "تم إنشاء الباقة على الخادم بنجاح" });
      handleReset();
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ الباقة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" dir="rtl" style={{ backgroundColor: theme.background }}>

      {/* ── Compact Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-1.5 sm:py-3 border-b bg-white shrink-0 gap-1.5 sm:gap-0" style={{ borderColor: theme.border }}>
        <div className="flex items-center justify-between sm:block">
          <h1 className="text-base sm:text-xl font-bold" style={{ color: theme.primaryDark }}>إنشاء باقة صلاحيات</h1>
          <p className="text-[10px] sm:text-xs text-gray-500 sm:mt-0.5">
            {loadingModules ? "⏳..." : `${totalPrivileges} صلاحية`}
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Progress pill */}
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-semibold border"
            style={{ borderColor: theme.accentBlue, color: theme.accentBlue, backgroundColor: `${theme.accentBlue}12` }}>
            <span>{selectedCount}</span>
            <span className="text-gray-400 font-normal">/</span>
            <span className="text-gray-500 font-normal">{totalPrivileges}</span>
            <span className="text-gray-500 font-normal text-[10px] hidden xs:inline">مختارة</span>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex sm:hidden bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === "form" ? "bg-white shadow-sm text-primaryDark" : "text-gray-500"}`}
              style={activeTab === "form" ? { color: theme.primaryDark } : {}}
            >
              التفاصيل
            </button>
            <button
              onClick={() => setActiveTab("privileges")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === "privileges" ? "bg-white shadow-sm text-primaryDark" : "text-gray-500"}`}
              style={activeTab === "privileges" ? { color: theme.primaryDark } : {}}
            >
              الاختيار
            </button>
            <button
              onClick={() => setActiveTab("selected")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === "selected" ? "bg-white shadow-sm text-primaryDark" : "text-gray-500"}`}
              style={activeTab === "selected" ? { color: theme.primaryDark } : {}}
            >
              المختارة
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 gap-0 flex-col sm:flex-row overflow-hidden">

        {/* ── LEFT: Package form ── */}
        <div className={`${activeTab === "form" ? "flex" : "hidden sm:flex"} flex-1 sm:flex-none sm:w-64 flex-col border-l overflow-y-auto bg-white`} style={{ borderColor: theme.border, WebkitOverflowScrolling: "touch" }}>
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">تفاصيل الباقة</p>

            {/* Package name */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">اسم الباقة *</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="مثال: باقة مدير الفرع"
                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50/50"
                style={{ borderColor: error && !packageName.trim() ? "#EF4444" : theme.border }}
              />
            </div>

            {/* Description */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">الوصف <span className="text-gray-400 font-normal">(اختياري)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر..."
                rows={3}
                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none bg-gray-50/50"
                style={{ borderColor: theme.border }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Stats */}
            <div className="rounded-xl p-2 sm:p-3 border space-y-1.5 sm:space-y-2" style={{ borderColor: theme.border, backgroundColor: `${theme.accentBlue}08` }}>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide">إحصاء</p>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-600">الصلاحيات المختارة</span>
                <span className="font-bold" style={{ color: theme.accentBlue }}>{selectedCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-600">الإجمالي</span>
                <span className="font-bold text-gray-700">{totalPrivileges}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1 sm:h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${totalPrivileges > 0 ? (selectedCount / totalPrivileges) * 100 : 0}%`, backgroundColor: theme.accentBlue }}
                />
              </div>
              <div className="text-[9px] sm:text-[10px] text-gray-400 text-left" dir="ltr">
                {totalPrivileges > 0 ? Math.round((selectedCount / totalPrivileges) * 100) : 0}%
              </div>
            </div>

            {/* Module breakdown */}
            {selectedCount > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">توزيع الوحدات</p>
                {modules.map((m) => {
                  const count = m.privileges.filter((p) => selectedPrivileges.has(p.id)).length;
                  if (count === 0) return null;
                  return (
                    <div key={m.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-gray-600 truncate">{m.name}</span>
                      <span className="shrink-0 font-semibold text-gray-800 mr-1">{count}/{m.privileges.length}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Modules accordion ── */}
        <div className={`${activeTab === "privileges" ? "flex" : "hidden sm:flex"} flex-1 flex-col min-w-0 min-h-0 border-l`} style={{ borderColor: theme.border }}>

          {/* Search + filter bar */}
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-white shrink-0" style={{ borderColor: theme.border }}>
            <div className="relative mb-2 sm:mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="ابحث في الوحدات..."
                className="w-full pr-9 sm:pr-10 pl-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: theme.border }}
              />
            </div>
            {/* Quick filter pills */}
            <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(["all", "selected", "unselected"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setViewFilter(f)}
                  className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap"
                  style={viewFilter === f
                    ? { backgroundColor: theme.primaryDark, color: "white" }
                    : { backgroundColor: theme.border, color: "#4B5563" }
                  }
                >
                  {f === "all" ? "الكل" : f === "selected" ? `المحددة (${selectedCount})` : "غير المحددة"}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
            {loadingModules ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white border animate-pulse" style={{ borderColor: theme.border }} />
              ))
            ) : filteredModules.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">لا توجد صلاحيات مطابقة للبحث</div>
            ) : (
              filteredModules.map((m) => {
                const isExpanded = expandedModules.has(m.id);
                const moduleSelected = m.privileges.filter((p) => selectedPrivileges.has(p.id)).length;
                const allSel = moduleSelected === m.privileges.length && m.privileges.length > 0;
                const someSel = moduleSelected > 0 && !allSel;

                return (
                  <div key={m.id} className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: theme.border }}>
                    {/* Module header */}
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(m.id)}>
                      <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "" : "-rotate-90"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{m.name}</p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400">{m.privileges.length} صلاحية</p>
                      </div>

                      {/* Selection badge */}
                      {moduleSelected > 0 && (
                        <span className="shrink-0 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: allSel ? theme.accentBlue : `${theme.accentBlue}99` }}>
                          {moduleSelected}/{m.privileges.length}
                        </span>
                      )}

                      {/* Select all / None toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleModule(m.id); }}
                        className="shrink-0 flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border transition-all hover:shadow-sm"
                        style={allSel
                          ? { borderColor: theme.accentBlue, color: theme.accentBlue, backgroundColor: `${theme.accentBlue}12` }
                          : { borderColor: theme.border, color: "#6B7280" }
                        }
                        title={allSel ? "إلغاء تحديد الكل" : "تحديد الكل"}
                      >
                        {allSel ? <CheckSquare className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : someSel ? <CheckSquare className="w-3 sm:w-3.5 h-3 sm:h-3.5 opacity-50" /> : <Square className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                        <span className="hidden xs:inline">{allSel ? "إلغاء الكل" : "تحديد الكل"}</span>
                      </button>
                    </div>

                    {/* Privilege chips */}
                    {isExpanded && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 flex flex-wrap gap-1.5 sm:gap-2 border-t" style={{ borderColor: theme.border }}>
                        {m.privileges.map((p) => {
                          const sel = selectedPrivileges.has(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => togglePrivilege(p.id)}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-medium transition-all duration-150 border"
                              style={sel
                                ? { backgroundColor: theme.accentBlue, color: "white", borderColor: theme.accentBlue }
                                : { backgroundColor: "white", color: "#374151", borderColor: theme.border }
                              }
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Selected privileges sidebar ── */}
        <div className={`${activeTab === "selected" ? "flex" : "hidden sm:flex"} flex-1 sm:flex-none sm:w-64 flex-col bg-white border-r min-h-0`} style={{ borderColor: theme.border }}>
          <div className="px-4 py-2 sm:py-3 border-b shrink-0" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">المختارة</p>
              {selectedCount > 0 && (
                <button
                  onClick={() => setSelectedPrivileges(new Set())}
                  className="text-[10px] sm:text-[11px] text-red-500 hover:text-red-600 transition-colors font-medium"
                >
                  مسح الكل
                </button>
              )}
            </div>
            {selectedCount > 0 && (
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="بحث..."
                  className="w-full pr-8 pl-2 py-1.5 text-[10px] sm:text-xs border rounded-lg focus:outline-none focus:ring-1 transition-all"
                  style={{ borderColor: theme.border }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3" style={{ WebkitOverflowScrolling: "touch" }}>
            {selectedCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-gray-400">
                <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accentBlue}12` }}>
                  <CheckSquare className="w-6 h-6" style={{ color: theme.accentBlue }} />
                </div>
                <p className="text-sm font-medium text-gray-500">لم تُحدَّد صلاحيات بعد</p>
                <p className="text-xs mt-1 leading-relaxed">اضغط على أي صلاحية في القائمة لإضافتها</p>
              </div>
            ) : sidebarGroups.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">لا توجد نتائج للبحث</p>
            ) : (
              <div className="space-y-4">
                {sidebarGroups.map((g) => (
                  <div key={g.moduleId}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">{g.moduleName}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: theme.accentBlue }}
                        >
                          {p.name}
                          <button
                            onClick={() => togglePrivilege(p.id)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            title="إزالة"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating action bar ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 border-t shrink-0"
        style={{ backgroundColor: "white", borderColor: theme.border }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-gray-600">
            <span className="font-bold" style={{ color: theme.accentBlue }}>{selectedCount}</span> <span className="hidden sm:inline">صلاحية مختارة</span>
            <span className="sm:hidden">مختارة</span>
          </span>
          {error && <span className="text-[10px] sm:text-xs text-red-500 truncate max-w-[100px] sm:max-w-none">{error}</span>}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
          >
            إلغاء
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
            style={{ backgroundColor: theme.primaryDark }}
          >
            {isSaving ? "جارٍ..." : "حفظ الباقة"}
          </button>
        </div>
      </div>
    </div>
  );
}
