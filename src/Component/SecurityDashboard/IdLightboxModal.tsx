/**
 * IdLightboxModal
 * نادي حلوان — عارض صور البطاقة الشخصية
 *
 * Full-screen secure document viewer for national ID card images.
 * Aesthetic: classified document viewer — dark void, gold frame markers,
 * authoritative typography. Renders via React portal at document.body.
 *
 * RTL | Cairo | Framer Motion | createPortal
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  Lock,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IdLightboxModalProps {
  isOpen:   boolean;
  imageUrl: string;
  label:    string;
  onClose:  () => void;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  void:       '#050C18',         // near-black backdrop
  surface:    '#0D1B2E',         // modal panel
  surfaceMid: '#132236',
  border:     'rgba(255,255,255,0.08)',
  gold:       '#C9A84C',
  goldLight:  '#E8D49A',
  goldDark:   '#9B7D2E',
  goldDim:    'rgba(201,168,76,0.25)',
  white:      '#FFFFFF',
  textPrimary:'rgba(255,255,255,0.92)',
  textMuted:  'rgba(255,255,255,0.42)',
  amber:      '#F59E0B',
  amberBg:    'rgba(245,158,11,0.12)',
  danger:     '#EF4444',
} as const;

const FONT_AR = "'Cairo', ui-sans-serif, system-ui, sans-serif";

// ─── Corner bracket markers ───────────────────────────────────────────────────

/**
 * Four corner bracket decorations — evoke a classified document scanner frame.
 * prop `corner`: 'tl' | 'tr' | 'bl' | 'br'
 */
function CornerMark({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size   = 20;
  const thick  = 2;
  const offset = -6;

  const pos: React.CSSProperties = {
    position:   'absolute',
    width:       size,
    height:      size,
    zIndex:      2,
    pointerEvents:'none',
  };

  const borders: React.CSSProperties = {
    tl: { top: offset, right: offset, borderTop: `${thick}px solid ${C.gold}`, borderRight: `${thick}px solid ${C.gold}`, borderTopRightRadius: 2 },
    tr: { top: offset, left:  offset, borderTop: `${thick}px solid ${C.gold}`, borderLeft:  `${thick}px solid ${C.gold}`, borderTopLeftRadius:  2 },
    bl: { bottom: offset, right: offset, borderBottom: `${thick}px solid ${C.gold}`, borderRight: `${thick}px solid ${C.gold}`, borderBottomRightRadius: 2 },
    br: { bottom: offset, left:  offset, borderBottom: `${thick}px solid ${C.gold}`, borderLeft:  `${thick}px solid ${C.gold}`, borderBottomLeftRadius:  2 },
  }[corner];

  return <div aria-hidden="true" style={{ ...pos, ...borders }} />;
}

// ─── Download helper ──────────────────────────────────────────────────────────

async function downloadImage(url: string, filename: string) {
  try {
    const res  = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href,
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    // Cross-origin fallback
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IdLightboxModal({
  isOpen,
  imageUrl,
  label,
  onClose,
}: IdLightboxModalProps) {
  const shouldReduce   = useReducedMotion();
  const [zoomed, setZoomed]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]  = useState(false);
  const [downloading, setDownloading] = useState(false);
  const backdropRef  = useRef<HTMLDivElement>(null);
  const closeRef     = useRef<HTMLButtonElement>(null);

  // Reset state whenever a new image opens
  useEffect(() => {
    if (isOpen) {
      setZoomed(false);
      setImgLoaded(false);
      setImgError(false);
    }
  }, [isOpen, imageUrl]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button for accessibility
      setTimeout(() => closeRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    await downloadImage(imageUrl, `helwan-id-${label}-${Date.now()}.jpg`);
    setDownloading(false);
  }, [imageUrl, label, downloading]);

  const toggleZoom = useCallback(() => {
    setZoomed(z => !z);
  }, []);

  // ── Animation variants ──
  const backdropVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  };

  const panelVariants = {
    hidden:  shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.90, y: 18 },
    visible: shouldReduce ? { opacity: 1 } : { opacity: 1, scale: 1,    y: 0 },
    exit:    shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 },
  };

  // ── Portal ──
  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="ilb-backdrop"
            ref={backdropRef}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: shouldReduce ? 0.01 : 0.28, ease: 'easeInOut' }}
            onClick={handleBackdropClick}
            aria-hidden="true"
            style={{
              position:   'fixed',
              inset:       0,
              zIndex:      999,
              background: 'rgba(5,12,24,0.92)',
              backdropFilter: 'blur(8px) saturate(0.6)',
              WebkitBackdropFilter: 'blur(8px) saturate(0.6)',
            }}
          />

          {/* ── Backdrop noise texture ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              pointerEvents: 'none',
            }}
          />

          {/* ── Modal Panel ── */}
          <motion.div
            key="ilb-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`عرض ${label}`}
            dir="rtl"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: shouldReduce ? 0.01 : 0.36,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position:       'fixed',
              inset:           0,
              zIndex:          1000,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '1.5rem',
              pointerEvents:  'none',   /* let backdrop capture outside clicks */
            }}
          >
            <div
              style={{
                pointerEvents:  'auto',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:             '1rem',
                width:          '100%',
                maxWidth:       820,
              }}
            >

              {/* ═══ HEADER BAR ══════════════════════════════════════════════ */}
              <div
                style={{
                  width:          '100%',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  gap:             '1rem',
                }}
              >
                {/* Label + shield icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert
                    size={16}
                    strokeWidth={2}
                    color={C.gold}
                    aria-hidden="true"
                  />
                  <h2
                    style={{
                      fontFamily:   FONT_AR,
                      fontSize:     '1rem',
                      fontWeight:   700,
                      color:        C.textPrimary,
                      margin:       0,
                      letterSpacing:'0.01em',
                    }}
                  >
                    {label}
                  </h2>
                  {/* Gold underline accent */}
                  <span
                    aria-hidden="true"
                    style={{
                      display:      'inline-block',
                      width:        36,
                      height:       2,
                      borderRadius: 9999,
                      background:   `linear-gradient(to left, ${C.gold}, ${C.goldDark})`,
                      marginRight:  2,
                      alignSelf:    'center',
                    }}
                  />
                </div>

                {/* Right-side action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                  {/* Download */}
                  <motion.button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading || imgError}
                    whileTap={shouldReduce ? {} : { scale: 0.93 }}
                    aria-label="تحميل الصورة"
                    title="تحميل"
                    style={{
                      display:        'inline-flex',
                      alignItems:     'center',
                      gap:             5,
                      padding:        '0.45em 1.1em',
                      borderRadius:   9999,
                      border:         `1.5px solid ${C.goldDim}`,
                      background:     'rgba(201,168,76,0.08)',
                      color:          downloading || imgError ? C.textMuted : C.gold,
                      fontFamily:     FONT_AR,
                      fontSize:       '0.8125rem',
                      fontWeight:     600,
                      cursor:         downloading || imgError ? 'not-allowed' : 'pointer',
                      transition:     'background 160ms ease, border-color 160ms ease',
                      opacity:        imgError ? 0.4 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!downloading && !imgError)
                        (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.16)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)';
                    }}
                  >
                    {downloading
                      ? <Loader2 size={13} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
                      : <Download size={13} strokeWidth={2.5} aria-hidden="true" />
                    }
                    {downloading ? 'جارٍ التحميل...' : 'تحميل'}
                  </motion.button>

                  {/* Close X */}
                  <motion.button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    whileTap={shouldReduce ? {} : { scale: 0.88, rotate: 90 }}
                    aria-label="إغلاق"
                    title="إغلاق (ESC)"
                    style={{
                      width:          36,
                      height:         36,
                      borderRadius:  '50%',
                      border:         `1.5px solid rgba(255,255,255,0.12)`,
                      background:    'rgba(255,255,255,0.06)',
                      color:          C.textPrimary,
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent:'center',
                      cursor:        'pointer',
                      transition:    'background 150ms ease, border-color 150ms ease',
                      flexShrink:    0,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)';
                      (e.currentTarget as HTMLElement).style.borderColor = `${C.danger}60`;
                      (e.currentTarget as HTMLElement).style.color = C.danger;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                      (e.currentTarget as HTMLElement).style.color = C.textPrimary;
                    }}
                  >
                    <X size={16} strokeWidth={2.5} aria-hidden="true" />
                  </motion.button>
                </div>
              </div>

              {/* ═══ IMAGE FRAME ═════════════════════════════════════════════ */}
              <div
                style={{
                  position:   'relative',
                  borderRadius: 12,
                  background: C.surface,
                  border:     `1px solid ${C.border}`,
                  boxShadow:  `
                    0 0 0 1px rgba(201,168,76,0.08),
                    0 4px 40px rgba(0,0,0,0.6),
                    0 1px 8px rgba(0,0,0,0.4)
                  `,
                  overflow:   'hidden',
                  maxWidth:   '90vw',
                  maxHeight:  '72vh',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent:'center',
                  padding:    16,
                  cursor:     zoomed ? 'zoom-out' : 'zoom-in',
                }}
                onClick={toggleZoom}
                role="button"
                aria-label={zoomed ? 'تصغير' : 'تكبير'}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoom(); } }}
              >
                {/* Corner markers */}
                <CornerMark corner="tl" />
                <CornerMark corner="tr" />
                <CornerMark corner="bl" />
                <CornerMark corner="br" />

                {/* Zoom indicator overlay (briefly shown when toggling) */}
                <div
                  aria-hidden="true"
                  style={{
                    position:       'absolute',
                    top:             10,
                    left:            10,
                    display:        'flex',
                    alignItems:     'center',
                    gap:             4,
                    padding:        '3px 9px',
                    borderRadius:   9999,
                    background:     'rgba(10,22,40,0.7)',
                    border:         `1px solid ${C.goldDim}`,
                    zIndex:          3,
                    pointerEvents: 'none',
                  }}
                >
                  {zoomed
                    ? <ZoomOut size={12} strokeWidth={2} color={C.gold} />
                    : <ZoomIn  size={12} strokeWidth={2} color={C.gold} />
                  }
                  <span style={{
                    fontFamily: FONT_AR,
                    fontSize:   '0.6875rem',
                    color:      C.gold,
                    fontWeight: 600,
                  }}>
                    {zoomed ? 'اضغط للتصغير' : 'اضغط للتكبير'}
                  </span>
                </div>

                {/* Loading spinner */}
                {!imgLoaded && !imgError && (
                  <div
                    aria-label="جارٍ التحميل..."
                    style={{
                      position:       'absolute',
                      inset:           0,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      background:      C.surface,
                      zIndex:          1,
                      borderRadius:    12,
                    }}
                  >
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 12 }}>
                      <Loader2
                        size={32}
                        strokeWidth={1.5}
                        color={C.gold}
                        style={{ animation: 'ilbSpin 1s linear infinite' }}
                        aria-hidden="true"
                      />
                      <span style={{
                        fontFamily: FONT_AR,
                        fontSize:   '0.875rem',
                        color:      C.textMuted,
                      }}>
                        جارٍ تحميل الصورة...
                      </span>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {imgError && (
                  <div
                    style={{
                      display:        'flex',
                      flexDirection:  'column',
                      alignItems:     'center',
                      justifyContent: 'center',
                      gap:             10,
                      padding:        '2rem 3rem',
                      color:           C.textMuted,
                    }}
                  >
                    <ShieldAlert size={36} strokeWidth={1.5} color={C.textMuted} aria-hidden="true" />
                    <span style={{ fontFamily: FONT_AR, fontSize:'0.875rem' }}>
                      تعذّر تحميل الصورة
                    </span>
                  </div>
                )}

                {/* The actual image */}
                {!imgError && (
                  <img
                    src={imageUrl}
                    alt={label}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => { setImgError(true); setImgLoaded(true); }}
                    draggable={false}
                    style={{
                      maxWidth:      '100%',
                      maxHeight:     'calc(72vh - 32px)',
                      objectFit:     'contain',
                      display:       'block',
                      borderRadius:   6,
                      opacity:        imgLoaded ? 1 : 0,
                      transform:      zoomed ? 'scale(2)' : 'scale(1)',
                      transformOrigin:'center',
                      transition:    `
                        transform 380ms cubic-bezier(0.22,1,0.36,1),
                        opacity 240ms ease
                      `,
                      userSelect:    'none',
                      WebkitUserSelect:'none',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>

              {/* ═══ SECURITY FOOTER ════════════════════════════════════════ */}
              <motion.div
                initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:             8,
                  padding:        '0.5em 1.5em',
                  borderRadius:   9999,
                  background:      C.amberBg,
                  border:         `1px solid rgba(245,158,11,0.22)`,
                }}
              >
                <Lock
                  size={12}
                  strokeWidth={2.5}
                  color={C.amber}
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontFamily:  FONT_AR,
                    fontSize:    '0.75rem',
                    fontWeight:  600,
                    color:       C.amber,
                    letterSpacing:'0.01em',
                  }}
                >
                  هذه الصورة سرية ولا يجوز مشاركتها
                </span>
                <Lock
                  size={12}
                  strokeWidth={2.5}
                  color={C.amber}
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                />
              </motion.div>

            </div>
          </motion.div>

          {/* Spin keyframe (local injection, avoids global CSS conflict) */}
          <style>{`
            @keyframes ilbSpin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
