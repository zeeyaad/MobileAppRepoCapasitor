import { useEffect, useState, type CSSProperties, type ElementType } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import {
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Home,
  Image,
  LayoutDashboard,
  MapPin,
  ScrollText,
  Shield,
  Trophy,
  User,
  UserPlus,
  Users,
  Dumbbell,
  Link2,
  Building,
} from "lucide-react";
import { PAYMENT_ALERTS } from "../../../data/paymentsData";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../hooks/useLanguage";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SidebarItem = {
  title: string;
  icon: ElementType;
  path: string;
  privilege?: string | null;
};

type SidebarGroup = {
  label: string;
  collapsible: boolean;
  items: SidebarItem[];
};

// ─── Groups ────────────────────────────────────────────────────────────────────

const SIDEBAR_GROUPS: SidebarGroup[] = [
  // ── 1. الرئيسية ───────────────────────────────────────────────────────────
  {
    label: "groups.home",
    collapsible: false,
    items: [
      {
        title: "nav.dashboard",
        icon: LayoutDashboard,
        path: "/staff/dashboard",
        privilege: "dashboard.view",
      },
    ],
  },
  // ── 2. الأعضاء ────────────────────────────────────────────────────────────
  {
    label: "groups.members",
    collapsible: false,
    items: [
      {
        title: "nav.registrations",
        icon: ClipboardList,
        path: "/staff/dashboard/registrations",
        privilege: "MANAGE_MEMBERSHIP_REQUEST",
      },
      {
        title: "nav.membersManage",
        icon: Users,
        path: "/staff/dashboard/members/manage",
        privilege: "VIEW_MEMBERS",
      },
      {
        title: "nav.membersNew",
        icon: UserPlus,
        path: "/staff/dashboard/members/new",
        privilege: "CREATE_MEMBER",
      },
      {
        title: "nav.membersNewTeam",
        icon: UserPlus,
        path: "/staff/dashboard/members/new-team-member",
        privilege: "ADD_TEAM_MEMBER",
      },
    ],
  },
  // ── 3. العمليات اليومية ───────────────────────────────────────────────────
  {
    label: "groups.dailyOps",
    collapsible: false,
    items: [
      {
        title: "nav.bookings",
        icon: CalendarCheck,
        path: "/staff/dashboard/sports/bookings",
        privilege: "VIEW_SPORTS",
      },
      {
        title: "nav.invitations",
        icon: Link2,
        path: "/staff/dashboard/sports/invitations",
        privilege: "VIEW_SPORTS",
      },
    ],
  },
  // ── 4. إدارة الرياضات ─────────────────────────────────────────────────────
  {
    label: "groups.sports",
    collapsible: true,
    items: [
      {
        title: "nav.sports",
        icon: Trophy,
        path: "/staff/dashboard/sports",
        privilege: "VIEW_SPORTS",
      },
      {
        title: "nav.teams",
        icon: Users,
        path: "/staff/dashboard/sports/teams",
        privilege: "VIEW_TEAMS",
      },
      {
        title: "nav.courts",
        icon: MapPin,
        path: "/staff/dashboard/sports/courts",
        privilege: "VIEW_FIELDS",
      },
      {
        title: "nav.assignSports",
        icon: Shield,
        path: "/staff/dashboard/members/sports",
        privilege: "ASSIGN_SPORT_TO_MEMBER",
      },
      {
        title: "nav.sportsView",
        icon: Users,
        path: "/staff/dashboard/members/sports-view",
        privilege: "VIEW_TEAM_MEMBERS",
      },
    ],
  },
  // ── 5. المالية والخدمات ───────────────────────────────────────────────────
  {
    label: "groups.finance",
    collapsible: true,
    items: [
      { title: "nav.subscriptions", icon: CreditCard, path: "/staff/dashboard/finance/subscriptions", privilege: "VIEW_FINANCE" },
      { title: "nav.memberships", icon: BadgeCheck, path: "/staff/dashboard/memberships", privilege: "VIEW_MEMBERSHIP_PLANS" },
      { title: "nav.media", icon: Image, path: "/staff/dashboard/media-gallery" },
    ],
  },
  // ── 6. الموظفون ───────────────────────────────────────────────────────────
  {
    label: "groups.staff",
    collapsible: true,
    items: [
      { title: "nav.staffNew", icon: UserPlus, path: "/staff/dashboard/admin/staff/new", privilege: "CREATE_STAFF" },
      { title: "nav.staffManage", icon: Users, path: "/staff/dashboard/admin/staff/manage", privilege: "VIEW_STAFF" },
    ],
  },
  // ── 7. النظام ─────────────────────────────────────────────────────────────
  {
    label: "groups.system",
    collapsible: true,
    items: [
      { title: "nav.branches", icon: Building, path: "/staff/dashboard/branches", privilege: "VIEW_BRANCHES" },
      { title: "nav.faculties", icon: Building, path: "/staff/dashboard/faculties", privilege: "VIEW_FACULTIES" },
      { title: "nav.professions", icon: Briefcase, path: "/staff/dashboard/professions", privilege: "VIEW_PROFESSIONS" },
      { title: "nav.privilegePackages", icon: Shield, path: "/staff/dashboard/admin/privilege-packages", privilege: "VIEW_PRIVILEGES" },
      { title: "nav.assignPrivileges", icon: Shield, path: "/staff/dashboard/admin/staff/assign-privileges", privilege: "VIEW_PRIVILEGES" },
      { title: "nav.revokePrivileges", icon: Shield, path: "/staff/dashboard/admin/staff/revoke-privileges", privilege: "VIEW_PRIVILEGES" },
      { title: "nav.auditLog", icon: ScrollText, path: "/staff/dashboard/audit-log", privilege: "VIEW_AUDIT_LOGS" },
    ],
  },
];

// ─── Member-only nav ───────────────────────────────────────────────────────────

const MEMBER_SIDEBAR_ITEMS: SidebarItem[] = [
  { title: "member.home", icon: Home, path: "/member/dashboard/home" },
  { title: "member.profile", icon: User, path: "/member/dashboard/profile" },
  { title: "member.memberships", icon: CreditCard, path: "/member/dashboard/memberships" },
  { title: "member.sports", icon: Trophy, path: "/member/dashboard/sports" },
  { title: "member.subscribe", icon: Dumbbell, path: "/member/dashboard/subscribe" },
  { title: "member.courts", icon: MapPin, path: "/member/dashboard/courts" },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const { t } = useTranslation("nav");
  const { isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { hasPrivilege, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isMember = user?.role === "MEMBER";
  const compactMode = collapsed && !isMobile;
  const sidebarWidth = isMobile ? "256px" : (collapsed ? "60px" : "256px");

  // ── Sidebar width via CSS var ──────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      setIsMobile(isSmall);
      document.documentElement.style.setProperty(
        "--sidebar-width",
        isSmall ? "0px" : (collapsed ? "60px" : "256px")
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
      return;
    }

    onMobileClose();
  }, [isMobile, onMobileClose]);

  useEffect(() => {
    if (isMobile) {
      onMobileClose();
    }
  }, [currentPath, isMobile, onMobileClose]);

  // ── Auto-expand group containing active route ──────────────────────────────
  useEffect(() => {
    const activeGroup = SIDEBAR_GROUPS.find(
      g =>
        g.collapsible &&
        g.items.some(
          item =>
            currentPath === item.path ||
            (item.path !== "/staff/dashboard" && currentPath.startsWith(item.path))
        )
    );
    if (activeGroup) {
      setOpenGroups(prev => new Set([...prev, activeGroup.label]));
    }
  }, [currentPath]);

  // ── Toggle collapsible group ───────────────────────────────────────────────
  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // ── Active detection ───────────────────────────────────────────────────────
  const isActive = (path: string) =>
    currentPath === path ||
    (path !== "/staff/dashboard" && currentPath.startsWith(path));

  // ── Privilege filter ───────────────────────────────────────────────────────
  const filterItems = (items: SidebarItem[]): SidebarItem[] => {
    if (user?.role === "ADMIN") return items;
    return items.filter(item => !item.privilege || hasPrivilege(item.privilege));
  };

  // ── Payment alert helpers ──────────────────────────────────────────────────
  const hasPaymentAlert = (path: string) =>
    path.includes("finance/subscriptions") && PAYMENT_ALERTS.length > 0;

  const paymentCountLabel =
    PAYMENT_ALERTS.length > 9 ? "9+" : String(PAYMENT_ALERTS.length);

  // ── Render single nav item ─────────────────────────────────────────────────
  const renderItem = (item: SidebarItem) => {
    const active = isActive(item.path);
    const hasAlert = hasPaymentAlert(item.path);

    if (compactMode) {
      return (
        <RouterNavLink
          key={item.path}
          to={item.path}
          title={t(item.title)}
          onClick={isMobile ? onMobileClose : undefined}
          className={`relative mx-auto mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150 ${active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-white/80 hover:bg-white/15 hover:text-white"
            }`}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {hasAlert && (
            <span className="absolute top-0.5 end-0.5 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-[#214474]" />
          )}
        </RouterNavLink>
      );
    }

    return (
      <RouterNavLink
        key={item.path}
        to={item.path}
        onClick={isMobile ? onMobileClose : undefined}
        className={`mx-2 mb-0.5 flex h-10 items-center gap-3 rounded-lg border-s-[3px] px-3 transition-all duration-150 ${active
          ? "bg-primary border-primary text-primary-foreground font-semibold shadow-sm"
          : "border-transparent text-white/85 hover:bg-white/10 hover:text-white"
          }`}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1 text-sm font-medium leading-none">{t(item.title)}</span>
        {hasAlert && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0">
            {paymentCountLabel}
          </span>
        )}
      </RouterNavLink>
    );
  };

  // ── Render group label / collapsible header ────────────────────────────────
  const renderGroupHeader = (group: SidebarGroup) => {
    if (compactMode) return null; // no labels in icon-only mode

    if (!group.collapsible) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 mt-4">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 whitespace-nowrap px-1">
            {t(group.label)}
          </span>
          <div className="h-px flex-1 bg-white/15" />
        </div>
      );
    }

    const isOpen = openGroups.has(group.label);
    return (
      <button
        onClick={() => toggleGroup(group.label)}
        className="w-full flex items-center gap-2 px-3 py-1.5 mt-4 rounded-md hover:bg-white/10 transition-colors"
      >
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 whitespace-nowrap px-1 flex items-center gap-1">
          {t(group.label)}
          <ChevronLeft
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "-rotate-90" : ""
              }`}
          />
        </span>
        <div className="h-px flex-1 bg-white/15" />
      </button>
    );
  };

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label={t("sidebar.collapse")}
          onClick={onMobileClose}
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/35 md:hidden"
        />
      )}

      <aside
        className={`fixed start-0 top-16 bottom-0 z-50 flex flex-col border-e border-[#2a5489] transition-all duration-200 ease-in-out md:z-30 ${isMobile
          ? (mobileOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full"))
          : "translate-x-0"
          }`}
        style={{ backgroundColor: "#214474", width: sidebarWidth }}
      >
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto py-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as CSSProperties}
      >
        {isMember ? (
          // Member-only nav ─────────────────────────────────────────────────
          <div className={compactMode ? "flex flex-col items-center gap-0.5 pt-1" : ""}>
            {MEMBER_SIDEBAR_ITEMS.map(item => renderItem(item))}
          </div>
        ) : (
          // Staff nav groups ─────────────────────────────────────────────────
          SIDEBAR_GROUPS.map(group => {
            const visibleItems = filterItems(group.items);
            if (visibleItems.length === 0) return null;

            const isOpen = !group.collapsible || openGroups.has(group.label);

            return (
              <div key={group.label}>
                {renderGroupHeader(group)}

                {group.collapsible ? (
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className={`pt-1 ${compactMode ? "flex flex-col items-center gap-0.5" : ""}`}>
                          {visibleItems.map(item => renderItem(item))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className={`pt-1 ${compactMode ? "flex flex-col items-center gap-0.5" : ""}`}>
                    {visibleItems.map(item => renderItem(item))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* ── Profile link (staff only) ────────────────────────────────────────── */}
      {!isMember && (
        <div className={`border-t border-white/10 py-2 ${compactMode ? "flex justify-center" : ""}`}>
          {renderItem({ title: "nav.profile", icon: User, path: "/staff/dashboard/profile" })}
        </div>
      )}

      {/* ── Expand / Collapse toggle ─────────────────────────────────────────── */}
      {!isMobile && (
        <div className="border-t border-white/10 px-2 py-3">
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-white transition-all duration-150 hover:bg-white/10"
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
