import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ROLE_LABELS } from "../../../types/auth";
import { Globe, LogOut, Menu, User, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { resolveFileUrl } from "../../../utils/fileUrl";
import { useLanguage } from "../../../hooks/useLanguage";
import { useTranslation } from "react-i18next";

const hucLogo = "/assets/HUC_logo.jpeg";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface NavbarProps {
  isMobileSidebarOpen: boolean;
  onMobileMenuToggle: () => void;
}

const LogoutModal = ({ isOpen, onClose, onConfirm }: LogoutModalProps) => {
  const { t } = useTranslation(["nav", "common"]);
  const { isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="bg-[#F9FAFB] rounded-[12px] shadow-xl w-full max-w-[440px] overflow-hidden"
        style={{ fontFamily: "'Cairo', 'Segoe UI', Roboto, sans-serif" }}
      >
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <div className="text-[#2563EB]">
              <LogOut size={32} />
            </div>
          </div>

          <h3 className="text-[22px] font-bold text-[#1F2937] text-center px-6">
            {t("nav:navbar.logoutConfirmTitle")}
          </h3>
        </div>

        <div className="px-8 pb-8 text-center">
          <p className="text-[14px] leading-relaxed text-[#6B7280]">
            {t("nav:navbar.logoutConfirmDesc")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 px-6 pb-6">
          <button
            onClick={onConfirm}
            className="w-full sm:flex-1 h-12 bg-[#DC2626] text-white text-[15px] font-semibold rounded-[10px] transition-all hover:bg-red-700 active:scale-95"
          >
            {t("nav:navbar.logout")}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:flex-1 h-12 bg-[#E5E7EB] text-[#111827] text-[15px] font-medium rounded-[10px] transition-all hover:bg-gray-300 active:scale-95"
          >
            {t("common:cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export function Navbar({ isMobileSidebarOpen, onMobileMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation(["nav"]);

  if (!user) return null;

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const photoUrl = resolveFileUrl(user.photo);
  const mobileLangLabel = language === "ar" ? "EN" : "AR";
  const fullLangLabel = language === "ar" ? "English" : "العربية";
  const mobileMenuLabel = isMobileSidebarOpen ? t("sidebar.collapse") : t("sidebar.expand");

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-40 h-16 bg-card border-b border-border">
        <div className="flex h-full items-center justify-between gap-2 px-2 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src={hucLogo}
              alt="HUC"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover bg-card shrink-0"
            />
            <span className="font-bold text-sm lg:text-base text-foreground hidden lg:block truncate">
              {t("navbar.clubName")}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-1 sm:gap-2 md:gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              title={mobileMenuLabel}
              aria-label={mobileMenuLabel}
            >
              {isMobileSidebarOpen ? (
                <X className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Menu className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={toggleLanguage}
              className="h-9 min-w-[42px] px-2 sm:px-3 rounded-lg hover:bg-muted flex items-center justify-center transition-colors shadow-sm border border-border bg-card hover:border-primary/20"
              title={t("navbar.language")}
            >
              <Globe className="h-4 w-4 text-primary sm:mx-1 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold text-primary mt-[2px] leading-none">
                {fullLangLabel}
              </span>
              <span className="sm:hidden text-[11px] font-bold text-primary mt-[2px] leading-none">
                {mobileLangLabel}
              </span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="hidden md:block text-right min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">{user.fullName}</p>
                <Badge className="bg-huc-orange text-huc-orange-foreground text-[11px] px-2 py-0.5 rounded-full">
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
              {photoUrl ? (
                <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border">
                  <img src={photoUrl} alt={user.fullName} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              title={t("navbar.logout")}
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
