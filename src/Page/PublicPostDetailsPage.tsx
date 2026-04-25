import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const BACKEND_URL = 'http://localhost:3000';
const DEFAULT_IMAGE = '/api/placeholder/1200/700';

interface MediaPostDetails {
  id: number;
  title: string;
  description?: string;
  category?: string;
  images?: string[];
  videoUrl?: string;
  videoDuration?: string;
  date?: string;
}

const normalizeUrl = (url?: string): string => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getYouTubeEmbedUrl = (url?: string): string => {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return url;
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    return '';
  } catch {
    return '';
  }
};

const isVideoCategory = (category?: string): boolean => {
  if (!category) return false;
  return /فيديو|video/i.test(category);
};

const PublicPostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<MediaPostDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        setError('معرف المنشور غير صالح.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        let foundPost: MediaPostDetails | null = null;

        try {
          const singleRes = await api.get(`/media-posts/${id}`);
          const payload = singleRes.data?.data ?? singleRes.data;

          if (payload && !Array.isArray(payload) && String(payload.id) === String(id)) {
            foundPost = payload as MediaPostDetails;
          }
        } catch {
          foundPost = null;
        }

        if (!foundPost) {
          const listRes = await api.get('/media-posts');
          const list: MediaPostDetails[] = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
          foundPost = list.find((item) => String(item.id) === String(id)) || null;
        }

        if (!foundPost) {
          setError('المنشور غير موجود.');
          setPost(null);
          return;
        }

        setPost(foundPost);
      } catch (err) {
        console.error('Failed to fetch post details:', err);
        setError('فشل تحميل تفاصيل المنشور. حاول مرة أخرى.');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const normalizedImages = useMemo(() => {
    if (!post?.images || !Array.isArray(post.images)) return [];
    return post.images.map((img) => normalizeUrl(img)).filter(Boolean);
  }, [post]);

  const displayImages = normalizedImages.length > 0 ? normalizedImages : [DEFAULT_IMAGE];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(post?.videoUrl);
  const directVideoUrl = normalizeUrl(post?.videoUrl);
  const isVideo = isVideoCategory(post?.category) || Boolean(post?.videoUrl);
  const formattedDate = formatDate(post?.date);
  const hasDescription = Boolean(post?.description?.trim());

  useEffect(() => {
    setCurrentImage(0);
  }, [post?.id]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#EEF2F7] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#0A1A44] animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">جاري تحميل تفاصيل المنشور...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#EEF2F7] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200">
          <h1 className="text-2xl font-bold text-[#0A1A44] mb-3">تعذر فتح المنشور</h1>
          <p className="text-gray-600 mb-6">{error || 'لا توجد بيانات لهذا المنشور.'}</p>
          <button
            onClick={() => navigate('/?tab=lastNews')}
            className="bg-[#0A1A44] hover:bg-[#0e1c38] text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#EEF2F7]">
      <section className="bg-gradient-to-br from-[#0A1A44] via-[#132B63] to-[#1D3A7A] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <button
              onClick={() => navigate('/?tab=lastNews')}
              className="inline-flex items-center gap-2 bg-white/95 text-[#0A1A44] border border-white/20 px-4 py-2 rounded-xl font-bold hover:bg-white transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة
            </button>

            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="bg-[#FDBF00] text-[#0A1A44] px-3 py-1 rounded-full font-semibold shadow">
                {post.category || 'منشور'}
              </span>
              {formattedDate && (
                <span className="bg-white/15 text-white px-3 py-1 rounded-full border border-white/25">
                  {formattedDate}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-snug max-w-4xl">{post.title}</h1>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-12 -mt-6">
        <section className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="bg-black">
            <div className="w-full h-[260px] sm:h-[380px] md:h-[500px] lg:h-[580px]">
              {isVideo ? (
                youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    className="w-full h-full"
                    title={post.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : directVideoUrl ? (
                  <video src={directVideoUrl} className="w-full h-full object-contain" controls />
                ) : (
                  <img src={displayImages[currentImage]} alt={post.title} className="w-full h-full object-contain" />
                )
              ) : (
                <div className="relative w-full h-full">
                  <img src={displayImages[currentImage]} alt={post.title} className="w-full h-full object-contain" />

                  {displayImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 rounded-full w-11 h-11 flex items-center justify-center shadow"
                        aria-label="الصورة السابقة"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 rounded-full w-11 h-11 flex items-center justify-center shadow"
                        aria-label="الصورة التالية"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/65 text-white text-sm px-4 py-1.5 rounded-full">
                        {currentImage + 1} / {displayImages.length}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {displayImages.length > 1 && !isVideo && (
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {displayImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${post.id}-${index}`}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                      currentImage === index ? 'border-[#FDBF00]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`${post.title}-${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 md:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <article className="xl:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#0A1A44] mb-3">تفاصيل المنشور</h2>
                <p className="text-slate-700 leading-8 whitespace-pre-line break-words text-base md:text-lg">
                  {hasDescription ? post.description : 'لا يوجد وصف لهذا المنشور.'}
                </p>
              </article>

              <aside className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                <h3 className="text-lg font-bold text-[#0A1A44] mb-4">معلومات سريعة</h3>
                <div className="space-y-3 text-sm md:text-base">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">التصنيف</span>
                    <span className="font-semibold text-slate-800">{post.category || 'منشور'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">التاريخ</span>
                    <span className="font-semibold text-slate-800">{formattedDate || '-'}</span>
                  </div>
                  {post.videoDuration && (
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">مدة الفيديو</span>
                      <span className="font-semibold text-slate-800">{post.videoDuration}</span>
                    </div>
                  )}
                  {!isVideo && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">عدد الصور</span>
                      <span className="font-semibold text-slate-800">{displayImages.length}</span>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicPostDetailsPage;
