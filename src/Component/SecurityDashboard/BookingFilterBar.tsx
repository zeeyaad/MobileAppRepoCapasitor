/**
 * BookingFilterBar
 * نادي حلوان — شريط فلترة الحجوزات
 *
 * Sticky filter bar that sits directly below SecurityDashboardHeader.
 * Exposes a typed FilterState to the parent via onFiltersChange callback.
 *
 * RTL | Cairo (Arabic) + Barlow Condensed (numbers) | Tailwind v4 | Framer Motion
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Search,
  X,
  ChevronDown,
  Dumbbell,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldId =
  | 'all'
  | 'football'
  | 'tennis'
  | 'basketball'
  | 'pool'
  | 'gym';

export type BookingStatus = 'all' | 'confirmed' | 'pending' | 'cancelled';

export interface BookingFilters {
  fields: FieldId[];
  date: string;           // ISO date string YYYY-MM-DD, empty = no filter
  status: BookingStatus;
  query: string;
}

interface BookingFilterBarProps {
  /** Live count of results matching current filters */
  resultCount: number;
  /** Called whenever any filter changes */
  onFiltersChange: (filters: BookingFilters) => void;
  /** Optional initial filter state */
  initialFilters?: Partial<BookingFilters>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELDS: { id: FieldId; label: string; icon: string }[] = [
  { id: 'all',        label: 'الكل',            icon: '🏟' },
  { id: 'football',   label: 'ملعب كرة القدم',  icon: '⚽' },
  { id: 'tennis',     label: 'ملعب التنس',       icon: '🎾' },
  { id: 'basketball', label: 'ملعب السلة',       icon: '🏀' },
  { id: 'pool',       label: 'حمام السباحة',     icon: '🏊' },
  { id: 'gym',        label: 'قاعة الرياضة',     icon: '💪' },
];

const STATUS_OPTIONS: { id: BookingStatus; label: string }[] = [
  { id: 'all',       label: 'الكل'  },
  { id: 'confirmed', label: 'مؤكد'  },
  { id: 'pending',   label: 'معلق'  },
  { id: 'cancelled', label: 'ملغي'  },
];

/** Today as YYYY-MM-DD in local time */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_FILTERS: BookingFilters = {
  fields: ['all'],
  date:   todayISO(),
  status: 'all',
  query:  '',
};

// ─── Palette tokens (inline — component is self-contained) ───────────────────

const C = {
  navy:       '#0A1628',
  navy5:      '#EDF1F7',
  navy10:     '#D4DDED',
  gold:       '#C9A84C',
  goldDark:   '#9B7D2E',
  goldMuted:  '#F5EDD0',
  white:      '#FFFFFF',
  bg:         '#F0F2F5',
  border:     '#DDE3EF',
  textPrimary:'#0A1628',
  textMuted:  '#64748B',
  success:    '#22C55E',
  successBg:  '#DCFCE7',
  warning:    '#F59E0B',
  warningBg:  '#FEF3C7',
  danger:     '#EF4444',
  dangerBg:   '#FEE2E2',
} as const;

const FONT_AR = "'Cairo', ui-sans-serif, system-ui, sans-serif";
const FONT_NUM = "'Barlow Condensed', ui-sans-serif, system-ui, sans-serif";

// ─── Status colour map ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<BookingStatus, { text: string; bg: string; activeBg: string; activeText: string }> = {
  all:       { text: C.textMuted,   bg: C.navy5,      activeBg: C.navy,    activeText: C.white   },
  confirmed: { text: C.success,     bg: C.successBg,  activeBg: C.success, activeText: C.white   },
  pending:   { text: '#92400E',     bg: C.warningBg,  activeBg: C.warning, activeText: C.navy    },
  cancelled: { text: C.danger,      bg: C.dangerBg,   activeBg: C.danger,  activeText: C.white   },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Single field chip — togglable, gold when active */
function FieldChip({
  field,
  active,
  onClick,
}: {
  field: typeof FIELDS[number];
  active: boolean;
  onClick: () => void;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={shouldReduce ? {} : { scale: 0.94 }}
      aria-pressed={active}
      aria-label={`فلترة: ${field.label}`}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '0.35em',
        padding:       '0.35em 0.9em',
        borderRadius:  9999,
        border:        `1.5px solid ${active ? C.gold : C.border}`,
        background:    active
          ? `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`
          : C.white,
        color:         active ? C.navy : C.textMuted,
        fontFamily:    FONT_AR,
        fontSize:      '0.8125rem',
        fontWeight:    active ? 700 : 500,
        cursor:        'pointer',
        whiteSpace:    'nowrap',
        boxShadow:     active
          ? `0 2px 10px rgba(201,168,76,0.35), 0 1px 3px rgba(201,168,76,0.2)`
          : `0 1px 2px rgba(10,22,40,0.04)`,
        transition:    'all 180ms ease',
        flexShrink:    0,
        userSelect:    'none',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '0.9em', lineHeight: 1 }}>
        {field.icon}
      </span>
      {field.label}
    </motion.button>
  );
}

/** Status pill tab */
function StatusPill({
  option,
  active,
  onClick,
}: {
  option: typeof STATUS_OPTIONS[number];
  active: boolean;
  onClick: () => void;
}) {
  const colors = STATUS_COLORS[option.id];
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={shouldReduce ? {} : { scale: 0.94 }}
      aria-pressed={active}
      aria-label={`فلتر الحالة: ${option.label}`}
      style={{
        padding:      '0.3em 1em',
        borderRadius: 9999,
        border:       `1.5px solid ${active ? colors.activeBg : C.border}`,
        background:   active ? colors.activeBg : C.white,
        color:        active ? colors.activeText : colors.text,
        fontFamily:   FONT_AR,
        fontSize:     '0.8125rem',
        fontWeight:   active ? 700 : 500,
        cursor:       'pointer',
        whiteSpace:   'nowrap',
        transition:   'all 180ms ease',
        flexShrink:   0,
        userSelect:   'none',
      }}
    >
      {option.label}
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BookingFilterBar({
  resultCount,
  onFiltersChange,
  initialFilters,
}: BookingFilterBarProps) {
  const searchId     = useId();
  const dateId       = useId();
  const shouldReduce = useReducedMotion();

  // ── Filter state ──
  const [filters, setFilters] = useState<BookingFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // ── Debounce search query ──
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(filters.query);

  // ── Notify parent on filter change ──
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // ── Derived: are any non-default filters active? ──
  const hasActiveFilters =
    !(filters.fields.length === 1 && filters.fields[0] === 'all') ||
    filters.date !== todayISO() ||
    filters.status !== 'all' ||
    filters.query !== '';

  // ── Field chip toggle ──
  const handleFieldToggle = useCallback((id: FieldId) => {
    setFilters(prev => {
      if (id === 'all') return { ...prev, fields: ['all'] };

      const without = prev.fields.filter(f => f !== 'all' && f !== id);
      const isActive = prev.fields.includes(id);

      if (isActive) {
        // Deselecting: if nothing left, revert to 'all'
        return { ...prev, fields: without.length ? without : ['all'] };
      } else {
        return { ...prev, fields: [...without, id] };
      }
    });
  }, []);

  // ── Status toggle ──
  const handleStatusChange = useCallback((id: BookingStatus) => {
    setFilters(prev => ({ ...prev, status: id }));
  }, []);

  // ── Date change ──
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, date: e.target.value }));
  }, []);

  // ── Search input (debounced 300ms) ──
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: val }));
    }, 300);
  }, []);

  // ── Clear all ──
  const handleClearAll = useCallback(() => {
    const cleared: BookingFilters = { ...DEFAULT_FILTERS, date: todayISO() };
    setFilters(cleared);
    setSearchInput('');
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── Date display helpers ──
  const dateIsToday = filters.date === todayISO();
  const formattedDate = filters.date
    ? new Date(filters.date + 'T00:00:00').toLocaleDateString('ar-EG', {
        weekday: 'short',
        day:     'numeric',
        month:   'short',
      })
    : 'اختر تاريخاً';

  return (
    <>
      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes bfbSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bfbResultPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .bfb-result-count-pop {
          animation: bfbResultPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        /* Style the native date input caret/icon in webkit */
        .bfb-date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          inset: 0;
          width: 100%;
          cursor: pointer;
        }
        .bfb-date-input::-webkit-inner-spin-button { display: none; }
        /* Remove default focus ring — we supply our own */
        .bfb-date-input:focus,
        .bfb-search-input:focus {
          outline: none;
        }
      `}</style>

      <motion.div
        dir="rtl"
        role="search"
        aria-label="شريط فلترة الحجوزات"
        initial={shouldReduce ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position:    'sticky',
          top:         82,           /* 80px header + 2px gold hairline */
          zIndex:      40,
          background:  C.white,
          borderBottom:`1px solid ${C.border}`,
          boxShadow:   '0 4px 20px rgba(10,22,40,0.07), 0 1px 4px rgba(10,22,40,0.04)',
        }}
      >
        {/* ── Inner container: two rows ── */}
        <div
          style={{
            maxWidth:     '100%',
            padding:      '0.75rem 1.75rem',
            display:      'flex',
            flexDirection:'column',
            gap:          '0.625rem',
          }}
        >

          {/* ════ ROW 1 — Field chips + result count + clear button ════ */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '0.75rem',
            }}
          >
            {/* Field selector label */}
            <span
              style={{
                fontFamily:  FONT_AR,
                fontSize:    '0.75rem',
                fontWeight:  600,
                color:       C.textMuted,
                whiteSpace:  'nowrap',
                flexShrink:  0,
                letterSpacing:'0.03em',
                textTransform:'uppercase',
                display:     'flex',
                alignItems:  'center',
                gap:         '0.3em',
              }}
            >
              <Dumbbell size={13} strokeWidth={2.5} style={{ color: C.gold }} aria-hidden="true" />
              الملعب
            </span>

            {/* Chips — horizontally scrollable */}
            <div
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '0.45rem',
                overflowX:      'auto',
                flex:           1,
                scrollbarWidth: 'none',
                paddingBottom:  '2px', /* prevent box-shadow clip on scroll */
              }}
              role="group"
              aria-label="فلتر الملعب"
            >
              {FIELDS.map(f => (
                <FieldChip
                  key={f.id}
                  field={f}
                  active={
                    f.id === 'all'
                      ? filters.fields.includes('all')
                      : filters.fields.includes(f.id)
                  }
                  onClick={() => handleFieldToggle(f.id)}
                />
              ))}
            </div>

            {/* Spacer */}
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>

              {/* Result count pill */}
              <ResultCountBadge count={resultCount} />

              {/* Clear-all button */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    key="clear-btn"
                    type="button"
                    onClick={handleClearAll}
                    initial={shouldReduce ? {} : { opacity: 0, scale: 0.8, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={shouldReduce ? {} : { opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    aria-label="مسح جميع الفلاتر"
                    style={{
                      display:       'inline-flex',
                      alignItems:    'center',
                      gap:           '0.35em',
                      padding:       '0.35em 0.85em',
                      borderRadius:  9999,
                      border:        `1.5px solid ${C.danger}`,
                      background:    C.dangerBg,
                      color:         C.danger,
                      fontFamily:    FONT_AR,
                      fontSize:      '0.8125rem',
                      fontWeight:    600,
                      cursor:        'pointer',
                      whiteSpace:    'nowrap',
                      overflow:      'hidden',
                      flexShrink:    0,
                      transition:    'background 150ms ease, box-shadow 150ms ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = C.danger;
                      (e.currentTarget as HTMLButtonElement).style.color = C.white;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = C.dangerBg;
                      (e.currentTarget as HTMLButtonElement).style.color = C.danger;
                    }}
                  >
                    <X size={13} strokeWidth={2.5} aria-hidden="true" />
                    مسح الفلاتر
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ════ SEPARATOR ════ */}
          <div
            aria-hidden="true"
            style={{
              height:     1,
              background: `linear-gradient(to left, transparent, ${C.border} 20%, ${C.border} 80%, transparent)`,
            }}
          />

          {/* ════ ROW 2 — Date | Status pills | Search ════ */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '1rem',
              flexWrap:   'wrap',
            }}
          >

            {/* ── Date picker ── */}
            <div
              style={{
                position:   'relative',
                display:    'flex',
                alignItems: 'center',
                gap:        '0.45rem',
                padding:    '0.35em 0.9em',
                borderRadius: 9999,
                border:     `1.5px solid ${filters.date !== todayISO() ? C.gold : C.border}`,
                background: filters.date !== todayISO()
                  ? C.goldMuted
                  : C.navy5,
                cursor:     'pointer',
                flexShrink: 0,
                transition: 'border-color 180ms ease, background 180ms ease',
              }}
            >
              <CalendarDays
                size={14}
                strokeWidth={2}
                aria-hidden="true"
                style={{ color: filters.date !== todayISO() ? C.goldDark : C.textMuted, flexShrink: 0 }}
              />
              <label
                htmlFor={dateId}
                style={{
                  fontFamily: FONT_AR,
                  fontSize:   '0.8125rem',
                  fontWeight: filters.date !== todayISO() ? 700 : 500,
                  color:      filters.date !== todayISO() ? C.goldDark : C.textMuted,
                  cursor:     'pointer',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {dateIsToday ? `اليوم — ${formattedDate}` : formattedDate}
              </label>

              {/* Invisible native date input overlaid for click-to-open */}
              <input
                id={dateId}
                type="date"
                value={filters.date}
                onChange={handleDateChange}
                aria-label="اختر تاريخ الفلتر"
                className="bfb-date-input"
                style={{
                  position: 'absolute',
                  inset:    0,
                  opacity:  0,
                  cursor:   'pointer',
                  width:    '100%',
                  height:   '100%',
                }}
              />

              {/* ChevronDown indicator */}
              <ChevronDown
                size={12}
                strokeWidth={2.5}
                aria-hidden="true"
                style={{ color: filters.date !== todayISO() ? C.goldDark : C.textMuted, flexShrink: 0 }}
              />
            </div>

            {/* ── Vertical divider ── */}
            <div
              aria-hidden="true"
              style={{
                width:      1,
                height:     28,
                background: C.border,
                flexShrink: 0,
              }}
            />

            {/* ── Status pills ── */}
            <div
              role="group"
              aria-label="فلتر الحالة"
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '0.375rem',
                flexShrink: 0,
              }}
            >
              {STATUS_OPTIONS.map(opt => (
                <StatusPill
                  key={opt.id}
                  option={opt}
                  active={filters.status === opt.id}
                  onClick={() => handleStatusChange(opt.id)}
                />
              ))}
            </div>

            {/* ── Vertical divider ── */}
            <div
              aria-hidden="true"
              style={{
                width:      1,
                height:     28,
                background: C.border,
                flexShrink: 0,
              }}
            />

            {/* ── Search input ── */}
            <div
              style={{
                position:     'relative',
                flex:         '1 1 220px',
                minWidth:     160,
                maxWidth:     360,
              }}
            >
              {/* Search icon (logical start = right in RTL) */}
              <Search
                size={15}
                strokeWidth={2}
                aria-hidden="true"
                style={{
                  position:    'absolute',
                  insetInlineEnd: '0.75rem',
                  top:         '50%',
                  transform:   'translateY(-50%)',
                  color:       searchInput ? C.gold : C.textMuted,
                  pointerEvents:'none',
                  transition:  'color 200ms ease',
                  flexShrink:  0,
                }}
              />

              <input
                id={searchId}
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="بحث بالاسم أو رقم الهاتف..."
                aria-label="بحث في الحجوزات"
                className="bfb-search-input"
                style={{
                  width:          '100%',
                  padding:        '0.42em 2.25em 0.42em 0.9em',
                  borderRadius:   9999,
                  border:         `1.5px solid ${searchInput ? C.gold : C.border}`,
                  background:     searchInput ? C.goldMuted : C.navy5,
                  fontFamily:     FONT_AR,
                  fontSize:       '0.875rem',
                  fontWeight:     400,
                  color:          C.textPrimary,
                  direction:      'rtl',
                  transition:     'border-color 200ms ease, background 200ms ease, box-shadow 200ms ease',
                  boxShadow:      searchInput
                    ? `0 0 0 3px rgba(201,168,76,0.18)`
                    : 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = C.gold;
                  e.currentTarget.style.boxShadow   = `0 0 0 3px rgba(201,168,76,0.18)`;
                  e.currentTarget.style.background   = C.goldMuted;
                }}
                onBlur={e => {
                  if (!searchInput) {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow   = 'none';
                    e.currentTarget.style.background   = C.navy5;
                  }
                }}
              />

              {/* Clear search X button */}
              <AnimatePresence>
                {searchInput && (
                  <motion.button
                    key="clear-search"
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setFilters(prev => ({ ...prev, query: '' }));
                    }}
                    initial={shouldReduce ? {} : { opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldReduce ? {} : { opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    aria-label="مسح البحث"
                    style={{
                      position:        'absolute',
                      insetInlineStart:'0.6rem',
                      top:             '50%',
                      transform:       'translateY(-50%)',
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                      width:           18,
                      height:          18,
                      borderRadius:    9999,
                      border:          'none',
                      background:      C.textMuted,
                      color:           C.white,
                      cursor:          'pointer',
                      padding:         0,
                    }}
                  >
                    <X size={10} strokeWidth={3} aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* ── Active filter indicator strip — gold microline at bottom ── */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              key="active-strip"
              initial={shouldReduce ? {} : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={shouldReduce ? {} : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
              style={{
                height:          2,
                background:      `linear-gradient(to left, transparent 2%, ${C.gold} 30%, ${C.goldDark} 70%, transparent 98%)`,
                transformOrigin: 'center',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ─── Result Count Badge (separate for key-based re-animation) ────────────────

function ResultCountBadge({ count }: { count: number }) {
  const [key, setKey] = useState(0);
  const prevCount = useRef(count);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (count !== prevCount.current) {
      setKey(k => k + 1);
      prevCount.current = count;
    }
  }, [count]);

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '0.3em',
        padding:    '0.3em 0.85em',
        borderRadius: 9999,
        background: C.navy5,
        border:     `1px solid ${C.navy10}`,
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`عدد النتائج: ${count}`}
    >
      <span
        key={key}
        className={shouldReduce ? '' : 'bfb-result-count-pop'}
        style={{
          fontFamily:   FONT_NUM,
          fontSize:     '1rem',
          fontWeight:   700,
          color:        C.navy,
          letterSpacing:'-0.01em',
          lineHeight:   1,
          display:      'inline-block',
        }}
      >
        {count.toLocaleString('ar-EG')}
      </span>
      <span
        style={{
          fontFamily: FONT_AR,
          fontSize:   '0.75rem',
          fontWeight: 500,
          color:      C.textMuted,
        }}
      >
        نتيجة
      </span>
    </div>
  );
}
