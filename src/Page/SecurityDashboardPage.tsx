import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, MapPin, Phone,
  Download, CalendarX, LogOut
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Guest {
  name: string;
  phone: string;
  relation: string;
}

interface BookingEntry {
  id: string;
  personName: string;
  phoneNumber: string;
  membershipId: string;
  memberType: string;
  fieldName: string;
  startTime: string;
  endTime: string;
  guests: Guest[];
  sport: string;
  frontIdUrl: string | null;
  backIdUrl: string | null;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h = 0, m = 0] = t.split(':').map(Number);
  return h * 60 + m;
}

function format12h(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  // User requested to swap: afternoon/PM (h >= 12) is called صباحاً, and AM is called مساءً
  const suffix = h >= 12 ? 'صباحاً' : 'مساءً';
  const hr12 = h % 12 || 12;
  return `${hr12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

function getSlotType(start: string, end: string): 'current' | 'all' | 'past' {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);

  if (currentMins >= endMins) return 'past';
  if (endMins > currentMins && startMins <= currentMins + 60) return 'current';
  return 'all';
}

function getAvatarColor(name: string): string {
  return 'bg-[#0e1c38]';
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

function generateMockData(): BookingEntry[] {
  const now = new Date();
  const h = now.getHours();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const tMinus1 = `${pad(h - 1)}:00`;
  const tMinus0 = `${pad(h - 1)}:30`;
  const tCurr0 = `${pad(h)}:00`;
  const tCurr1 = `${pad(h)}:30`;
  const tPlus1 = `${pad(h + 1)}:00`;
  const tPlus2 = `${pad(h + 2)}:00`;
  const tPlus3 = `${pad(h + 3)}:00`;

  return [
    {
      id: 'bk-001', personName: 'أحمد محمد علي', phoneNumber: '01012345678',
      membershipId: 'HC-00441', memberType: 'عضو ذهبي',
      fieldName: 'ملعب كرة القدم 1', startTime: tMinus1, endTime: tMinus0,
      sport: 'كرة القدم', guests: [{ name: 'محمود سامي', phone: '01198765432', relation: 'صديق' }],
      frontIdUrl: 'https://picsum.photos/seed/front1/400/300',
      backIdUrl: 'https://picsum.photos/seed/back1/400/300'
    },
    {
      id: 'bk-002', personName: 'سارة أحمد سليم', phoneNumber: '01098765432',
      membershipId: 'HC-00512', memberType: 'عضوية عائلية',
      fieldName: 'حمام السباحة', startTime: tCurr0, endTime: tPlus1,
      sport: 'السباحة', guests: [],
      frontIdUrl: 'https://picsum.photos/seed/front2/400/300',
      backIdUrl: null
    },
    {
      id: 'bk-003', personName: 'محمود عبد الرحمن', phoneNumber: '01234567890',
      membershipId: 'HC-00289', memberType: 'عضو عادي',
      fieldName: 'ملعب السلة', startTime: tCurr1, endTime: tPlus2,
      sport: 'كرة السلة', guests: [{ name: 'ياسر عرفات', phone: '0112346678', relation: 'ضيف' }],
      frontIdUrl: 'https://picsum.photos/seed/front3/400/300',
      backIdUrl: 'https://picsum.photos/seed/back3/400/300'
    },
    {
      id: 'bk-004', personName: 'مريم حسن إبراهيم', phoneNumber: '01123456789',
      membershipId: 'HC-00317', memberType: 'عضو فضي',
      fieldName: 'ملعب التنس', startTime: tPlus2, endTime: tPlus3,
      sport: 'التنس', guests: [],
      frontIdUrl: null,
      backIdUrl: 'https://picsum.photos/seed/back4/400/300'
    },
    {
      id: 'bk-005', personName: 'يوسف إبراهيم عمر', phoneNumber: '01001122334',
      membershipId: 'HC-00773', memberType: 'عضو ذهبي',
      fieldName: 'ملعب التنس', startTime: '19:00', endTime: '20:30',
      sport: 'التنس', guests: [],
      frontIdUrl: 'https://picsum.photos/seed/front6/400/300',
      backIdUrl: 'https://picsum.photos/seed/back6/400/300'
    },
  ];
}

const MOCK = generateMockData();
const SPORT_FILTERS = ['الكل', 'كرة القدم', 'التنس', 'كرة السلة', 'السباحة', 'الرياضة'];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

export default function SecurityDashboardPage() {
  const [sportFilter, setSportFilter] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [lightbox, setLightbox] = useState<{ url: string; label: string; name: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingEntry | null>(null);

  const filteredData = useMemo(() => {
    let result = [...MOCK].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    if (sportFilter !== 'الكل') {
      result = result.filter(b => b.sport === sportFilter);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim();
      result = result.filter(b => b.personName.includes(q) || b.phoneNumber.includes(q));
    }

    return result;
  }, [sportFilter, debouncedSearch]);

  const hasActiveFilters = sportFilter !== 'الكل' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSportFilter('الكل');
    setSearchQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        else if (selectedBooking) setSelectedBooking(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, selectedBooking]);

  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const closestBookingId = useMemo(() => {
    return filteredData.find(b => timeToMinutes(b.endTime) > nowMins)?.id;
  }, [filteredData, nowMins]);

  const currentBookings = filteredData.filter(b => getSlotType(b.startTime, b.endTime) === 'current');
  const allOtherBookings = filteredData.filter(b => getSlotType(b.startTime, b.endTime) !== 'current');

  return (
    <div dir="rtl" className="min-h-screen bg-[#F0F2F5] font-[Cairo]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0e1c38; border-radius: 4px; }
      `}</style>

      {/* ── 1. HEADER ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-[72px] px-6 bg-[#0e1c38] shadow-[0_4px_24px_rgba(14,28,56,0.15)] border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/HUC_logo.jpeg"
            alt="شعار نادي حلوان"
            className="w-11 h-11 object-contain rounded-xl bg-white p-0.5 shadow-sm"
          />
          <div className="h-8 w-px bg-white/15" aria-hidden="true" />
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg leading-tight m-0 tracking-wide drop-shadow-sm">
              لوحة مراقبة الحجوزات
            </h1>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/login'}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-medium text-sm"
        >
          <span className="hidden md:inline">تسجيل الخروج</span>
          <LogOut size={16} strokeWidth={2} />
        </button>
      </header>

      {/* ── 2. FILTER BAR ── */}
      <div className="sticky top-[72px] z-40 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center gap-5">

          <div className="relative w-full md:w-[380px] shrink-0">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن اسم العضو أو رقم الهاتف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e1c38]/10 focus:border-[#0e1c38] text-[#0e1c38] font-semibold transition-all shadow-inner shadow-slate-100/50"
            />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
              {SPORT_FILTERS.map(sport => (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-all shrink-0 border ${sportFilter === sport
                    ? 'bg-[#0e1c38] text-[#ffffff] border-[#0e1c38]'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, w: 0 }}
                  animate={{ opacity: 1, w: 'auto' }}
                  exit={{ opacity: 0, w: 0 }}
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100 whitespace-nowrap"
                >
                  <X size={14} strokeWidth={2.5} /> مسح الفلاتر
                </motion.button>
              )}
            </AnimatePresence>
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              {filteredData.length.toLocaleString('ar-EG')} نتيجة
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32 flex flex-col gap-10">

        {filteredData.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 mt-4 bg-white/50 backdrop-blur rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <CalendarX size={28} className="text-slate-300" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-[#0e1c38] mb-1">لا توجد حجوزات</h3>
            <p className="text-sm text-slate-500">جرّب تغيير الفلتر أو البحث بكلمة مختلفة</p>
          </motion.div>
        ) : (
          <>
            {/* ── SECTION 1: NOW & NEXT 1 HR ── */}
            {currentBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5 px-1">
                  <div className="w-2 h-6 bg-[#f8941c] rounded-full shadow-[0_0_8px_rgba(248,148,28,0.5)]" />
                  <h2 className="text-xl font-extrabold text-[#0e1c38] m-0">حالياً وخلال ساعة</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {currentBookings.map((b, i) => (
                      <BookingCard key={`curr-${b.id}`} booking={b} index={i} type="current" isNext={b.id === closestBookingId} onClick={() => setSelectedBooking(b)} onThumbClick={setLightbox} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* ── SECTION 2: ALL DAY ── */}
            {allOtherBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5 px-1 pt-6 border-t border-slate-200/60">
                  <div className="w-2 h-6 bg-[#0e1c38] rounded-full opacity-60" />
                  <h2 className="text-xl font-extrabold text-[#0e1c38] m-0">جدول اليوم</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {allOtherBookings.map((b, i) => {
                      const type = getSlotType(b.startTime, b.endTime);
                      return <BookingCard key={`all-${b.id}`} booking={b} index={i} type={type} isNext={b.id === closestBookingId} onClick={() => setSelectedBooking(b)} onThumbClick={setLightbox} />;
                    })}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ── 4. POPUP & LIGHTBOX ── */}
      <AnimatePresence>
        {selectedBooking && <MemberDetailPopup booking={selectedBooking} onClose={() => setSelectedBooking(null)} onThumbClick={setLightbox} />}
        {lightbox && <LightboxOverlay lightbox={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── BOOKING CARD (SIMPLIFIED & MODERN) ──────────────────────────────────────

function BookingCard({
  booking, index, type, isNext, onClick, onThumbClick
}: {
  booking: BookingEntry, index: number, type: 'current' | 'all' | 'past', isNext: boolean, onClick: () => void, onThumbClick: (v: any) => void
}) {
  const isCurrent = type === 'current';
  const isPast = type === 'past';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      onClick={onClick}
      className={`relative flex flex-col bg-white rounded-2xl cursor-pointer transition-all duration-300 border ${isNext
        ? 'border-[#f8941c]/40 shadow-[0_4px_24px_-4px_rgba(248,148,28,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(248,148,28,0.25)] hover:-translate-y-1'
        : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1'
        } overflow-hidden group`}
    >
      {/* Right Indicator Bar */}
      <div className={`absolute right-0 top-0 bottom-0 w-1.5 transition-colors ${isNext ? 'bg-[#f8941c]' : isPast ? 'bg-slate-200' : 'bg-slate-800'
        }`} />

      {/* Header: Time */}
      <div className={`flex justify-between items-center p-5 pb-3 border-b border-slate-50/80 ${isPast ? 'opacity-50' : ''}`}>
        <div className={`flex items-center gap-2 text-xl font-bold tracking-widest ${isNext ? 'text-[#f8941c]' : 'text-[#0e1c38]'}`}>
          <Clock size={16} strokeWidth={2.5} className={isNext ? 'text-[#f8941c]' : 'text-slate-300'} />
          <span className="flex gap-1.5 font-bold">
            {format12h(booking.startTime)}
            <span className="text-slate-700 opacity-100">←</span>
            {format12h(booking.endTime)}
          </span>
        </div>

        {isNext ? (
          <div className="flex items-center gap-1.5 bg-[#f8941c]/10 text-[#c2700e] px-2.5 py-1 rounded-md text-xs font-bold border border-[#f8941c]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f8941c] animate-pulse" /> التالي
          </div>
        ) : isCurrent ? (
          <div className="flex items-center gap-1.5 bg-slate-100 text-[#0e1c38] px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
            قريباً
          </div>
        ) : null}
      </div>

      {/* Body: Person Info */}
      <div className={`p-5 flex-1 flex flex-col gap-4 ${isPast ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-white font-extrabold text-xl shadow-sm bg-[#0e1c38]`}>
            {[...booking.personName.trim()][0]}
          </div>
          <div>
            <h3 className="font-bold text-[17px] text-[#0e1c38] leading-tight mb-1">{booking.personName}</h3>
            <div className="text-[14px] text-slate-500 font-medium tracking-wider" dir="ltr">
              {booking.phoneNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Location & Thumbs */}
      <div className="px-5 pb-5 pt-3 flex justify-between items-end">
        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
          <MapPin size={14} className="text-[#0e1c38]/40" />
          {booking.fieldName}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <SmallThumb url={booking.frontIdUrl} label="صورة الوجه" name={booking.personName} onClick={onThumbClick} />
          <SmallThumb url={booking.backIdUrl} label="صورة الظهر" name={booking.personName} onClick={onThumbClick} />
        </div>
      </div>
    </motion.article>
  );
}

function SmallThumb({ url, label, name, onClick }: { url: string | null, label: string, name: string, onClick: (v: any) => void }) {
  if (!url) {
    return (
      <div className="w-11 h-8 rounded border border-dashed border-rose-300 bg-rose-50 flex items-center justify-center" title={`${label} مفقودة`}>
        <X size={12} className="text-rose-400" />
      </div>
    );
  }
  return (
    <button onClick={() => onClick({ url, label, name })} className="w-13 h-9 rounded overflow-hidden border border-slate-200 hover:border-[#0e1c38] hover:shadow-md transition-all">
      <img src={url} alt={label} className="w-full h-full object-cover" />
    </button>
  );
}

// ─── FULL INFO POPUP ─────────────────────────────────────────────────────────

function MemberDetailPopup({ booking, onClose, onThumbClick }: { booking: BookingEntry; onClose: () => void; onThumbClick: (v: any) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e1c38]/40 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[500px] bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(14,28,56,0.2)] border border-white"
        dir="rtl"
      >
        <div className="bg-[#0e1c38] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white font-extrabold text-xl border-[2px] border-white/20 ${getAvatarColor(booking.personName)}`}>
              {[...booking.personName.trim()][0]}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight mb-1">{booking.personName}</h2>
              <div className="text-white/60 text-xs font-bold">{booking.memberType} • {booking.membershipId}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 bg-slate-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1.5"><Phone size={12} /> الهاتف</div>
              <div className="text-[#0e1c38] font-bold tracking-widest" dir="ltr">{booking.phoneNumber}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1.5"><MapPin size={12} /> الملعب</div>
              <div className="text-[#0e1c38] font-bold text-sm">{booking.fieldName}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#0e1c38] mb-3 border-b border-slate-200 pb-2">تفاصيل الحجز</h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">الوقت</span>
                <span className="font-bold text-[#f8941c] text-base tracking-wider">{format12h(booking.startTime)} - {format12h(booking.endTime)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500">مرفقات الهوية</span>
                <div className="flex gap-2">
                  <button onClick={() => onThumbClick({ url: booking.frontIdUrl, label: 'الوجه', name: booking.personName })} className="text-xs bg-white border border-slate-300 font-bold px-3 py-1.5 rounded disabled:opacity-50" disabled={!booking.frontIdUrl}>عرض الوجه</button>
                  <button onClick={() => onThumbClick({ url: booking.backIdUrl, label: 'الظهر', name: booking.personName })} className="text-xs bg-white border border-slate-300 font-bold px-3 py-1.5 rounded disabled:opacity-50" disabled={!booking.backIdUrl}>عرض الظهر</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#0e1c38] mb-3 border-b border-slate-200 pb-2 flex justify-between">
              المرافقون
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{booking.guests.length}</span>
            </h3>
            {booking.guests.length === 0 ? (
              <div className="text-center text-sm font-bold text-slate-400 py-6 border border-dashed border-slate-300 rounded-xl bg-white">لا يوجد ضيوف مسجلين</div>
            ) : (
              <div className="flex flex-col gap-2">
                {booking.guests.map((g, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl">
                    <div>
                      <div className="font-bold text-sm text-[#0e1c38]">{g.name}</div>
                      <div className="text-xs text-slate-400 tracking-wider" dir="ltr">{g.phone}</div>
                    </div>
                    <span className="text-[11px] font-bold bg-[#0e1c38]/5 text-[#0e1c38] px-2.5 py-1 rounded-md">{g.relation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── LIGHTBOX OVERLAY ────────────────────────────────────────────────────────

function LightboxOverlay({ lightbox, onClose }: { lightbox: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
          <h3 className="text-white font-bold text-sm ml-4 truncate">صورة {lightbox.label} — {lightbox.name}</h3>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => downloadImage(lightbox.url, `id.jpg`)} className="p-2 bg-slate-700 hover:bg-blue-500/20 text-white rounded-full transition-colors"><Download size={16} strokeWidth={2.5} /></button>
            <button onClick={onClose} className="p-2 bg-slate-700 hover:bg-rose-500/20 text-white rounded-full transition-colors"><X size={16} strokeWidth={2.5} /></button>
          </div>
        </div>
        <div className="relative flex-1 overflow-auto bg-[#000000] p-2 flex items-center justify-center">
          <img src={lightbox.url} alt={lightbox.label} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
        </div>
        <div className="bg-[#f8941c]/10 border-t border-[#f8941c]/30 p-2.5 flex justify-center items-center">
          <span className="text-[#f8941c] text-[11px] font-bold tracking-wide">⚠️ هذه الصورة سرية — للاستخدام الأمني فقط</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
