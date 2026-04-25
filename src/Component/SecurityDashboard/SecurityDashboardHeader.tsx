/**
 * SecurityDashboardHeader — Simplified
 * نادي حلوان — بوابة الأمن
 *
 * Clean header: HUC logo | title | sign-out button.
 * Derives colors from the existing staff dashboard blue palette.
 * RTL | Cairo font
 */

import { LogOut } from 'lucide-react';

const FONT = "'Cairo', ui-sans-serif, system-ui, sans-serif";

// Brand blues matching the staff dashboard palette
const NAVY   = '#1B2D48';
const BORDER = 'rgba(255,255,255,0.10)';

export default function SecurityDashboardHeader() {
  return (
    <header
      dir="rtl"
      role="banner"
      aria-label="رأس لوحة مراقبة الأمن"
      style={{
        position:        'sticky',
        top:              0,
        zIndex:           50,
        width:           '100%',
        height:           64,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        paddingInline:   '1.5rem',
        background:       NAVY,
        borderBottom:    `1px solid ${BORDER}`,
        boxShadow:       '0 2px 12px rgba(10,22,40,0.25)',
      }}
    >
      {/* ── RIGHT: Logo + title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src="/assets/HUC_logo.jpeg"
          alt="شعار نادي حلوان"
          style={{
            width:        42,
            height:       42,
            borderRadius: '8px',
            objectFit:   'contain',
            background:  '#ffffff',
            padding:      '2px',
            flexShrink:   0,
          }}
        />

        {/* Thin vertical divider */}
        <div
          aria-hidden="true"
          style={{
            width:      1,
            height:     32,
            background: BORDER,
            flexShrink: 0,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <h1
            style={{
              fontFamily:   FONT,
              fontSize:     '1rem',
              fontWeight:   700,
              color:        '#ffffff',
              margin:        0,
              lineHeight:    1.2,
            }}
          >
            لوحة مراقبة الحجوزات
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize:   '0.75rem',
              fontWeight: 400,
              color:      'rgba(255,255,255,0.50)',
              margin:      0,
              lineHeight:  1,
            }}
          >
            نادي حلوان — بوابة الأمن
          </p>
        </div>
      </div>

      {/* ── LEFT: Sign out ── */}
      <button
        type="button"
        aria-label="تسجيل الخروج"
        onClick={() => {
          // Sign-out handler — replace with actual auth logout when integrated
          window.location.href = '/login';
        }}
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:             6,
          padding:        '0.45em 1.1em',
          borderRadius:    8,
          border:         '1px solid rgba(255,255,255,0.18)',
          background:     'rgba(255,255,255,0.06)',
          color:          'rgba(255,255,255,0.80)',
          fontFamily:      FONT,
          fontSize:       '0.875rem',
          fontWeight:      500,
          cursor:         'pointer',
          transition:     'background 160ms ease, color 160ms ease',
          flexShrink:      0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)';
          (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)';
        }}
      >
        <LogOut size={15} strokeWidth={2} aria-hidden="true" />
        تسجيل الخروج
      </button>
    </header>
  );
}
