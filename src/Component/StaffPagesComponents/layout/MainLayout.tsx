import { type ReactNode, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { AppSidebar } from "./AppSidebar";
import { useLanguage } from "../../../hooks/useLanguage";

export function MainLayout({ children }: { children: ReactNode }) {
  const { isRTL } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedLang = Object.keys(localStorage).includes('dashboard-lang') 
      ? localStorage.getItem('dashboard-lang') 
      : 'ar';
    const rtl = savedLang === 'ar';
    document.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang || 'ar';
  }, []);

  return (
    <div className="h-screen bg-background huc-app huc-page overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar
        isMobileSidebarOpen={mobileSidebarOpen}
        onMobileMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
      />
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      {/*
        Main content area: exactly the remaining height after the 4rem navbar.
        overflow-hidden here; each page decides its own scrolling strategy.
        Table pages use h-[calc(100vh-4rem)] flex flex-col + flex-1 overflow-auto.
        Form/scroll pages use overflow-y-auto on their own containers.
      */}
      <main
        className="pt-16 h-screen overflow-hidden transition-[margin-inline-start] duration-[250ms] ease-in-out min-w-0"
        style={{ marginInlineStart: "var(--sidebar-width, 256px)" }}
      >
        <div className="h-[calc(100vh-4rem)] min-w-0 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
