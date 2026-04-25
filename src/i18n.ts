import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const RTL_LANGUAGES = new Set(['ar']);
const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
const NAMESPACES = ['common', 'auth', 'admin', 'member', 'team', 'landing'] as const;
const LOCALES_BASE_PATH = import.meta.env.DEV
  ? `${import.meta.env.BASE_URL}locales`
  : `${import.meta.env.BASE_URL}locales`;

const normalizeLanguage = (language?: string): 'ar' | 'en' => {
  const baseLanguage = language?.split('-')[0];
  return baseLanguage === 'en' ? 'en' : 'ar';
};

const syncDocumentLanguage = (language?: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  const normalizedLanguage = normalizeLanguage(language);
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir = RTL_LANGUAGES.has(normalizedLanguage) ? 'rtl' : 'ltr';
  localStorage.setItem('dashboard-lang', normalizedLanguage);
};

i18n.on('languageChanged', syncDocumentLanguage);

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    load: 'languageOnly',
    defaultNS: 'common',
    ns: [...NAMESPACES],
    backend: {
      loadPath: `${LOCALES_BASE_PATH}/{{lng}}/{{ns}}.json`,
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dashboard-lang',
      caches: ['localStorage'],
    },
  })
  .then(() => {
    syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
  })
  .catch((error) => {
    console.error('Failed to initialize i18n', error);
  });
export default i18n;
