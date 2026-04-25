/**
 * Helwan Club (نادي حلوان) — Security Dashboard Design Token Config
 *
 * Single source of truth for all brand, semantic, and typographic tokens.
 * These values mirror the CSS custom properties defined in `security-dashboard.css`.
 * Use this config to drive Tailwind theme extensions or runtime token access.
 */

// ─── Palette ─────────────────────────────────────────────────────────────────

export const palette = {
  /** Deep Navy — primary brand color, backgrounds, headings */
  navy: {
    DEFAULT: '#0A1628',
    90: '#1A2A42',
    80: '#1E3355',
    70: '#243E6A',
    60: '#2B4B7E',
    40: '#5A7BAD',
    20: '#A8BBDA',
    10: '#D4DDED',
    5:  '#EDF1F7',
  },

  /** Gold — accent, highlights, active states */
  gold: {
    DEFAULT: '#C9A84C',
    light:   '#E8D49A',
    dark:    '#9B7D2E',
    muted:   '#F5EDD0',
  },

  /** Semantic status colors */
  success: {
    DEFAULT: '#22C55E',
    light:   '#DCFCE7',
    dark:    '#15803D',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light:   '#FEF3C7',
    dark:    '#B45309',
  },
  danger: {
    DEFAULT: '#EF4444',
    light:   '#FEE2E2',
    dark:    '#B91C1C',
  },

  /** Surface & text neutrals */
  background: '#F0F2F5',
  card:       '#FFFFFF',
  border:     '#DDE3EF',

  text: {
    primary:   '#0A1628',
    secondary: '#64748B',
    muted:     '#94A3B8',
    inverse:   '#FFFFFF',
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  /**
   * Font stacks
   * Arabic body & UI: Cairo (Google Fonts)
   * Numbers & Latin display/labels: Barlow Condensed (Google Fonts)
   */
  fontFamily: {
    arabic: ['Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    latin:  ['Barlow Condensed', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },

  /** Scale — px values as numbers for programmatic use */
  fontSize: {
    heading: 28,   // Section/page headings
    subheading: 20,
    body:    15,   // Default body text
    small:   13,   // Labels, captions, metadata
    xsmall:  11,   // Badge text, fine print
  },

  fontWeight: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },

  lineHeight: {
    tight:   1.25,
    snug:    1.4,
    normal:  1.6,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight:  '-0.01em',
    normal:  '0em',
    wide:    '0.03em',
    widest:  '0.08em', // Good for Barlow Condensed uppercase labels
  },
} as const;

// ─── Spacing & Sizing ─────────────────────────────────────────────────────────

export const spacing = {
  /** Dashboard layout rhythm (rem) */
  pagePadding:   '2rem',
  cardPadding:   '1.5rem',
  sectionGap:    '1.5rem',
  gridGap:       '1.25rem',
  sidebarWidth:  '260px',
  topbarHeight:  '64px',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const borderRadius = {
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '18px',
  pill: '9999px',
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  card:    '0 1px 4px rgba(10,22,40,0.06), 0 4px 16px rgba(10,22,40,0.06)',
  cardHover: '0 4px 20px rgba(10,22,40,0.12), 0 1px 6px rgba(10,22,40,0.08)',
  gold:    '0 2px 12px rgba(201,168,76,0.30)',
  sidebar: '2px 0 20px rgba(10,22,40,0.15)',
  topbar:  '0 1px 8px rgba(10,22,40,0.08)',
  focus:   '0 0 0 3px rgba(201,168,76,0.35)',
} as const;

// ─── Z-Index Scale ────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  card:    10,
  sidebar: 30,
  topbar:  50,
  overlay: 100,
  modal:   200,
  toast:   300,
} as const;

// ─── Transitions ─────────────────────────────────────────────────────────────

export const transitions = {
  fast:   '150ms ease',
  normal: '250ms ease',
  slow:   '400ms ease',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────

export const animation = {
  stagger: {
    /** Stagger delay per card row — apply via CSS animation-delay */
    step: 60, // ms
    max:  5,  // After 5 items, no more stagger
  },
  duration: {
    pageLoad:  450,
    cardEntry: 380,
    toast:     300,
  },
} as const;

// ─── Google Fonts URL ─────────────────────────────────────────────────────────

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap';

// ─── Aggregated export ────────────────────────────────────────────────────────

const helwanTheme = {
  palette,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  animation,
  GOOGLE_FONTS_URL,
} as const;

export default helwanTheme;
