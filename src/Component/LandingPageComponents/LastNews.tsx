import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Category, NewsCategory, NewsItem } from './new';

const BACKEND_URL = 'http://localhost:3000';
const DEFAULT_IMAGE = '/api/placeholder/800/600';

interface BackendMediaPost {
  id: number;
  title: string;
  description?: string;
  category: string;
  images?: string[];
  videoUrl?: string;
  videoDuration?: string;
  date?: string;
}

type FilterKey = 'all' | NewsCategory;

const normalizeImageUrl = (url?: string): string => {
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

const normalizeSearchText = (value = ''): string => {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const mapMediaCategory = (category: string): NewsCategory => {
  const normalized = normalizeSearchText(category);

  if (normalized.includes('فيديو')) return 'videos';
  if (normalized.includes('فعاليات') || normalized.includes('حدث')) return 'events';
  if (normalized.includes('عرض') && normalized.includes('ترويجي')) return 'promotions';
  if (normalized.includes('اخبار') || normalized.includes('خبر')) return 'news';
  if (normalized.includes('اعلان')) return 'announcements';
  if (normalized.includes('صيانه')) return 'maintenance';
  if (normalized.includes('صور')) return 'photos';

  return 'photos';
};

const LastNews: React.FC = () => {
  const { t } = useTranslation("landing");
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const newsCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const categories: Category[] = [
    { id: 'all', name: 'all', label: t('news.cats.all', 'الكل') },
    { id: 'photos', name: 'photos', label: t('news.cats.photos', 'الصور') },
    { id: 'videos', name: 'videos', label: t('news.cats.videos', 'الفيديوهات') },
    { id: 'events', name: 'events', label: t('news.cats.events', 'الفعاليات') },
    { id: 'promotions', name: 'promotions', label: t('news.cats.promotions', 'العروض الترويجية') },
    { id: 'news', name: 'news', label: t('news.cats.news', 'الأخبار') },
    { id: 'announcements', name: 'announcements', label: t('news.cats.announcements', 'الإعلانات') },
    { id: 'maintenance', name: 'maintenance', label: t('news.cats.maintenance', 'الصيانة') },
  ];

  useEffect(() => {
    const fetchMediaPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/media-posts');
        const backendPosts: BackendMediaPost[] =
          response.data?.success && Array.isArray(response.data?.data) ? response.data.data : [];

        const sortedPosts = [...backendPosts].sort((a, b) => {
          const aTime = a.date ? new Date(a.date).getTime() : 0;
          const bTime = b.date ? new Date(b.date).getTime() : 0;
          return bTime - aTime || b.id - a.id;
        });

        const mappedPosts: NewsItem[] = sortedPosts.map((post) => {
          const primaryImage = normalizeImageUrl(post.images?.[0]);
          const formattedDate = formatDate(post.date);

          return {
            id: Number(post.id),
            title: post.title || 'بدون عنوان',
            excerpt: post.description || 'لا يوجد وصف لهذا المنشور.',
            content: post.description || '',
            image: primaryImage || DEFAULT_IMAGE,
            category: mapMediaCategory(post.category),
            sourceCategory: post.category || '',
            date: formattedDate,
            timeAgo: formattedDate,
          };
        });

        setPosts(mappedPosts);
      } catch (error) {
        console.error('Failed to fetch media posts for LastNews:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaPosts();
  }, []);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      newsCardsRef.current.forEach((card, index) => {
        if (card) {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, posts, activeFilter, searchTerm]);

  const handleFilterClick = (filterId: FilterKey) => {
    setActiveFilter(filterId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openPostDetails = (postId: number) => {
    navigate(`/news/${postId}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`شكراً لاشتراكك! سنرسل لك آخر الأخبار على: ${email}`);
    setEmail('');
  };

  const getCategoryBadge = (category: NewsCategory) => {
    switch (category) {
      case 'photos':
        return { label: t('news.badge.photos', 'صور'), class: 'bg-slate-600/90 text-white' };
      case 'videos':
        return { label: t('news.badge.video', 'فيديو'), class: 'bg-[#FDBF00]/90 text-[#0A1A44]' };
      case 'events':
        return { label: t('news.badge.event', 'فعالية'), class: 'bg-blue-500/90 text-white' };
      case 'promotions':
        return { label: t('news.badge.offer', 'عرض'), class: 'bg-purple-500/90 text-white' };
      case 'news':
        return { label: t('news.badge.news', 'خبر'), class: 'bg-emerald-500/90 text-white' };
      case 'announcements':
        return { label: t('news.badge.announcement', 'إعلان'), class: 'bg-red-500/90 text-white' };
      case 'maintenance':
        return { label: t('news.badge.maintenance', 'صيانة'), class: 'bg-amber-500/90 text-white' };
      default:
        return { label: t('news.badge.post', 'منشور'), class: 'bg-gray-500/90 text-white' };
    }
  };

  const getCategoryColor = (category: NewsCategory) => {
    switch (category) {
      case 'videos':
        return 'bg-yellow-100 text-yellow-800';
      case 'events':
        return 'bg-blue-100 text-[#0A1A44]';
      case 'promotions':
        return 'bg-purple-100 text-purple-800';
      case 'news':
        return 'bg-emerald-100 text-emerald-800';
      case 'announcements':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800';
      case 'photos':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const featuredNews = useMemo(() => posts.slice(0, 3), [posts]);
  const secondaryFeatured = useMemo(() => featuredNews.slice(1), [featuredNews]);
  const featuredMain = featuredNews[0];

  const filteredNews = useMemo(() => {
    const searchQuery = normalizeSearchText(searchTerm);
    const shouldSearchAllPosts = activeFilter !== 'all' || Boolean(searchQuery);
    const sourcePosts = shouldSearchAllPosts ? posts : posts.slice(3);

    return sourcePosts.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.category === activeFilter;

      if (!searchQuery) {
        return matchesFilter;
      }

      const haystack = normalizeSearchText(
        `${item.title} ${item.excerpt} ${item.content} ${item.sourceCategory || ''}`,
      );

      return matchesFilter && haystack.includes(searchQuery);
    });
  }, [activeFilter, posts, searchTerm]);

  return (
    <div className="font-cairo bg-gray-50" >
      <section className="relative overflow-hidden bg-[#0e1c38] hero-pattern">
        <div className="gradient-overlay">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">{t("news.title", "آخر الأخبار")}</h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                {t("news.subtitle", "تابع أحدث أخبار نادي حلوان والإنجازات والفعاليات")}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-700 font-bold">{t("news.filter_by", "تصفية حسب:")}</span>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleFilterClick(category.id as FilterKey)}
                  className={`filter-btn px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    activeFilter === category.id
                      ? 'bg-gradient-to-r from-[#0A1A44] to-[#0e1c38] text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t("news.search_placeholder", "ابحث في الأخبار...")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-gray-700 w-48"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t("news.featured", "الأخبار المميزة")}</h2>
            <div className="h-1 w-20 bg-[#FDBF00] rounded-full"></div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">{t("news.loading", "جاري تحميل الأخبار...")}</div>
          ) : featuredMain ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div
                onClick={() => openPostDetails(featuredMain.id)}
                className="news-card bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer opacity-0 transform translate-y-4 transition-all duration-300"
                data-category={featuredMain.category}
                ref={(el) => {
                  newsCardsRef.current[0] = el;
                }}
              >
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <img src={featuredMain.image} alt={featuredMain.title} className="news-image w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="category-badge bg-[#FDBF00]/90 text-[#0A1A44] px-4 py-2 rounded-full text-sm font-bold">
                      {getCategoryBadge(featuredMain.category).label}
                    </span>
                  </div>
                  <div className="absolute bottom-6 right-6 left-6 z-20 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{featuredMain.title}</h3>
                    <p className="text-white/90 text-sm mb-3">{featuredMain.timeAgo}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">{featuredMain.excerpt}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPostDetails(featuredMain.id);
                    }}
                    className="mt-4 text-[#0A1A44] font-bold hover:text-[#FDBF00] transition-colors flex items-center gap-2"
                  >
                    <span>{t("news.read_more", "اقرأ المزيد")}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {secondaryFeatured.map((news, index) => (
                  <div
                    key={news.id}
                    onClick={() => openPostDetails(news.id)}
                    className="news-card bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer flex opacity-0 transform translate-y-4 transition-all duration-300"
                    data-category={news.category}
                    ref={(el) => {
                      newsCardsRef.current[index + 1] = el;
                    }}
                  >
                    <div className="relative w-40 flex-shrink-0 overflow-hidden">
                      <img src={news.image} alt={news.title} className="news-image w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex-1">
                      <span className={`inline-block ${getCategoryColor(news.category)} px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {getCategoryBadge(news.category).label}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{news.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{news.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">{t("news.no_news", "لا توجد أخبار متاحة حالياً.")}</div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t("news.all_news", "جميع الأخبار")}</h2>
            <div className="h-1 w-20 bg-[#FDBF00] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading && filteredNews.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500">{t("news.no_results", "لا توجد نتائج مطابقة للبحث أو الفلتر.")}</div>
            ) : (
              filteredNews.map((news, index) => {
                const badge = getCategoryBadge(news.category);
                return (
                  <div
                    key={news.id}
                    onClick={() => openPostDetails(news.id)}
                    className="news-card bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer opacity-0 transform translate-y-4 transition-all duration-300"
                    data-category={news.category}
                    ref={(el) => {
                      newsCardsRef.current[index + 1 + secondaryFeatured.length] = el;
                    }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img src={news.image} alt={news.title} className="news-image w-full h-full object-cover" />
                      <div className="absolute top-4 right-4">
                        <span className={`category-badge ${badge.class} px-3 py-1.5 rounded-full text-xs font-bold`}>{badge.label}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{news.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{news.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{news.excerpt}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPostDetails(news.id);
                        }}
                        className="text-[#0A1A44] font-bold hover:text-[#FDBF00] transition-colors text-sm flex items-center gap-2"
                      >
                        <span>{t("news.read_more", "اقرأ المزيد")}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-[#0e1c38] to-[#0A1A44] hover:from-[#0A1A44] hover:to-[#0e1c38] text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              {t("news.load_more", "عرض المزيد من الأخبار")}
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#0e1c38] to-[#0A1A44]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="mb-8">
              <svg className="w-20 h-20 mx-auto mb-6 text-[#FDBF00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("news.subscribe.title", "اشترك في النشرة الإخبارية")}</h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">{t("news.subscribe.subtitle", "احصل على آخر الأخبار والإنجازات مباشرة في بريدك الإلكتروني")}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                placeholder={t("news.subscribe.placeholder", "أدخل بريدك الإلكتروني")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-full text-gray-900 text-lg outline-none focus:ring-4 focus:ring-[#FDBF00]/30"
                required
              />
              <button
                type="submit"
                className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >{t("news.subscribe.button", "اشترك الآن")}</button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .gradient-overlay {
          background: linear-gradient(135deg, rgba(10, 26, 68, 0.95) 0%, rgba(14, 28, 56, 0.9) 100%);
        }

        .hero-pattern {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(253, 191, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(253, 191, 0, 0.1) 0%, transparent 50%);
        }

        .news-card {
          transition: all 0.3s ease;
        }

        .news-card:hover {
          transform: translateY(-8px);
        }

        .news-card:hover .news-image {
          transform: scale(1.1);
        }

        .news-image {
          transition: transform 0.5s ease;
        }

        .category-badge {
          backdrop-filter: blur(10px);
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LastNews;
