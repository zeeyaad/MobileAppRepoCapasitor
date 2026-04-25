import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ─── Arabic namespaces ────────────────────────────────────────────────────────
import arCommon from './locales/ar/common.json';
import arNav from './locales/ar/nav.json';
import arDashboard from './locales/ar/dashboard.json';
import arDashboardPage from './locales/ar/DashboardPage.json';
import arMembers from './locales/ar/members.json';
import arSports from './locales/ar/sports.json';
import arFinance from './locales/ar/finance.json';
import arRegistrations from './locales/ar/registrations.json';
import arRegistrationManagementPage from './locales/ar/RegistrationManagementPage.json';
import arFaculties from './locales/ar/faculties.json';
import arBranches from './locales/ar/branches.json';
import arProfessions from './locales/ar/professions.json';
import arMedia from './locales/ar/media.json';
import arAdmin from './locales/ar/admin.json';

// ─── English namespaces ───────────────────────────────────────────────────────
import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enDashboard from './locales/en/dashboard.json';
import enDashboardPage from './locales/en/DashboardPage.json';
import enMembers from './locales/en/members.json';
import enSports from './locales/en/sports.json';
import enFinance from './locales/en/finance.json';
import enRegistrations from './locales/en/registrations.json';
import enRegistrationManagementPage from './locales/en/RegistrationManagementPage.json';
import enFaculties from './locales/en/faculties.json';
import enBranches from './locales/en/branches.json';
import enProfessions from './locales/en/professions.json';
import enMedia from './locales/en/media.json';
import enAdmin from './locales/en/admin.json';

// ─── Namespace list (single source of truth) ──────────────────────────────────
export const NS = [
  'common',
  'nav',
  'dashboard',
  'DashboardPage',
  'members',
  'sports',
  'finance',
  'registrations',
  'RegistrationManagementPage',
  'faculties',
  'branches',
  'professions',
  'media',
  'admin',
] as const;

export type Namespace = (typeof NS)[number];

// ─── i18n init ────────────────────────────────────────────────────────────────
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        common: arCommon,
        nav: arNav,
        dashboard: arDashboard,
        DashboardPage: arDashboardPage,
        members: arMembers,
        sports: arSports,
        finance: arFinance,
        registrations: arRegistrations,
        RegistrationManagementPage: arRegistrationManagementPage,
        faculties: arFaculties,
        branches: arBranches,
        professions: arProfessions,
        media: arMedia,
        admin: arAdmin,
      },
      en: {
        common: enCommon,
        nav: enNav,
        dashboard: enDashboard,
        DashboardPage: enDashboardPage,
        members: enMembers,
        sports: enSports,
        finance: enFinance,
        registrations: enRegistrations,
        RegistrationManagementPage: enRegistrationManagementPage,
        faculties: enFaculties,
        branches: enBranches,
        professions: enProfessions,
        media: enMedia,
        admin: enAdmin,
      },
    },

    // ── Language – Arabic is the default ──────────────────────────────────────
    lng: 'ar',
    fallbackLng: 'ar',

    // ── Namespace defaults ────────────────────────────────────────────────────
    ns: NS,
    defaultNS: 'common',    // useTranslation() with no arg → common namespace

    // ── Detection: check localStorage first, then browser ─────────────────────
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dashboard-lang',
      caches: ['localStorage'],
    },

    // ── Interpolation ──────────────────────────────────────────────────────────
    interpolation: {
      escapeValue: false,   // React already handles XSS
    },

    keySeparator: '.',
    saveMissing: false,
  });

export default i18n;
