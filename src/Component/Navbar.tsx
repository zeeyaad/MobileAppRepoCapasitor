import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
const HUCLogo = "/assets/HUC_logo.jpeg";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showAuthButtons?: boolean;
  onLogout?: () => void;
  showNavigation?: boolean;
  lang?: 'ar' | 'en';
  setLang?: (lang: 'ar' | 'en') => void;
  isDark?: boolean;
}

const navTabs = [
  { key: "home", label: "الرئيسية" },
  { key: "clubs", label: "الأندية" },
  { key: "Sports", label: "الرياضات" },
  { key: "memberships", label: "العضويات" },
  { key: "lastNews", label: "اخر الاحداث" },
  { key: "contact us", label: "تواصل معنا" },
];

export const Navbar = ({
  activeTab = "home",
  onTabChange = () => {},
  showAuthButtons = true,
  onLogout,
  showNavigation = true,
  lang = 'ar',
  setLang = () => {},
  isDark = false
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isDark) {
        setScrolled(window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDark]);

  const headerClasses = isDark
    ? "bg-gradient-to-r from-[#0e1c38] to-[#1a4d63] py-5 border-b-4 border-[#f8941c] shadow-2xl"
    : scrolled
    ? "bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg py-2"
    : "bg-white py-4";

  const logoClasses = isDark
    ? "text-white"
    : "text-[#0e1c38]";

  const navButtonClasses = (isActive: boolean) => {
    if (isDark) {
      return "text-white font-bold px-5 py-2 rounded-full text-sm";
    }
    return `font-bold transition-all duration-300 px-5 py-2 rounded-full text-sm relative whitespace-nowrap ${
      isActive ? "text-white" : "text-gray-600 hover:text-[#2596be]"
    }`;
  };

  return (
    <>
      {/* Sticky Glass Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClasses}`}>
        <div className={`w-full ${isDark ? "px-6 md:px-12 lg:px-16" : "px-6 md:px-12 lg:px-16"}`}>
          <div className="flex items-center justify-between">

            {/* 1. Logo & Brand (Left Side in RTL) */}
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => onTabChange("home")}
            >
              <div className={`${isDark ? "bg-[#f8941c]" : "bg-gradient-to-br from-blue-50 to-white border border-gray-100"} p-2 rounded-xl shadow-${isDark ? "lg" : "sm"}`}>
                <img src={HUCLogo} alt="نادي جامعه حلوان" className="w-12 h-12 object-contain" />
              </div>
              <div className="hidden md:block">
                <h1 className={`font-extrabold text-lg ${isDark ? "text-white" : logoClasses} leading-tight`}>نادي جامعه حلوان</h1>
                {isDark && <p className="text-[#a0d5e8] text-xs font-bold">نادي جامعة حلوان</p>}
              </div>
            </div>

            {/* 2. Desktop Navigation (Center) - Clean Floating Style */}
            {showNavigation && (
              <nav className={isDark ? "hidden md:flex items-center gap-6" : "hidden xl:flex items-center gap-2"}>
                {navTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={navButtonClasses(activeTab === tab.key)}
                  >
                    <span className="relative z-10">{tab.label}</span>
                    {!isDark && activeTab === tab.key && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: "spring", duration: 0.5 }}
                        className="absolute inset-0 z-0 bg-[#2596be] rounded-full shadow-md"
                      ></motion.span>
                    )}
                  </button>
                ))}
              </nav>
            )}

            {/* 3. Actions (Right Side in RTL) */}
            <div className="flex items-center gap-4">

              {/* Language Switcher */}
              {!isDark && <LanguageSwitcher lang={lang} setLang={setLang} />}

              {/* Vertical Divider */}
              {!isDark && <div className="hidden md:block h-6 w-px bg-gray-200"></div>}

              {/* Buttons Group */}
              <div className={isDark ? "hidden md:flex gap-3" : "hidden md:flex items-center gap-3"}>
                {showAuthButtons ? (
                  <>
                    {/* Login Button - Ghost/Outline Style */}
                    <button
                      onClick={() => window.location.hash = '#/login'}
                      className={isDark ? 
                        "text-white hover:bg-white/10 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm" :
                        "text-[#0e1c38] hover:bg-gray-50 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm flex items-center gap-2 whitespace-nowrap border border-transparent hover:border-gray-200"
                      }
                    >
                      <User className="w-4 h-4" /> تسجيل الدخول
                    </button>

                    {/* Register Button - Primary CTA */}
                    <button
                      onClick={() => window.location.hash = '#/re'}
                      className={isDark ?
                        "bg-[#f8941c]/90 hover:bg-[#f8941c] text-white px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm" :
                        "bg-[#f8941c] hover:bg-[#e07d10] text-white px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                      }
                    >
                      <User className="w-4 h-4" /> سجل الآن
                    </button>
                  </>
                ) : onLogout ? (
                  <button
                    onClick={onLogout}
                    className={isDark ? 
                      "bg-red-500/90 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl" :
                      "bg-red-500/90 hover:bg-red-600 text-white px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg"
                    }
                  >
                    تسجيل الخروج
                  </button>
                ) : null}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`${isDark ? "xl:hidden" : "xl:hidden"} p-2.5 ${isDark ? "text-white bg-white/10 hover:bg-white/20" : "text-[#0e1c38] bg-gray-100 hover:bg-gray-200"} rounded-xl transition-colors`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0e1c38] text-white p-6 animate-fade-in flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <span className="font-bold text-xl text-[#f8941c]">القائمة</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          {showNavigation && (
            <nav className="flex flex-col gap-2 flex-1">
              {navTabs.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { onTabChange(item.key); setMobileMenuOpen(false); }}
                  className={`w-full text-right py-4 px-4 rounded-xl font-bold text-lg transition-all ${activeTab === item.key ? "bg-[#f8941c] text-white" : "hover:bg-white/5 text-gray-300"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
          <div className="flex flex-col gap-3">
            {showAuthButtons ? (
              <>
                <button
                  onClick={() => { window.location.hash = '#/login'; setMobileMenuOpen(false); }}
                  className="w-full bg-white text-[#0e1c38] py-4 rounded-xl font-bold text-lg"
                >
                  تسجيل دخول
                </button>
                <button
                  onClick={() => { window.location.hash = '#/re'; setMobileMenuOpen(false); }}
                  className="w-full bg-[#f8941c] text-white py-4 rounded-xl font-bold text-lg"
                >
                  سجل الآن
                </button>
              </>
            ) : onLogout ? (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg"
              >
                تسجيل الخروج
              </button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
