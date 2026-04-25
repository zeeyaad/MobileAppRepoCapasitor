/**
 * BookingCard
 * نادي حلوان — بطاقة حجز
 *
 * Displays a single booking entry with identity verification thumbnails.
 * Three-column RTL layout: Person | Booking details | Status + ID images.
 *
 * RTL | Cairo + Barlow Condensed | Framer Motion
 */

import { useCallback, useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Phone,
  CreditCard,
  Hash,
  Clock,
  CalendarDays,
  ZoomIn,
  ShieldAlert,
  MapPin,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface BookingCardProps {
  id:           string;
  personName:   string;
  phoneNumber:  string;
  fieldName:    string;
  bookingDate:  string;           // ISO: YYYY-MM-DD
  startTime:    string;           // HH:MM
  endTime:      string;           // HH:MM
  status:       BookingStatus;
  frontIdUrl:   string;
  backIdUrl:    string;
  membershipId?: string;
  onIdClick:    (url: string) => void;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  white:      '#FFFFFF',
  border:     '#DDE3EF',
  navy:       '#0A1628',
  navy5:      '#EDF1F7',
  navyMid:    '#243E6A',
  gold:       '#C9A84C',
  textPrimary:'#0A1628',
  textMuted:  '#64748B',
  textFaint:  '#94A3B8',
} as const;

const FONT_AR  = "'Cairo', ui-sans-serif, system-ui, sans-serif";
const FONT_NUM = "'Barlow Condensed', ui-sans-serif, system-ui, sans-serif";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS: Record<BookingStatus, {
  label:       string;
  color:       string;
  dark:        string;
  border:      string;   // visual-left CSS border color
  glow:        string;   // box-shadow glow color
  badgeBg:     string;
  badgeText:   string;
  avatarBg:    string;
}> = {
  confirmed: {
    label:     'مؤكد',
    color:     '#22C55E',
    dark:      '#15803D',
    border:    '#22C55E',
    glow:      'rgba(34,197,94,0.25)',
    badgeBg:   '#DCFCE7',
    badgeText: '#166534',
    avatarBg:  'rgba(34,197,94,0.12)',
  },
  pending: {
    label:     'معلق',
    color:     '#F59E0B',
    dark:      '#B45309',
    border:    '#F59E0B',
    glow:      'rgba(245,158,11,0.22)',
    badgeBg:   '#FEF3C7',
    badgeText: '#78350F',
    avatarBg:  'rgba(245,158,11,0.10)',
  },
  cancelled: {
    label:     'ملغي',
    color:     '#EF4444',
    dark:      '#B91C1C',
    border:    '#EF4444',
    glow:      'rgba(239,68,68,0.18)',
    badgeBg:   '#FEE2E2',
    badgeText: '#991B1B',
    avatarBg:  'rgba(239,68,68,0.08)',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('ar-EG', {
      weekday: 'short',
      day:     'numeric',
      month:   'short',
      year:    'numeric',
    });
  } catch {
    return iso;
  }
}

function calcDuration(start: string, end: string): string {
  const [sh = 0, sm = 0] = start.split(':').map(Number);
  const [eh = 0, em = 0] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} دقيقة`;
  if (m === 0) return `${h} ساعة`;
  return `${h}س ${m}د`;
}

/** First Arabic character of a name for the avatar monogram */
function nameInitial(name: string): string {
  return [...name.trim()][0] ?? '؟';
}

/** Short booking reference from the full id */
function shortRef(id: string): string {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

// ─── IdThumbnail ─────────────────────────────────────────────────────────────

interface IdThumbnailProps {
  url:      string;
  label:    string;
  onClick:  () => void;
  disabled?: boolean;
}

function IdThumbnail({ url, label, onClick, disabled }: IdThumbnailProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Thumbnail frame */}
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`عرض ${label}`}
        disabled={disabled}
        style={{
          position:     'relative',
          width:         90,
          height:        60,
          borderRadius:  7,
          overflow:     'hidden',
          border:        `1.5px solid ${hovered && !disabled ? C.gold : C.border}`,
          padding:       0,
          background:    C.navy5,
          cursor:        disabled ? 'default' : 'pointer',
          transition:   'border-color 180ms ease, box-shadow 180ms ease',
          boxShadow:     hovered && !disabled
            ? `0 2px 10px rgba(201,168,76,0.3), 0 0 0 2px rgba(201,168,76,0.12)`
            : `0 1px 3px rgba(10,22,40,0.08)`,
          flexShrink:    0,
        }}
      >
        {!imgError ? (
          <img
            src={url}
            alt={label}
            onError={() => setImgError(true)}
            draggable={false}
            style={{
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              display:    'block',
              filter:     disabled ? 'grayscale(60%) opacity(0.6)' : 'none',
              transition: 'transform 220ms ease',
              transform:  hovered && !disabled ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          /* Fallback placeholder */
          <IdPlaceholder label={label} />
        )}

        {/* Scan-line overlay on hover */}
        {hovered && !disabled && !imgError && (
          <span
            aria-hidden="true"
            style={{
              position:    'absolute',
              insetInline:  0,
              top:          0,
              height:       2,
              background:  `linear-gradient(to left, transparent, ${C.gold}, transparent)`,
              animation:   'bcScan 1.2s ease-in-out infinite',
              pointerEvents:'none',
            }}
          />
        )}

        {/* Magnify icon */}
        {hovered && !disabled && (
          <span
            aria-hidden="true"
            style={{
              position:       'absolute',
              inset:           0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     'rgba(10,22,40,0.42)',
              borderRadius:   5,
            }}
          >
            <ZoomIn size={18} strokeWidth={2} color={C.gold} />
          </span>
        )}
      </button>

      {/* Label */}
      <span
        style={{
          fontFamily:  FONT_AR,
          fontSize:    '0.6875rem',
          fontWeight:  500,
          color:       C.textFaint,
          textAlign:   'center',
          lineHeight:  1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** SVG national-ID-shaped placeholder shown on image error */
function IdPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            4,
        background:     C.navy5,
      }}
    >
      <CreditCard size={20} strokeWidth={1.5} color={C.textFaint} aria-hidden="true" />
      <span
        style={{
          fontFamily: FONT_AR,
          fontSize:   '0.5625rem',
          color:      C.textFaint,
          textAlign:  'center',
          padding:    '0 4px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Vertical divider ─────────────────────────────────────────────────────────

function VDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        width:      1,
        alignSelf:  'stretch',
        background: `linear-gradient(to bottom, transparent, ${C.border} 15%, ${C.border} 85%, transparent)`,
        flexShrink:  0,
        margin:     '0 0.125rem',
      }}
    />
  );
}

// ─── BookingCard ──────────────────────────────────────────────────────────────

export default function BookingCard(props: BookingCardProps) {
  const {
    id,
    personName,
    phoneNumber,
    fieldName,
    bookingDate,
    startTime,
    endTime,
    status,
    frontIdUrl,
    backIdUrl,
    membershipId,
    onIdClick,
  } = props;

  const labelId       = useId();
  const shouldReduce  = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const cfg        = STATUS[status];
  const isCancelled= status === 'cancelled';
  const duration   = calcDuration(startTime, endTime);

  const handleIdClick = useCallback(
    (url: string) => { if (!isCancelled) onIdClick(url); },
    [isCancelled, onIdClick]
  );

  return (
    <>
      <style>{`
        @keyframes bcScan {
          0%   { top: 0%;   opacity: 0.9; }
          80%  { top: 100%; opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      <motion.article
        dir="rtl"
        aria-labelledby={labelId}
        initial={shouldReduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: isCancelled ? 0.68 : 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          position:     'relative',
          display:      'flex',
          alignItems:   'stretch',
          gap:           0,
          background:    C.white,
          border:        `1px solid ${hovered ? cfg.border + '60' : C.border}`,
          borderLeft:    `5px solid ${cfg.border}`,
          borderRadius:  12,
          overflow:     'hidden',
          boxShadow:     hovered && !shouldReduce
            ? `0 6px 24px rgba(10,22,40,0.10), 0 1px 4px rgba(10,22,40,0.06), -2px 0 0 0 ${cfg.glow}`
            : `0 1px 4px rgba(10,22,40,0.06)`,
          transform:     hovered && !shouldReduce ? 'translateY(-2px)' : 'translateY(0)',
          transition:    'box-shadow 240ms ease, transform 240ms ease, border-color 240ms ease',
          cursor:        'default',
        }}
      >
        {/* ── Cancelled diagonal stripe texture ── */}
        {isCancelled && (
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:       0,
              borderRadius:11,
              pointerEvents:'none',
              backgroundImage:`repeating-linear-gradient(
                -45deg,
                rgba(239,68,68,0.04),
                rgba(239,68,68,0.04) 6px,
                transparent 6px,
                transparent 16px
              )`,
            }}
          />
        )}

        {/* ── Booking ref chip — top-left corner ── */}
        <div
          aria-label={`رقم الحجز: ${shortRef(id)}`}
          style={{
            position:  'absolute',
            top:        8,
            left:       10,
            display:   'flex',
            alignItems:'center',
            gap:        3,
            padding:   '2px 7px',
            borderRadius: 9999,
            background:  'rgba(10,22,40,0.055)',
            border:     `1px solid ${C.border}`,
          }}
        >
          <Hash size={9} strokeWidth={2.5} color={C.textFaint} aria-hidden="true" />
          <span
            style={{
              fontFamily:   FONT_NUM,
              fontSize:     '0.6875rem',
              fontWeight:   600,
              color:        C.textFaint,
              letterSpacing:'0.06em',
            }}
          >
            {shortRef(id)}
          </span>
        </div>

        {/* ════ COLUMN 1 — Person ════ */}
        <div
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:            '0.875rem',
            padding:       '0.9rem 1.125rem 0.9rem 0.875rem',
            flexShrink:     0,
            width:          230,
          }}
        >
          {/* Monogram avatar */}
          <div
            aria-hidden="true"
            style={{
              width:          46,
              height:         46,
              borderRadius:  '50%',
              background:     cfg.avatarBg,
              border:         `2px solid ${cfg.color}30`,
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              flexShrink:     0,
              fontFamily:     FONT_AR,
              fontSize:       '1.25rem',
              fontWeight:     700,
              color:          cfg.color,
              lineHeight:     1,
              userSelect:    'none',
              position:      'relative',
            }}
          >
            {nameInitial(personName)}
            {/* Status dot */}
            <span
              style={{
                position:   'absolute',
                bottom:      1,
                right:       1,
                width:       10,
                height:      10,
                borderRadius:'50%',
                background:  cfg.color,
                border:     `1.5px solid white`,
                boxShadow:  `0 0 0 1px ${cfg.color}40`,
              }}
            />
          </div>

          {/* Name + phone + membership */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <span
              id={labelId}
              style={{
                fontFamily:   FONT_AR,
                fontSize:     '0.9375rem',
                fontWeight:   700,
                color:        C.textPrimary,
                lineHeight:   1.25,
                whiteSpace:  'nowrap',
                overflow:    'hidden',
                textOverflow:'ellipsis',
              }}
            >
              {personName}
            </span>

            <span
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:         4,
                fontFamily: FONT_NUM,
                fontSize:   '0.875rem',
                fontWeight: 500,
                color:      C.textMuted,
                direction:  'ltr',        /* phone numbers always LTR */
                textAlign:  'right',
              }}
            >
              <Phone size={11} strokeWidth={2} color={C.textFaint} aria-hidden="true" />
              <span dir="ltr">{phoneNumber}</span>
            </span>

            {membershipId && (
              <span
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:         4,
                  fontFamily: FONT_NUM,
                  fontSize:   '0.75rem',
                  fontWeight: 600,
                  color:      C.gold,
                  letterSpacing:'0.04em',
                }}
              >
                <ShieldAlert size={10} strokeWidth={2} color={C.gold} aria-hidden="true" />
                {membershipId}
              </span>
            )}
          </div>
        </div>

        <VDivider />

        {/* ════ COLUMN 2 — Booking details ════ */}
        <div
          style={{
            flex:        '1 1 0',
            minWidth:     0,
            display:     'flex',
            flexDirection:'column',
            justifyContent:'center',
            gap:           6,
            padding:      '0.9rem 1.125rem',
          }}
        >
          {/* Field name */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:         6,
            }}
          >
            <MapPin
              size={13}
              strokeWidth={2}
              aria-hidden="true"
              style={{ color: C.gold, flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily:   FONT_AR,
                fontSize:     '0.875rem',
                fontWeight:   600,
                color:        C.textPrimary,
                whiteSpace:  'nowrap',
                overflow:    'hidden',
                textOverflow:'ellipsis',
              }}
            >
              {fieldName}
            </span>
          </div>

          {/* Time slot */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:         6,
            }}
            aria-label={`من ${startTime} إلى ${endTime}`}
          >
            <Clock
              size={12}
              strokeWidth={2}
              color={C.textFaint}
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            />
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:         4,
              }}
            >
              {/* Start time */}
              <span
                style={{
                  fontFamily:   FONT_NUM,
                  fontSize:     '1.0625rem',
                  fontWeight:   700,
                  color:        C.navyMid,
                  lineHeight:   1,
                  letterSpacing:'-0.01em',
                }}
              >
                {startTime}
              </span>

              {/* Connector */}
              <span aria-hidden="true" style={{ display:'flex', alignItems:'center', gap: 2 }}>
                <span style={{ width:12, height:1.5, background: C.border, display:'block', borderRadius:2 }} />
                <span style={{
                  width:6, height:6, borderRadius:'50%',
                  border:`1.5px solid ${cfg.color}`,
                  background: `${cfg.color}20`,
                  display:'block',
                }} />
                <span style={{ width:12, height:1.5, background: C.border, display:'block', borderRadius:2 }} />
              </span>

              {/* End time */}
              <span
                style={{
                  fontFamily:   FONT_NUM,
                  fontSize:     '1.0625rem',
                  fontWeight:   700,
                  color:        C.navyMid,
                  lineHeight:   1,
                  letterSpacing:'-0.01em',
                }}
              >
                {endTime}
              </span>

              {/* Duration chip */}
              {duration && (
                <span
                  style={{
                    fontFamily:   FONT_AR,
                    fontSize:     '0.6875rem',
                    fontWeight:   600,
                    color:        cfg.color,
                    background:   cfg.badgeBg,
                    padding:     '1px 7px',
                    borderRadius: 9999,
                    marginRight:  4,
                    lineHeight:   1.6,
                    flexShrink:   0,
                  }}
                >
                  {duration}
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:         5,
            }}
          >
            <CalendarDays
              size={12}
              strokeWidth={2}
              color={C.textFaint}
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: FONT_AR,
                fontSize:   '0.75rem',
                fontWeight: 400,
                color:      C.textMuted,
              }}
            >
              {formatDate(bookingDate)}
            </span>
          </div>
        </div>

        <VDivider />

        {/* ════ COLUMN 3 — Status + ID images ════ */}
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            justifyContent:'center',
            alignItems:   'flex-start',
            gap:            10,
            padding:       '0.75rem 1rem 0.75rem 1.125rem',
            flexShrink:    0,
          }}
        >
          {/* Status badge */}
          <div
            role="status"
            aria-label={`حالة الحجز: ${cfg.label}`}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:           5,
              padding:      '0.28em 0.85em',
              borderRadius:  9999,
              background:    cfg.badgeBg,
              border:       `1.5px solid ${cfg.color}40`,
              fontFamily:    FONT_AR,
              fontSize:     '0.8125rem',
              fontWeight:    700,
              color:         cfg.badgeText,
              lineHeight:    1.4,
              whiteSpace:   'nowrap',
            }}
          >
            {/* Dot indicator */}
            <span
              aria-hidden="true"
              style={{
                width:        7,
                height:       7,
                borderRadius: '50%',
                background:   cfg.color,
                display:     'inline-block',
                flexShrink:   0,
                boxShadow:   `0 0 4px ${cfg.glow}`,
              }}
            />
            {cfg.label}
          </div>

          {/* ID thumbnails row */}
          <div
            style={{
              display:    'flex',
              alignItems: 'flex-end',
              gap:         8,
            }}
            role="group"
            aria-label="صور البطاقة الشخصية"
          >
            <IdThumbnail
              url={frontIdUrl}
              label="وجه البطاقة"
              onClick={() => handleIdClick(frontIdUrl)}
              disabled={isCancelled}
            />
            <IdThumbnail
              url={backIdUrl}
              label="ظهر البطاقة"
              onClick={() => handleIdClick(backIdUrl)}
              disabled={isCancelled}
            />
          </div>
        </div>

      </motion.article>
    </>
  );
}
