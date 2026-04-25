import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
} from 'lucide-react';

type BranchRecord = {
  id: string;
  name: string;
  location: string;
  address: string;
  mapUrl: string;
  openingTime: string;
  closingTime: string;
  workingDays: string;
  phone: string;
  email: string;
  about: string;
  photos: string[];
  videoUrl?: string;
};

// Resolve asset URLs (public folder)
const HELWAN_PHOTOS = Array.from({ length: 11 }, (_, index) => `/assets/BrancheHU${index + 1}.jpg`);

const CLUB_HOTLINE = '1913641';
const CLUB_LOCATION_URL = 'https://maps.app.goo.gl/QHexupLs17Y7u7rF6';

const BRANCHES: Record<string, BranchRecord> = {
  helwan: {
    id: 'helwan',
    name: 'فرع حلوان',
    location: 'حلوان',
    address: 'حلوان، القاهرة، مصر',
    mapUrl: CLUB_LOCATION_URL,
    openingTime: '08:00 صباحًا',
    closingTime: '11:00 مساءً',
    workingDays: 'طوال الأسبوع',
    phone: CLUB_HOTLINE,
    email: 'helwan@helwanclub.eg',
    about:
      'يوفر فرع حلوان مرافق رياضية واجتماعية متكاملة تشمل ملاعب متنوعة، مساحات مفتوحة، وخدمات مناسبة لجميع أفراد الأسرة.',
    photos: HELWAN_PHOTOS,
    videoUrl: 'https://youtu.be/OoNspoOhrrg?si=mY1O1mkMl8Y5tn5c',
  },
  maadi: {
    id: 'maadi',
    name: 'فرع المعادي',
    location: 'زهراء المعادي',
    address: 'زهراء المعادي، القاهرة، مصر',
    mapUrl: CLUB_LOCATION_URL,
    openingTime: '08:00 صباحًا',
    closingTime: '11:00 مساءً',
    workingDays: 'طوال الأسبوع',
    phone: CLUB_HOTLINE,
    email: 'maadi@helwanclub.eg',
    about: 'فرع المعادي يقدم تجربة رياضية متكاملة بأجواء عائلية وخدمات متنوعة.',
    photos: ['/assets/club.png'],
    videoUrl: '',
  },
  tagamoa: {
    id: 'tagamoa',
    name: 'فرع التجمع',
    location: 'التجمع الخامس',
    address: 'التجمع الخامس، القاهرة الجديدة، مصر',
    mapUrl: CLUB_LOCATION_URL,
    openingTime: '09:00 صباحًا',
    closingTime: '11:00 مساءً',
    workingDays: 'طوال الأسبوع',
    phone: CLUB_HOTLINE,
    email: 'tagamoa@helwanclub.eg',
    about: 'فرع التجمع يضم أنشطة رياضية وترفيهية حديثة للأعضاء والزوار.',
    photos: ['/assets/club.png'],
    videoUrl: '',
  },
  zayed: {
    id: 'zayed',
    name: 'فرع الشيخ زايد',
    location: 'الشيخ زايد',
    address: 'الشيخ زايد، الجيزة، مصر',
    mapUrl: CLUB_LOCATION_URL,
    openingTime: '09:00 صباحًا',
    closingTime: '11:00 مساءً',
    workingDays: 'طوال الأسبوع',
    phone: CLUB_HOTLINE,
    email: 'zayed@helwanclub.eg',
    about: 'فرع الشيخ زايد يقدم مرافق متعددة للرياضة والترفيه في موقع مميز.',
    photos: ['/assets/club.png'],
    videoUrl: '',
  },
};

const getYouTubeEmbedUrl = (url?: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (host.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    return '';
  } catch {
    return '';
  }
};

const isDirectVideo = (url?: string): boolean =>
  Boolean(url && /\.(mp4|webm|ogg|mov)$/i.test(url));

const BranchExplorePage = () => {
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();

  const branch = useMemo(() => {
    if (!branchId) return undefined;
    return BRANCHES[branchId];
  }, [branchId]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [branchId]);

  if (!branch) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-xl w-full text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">الفرع غير موجود</h1>
          <p className="text-slate-600 mb-6">
            لم يتم العثور على بيانات الفرع المطلوب.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2596be] text-white font-bold hover:bg-[#1d7897] transition-colors"
          >
            العودة للرئيسية
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = branch.photos[activePhotoIndex] || branch.photos[0];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(branch.videoUrl);
  const hasDirectVideo = isDirectVideo(branch.videoUrl);
  const hasVideo = Boolean(youtubeEmbedUrl || hasDirectVideo);

  const goNext = () => {
    setActivePhotoIndex((prev) => (prev + 1) % branch.photos.length);
  };

  const goPrev = () => {
    setActivePhotoIndex((prev) => (prev - 1 + branch.photos.length) % branch.photos.length);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-10 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            العودة للرئيسية
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500">{branch.name}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="relative bg-slate-200 aspect-[16/9]">
              <img
                src={currentPhoto}
                alt={`${branch.name} - صورة ${activePhotoIndex + 1}`}
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />

              {branch.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="الصورة التالية"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {activePhotoIndex + 1} / {branch.photos.length}
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {branch.photos.map((photo, index) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={() => setActivePhotoIndex(index)}
                    className={`overflow-hidden rounded-lg border-2 transition-all ${
                      index === activePhotoIndex
                        ? 'border-[#2596be] shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${branch.name} - صورة مصغرة ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      width={160}
                      height={90}
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="bg-white rounded-3xl shadow-lg p-5 md:p-6 space-y-5">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{branch.name}</h1>
              <p className="text-slate-600 leading-7">{branch.about}</p>
            </div>

            <div className="space-y-3">
              <InfoRow icon={<MapPin className="w-5 h-5 text-[#2596be]" />} label="الموقع" value={branch.location} />
              <InfoRow icon={<Clock3 className="w-5 h-5 text-[#2596be]" />} label="موعد الفتح" value={branch.openingTime} />
              <InfoRow icon={<Clock3 className="w-5 h-5 text-[#2596be]" />} label="موعد الإغلاق" value={branch.closingTime} />
              <InfoRow icon={<CalendarDays className="w-5 h-5 text-[#2596be]" />} label="أيام العمل" value={branch.workingDays} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                href={`tel:${branch.phone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2596be] text-white font-bold hover:bg-[#1d7897] transition-colors"
              >
                <Phone className="w-4 h-4" />
                اتصل الآن
              </a>
              <a
                href={branch.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                الموقع
              </a>
              <a
                href={`mailto:${branch.email}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </a>
            </div>
          </aside>
        </div>

        <section className="bg-white rounded-3xl shadow-lg p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-6 h-6 text-[#2596be]" />
            <h2 className="text-2xl font-extrabold text-slate-900">فيديو الفرع</h2>
          </div>

          {hasVideo ? (
            youtubeEmbedUrl ? (
              <div className="relative w-full overflow-hidden rounded-2xl bg-slate-200 aspect-video">
                <iframe
                  src={youtubeEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${branch.name} video`}
                />
              </div>
            ) : (
              <video
                className="w-full rounded-2xl bg-black aspect-video"
                controls
                preload="metadata"
                src={branch.videoUrl}
              />
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
              أضف رابط الفيديو أو مسار الملف في `BranchExplorePage.tsx` داخل بيانات الفرع ليظهر هنا.
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#2596be]" />
            <h2 className="text-2xl font-extrabold text-slate-900">بيانات الفرع</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard
              label="العنوان"
              value={
                <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#2596be] transition-colors">
                  {branch.address}
                </a>
              }
            />
            <DataCard
              label="رقم الهاتف"
              value={
                <a href={`tel:${branch.phone}`} className="hover:text-[#2596be] transition-colors">
                  {branch.phone}
                </a>
              }
            />
            <DataCard label="البريد الإلكتروني" value={branch.email} />
            <DataCard label="المواعيد" value={`${branch.openingTime} - ${branch.closingTime}`} />
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-slate-600 text-sm">{label}</span>
    </div>
    <span className="font-bold text-slate-900">{value}</span>
  </div>
);

const DataCard = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-slate-900 font-bold">{value}</p>
  </div>
);

export default BranchExplorePage;
