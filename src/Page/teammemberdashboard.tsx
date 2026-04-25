import { useState, useEffect, useCallback, lazy, Suspense, memo } from "react";
import { useTranslation } from "react-i18next";
const hucLogo = "/assets/HUC logo.jpeg";
import { useAuth } from "../context/AuthContext";
import { AuthService } from "../services/authService";
import api from "../api/axios";
import { LanguageSwitcher } from "../Component/LanguageSwitcher";

// ─── Dashboard Features ──────────────────────────────────────
// ─── Dashboard Features ──────────────────────────────────────
import type { ToastType, EnrolledSport } from "../features/dashboard/types";
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const SportsExplorePage = lazy(() => import("../features/dashboard/pages/SportsExplorePage"));
const CourtRentalPage = lazy(() => import("../features/dashboard/pages/CourtRentalPage"));
const NotificationPanelLazy = lazy(() => import("../features/dashboard/NotificationPanel").then(m => ({ default: m.NotificationPanel })));
import { Toast } from "../features/dashboard/Toast";
import SportCard from "../features/dashboard/SportCard";
import { localizeDays } from "../features/dashboard/calendarUtils";

// ─── Types ──────────────────────────────────────────────────
interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    nationalId: string;
    joinDate: string;
    status: string; // added
    avatar: string | null;
    medicalReport: string | null;
    nationalIdFront: string | null;
    nationalIdBack: string | null;
    proof: string | null;
}

const getFullUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const fileBase = "http://localhost:3000";
    const normalizedPath = path.replace(/\\/g, "/");
    const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;

    return `${fileBase}${cleanPath}`;
};

const isAtLeast16YearsOld = (birthdate: string) => {
    const birth = new Date(birthdate);
    if (Number.isNaN(birth.getTime())) return false;
    const today = new Date();
    const minBirth = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return birth <= minBirth;
};

const mapTeamStatusLabel = (status?: string | null, t?: any): string => {
    const normalized = String(status ?? "").trim().toLowerCase();
    if (!normalized || normalized === "pending" || normalized === "pending_admin_approval" || normalized === "pending_payment") {
        return t ? t("sports.status.pending") : "قيد الانتظار";
    }
    if (normalized === "approved" || normalized === "active") {
        return t ? t("sports.status.active") : "نشط";
    }
    if (normalized === "expired" || normalized === "inactive" || normalized === "cancelled" || normalized === "declined") {
        return t ? t("sports.status.expired") : "منتهي";
    }
    return status ?? (t ? t("sports.status.pending") : "قيد الانتظار");
};

const normalizeSportName = (value: string): string =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

const looksLikeUuid = (value: string): boolean => {
    const v = String(value || "").trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
};

const getSportIconFromName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("قدم") || n.includes("كرة القدم") || n.includes("foot")) return "⚽";
    if (n.includes("سلة") || n.includes("كرة السلة") || n.includes("basket")) return "🏀";
    if (n.includes("تنس") || n.includes("tennis")) return "🎾";
    if (n.includes("سباح") || n.includes("السباحة") || n.includes("swim")) return "🏊";
    if (n.includes("طائر") || n.includes("الكرة الطائرة") || n.includes("volley")) return "🏐";
    return "🏅";
};

interface TeamLike {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
}

interface LastPaidSportCache {
    name: string;
    amount: number;
    teamId?: string;
    paidAt: number;
}

const toEnrolledSportFromTeam = (team: TeamLike, idx: number, t: any): EnrolledSport => ({
    id: Number(team.id) || 10000 + idx + 1,
    name: team.name || t("sports.unknown_sport"),
    icon: getSportIconFromName(team.name || ""),
    status: mapTeamStatusLabel(team.status, t) as EnrolledSport["status"],
    nextDay: t("notifications.time.now"),
    nextTime: "-",
    court: t("sports.court"),
    attended: 0,
    absent: 0,
    remaining: 0,
    total: 0,
    color: ["#16A34A", "#1F6FD5", "#F59E0B", "#DC2626"][idx % 4],
    weekdays: [],
    records: [],
    startDate: team.startDate,
    endDate: team.endDate,
    price: team.price,
});

const readLastPaidSportCache = (): LastPaidSportCache | null => {
    try {
        const raw = sessionStorage.getItem("tm_last_paid_sport");
        if (!raw) return null;
        const parsed = JSON.parse(raw) as LastPaidSportCache;
        if (!parsed?.name) return null;
        if (!parsed?.paidAt || Date.now() - parsed.paidAt > 60 * 60 * 1000) {
            sessionStorage.removeItem("tm_last_paid_sport");
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

interface Sport {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
}

interface AvailableSport {
    code: string;
    name_ar: string;
    name_en: string;
    price: number;
}

// ─── Icons ───────────────────────────────────────────────────
interface IconProps {
    d: string;
    size?: number;
}

const Icon = ({ d, size = 20 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    profile: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    sports: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z M12 8v4l3 3",
    explore: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    plus: "M12 5v14 M5 12h14",
    menu: "M4 6h16 M4 12h16 M4 18h16",
    close: "M18 6 6 18 M6 6l12 12",
    save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8",
    calendar: "M8 2v4 M16 2v4 M3 10h18 M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
    court: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
};

// ─── Sidebar ─────────────────────────────────────────────────
interface SidebarProps {
    activeNav: string;
    setActiveNav: (key: string) => void;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
    dir?: string;
}

const Sidebar = memo(({ activeNav, setActiveNav, setActiveTab, onLogout, isOpen, onClose, dir = 'rtl' }: SidebarProps) => {
    const { t } = useTranslation("team");
    const navItems = [
        { key: "dashboard", label: t("sidebar.dashboard"), icon: icons.home },
        { key: "profile", label: t("sidebar.profile"), icon: icons.profile },
        { key: "sports", label: t("sidebar.my_sports"), icon: icons.sports },
        { key: "available-sports", label: t("sidebar.explore_sports"), icon: icons.explore },
        { key: "courts", label: t("sidebar.court_booking"), icon: icons.court },
    ];

    const handleNav = (key: string) => {
        setActiveNav(key);
        setActiveTab(key);
        onClose();
    };

    const isRtl = dir === 'rtl';

    return (
        <aside
            dir={dir}
            aria-label={t("sidebar.dashboard")}
            className={`flex flex-col fixed top-16 h-[calc(100vh-64px)] z-50 w-[82vw] max-w-[300px] sm:w-[260px] bg-ds-navy shadow-2xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 ${
                isOpen 
                    ? "translate-x-0" 
                    : (isRtl ? "translate-x-full" : "-translate-x-full")
            }`}
            style={{
                [isRtl ? 'right' : 'left']: 0,
            }}
        >
            {/* Nav items */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = activeNav === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => handleNav(item.key)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-150 ${isActive ? 'bg-ds-primary text-white shadow-sm' : 'bg-transparent text-[#B8C7E0] hover:bg-white/5'}`}
                            style={{ textAlign: isRtl ? 'right' : 'left' }}
                        >
                            <Icon d={item.icon} size={18} />
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-4 pb-6">
                <button
                    onClick={onLogout}
                    aria-label={t("sidebar.logout")}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-150 text-[#B8C7E0] hover:bg-red-500/10 hover:text-red-400`}
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                    <Icon d={icons.logout} size={18} />
                    <span className="text-sm font-bold tracking-tight">{t("sidebar.logout")}</span>
                </button>
            </div>
        </aside>
    );
});

// ─── Navbar ──────────────────────────────────────────────────
interface NavbarProps {
    member: Member;
    notifications: any[];
    onToggleNotifications: () => void;
    showNotifs: boolean;
    onOpenSidebar: () => void;
    onMarkAllRead: () => void;
    onMarkRead: (id: number) => void;
    dir?: string;
}

const Navbar = memo(({ member, notifications, onToggleNotifications, showNotifs, onOpenSidebar, onMarkAllRead, onMarkRead, dir = 'rtl' }: NavbarProps) => {
    const { t } = useTranslation("team");
    return (
        <header
            dir={dir}
            role="banner"
            className="fixed top-0 z-40 flex items-center justify-between px-2.5 sm:px-4 lg:px-10 h-16 bg-white border-b border-[#E5E7EB] shadow-sm"
            style={{ insetInlineStart: 0, insetInlineEnd: 0 }}
        >
            {/* Start: Club brand */}
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white ring-1 ring-ds-border/50">
                    <img src={hucLogo} alt="HUC Logo" loading="eager" fetchPriority="high" width={40} height={40} decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="max-[420px]:hidden">
                    <p className="font-extrabold text-[15px] sm:text-[17px] text-ds-text-primary tracking-tight">{t("navbar.brand")}</p>
                </div>
            </div>

            {/* End: Member info & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6">
                {/* Language Switcher */}
                <div className="block scale-[0.9] sm:scale-100 origin-center">
                    <LanguageSwitcher />
                </div>

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={onToggleNotifications}
                        aria-label={t("navbar.notifications")}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${showNotifs ? 'bg-ds-primary-light text-ds-primary shadow-inner' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'}`}
                    >
                        <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" size={20} />
                        {notifications.some(n => !n.read) && (
                            <span className="absolute top-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm" style={{ insetInlineEnd: 6 }}></span>
                        )}
                    </button>
                    {showNotifs && (
                        <Suspense fallback={null}>
                            <NotificationPanelLazy
                                onClose={onToggleNotifications}
                                notifications={notifications}
                                onMarkAllRead={onMarkAllRead}
                                onMarkRead={onMarkRead}
                            />
                        </Suspense>
                    )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className={`${dir === 'rtl' ? 'text-right' : 'text-left'} hidden sm:block`}>
                        <p className="font-bold text-[13px] text-ds-text-primary leading-tight">{member.firstName} {member.lastName}</p>
                        <span className="text-[10px] px-3 py-0.5 rounded-full text-white font-black bg-ds-orange shadow-sm">
                            {t("navbar.role")}
                        </span>
                    </div>
                    {/* Avatar (User Icon) */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 border border-ds-border overflow-hidden ring-2 ring-ds-border/20">
                        {member.avatar ? (
                            <img
                                src={getFullUrl(member.avatar) || ""}
                                alt="Avatar"
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-black">{member.firstName?.charAt(0)}</span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onOpenSidebar}
                    aria-label={t("navbar.menu")}
                    className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 text-[#6B7280] hover:bg-gray-200 transition-all duration-200"
                    title={t("navbar.menu")}
                >
                    <Icon d={icons.menu} size={18} />
                </button>
            </div>
        </header>
    );
});

// ─── Logout Modal ─────────────────────────────────────────────
interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    dir?: string;
}

const LogoutModal = memo(({ isOpen, onClose, onConfirm, dir = 'rtl' }: LogoutModalProps) => {
    const { t } = useTranslation("team");
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                dir={dir}
                className="bg-[#F9FAFB] rounded-[12px] shadow-xl w-full max-w-[440px] overflow-hidden"
                style={{ fontFamily: "'Cairo', 'Segoe UI', Roboto, sans-serif" }}
            >
                {/* Header/Icon */}
                <div className="flex flex-col items-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <div className="text-[#2563EB]">
                            <Icon d={icons.logout} size={32} />
                        </div>
                    </div>

                    <h3 className="text-[22px] font-bold text-[#1F2937] text-center px-6">
                        {t("logout_modal.title")}
                    </h3>
                </div>

                {/* Body */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-[14px] leading-relaxed text-[#6B7280]">
                        {t("logout_modal.description")}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
                    <button
                        onClick={onConfirm}
                        className="flex-1 h-[44px] bg-[#DC2626] text-white text-[14px] font-semibold rounded-[8px] transition-all hover:bg-red-700 active:scale-95 sm:order-last"
                    >
                        {t("logout_modal.confirm")}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 h-[44px] bg-[#E5E7EB] text-[#111827] text-[14px] font-medium rounded-[8px] transition-all hover:bg-gray-300 active:scale-95"
                    >
                        {t("logout_modal.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
});

// ─── Profile Tab ─────────────────────────────────────────────
interface ProfileTabProps {
    member: Member;
    setMember: (updated: Member, files?: { [key: string]: File }) => void;
    dir?: string;
}

const ProfileTab = memo(({ member, setMember, dir = 'rtl' }: ProfileTabProps) => {
    const { t } = useTranslation("team");
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Member>({ ...member });
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [errors, setErrors] = useState<Partial<Record<keyof Member, string>>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

    const isArabic = (value: string) => /^[\u0600-\u06FF\s]+$/.test(value.trim());

    const validateField = (key: keyof Member, value: string) => {
        const trimmed = value.trim();

        switch (key) {
            case "firstName":
                if (!trimmed) return t("profile.validation.first_name_required");
                if (!isArabic(trimmed)) return t("profile.validation.first_name_arabic");
                return "";
            case "lastName":
                if (!trimmed) return t("profile.validation.last_name_required");
                if (!isArabic(trimmed)) return t("profile.validation.last_name_arabic");
                return "";
            case "email":
                if (!trimmed) return t("profile.validation.email_required");
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return t("profile.validation.email_invalid");
                return "";
            case "phone":
                if (!trimmed) return t("profile.validation.phone_required");
                if (!/^(010|011|012|015)\d{8}$/.test(trimmed)) return t("profile.validation.phone_invalid");
                return "";
            case "nationalId":
                if (!trimmed) return t("profile.validation.national_id_required");
                if (!/^[1-9]\d{13}$/.test(trimmed)) return t("profile.validation.national_id_invalid");
                return "";
            case "birthDate":
                if (!trimmed) return t("profile.validation.birth_date_required");
                if (!isAtLeast16YearsOld(trimmed)) return t("profile.validation.age_min");
                return "";
            default:
                return "";
        }
    };

    const validateProfileForm = () => {
        const nextErrors: Partial<Record<keyof Member, string>> = {};
        (["firstName", "lastName", "email", "phone", "birthDate", "nationalId"] as (keyof Member)[]).forEach((key) => {
            const message = validateField(key, String(form[key] || ""));
            if (message) nextErrors[key] = message;
        });
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleFileChange = (key: string, file: File | null) => {
        if (!file) return;
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            setFileErrors((prev) => ({ ...prev, [key]: t("profile.validation.file_unsupported") }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFileErrors((prev) => ({ ...prev, [key]: t("profile.validation.file_too_large") }));
            return;
        }
        setFileErrors((prev) => ({ ...prev, [key]: "" }));
        setSelectedFiles(prev => ({ ...prev, [key]: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!validateProfileForm()) return;
        if (Object.values(fileErrors).some(Boolean)) return;
        setMember({ ...form }, selectedFiles);
        setEditing(false);
        setPreviews({});
        setErrors({});
    };

    const handleCancel = () => {
        setForm({ ...member });
        setEditing(false);
        setSelectedFiles({});
        setPreviews({});
        setErrors({});
        setFileErrors({});
    };

    const fields: { key: keyof Member; label: string; type: string }[] = [
        { key: "firstName", label: t("profile.first_name"), type: "text" },
        { key: "lastName", label: t("profile.last_name"), type: "text" },
        { key: "email", label: t("profile.email"), type: "email" },
        { key: "phone", label: t("profile.phone"), type: "tel" },
        { key: "birthDate", label: t("profile.birth_date"), type: "date" },
        { key: "nationalId", label: t("profile.national_id"), type: "text" },
    ];

    const documents = [
        { key: "avatar", label: t("profile.avatar"), field: "personal_photo" },
        { key: "nationalIdFront", label: t("profile.national_id_front"), field: "national_id_front" },
        { key: "nationalIdBack", label: t("profile.national_id_back"), field: "national_id_back" },
        { key: "medicalReport", label: t("profile.medical_report"), field: "medical_report" },
        { key: "proof", label: t("profile.proof"), field: "proof" },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6" dir={dir}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-2 border-white shadow-soft"
                            style={{ backgroundColor: "#1E6FB9" }}>
                            {previews.personal_photo ? (
                                <img src={previews.personal_photo} alt="Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            ) : member.avatar ? (
                                <img
                                    src={getFullUrl(member.avatar) || ""}
                                    alt="Profile"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                member.firstName.charAt(0)
                            )}
                        </div>
                        <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                            <h2 className="font-bold text-base sm:text-lg" style={{ color: "#1F2937" }}>{member.firstName} {member.lastName}</h2>
                            <p className="text-sm" style={{ color: "#6B7280" }}>{t("profile.membership_id")}: {member.id}</p>
                        </div>
                    </div>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                            style={{ backgroundColor: "#2EA7C9" }}
                        >
                            <Icon d={icons.edit} size={15} />
                            {t("profile.edit_data")}
                        </button>
                    )}
                </div>
            </div>

            {/* Editable Fields */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6" dir={dir}>
                <h3 className="font-bold mb-5 text-base" style={{ color: "#1F2937" }}>{t("profile.personal_info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(({ key, label, type }) => (
                        <div key={key}>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7280" }}>
                                {label}
                            </label>
                            <input
                                type={type}
                                value={(form[key] as string) || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setForm({ ...form, [key]: value });
                                    if (editing) {
                                        const message = validateField(key, value);
                                        setErrors((prev) => ({ ...prev, [key]: message }));
                                    }
                                }}
                                disabled={!editing}
                                className="w-full px-4 py-2.5 rounded-lg text-sm border transition-all"
                                style={{
                                    borderColor: errors[key] ? "#DC2626" : editing ? "#2EA7C9" : "#E5E7EB",
                                    backgroundColor: editing ? "#fff" : "#F9FAFB",
                                    color: "#1F2937",
                                    outline: "none",
                                    textAlign: dir === 'rtl' ? 'right' : 'left',
                                }}
                            />
                            {errors[key] && (
                                <p className="text-[11px] mt-1" style={{ color: "#DC2626" }}>
                                    {errors[key]}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* Read-only join date */}
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7280" }}>
                            {t("profile.join_date")}
                        </label>
                        <input
                            type="text"
                            value={member.joinDate ? new Date(member.joinDate).toLocaleDateString() : "-"}
                            disabled
                            className="w-full px-4 py-2.5 rounded-lg text-sm border font-medium"
                            style={{
                                borderColor: "#E5E7EB",
                                backgroundColor: "#F3F4F6",
                                color: "#4B5563",
                                textAlign: dir === 'rtl' ? 'right' : 'left',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6" dir={dir}>
                <h3 className="font-bold mb-5 text-base" style={{ color: "#1F2937" }}>{t("profile.documents_title")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                    {documents.map((doc) => {
                        const currentUrl = member[doc.key as keyof Member] as string | null;
                        const preview = previews[doc.field];

                        return (
                            <div key={doc.key} className="flex flex-col gap-3">
                                <label className="text-xs font-semibold" style={{ color: "#374151" }}>{doc.label}</label>
                                <div
                                    className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group transition-all hover:border-blue-400"
                                >
                                    {preview ? (
                                        <img src={preview} alt="Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                    ) : currentUrl ? (
                                        currentUrl.toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <div className="text-red-500 mb-2">
                                                    <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" size={32} />
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-medium">ملف PDF</span>
                                                <a
                                                    href={getFullUrl(currentUrl) || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 text-[10px] text-blue-600 underline"
                                                >
                                                    عرض الملف
                                                </a>
                                            </div>
                                        ) : (
                                            <img
                                                src={getFullUrl(currentUrl) || ""}
                                                alt={doc.label}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Icon d={icons.plus} size={24} />
                                            <span className="text-[10px] mt-1">{t("profile.no_file")}</span>
                                        </div>
                                    )}

                                    {/* Edit Overlay */}
                                    {editing && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5">
                                                <Icon d={icons.edit} size={12} />
                                                {t("profile.change_file")}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => handleFileChange(doc.field, e.target.files?.[0] || null)}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                                {fileErrors[doc.field] && (
                                    <p className="text-[11px]" style={{ color: "#DC2626" }}>
                                        {fileErrors[doc.field]}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {editing && (
                    <div className={`flex flex-col sm:flex-row gap-3 mt-8 ${dir === 'rtl' ? 'sm:flex-row-reverse' : 'sm:flex-row'} border-t pt-6`} style={{ borderColor: "#F3F4F6" }} dir={dir}>
                        <button
                            onClick={handleCancel}
                            className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
                            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                        >
                            {t("logout_modal.cancel")}
                        </button>
                        <button
                            onClick={handleSave}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
                            style={{ backgroundColor: "#2EA7C9" }}
                        >
                            <Icon d={icons.save} size={15} />
                            {t("profile.save_changes")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

// ─── Sports Tab ───────────────────────────────────────────────
interface SportsTabProps {
    sports: EnrolledSport[];
    availableSports: AvailableSport[];
    onJoin: (sportCode: string, startDate: string, endDate: string) => void;
    onNavigateTo?: (tab: string) => void;
    dir?: string;
}

const SportsTab = memo(({ sports, availableSports, onJoin, onNavigateTo, dir = 'rtl' }: SportsTabProps) => {
    const { t, i18n } = useTranslation("team");
    const [showModal, setShowModal] = useState(false);
    const [newSportCode, setNewSportCode] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    });
    const [joinError, setJoinError] = useState("");

    const calculateTotalPrice = (startStr: string, endStr: string, monthlyPrice: number) => {
        if (!startStr || !endStr || startStr === "-" || endStr === "-") return 0;
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

        // Simple month difference
        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (end.getDate() < start.getDate()) {
            months--;
        }
        // At least 1 month if start < end
        if (months <= 0 && end > start) months = 1;
        return Math.max(0, months * monthlyPrice);
    };

    const handleJoin = () => {
        if (!newSportCode || !startDate || !endDate) {
            setJoinError(t("sports.validation.complete_fields"));
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            setJoinError(t("sports.validation.date_invalid"));
            return;
        }
        setJoinError("");
        onJoin(newSportCode, startDate, endDate);
        setShowModal(false);
        setNewSportCode("");
    };

    const currentLang = i18n.resolvedLanguage || i18n.language;

    return (
        <div dir={dir} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-base" style={{ color: "#1F2937" }}>
                    {t("sports.title")}
                </h2>
            </div>

            {/* Sports Grid */}
            {sports.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 text-center">
                    <p style={{ color: "#6B7280" }} className="text-sm">{t("sports.no_sports")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sports.map((sport) => (
                        <SportCard
                            key={sport.id}
                            title={currentLang.startsWith('ar') ? sport.name : (availableSports.find(s => s.name_ar === sport.name || s.name_en === sport.name)?.name_en || sport.name)}
                            image={sport.img || ""}
                            days={localizeDays(sport.nextDay || "-", currentLang.startsWith('ar'))}
                            time={sport.nextTime || "-"}
                            location={sport.court || t("sports.court")}
                            price={sport.price || 0}
                            joined={sport.status === "نشط" || sport.status === t("sports.status.active")}
                            status={sport.status}
                            endDate={sport.endDate || "-"}
                            onRejoin={() => onNavigateTo?.("available-sports")}
                        />
                    ))}
                </div>
            )}

            {/* Join Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" dir={dir}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-base" style={{ color: "#1F2937" }}>
                                {t("sports.join_new")}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
                                style={{ color: "#6B7280" }}
                            >
                                <Icon d={icons.close} size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Select sport */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7280" }}>
                                    {t("sports.select_sport")}
                                </label>
                                <select
                                    value={newSportCode}
                                    onChange={(e) => {
                                        setNewSportCode(e.target.value);
                                        if (joinError) setJoinError("");
                                    }}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm border"
                                    style={{
                                        borderColor: joinError && !newSportCode ? "#DC2626" : "#E5E7EB",
                                        color: "#1F2937",
                                        textAlign: dir === 'rtl' ? 'right' : 'left',
                                        outline: "none",
                                    }}
                                >
                                    <option value="">-- {t("sports.select_sport")} --</option>
                                    {availableSports.map((s) => (
                                        <option key={s.code} value={s.code}>{currentLang.startsWith('ar') ? s.name_ar : s.name_en}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7280" }}>
                                    {t("sports.start_date")}
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        if (joinError) setJoinError("");
                                    }}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm border"
                                    style={{ borderColor: joinError ? "#DC2626" : "#E5E7EB", color: "#1F2937", textAlign: dir === 'rtl' ? 'right' : 'left', outline: "none" }}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7280" }}>
                                    {t("sports.end_date")}
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        if (joinError) setJoinError("");
                                    }}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm border"
                                    style={{ borderColor: joinError ? "#DC2626" : "#E5E7EB", color: "#1F2937", textAlign: dir === 'rtl' ? 'right' : 'left', outline: "none" }}
                                />
                            </div>
                            {joinError && (
                                <p className="text-[12px] -mt-1" style={{ color: "#DC2626" }}>
                                    {joinError}
                                </p>
                            )}

                            {/* Dynamic Price Preview in Modal */}
                            {newSportCode && (
                                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-800">{t("sports.total_price")}:</span>
                                    <span className="text-sm font-bold text-emerald-700">
                                        {(() => {
                                            const s = availableSports.find(x => x.code === newSportCode);
                                            return calculateTotalPrice(startDate, endDate, s?.price || 0);
                                        })()} {t("sports.currency")}
                                    </span>
                                </div>
                            )}

                            {/* Info message */}
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    {t("sports.info_message")}
                                </p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
                                style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                            >
                                {t("logout_modal.cancel")}
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={!newSportCode}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
                                style={{ backgroundColor: "#1E6FB9" }}
                            >
                                {t("sports.confirm_join")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

// ─── Dashboard Home ───────────────────────────────────────────

// ─── Root App ─────────────────────────────────────────────────
export default function TeamMemberDashboard() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation("team");
    const [member, setMember] = useState<Member | null>(null);
    const [sports, setSports] = useState<EnrolledSport[]>([]);
    const [availableSports, setAvailableSports] = useState<AvailableSport[]>([]);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
    const [dashboardStats, setDashboardStats] = useState<{
        enrolledSports: EnrolledSport[];
        totalAttended: number;
        totalSessions: number;
    } | null>(null);
    const [teamMemberBookings, setTeamMemberBookings] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [currentLang, setCurrentLang] = useState<'ar' | 'en'>((i18n.resolvedLanguage ?? i18n.language).startsWith('en') ? 'en' : 'ar');

    useEffect(() => {
        const tab = new URLSearchParams(window.location.search).get("tab");
        if (!tab) return;

        const allowedTabs = ["dashboard", "profile", "sports", "available-sports", "courts"];
        if (!allowedTabs.includes(tab)) return;

        setActiveTab(tab);
        setActiveNav(tab);
    }, []);

    const showToast = useCallback((msg: string, type: ToastType) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3800);
    }, []);

    // ─── Sync with i18n language changes ────────────────────────────────────
    useEffect(() => {
        const handleLanguageChange = (lang: string) => {
            const isArabic = lang.startsWith('ar');
            setCurrentLang(isArabic ? 'ar' : 'en');
            const html = document.documentElement;
            html.setAttribute('lang', isArabic ? 'ar' : 'en');
            html.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
            document.body.style.direction = isArabic ? 'rtl' : 'ltr';
        };
        
        // Set initial language
        const isArabic = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');
        setCurrentLang(isArabic ? 'ar' : 'en');
        const html = document.documentElement;
        html.setAttribute('lang', isArabic ? 'ar' : 'en');
        html.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
        document.body.style.direction = isArabic ? 'rtl' : 'ltr';
        
        // Listen to i18n language changes
        i18n.on('languageChanged', handleLanguageChange);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    // ─── Set metadata ──────────────────────────────────────────────────────
    useEffect(() => {
        document.title = t("dashboard.meta_title");
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "description";
            document.head.appendChild(meta);
        }
        meta.content = t("dashboard.meta_description");
    }, [t]);

    const handleMarkAllRead = useCallback(() => {
        const userId = user?.team_member_id || user?.member_id;
        const storageKey = `read_notifs_${userId}`;
        const allIds = notifications.map(n => n.title + n.msg);
        localStorage.setItem(storageKey, JSON.stringify(allIds));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, [notifications, user?.member_id, user?.team_member_id]);

    const handleMarkRead = useCallback((id: number) => {
        const userId = user?.team_member_id || user?.member_id;
        const storageKey = `read_notifs_${userId}`;
        const target = notifications.find(n => n.id === id);
        if (target) {
            const readList = JSON.parse(localStorage.getItem(storageKey) || "[]");
            const idStr = target.title + target.msg;
            if (!readList.includes(idStr)) {
                readList.push(idStr);
                localStorage.setItem(storageKey, JSON.stringify(readList));
            }
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, [notifications, user?.member_id, user?.team_member_id]);

    useEffect(() => {
        if (!member) return;

        const newNotifs: any[] = [];
        let nId = 1;
        const now = new Date();
        const nowTime = now.getTime();

        const userId = user?.team_member_id || user?.member_id;
        const storageKey = `read_notifs_${userId}`;
        const readList = JSON.parse(localStorage.getItem(storageKey) || "[]");

        const isRead = (title: string, msg: string) => readList.includes(title + msg);

        // 1. Account Activation Notification
        if (member.joinDate) {
            const jd = new Date(member.joinDate).getTime();
            const diff = (nowTime - jd) / (1000 * 3600 * 24);
            if (diff <= 7) {
                const title = t("notifications.welcome_title");
                const msg = t("notifications.welcome_msg");
                newNotifs.push({
                    id: nId++,
                    icon: "⭐",
                    title,
                    msg,
                    time: diff < 1 ? t("notifications.time.today") : t("notifications.time.days_ago", { count: Math.floor(diff) }),
                    read: isRead(title, msg)
                });
            }
        }

        // 2. Training Today Notifications
        if (dashboardStats?.enrolledSports) {
            const todayIdx = now.getDay();
            dashboardStats.enrolledSports.forEach(s => {
                if (s.status === "نشط" && s.weekdays?.includes(todayIdx)) {
                    const title = t("notifications.training_today_title");
                    const msg = t("notifications.training_today_msg", { sport: s.name, time: s.nextTime });
                    newNotifs.push({
                        id: nId++,
                        icon: s.icon || "🏋️",
                        title,
                        msg,
                        time: t("notifications.time.now"),
                        read: isRead(title, msg)
                    });
                }

                // Recent Enrollment Notification
                if (s.createdAt) {
                    const cDate = new Date(s.createdAt).getTime();
                    const ageDays = (nowTime - cDate) / (1000 * 3600 * 24);
                    if (ageDays <= 2) {
                        const title = t("notifications.new_subscription_title");
                        const msg = t("notifications.new_subscription_msg", { sport: s.name });
                        newNotifs.push({
                            id: nId++,
                            icon: "🏆",
                            title,
                            msg,
                            time: ageDays < 1 ? t("notifications.time.today") : t("notifications.time.yesterday"),
                            read: isRead(title, msg)
                        });
                    }
                }
            });
        }

        // 3. Court Booking Notifications
        if (teamMemberBookings && teamMemberBookings.length > 0) {
            teamMemberBookings.forEach(b => {
                const bCreatedAt = b.created_at || b.createdAt;
                if (bCreatedAt) {
                    const cDate = new Date(bCreatedAt).getTime();
                    const ageDays = (nowTime - cDate) / (1000 * 3600 * 24);
                    if (ageDays <= 2) {
                        const title = t("notifications.court_booking_title");
                        const msg = t("notifications.court_booking_msg", { 
                            court: b.field?.name_ar || b.facility_name || (t("sports.court") || "الملعب"), 
                            date: b.date || b.start_time?.split('T')[0] 
                        });
                        newNotifs.push({
                            id: nId++,
                            icon: "🏟️",
                            title,
                            msg,
                            time: ageDays < 1 ? t("notifications.time.today") : t("notifications.time.yesterday"),
                            read: isRead(title, msg)
                        });
                    }
                }
            });
        }

        // 3. Sport Subscription Expiry Notifications (3 days before)
        if (dashboardStats?.enrolledSports) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            dashboardStats.enrolledSports.forEach((sport) => {
                if (!sport.endDate || sport.endDate === "-") return;
                const end = new Date(sport.endDate); end.setHours(0, 0, 0, 0);
                if (isNaN(end.getTime())) return;
                const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (daysLeft >= 0 && daysLeft <= 3) {
                    const title = t("notifications.expiry_title", { sport: sport.name });
                    const msg = daysLeft === 0
                        ? t("notifications.expiry_msg_today", { sport: sport.name })
                        : t("notifications.expiry_msg_days", { 
                            sport: sport.name, 
                            days: daysLeft, 
                            day_unit: daysLeft === 1 ? t("notifications.time.day") : t("notifications.time.days") 
                          });
                    newNotifs.push({
                        id: nId++,
                        icon: "⚠️",
                        title,
                        msg,
                        time: t("notifications.time.today"),
                        read: isRead(title, msg)
                    });
                }
            });
        }

        // 4. Default Notification fallback
        if (newNotifs.length === 0) {
            const title = t("notifications.important_notice_title");
            const msg = t("notifications.important_notice_msg");
            newNotifs.push({
                id: nId++,
                icon: "📢",
                title,
                msg,
                time: t("notifications.time.today"),
                read: isRead(title, msg)
            });
        }

        // Deduplicate by title/msg to avoid cluttering if multiple triggers overlap
        const uniqueNotifs = Array.from(new Map(newNotifs.map(item => [item.title + item.msg, item])).values());
        setNotifications(uniqueNotifs);
    }, [member, dashboardStats, teamMemberBookings, user?.team_member_id, t]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.team_member_id) {
                setLoading(false);
                return;
            }

            let profileTeams: TeamLike[] = [];
            try {
                setLoading(true);
                const profilePromise = AuthService.getTeamMemberDetails(user.team_member_id);
                const subscriptionsPromise = AuthService.getTeamMemberSubscriptions(user.team_member_id);
                const statsPromise = AuthService.getTeamMemberAttendanceStats(user.team_member_id);
                const bookingsPromise = api.get(`/team-members/${user.team_member_id}/bookings`);
                const availableSportsPromise = AuthService.getAllSports({ is_active: true, status: "active" });

                // 1. Fetch Profile (authoritative member data)
                const profileRes = await profilePromise;
                if (profileRes.success && profileRes.data) {
                    const d = profileRes.data;
                    const memberData = {
                        id: String(d.id),
                        firstName: d.firstNameAr || d.name_ar?.split(' ')[0] || "",
                        lastName: d.lastNameAr || d.name_ar?.split(' ').slice(1).join(' ') || "",
                        email: user.email || "",
                        phone: d.phone || "",
                        birthDate: d.birthdate || "",
                        address: d.address || "",
                        nationalId: d.national_id || "",
                        joinDate: d.created_at || d.createdAt || d.join_date || "",
                        status: d.status || "pending",
                        avatar: d.documents?.personal_photo_url || d.personal_photo_url || d.photo || null,
                        medicalReport: d.documents?.medical_report_url || d.medical_report_url || d.medical_report || null,
                        nationalIdFront: d.documents?.national_id_front_url || d.national_id_front_url || d.national_id_front || null,
                        nationalIdBack: d.documents?.national_id_back_url || d.national_id_back_url || d.national_id_back || null,
                        proof: d.documents?.proof_url || d.proof_url || d.proof || null,
                    };
                    setMember(memberData);

                    profileTeams = (d.teams || []).map((t: any, idx: number) => ({
                        id: String(t?.id || t?.team_id || t?.subscription_id || idx + 1),
                        name: (() => {
                            const candidate = String(
                                t?.name ||
                                t?.team_name ||
                                t?.team_name_ar ||
                                t?.sport_name_ar ||
                                t?.sport_name ||
                                ""
                            ).trim();
                            return candidate && !looksLikeUuid(candidate) ? candidate : "";
                        })(),
                        startDate: String(t?.startDate || t?.start_date || "-"),
                        endDate: String(t?.endDate || t?.end_date || "-"),
                        price: Number(t?.price || t?.monthly_fee || t?.training_fee || t?.slot_price || t?.fee || t?.amount || 0),
                        status: t?.payment_completed_at
                            ? "active"
                            : String(t?.status || t?.subscription_status || "pending"),
                    }));
                }

                const [subscriptionsSettled, statsSettled, bookingsSettled, availableSportsSettled] = await Promise.allSettled([
                    subscriptionsPromise,
                    statsPromise,
                    bookingsPromise,
                    availableSportsPromise,
                ]);

                // Merge subscriptions fallback into profileTeams
                if (subscriptionsSettled.status === "fulfilled") {
                    const subscriptionsRes = subscriptionsSettled.value;
                    const rawSubscriptions =
                        (Array.isArray(subscriptionsRes?.data?.subscriptions) && subscriptionsRes.data.subscriptions) ||
                        (Array.isArray(subscriptionsRes?.data) && subscriptionsRes.data) ||
                        (Array.isArray(subscriptionsRes?.subscriptions) && subscriptionsRes.subscriptions) ||
                        [];

                    // debug log removed for production performance

                    const subscriptionTeams = rawSubscriptions
                        .map((sub: any, idx: number) => ({
                            id: String(sub?.subscription_id || sub?.id || sub?.team_id || idx + 1),
                            name: (() => {
                                const candidate = String(
                                    sub?.team_name ||
                                    sub?.team_name_ar ||
                                    sub?.sport_name_ar ||
                                    sub?.sport_name ||
                                    sub?.name ||
                                    ""
                                ).trim();
                                return candidate && !looksLikeUuid(candidate) ? candidate : "";
                            })(),
                            startDate: String(sub?.start_date || "-"),
                            endDate: String(sub?.end_date || "-"),
                            price: Number(sub?.price || sub?.monthly_fee || sub?.training_fee || sub?.slot_price || sub?.fee || sub?.amount || sub?.slot?.price || 0),
                            status: sub?.payment_completed_at
                                ? "active"
                                : String(sub?.subscription_status || sub?.status || "pending"),
                        }))
                        .filter((team: TeamLike) => !!team.name);

                    if (profileTeams.length === 0) {
                        profileTeams = subscriptionTeams;
                    } else {
                        subscriptionTeams.forEach((subTeam: TeamLike) => {
                            const existingIdx = profileTeams.findIndex(
                                (team) =>
                                    team.id === subTeam.id ||
                                    normalizeSportName(team.name) === normalizeSportName(subTeam.name)
                            );
                            if (existingIdx === -1) {
                                profileTeams.push(subTeam);
                                return;
                            }

                            const existing = profileTeams[existingIdx];
                            if (String(subTeam.status).toLowerCase() === "active") {
                                existing.status = "active";
                            }
                            if ((existing.price || 0) <= 0 && (subTeam.price || 0) > 0) {
                                existing.price = subTeam.price;
                            }
                            if ((!existing.startDate || existing.startDate === "-") && subTeam.startDate && subTeam.startDate !== "-") {
                                existing.startDate = subTeam.startDate;
                            }
                            if ((!existing.endDate || existing.endDate === "-") && subTeam.endDate && subTeam.endDate !== "-") {
                                existing.endDate = subTeam.endDate;
                            }
                        });
                    }
                } else {
                    console.warn("Failed to fetch team subscriptions fallback", subscriptionsSettled.reason);
                }

                if (profileTeams.length > 0) {
                    setSports(profileTeams.map((team, idx) => toEnrolledSportFromTeam(team, idx, t)));
                }

                const cachedPaidSport = readLastPaidSportCache();
                if (cachedPaidSport) {
                    const existsInProfileTeams = profileTeams.some(
                        (team) => normalizeSportName(team.name) === normalizeSportName(cachedPaidSport.name)
                    );
                    if (!existsInProfileTeams) {
                        profileTeams.push({
                            id: `paid-${cachedPaidSport.teamId || Date.now()}`,
                            name: cachedPaidSport.name,
                            startDate: "-",
                            endDate: "-",
                            price: cachedPaidSport.amount || 0,
                            status: "active",
                        });
                    }
                }

                // 2. Fetch Attendance and Joined Sports Stats
                const statsRes = statsSettled.status === "fulfilled" ? statsSettled.value : null;
                if (statsRes?.success && statsRes.data) {
                    const { overall, sports: backendSports } = statsRes.data;

                    const dayMap: Record<string, number> = {
                        "Sunday": 0, "الاحد": 0, "الأحد": 0,
                        "Monday": 1, "الاثنين": 1, "الإثنين": 1,
                        "Tuesday": 2, "الثلاثاء": 2,
                        "Wednesday": 3, "الاربعاء": 3, "الأربعاء": 3,
                        "Thursday": 4, "الخميس": 4,
                        "Friday": 5, "الجمعة": 5,
                        "Saturday": 6, "السبت": 6
                    };

                    const mappedSports: EnrolledSport[] = backendSports.map((s: any, idx: number) => {
                        const firstSched = s.schedules?.[0];
                        // Extract all unique weekdays from all schedules
                        const weekdaysSet = new Set<number>();
                        (s.schedules || []).forEach((sched: any) => {
                            const dArs = (sched.days_ar || "").split(/[،,]/).map((d: string) => d.trim());
                            const dEns = (sched.days_en || "").split(/[،,]/).map((d: string) => d.trim());
                            dArs.forEach((d: string) => { if (dayMap[d] !== undefined) weekdaysSet.add(dayMap[d]); });
                            dEns.forEach((d: string) => { if (dayMap[d] !== undefined) weekdaysSet.add(dayMap[d]); });
                        });

                        // Remaining = number of days from today to the end of the current month (excluding today)
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        const remainingThisMonth = Math.max(0, endOfMonth.getDate() - today.getDate());
                        // Look up actual price from profileTeams to ensure it displays correctly
                        const profileMatch = profileTeams.find(pt => normalizeSportName(pt.name) === normalizeSportName(s.sport_name_ar || s.name_ar || s.sport_name || s.name));

                        return {
                            id: idx + 1,
                            name: s.sport_name_ar || s.name_ar || s.sport_name || s.name,
                            nameAr: s.sport_name_ar || s.name_ar || s.sport_name || s.name,
                            icon: getSportIconFromName(s.sport_name_ar || s.sport_name || s.name || ""),
                            img: s.sport_image || null,
                            status: s.status === "approved" || s.status === "active"
                                ? t("sports.status.active")
                                : (s.status === "pending" || !s.status)
                                    ? t("sports.status.pending")
                                    : t("sports.status.upcoming"),
                            nextDay: localizeDays(firstSched?.days_ar || firstSched?.days_en || t("notifications.time.now"), currentLang === 'ar'),
                            nextTime: firstSched ? `${firstSched.start_time?.slice(0, 5)} - ${firstSched.end_time?.slice(0, 5)}` : "-",
                            court: firstSched?.field?.name_ar || t("sports.court"),
                            attended: s.stats.attended,
                            absent: s.stats.absent,
                            remaining: remainingThisMonth,
                            total: s.stats.total || 0,
                            color: ["#16A34A", "#1F6FD5", "#F59E0B", "#DC2626"][idx % 4],
                            weekdays: Array.from(weekdaysSet),
                            records: s.stats.records || [],
                            startDate: s.start_date || s.created_at || s.subscriptionDate || "-",
                            endDate: s.end_date || "-",
                            createdAt: s.created_at,
                            price: profileMatch?.price || s.price || s.slot?.price || s.monthly_fee || 0
                        };
                    });

                    const profileOnlySports = profileTeams
                        .filter((team) => {
                            if (!team.name) return false;
                            return !mappedSports.some(
                                (sport) => normalizeSportName(sport.name) === normalizeSportName(team.name)
                            );
                        })
                        .map((team, idx) => toEnrolledSportFromTeam(team, mappedSports.length + idx, t));

                    const mergedSports = [...mappedSports, ...profileOnlySports];

                    setDashboardStats({
                        enrolledSports: mergedSports,
                        totalAttended: overall.attended_sessions,
                        totalSessions: overall.total_sessions
                    });

                    // Keep "Sports" tab list in sync with dashboard cards
                    setSports(mergedSports);
                } else if (profileTeams.length > 0) {
                    const fallbackSports = profileTeams.map((team, idx) => toEnrolledSportFromTeam(team, idx, t));

                    setDashboardStats({
                        enrolledSports: fallbackSports,
                        totalAttended: 0,
                        totalSessions: 0
                    });

                    setSports(fallbackSports);
                }

                const cachedPaidSportAfterMerge = readLastPaidSportCache();
                if (cachedPaidSportAfterMerge) {
                    sessionStorage.removeItem("tm_last_paid_sport");
                }

                // 2. Fetch Team Member Bookings
                if (bookingsSettled.status === "fulfilled") {
                    const bRes = bookingsSettled.value;
                    const bList = Array.isArray(bRes.data?.data) ? bRes.data.data : (Array.isArray(bRes.data) ? bRes.data : []);
                    setTeamMemberBookings(bList);
                } else {
                    setTeamMemberBookings([]);
                }

                // 3. Fetch available sports
                if (availableSportsSettled.status === "fulfilled") {
                    const sportsRes = availableSportsSettled.value;
                    if (sportsRes.success && Array.isArray(sportsRes.data)) {
                        const mapped = sportsRes.data.map((s: any) => ({
                            code: String(s.id),
                            name_ar: s.name_ar,
                            name_en: s.name_en,
                            price: Number(s.price) || 0
                        }));
                        setAvailableSports(mapped);
                    } else {
                        setAvailableSports([
                            { code: "FOOTBALL", name_ar: "كرة القدم", name_en: "Football", price: 200 },
                            { code: "SWIMMING", name_ar: "السباحة", name_en: "Swimming", price: 300 },
                            { code: "BASKETBALL", name_ar: "كرة السلة", name_en: "Basketball", price: 250 },
                        ]);
                    }
                } else {
                    setAvailableSports([
                        { code: "FOOTBALL", name_ar: "كرة القدم", name_en: "Football", price: 200 },
                        { code: "SWIMMING", name_ar: "السباحة", name_en: "Swimming", price: 300 },
                        { code: "BASKETBALL", name_ar: "كرة السلة", name_en: "Basketball", price: 250 },
                    ]);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, refreshKey, t]);

    const handleLogoutConfirm = () => {
        AuthService.logout();
        setShowLogoutModal(false);
        window.location.href = "/login";
    };

    const isArabicName = (value: string) => /^[\u0600-\u06FF\s]+$/.test(value.trim());

    const handleUpdateMember = async (updated: Member, files?: { [key: string]: File }) => {
        if (!user?.team_member_id) return;
        if (!isArabicName(updated.firstName)) {
            alert(t("profile.validation.first_name_arabic"));
            return;
        }
        if (!isArabicName(updated.lastName)) {
            alert(t("profile.validation.last_name_arabic"));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email.trim())) {
            alert(t("profile.validation.email_invalid"));
            return;
        }
        if (!/^(010|011|012|015)\d{8}$/.test(updated.phone.trim())) {
            alert(t("profile.validation.phone_invalid"));
            return;
        }
        if (!/^[1-9]\d{13}$/.test(updated.nationalId.trim())) {
            alert(t("profile.validation.national_id_invalid"));
            return;
        }
        if (!isAtLeast16YearsOld(updated.birthDate.trim())) {
            alert(t("profile.validation.age_min"));
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("first_name_ar", updated.firstName);
            formData.append("last_name_ar", updated.lastName);
            formData.append("phone", updated.phone);
            formData.append("address", updated.address);
            formData.append("birthdate", updated.birthDate);
            formData.append("national_id", updated.nationalId);

            if (files) {
                Object.entries(files).forEach(([key, file]) => {
                    formData.append(key, file);
                });
            }

            const res = await AuthService.updateTeamMemberDetails(user.team_member_id, formData);
            if (res.success) {
                // Refresh data to get updated URLs
                const profileRes = await AuthService.getTeamMemberDetails(user.team_member_id);
                if (profileRes.success && profileRes.data) {
                    const d = profileRes.data;
                    setMember({
                        id: String(d.id),
                        firstName: d.firstNameAr || "",
                        lastName: d.lastNameAr || "",
                        email: user.email || "",
                        phone: d.phone || "",
                        birthDate: d.birthdate || "",
                        address: d.address || "",
                        nationalId: d.national_id || "",
                        joinDate: d.created_at || d.createdAt || d.join_date || "",
                        status: d.status || "pending",
                        avatar: d.documents?.personal_photo_url || d.personal_photo_url || d.photo || null,
                        medicalReport: d.documents?.medical_report_url || d.medical_report_url || d.medical_report || null,
                        nationalIdFront: d.documents?.national_id_front_url || d.national_id_front_url || d.national_id_front || null,
                        nationalIdBack: d.documents?.national_id_back_url || d.national_id_back_url || d.national_id_back || null,
                        proof: d.documents?.proof_url || d.proof_url || d.proof || null,
                    });

                }
                alert(t("profile.validation.update_success"));
            }
        } catch (err) {
            alert(t("profile.validation.update_failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSport = async (sportId: string, startDate: string, endDate: string) => {
        if (!user?.team_member_id) return;
        if (!sportId || !startDate || !endDate) {
            alert(t("sports.validation.complete_fields"));
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            alert(t("sports.validation.date_invalid"));
            return;
        }
        if (sports.length >= 4) {
            alert(t("sports.validation.max_sports"));
            return;
        }

        const sport = availableSports.find(s => s.code === sportId);
        if (!sport) return;

        try {
            const res = await AuthService.selectTeamMemberTeams({
                member_id: user.team_member_id,
                teams: [sport.name_ar],
                startDate,
                endDate
            });

            if (res.success) {
                // Refresh data to get correct fields from server
                const profileRes = await AuthService.getTeamMemberDetails(user.team_member_id);
                if (profileRes.success && profileRes.data) {
                    const d = profileRes.data;
                    const joined = (d.teams || []).map((t: any) => ({
                        id: String(t.id),
                        name: t.name,
                        startDate: t.startDate || "-",
                        endDate: t.endDate || "-",
                        price: t.price || 0,
                        status: t.status === "active" ? t("sports.status.active") : t.status === "expired" ? t("sports.status.expired") : t.status || t("sports.status.active"),
                    }));
                    setSports(
                        joined.map((team: Sport) => ({
                            ...team,
                            status: mapTeamStatusLabel(team.status),
                        }))
                    );
                }
                setRefreshKey(prev => prev + 1);
            }
        } catch (err) {
            alert(t("sports.validation.join_failed"));
        }
    };

    if (loading || !member) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="ml-3 font-bold">{t("dashboard.loading")}</p>
            </div>
        );
    }

    // ─── Restricted Access (Pending Status) ─────────────────
    if (member.status === "pending") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F9] p-6 text-center" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-soft max-w-lg w-full transform transition-all hover:scale-[1.01]">
                    {/* Language Switcher in Pending view */}
                    <div className="flex justify-end mb-6">
                        <LanguageSwitcher />
                    </div>
                    {member.avatar ? (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-100 overflow-hidden">
                            <img src={getFullUrl(member.avatar) || ""} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {t("pending_access.welcome", { name: member.firstName })}
                    </h2>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {t("pending_access.under_review")}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-8 text-base sm:text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {t("pending_access.description")}
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-yellow-700 bg-yellow-50 py-3 px-4 rounded-xl text-sm font-medium">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                            {t("pending_access.status_label")}
                        </div>
                        <button
                            onClick={handleLogoutConfirm}
                            className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold shadow-lg hover:bg-gray-700 transition-all active:scale-95 mt-4"
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                            {t("pending_access.logout")}
                        </button>
                    </div>
                </div>
                <div className="mt-8 text-gray-400 text-sm">
                    {t("pending_access.footer", { year: new Date().getFullYear() })}
                </div>
            </div>
        );
    }

    // ─── Determine dir attribute based on current language ─────────────────
    const dirAttr = currentLang === 'ar' ? 'rtl' : 'ltr';

    const renderContent = () => {
        return (
            <div className="dashboard-scoped">
                <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center">... {t("dashboard.loading")}</div>}>
                    {activeTab === "dashboard" && (
                        <DashboardPage
                            enrolledSports={dashboardStats?.enrolledSports}
                            totalAttended={dashboardStats?.totalAttended}
                            totalSessions={dashboardStats?.totalSessions}
                            joinDate={member.joinDate}
                            bookings={teamMemberBookings}
                        />
                    )}
                    {activeTab === "profile" && <ProfileTab member={member} setMember={handleUpdateMember} dir={dirAttr} />}
                    {activeTab === "sports" && (
                        <SportsTab
                            sports={sports}
                            availableSports={availableSports}
                            onJoin={handleJoinSport}
                            dir={dirAttr}
                        />
                    )}
                    {activeTab === "available-sports" && <SportsExplorePage showToast={showToast} onJoined={() => setRefreshKey(prev => prev + 1)} />}
                    {activeTab === "courts" && <CourtRentalPage showToast={showToast} />}
                </Suspense>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] font-[Cairo]" dir={dirAttr}>
            <Sidebar
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                setActiveTab={setActiveTab}
                onLogout={() => {
                    setIsSidebarOpen(false);
                    setShowLogoutModal(true);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                dir={dirAttr}
            />
            <Navbar
                member={member}
                notifications={notifications}
                onToggleNotifications={() => setShowNotifs(!showNotifs)}
                showNotifs={showNotifs}
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                dir={dirAttr}
            />

            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label={t("navbar.menu")}
                    className="fixed inset-0 top-16 bg-black/35 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main content offset for fixed sidebar and navbar */}
            <main
                role="main"
                className={`px-3 sm:px-6 lg:px-10 py-4 sm:py-6 pt-[76px] sm:pt-[84px] ${dirAttr === 'rtl' ? 'lg:pr-[300px] lg:pl-10' : 'lg:pl-[300px] lg:pr-10'}`}
            >
                {renderContent()}
            </main>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
                dir={dirAttr}
            />

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

