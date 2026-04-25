import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();

  const language = i18n.language ?? 'ar';
  const isRTL = language === 'ar';

  const applyToDocument = useCallback((lang: string) => {
    const rtl = lang === 'ar';
    document.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('dashboard-lang', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = language === 'ar' ? 'en' : 'ar';
    void i18n.changeLanguage(next);
    applyToDocument(next);
  }, [language, i18n, applyToDocument]);

  return { language, isRTL, toggleLanguage };
}
