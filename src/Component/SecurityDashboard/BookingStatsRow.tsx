/**
 * BookingStatsRow
 * نادي حلوان — صف إحصائيات الحجوزات
 *
 * Three stat cards: total | confirmed | pending
 * Features animated count-up, proportion ring, and staggered entry.
 *
 * RTL | Cairo + Barlow Condensed | Framer Motion
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BookingStatsRowProps {
  total:     number;
  confirmed: number;
  pending:   number;
}

// ─── Design tokens (self-contained) ──────────────────────────────────────────

const C = {
  white:      '#FFFFFF',
  bg:         '#F0F2F5',
  border:     '#DDE3EF',
  navy:       '#0A1628',
  navy70:     '#243E6A',
  navy5:      '#EDF1F7',
  gold:       '#C9A84C',
  success:    '#22C55E',
  successDk:  '#15803D',
  successBg:  'rgba(34,197,94,0.05)',
  warning:    '#F59E0B',
  warningDk:  '#B45309',
  warningBg:  'rgba(245,158,11,0.05)',
  navyBg:     'rgba(10,22,40,0.035)',
  textMuted:  '#64748B',
} as const;

const FONT_AR  = "'Cairo', ui-sans-serif, system-ui, sans-serif";
const FONT_NUM = "'Barlow Condensed', ui-sans-serif, system-ui, sans-serif";

// ─── useCountUp ───────────────────────────────────────────────────────────────

/**
 * Animates from 0 → target using ease-out-cubic over `ms` milliseconds.
 * Respects reduced-motion by returning the target immediately.
 */
function useCountUp(target: number, ms = 1100): number {
  const shouldReduce  = useReducedMotion();
  const [value, setValue] = useState(0);
  const rafRef        = useRef<number>(0);
  const prevTarget    = useRef<number>(-1);

  useEffect(() => {
    if (prevTarget.current === target) return;
    prevTarget.current = target;

    if (shouldReduce) {
      setValue(target);
      return;
    }

    let startTime: number | null = null;
    const from = value;

    function step(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed  = ts - startTime;
      const progress = Math.min(elapsed / ms, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ms, shouldReduce]);

  return value;
}

// ─── ProportionRing ───────────────────────────────────────────────────────────

/**
 * SVG circular progress ring showing a proportion 0–1.
 * Animates the stroke-dashoffset on mount.
 */
function ProportionRing({
  ratio,
  color,
  size  = 48,
  stroke = 4,
}: {
  ratio:  number;    // 0–1
  color:  string;
  size?:  number;
  stroke?: number;
}) {
  const shouldReduce = useReducedMotion();
  const r            = (size - stroke) / 2;
  const circ         = 2 * Math.PI * r;
  const dashOffset   = circ * (1 - Math.max(0, Math.min(1, ratio)));

  const [offset, setOffset] = useState(circ);  // start fully hidden

  useEffect(() => {
    if (shouldReduce) { setOffset(dashOffset); return; }
    // Delay slightly so card entry animation plays first
    const id = setTimeout(() => setOffset(dashOffset), 200);
    return () => clearTimeout(id);
  }, [dashOffset, shouldReduce]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.12}
        strokeWidth={stroke}
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: shouldReduce ? 'none' : 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
      />
    </svg>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardConfig {
  id:            string;
  label:         string;
  sublabel:      string;      // e.g. "حجز اليوم"
  value:         number;
  ratio:         number;      // 0–1 for ring
  accentColor:   string;
  accentDark:    string;
  bgWash:        string;
  /** Arabic symbol / glyph for the icon area center */
  glyph:         string;
  /** Barlow Condensed font size */
  numSize?:       number;
}

function StatCard({
  card,
  index,
}: {
  card:  StatCardConfig;
  index: number;
}) {
  const shouldReduce = useReducedMotion();
  const displayValue = useCountUp(card.value, 1100);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      key={card.id}
      initial={shouldReduce ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay:    index * 0.1,
        ease:     [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label={`${card.label}: ${card.value}`}
      style={{
        position:     'relative',
        flex:         '1 1 0',
        minWidth:     0,
        background:   C.white,
        border:       `1px solid ${C.border}`,
        borderRadius:  14,
        overflow:     'hidden',
        cursor:       'default',
        boxShadow:    hovered
          ? `0 8px 28px rgba(10,22,40,0.10), 0 2px 8px rgba(10,22,40,0.06)`
          : `0 2px 8px rgba(10,22,40,0.05), 0 1px 2px rgba(10,22,40,0.04)`,
        transform:    hovered && !shouldReduce ? 'translateY(-2px)' : 'translateY(0)',
        transition:   'box-shadow 250ms ease, transform 250ms ease',
      }}
    >
      {/* ── Colored right accent bar (RTL = visual start) ── */}
      <motion.div
        aria-hidden="true"
        initial={shouldReduce ? {} : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.55, delay: index * 0.1 + 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position:        'absolute',
          insetBlock:       0,
          insetInlineEnd:   0,
          width:            4,
          background:       `linear-gradient(to bottom, ${card.accentColor}, ${card.accentDark})`,
          borderRadius:    '0 14px 14px 0',
          transformOrigin: 'top',
        }}
      />

      {/* ── Background color wash ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:       0,
          background:  card.bgWash,
          borderRadius: 14,
          pointerEvents:'none',
        }}
      />

      {/* ── Subtle diagonal line pattern overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:       0,
          borderRadius: 14,
          pointerEvents:'none',
          backgroundImage: `repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 18px,
            ${card.accentColor}0C 18px,
            ${card.accentColor}0C 19px
          )`,
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position:    'relative',
          padding:     '1.25rem 1.375rem 1.125rem',
          display:     'flex',
          flexDirection:'column',
          gap:          0,
        }}
      >
        {/* Top row: label + ring */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-start',
            marginBottom:   '0.625rem',
          }}
        >
          {/* Labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily:  FONT_AR,
                fontSize:    '0.9375rem',
                fontWeight:  700,
                color:       C.navy,
                lineHeight:  1.2,
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontFamily:  FONT_AR,
                fontSize:    '0.75rem',
                fontWeight:  400,
                color:       C.textMuted,
                lineHeight:  1.3,
              }}
            >
              {card.sublabel}
            </span>
          </div>

          {/* Proportion ring + glyph stack */}
          <div
            style={{
              position:   'relative',
              width:       48,
              height:      48,
              flexShrink: 0,
            }}
          >
            <ProportionRing ratio={card.ratio} color={card.accentColor} size={48} stroke={3.5} />
            {/* Glyph centred inside ring */}
            <span
              aria-hidden="true"
              style={{
                position:   'absolute',
                inset:       0,
                display:    'flex',
                alignItems: 'center',
                justifyContent:'center',
                fontSize:   '1.125rem',
                lineHeight:  1,
              }}
            >
              {card.glyph}
            </span>
          </div>
        </div>

        {/* Large count number */}
        <div
          style={{
            display:    'flex',
            alignItems: 'baseline',
            gap:        '0.25em',
          }}
        >
          <span
            style={{
              fontFamily:   FONT_NUM,
              fontSize:     '2.5rem',         /* 40px — slightly bigger than 36 for impact */
              fontWeight:   800,
              color:        card.accentColor,
              lineHeight:   1,
              letterSpacing:'-0.02em',
              textShadow:   `0 0 24px ${card.accentColor}30`,
              minWidth:     '1ch',            /* prevent layout shift */
              display:      'inline-block',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {displayValue.toLocaleString('ar-EG')}
          </span>

          {/* Percentage badge — only for confirmed & pending */}
          {card.ratio < 1 && card.value > 0 && (
            <motion.span
              initial={shouldReduce ? {} : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.6 }}
              style={{
                fontFamily:   FONT_NUM,
                fontSize:     '0.875rem',
                fontWeight:   600,
                color:        card.accentColor,
                opacity:      0.7,
                letterSpacing:'0.01em',
              }}
            >
              {Math.round(card.ratio * 100)}٪
            </motion.span>
          )}
        </div>

        {/* ── Bottom progress fill bar ── */}
        <div
          aria-hidden="true"
          style={{
            marginTop:   '0.875rem',
            height:       3,
            borderRadius: 9999,
            background:   `${card.accentColor}1A`,
            overflow:     'hidden',
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${Math.round(card.ratio * 100)}%` }}
            transition={{
              duration: 1.0,
              delay:    index * 0.1 + 0.3,
              ease:     [0.22, 1, 0.36, 1],
            }}
            style={{
              height:        '100%',
              borderRadius:  9999,
              background:    `linear-gradient(to left, ${card.accentColor}, ${card.accentDark})`,
              boxShadow:     `0 0 6px ${card.accentColor}60`,
            }}
          />
        </div>
      </div>
    </motion.article>
  );
}

// ─── BookingStatsRow ──────────────────────────────────────────────────────────

export default function BookingStatsRow({
  total,
  confirmed,
  pending,
}: BookingStatsRowProps) {

  const safeTotal = total > 0 ? total : 1;  // avoid div/0

  const cards: StatCardConfig[] = [
    {
      id:          'total',
      label:       'إجمالي الحجوزات',
      sublabel:    'جميع الحجوزات اليوم',
      value:       total,
      ratio:       1,
      accentColor: C.navy,
      accentDark:  C.navy70,
      bgWash:      C.navyBg,
      glyph:       '📋',
    },
    {
      id:          'confirmed',
      label:       'مؤكدة',
      sublabel:    'حجوزات مؤكدة',
      value:       confirmed,
      ratio:       confirmed / safeTotal,
      accentColor: C.success,
      accentDark:  C.successDk,
      bgWash:      C.successBg,
      glyph:       '✓',
    },
    {
      id:          'pending',
      label:       'معلقة',
      sublabel:    'في انتظار التأكيد',
      value:       pending,
      ratio:       pending / safeTotal,
      accentColor: C.warning,
      accentDark:  C.warningDk,
      bgWash:      C.warningBg,
      glyph:       '⏳',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes bsrShimmer {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <div
        dir="rtl"
        role="region"
        aria-label="إحصائيات الحجوزات"
        style={{
          display:   'flex',
          gap:       '1.125rem',
          padding:   '1.25rem 1.75rem 0',
          alignItems:'stretch',
        }}
      >
        {cards.map((card, i) => (
          <StatCard key={card.id} card={card} index={i} />
        ))}
      </div>
    </>
  );
}
