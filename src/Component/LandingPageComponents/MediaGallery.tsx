import { useEffect, useState, type FC } from 'react';
import api from '../../api/axios';
import type { MediaItem, PhotoAlbum, Video } from './MediaTypes';

const BACKEND_URL = 'http://localhost:3000';
const DEFAULT_IMAGE = '/api/placeholder/1200/700';

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

const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
};

const mapPostImages = (images?: string[]): string[] => {
  if (!Array.isArray(images)) return [];
  return images.map((img) => normalizeImageUrl(img)).filter(Boolean);
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const resolveCategoryLabel = (type: MediaItem['type']): string => {
  if (type === 'videos') return 'فيديو';
  if (type === 'events') return 'فعاليات';
  return 'صور';
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

const MediaGallery: FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'events' | 'promotions' | 'news' | 'announcements' | 'maintenance'>('all');
  const [posts, setPosts] = useState<BackendMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<MediaItem | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/media-posts');
      if (response.data.success) {
        setPosts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const photoAlbums: PhotoAlbum[] = posts
    .filter((post) => post.category !== 'فيديو')
    .map((post) => {
      const images = mapPostImages(post.images);
      return {
        id: String(post.id),
        type: post.category === 'فيديو' ? 'videos' :
          (post.category === 'فعاليات' || post.category === 'حدث') ? 'events' :
            (post.category === 'عرض ترويجي') ? 'promotions' :
              (post.category === 'أخبار') ? 'news' :
                (post.category === 'إعلان') ? 'announcements' :
                  (post.category === 'الصيانة') ? 'maintenance' : 'photos',
        title: post.title,
        description: post.description || '',
        imageUrl: images[0] || DEFAULT_IMAGE,
        images,
        count: `${images.length} صورة`,
        date: formatDate(post.date),
        categoryLabel: post.category || ''
      };
    });

  const videos: Video[] = posts
    .filter((post) => post.category === 'فيديو')
    .map((post) => {
      const images = mapPostImages(post.images);
      return {
        id: String(post.id),
        type: 'videos',
        title: post.title,
        description: post.description || '',
        imageUrl: images[0] || DEFAULT_IMAGE,
        images,
        duration: post.videoDuration || '00:00',
        videoUrl: post.videoUrl || '',
        date: formatDate(post.date),
        categoryLabel: post.category || ''
      };
    });

  const eventAlbums = photoAlbums.filter((album) => album.type === 'events');
  const imageAlbums = photoAlbums.filter((album) => album.type === 'photos');
  const promotionAlbums = photoAlbums.filter((album) => album.type === 'promotions');
  const newsAlbums = photoAlbums.filter((album) => album.type === 'news');
  const announcementAlbums = photoAlbums.filter((album) => album.type === 'announcements');
  const maintenanceAlbums = photoAlbums.filter((album) => album.type === 'maintenance');

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedPost) {
        setSelectedPost(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [selectedPost]);

  if (loading) {
    return <div className="py-20 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="bg-gray-50" dir="rtl">
      <HeroSection />
      <TabsSection activeTab={activeTab} onTabChange={setActiveTab} />

      <MediaGrid
        activeTab={activeTab}
        imageAlbums={imageAlbums}
        eventAlbums={eventAlbums}
        promotionAlbums={promotionAlbums}
        newsAlbums={newsAlbums}
        announcementAlbums={announcementAlbums}
        maintenanceAlbums={maintenanceAlbums}
        videos={videos}
        onPostOpen={setSelectedPost}
      />

      <PostDetailsModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  );
};

const HeroSection: FC = () => (
  <section className="relative overflow-hidden bg-[#0e1c38] hero-pattern">
    <div className="gradient-overlay">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            معرض الوسائط
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            شاهد أجمل اللحظات والإنجازات من نادي حلوان
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
);

interface TabsSectionProps {
  activeTab: string;
  onTabChange: (tab: 'all' | 'photos' | 'videos' | 'events') => void;
}

const TabsSection: FC<TabsSectionProps> = ({ activeTab, onTabChange }) => (
  <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-40">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {[
          { id: 'all', label: 'الكــل' },
          { id: 'photos', label: 'الصور' },
          { id: 'videos', label: 'الفيديوهات' },
          { id: 'events', label: 'الفعاليات' },
          { id: 'promotions', label: 'العروض الترويجية' },
          { id: 'news', label: 'الأخبار' },
          { id: 'announcements', label: 'الإعلانات' },
          { id: 'maintenance', label: 'الصيانة' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${activeTab === tab.id
              ? 'active bg-[#0A1A44] text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
            onClick={() => onTabChange(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  </section>
);

interface MediaGridProps {
  activeTab: string;
  imageAlbums: PhotoAlbum[];
  eventAlbums: PhotoAlbum[];
  promotionAlbums: PhotoAlbum[];
  newsAlbums: PhotoAlbum[];
  announcementAlbums: PhotoAlbum[];
  maintenanceAlbums: PhotoAlbum[];
  videos: Video[];
  onPostOpen: (post: MediaItem) => void;
}

const MediaGrid: FC<MediaGridProps> = ({
  activeTab,
  imageAlbums,
  eventAlbums,
  promotionAlbums,
  newsAlbums,
  announcementAlbums,
  maintenanceAlbums,
  videos,
  onPostOpen
}) => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      {(activeTab === 'all' || activeTab === 'photos') && (
        <div className="mb-16">
          <SectionHeader title="ألبومات الصور" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageAlbums.map((album) => (
              <MediaCard key={album.id} item={album} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'events') && (
        <div className="mb-16">
          <SectionHeader title="الفعاليات" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventAlbums.map((eventAlbum) => (
              <MediaCard key={eventAlbum.id} item={eventAlbum} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
        <div className="mb-16">
          <SectionHeader title="الفيديوهات" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <MediaCard key={video.id} item={video} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'promotions') && promotionAlbums.length > 0 && (
        <div className="mb-16">
          <SectionHeader title="العروض الترويجية" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotionAlbums.map((album) => (
              <MediaCard key={album.id} item={album} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'news') && newsAlbums.length > 0 && (
        <div className="mb-16">
          <SectionHeader title="الأخبار" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsAlbums.map((album) => (
              <MediaCard key={album.id} item={album} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'announcements') && announcementAlbums.length > 0 && (
        <div className="mb-16">
          <SectionHeader title="الإعلانات" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcementAlbums.map((album) => (
              <MediaCard key={album.id} item={album} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'maintenance') && maintenanceAlbums.length > 0 && (
        <div className="mb-16">
          <SectionHeader title="الصيانة" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {maintenanceAlbums.map((album) => (
              <MediaCard key={album.id} item={album} onPostOpen={onPostOpen} />
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

const SectionHeader: FC<{ title: string }> = ({ title }) => (
  <div className="mb-8">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
    <div className="h-1 w-20 bg-[#FDBF00] rounded-full"></div>
  </div>
);

interface MediaCardProps {
  item: MediaItem;
  onPostOpen: (post: MediaItem) => void;
}

const MediaCard: FC<MediaCardProps> = ({ item, onPostOpen }) => {
  const isVideo = item.type === 'videos';
  const album = item as PhotoAlbum;
  const video = item as Video;

  return (
    <button
      type="button"
      className="media-card bg-white rounded-3xl shadow-lg overflow-hidden text-right w-full"
      onClick={() => onPostOpen(item)}
    >
      <div className={`relative h-64 overflow-hidden ${isVideo ? 'group' : ''}`}>
        <img
          src={item.imageUrl || DEFAULT_IMAGE}
          alt={item.title}
          className="media-image w-full h-full object-cover"
        />

        {isVideo ? (
          <>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="play-icon w-20 h-20 bg-[#FDBF00] rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-[#0A1A44] mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
              {video.duration}
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 right-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{album.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  {album.count}
                </span>
                <span>{album.date}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {isVideo && (
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
          <p className="text-gray-600 text-sm">{video.description || 'اضغط لعرض تفاصيل الفيديو'}</p>
        </div>
      )}
    </button>
  );
};

interface PostDetailsModalProps {
  post: MediaItem | null;
  onClose: () => void;
}

const PostDetailsModal: FC<PostDetailsModalProps> = ({ post, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [post?.id]);

  if (!post) return null;

  const isVideo = post.type === 'videos';
  const postImages = post.images && post.images.length > 0
    ? post.images
    : [post.imageUrl || DEFAULT_IMAGE];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.videoUrl);
  const category = post.categoryLabel || resolveCategoryLabel(post.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-20 rounded-full bg-black/70 text-white w-10 h-10 flex items-center justify-center hover:bg-black transition-colors"
          aria-label="إغلاق"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-black">
          {isVideo ? (
            youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                className="w-full h-[260px] md:h-[520px]"
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : post.videoUrl ? (
              <video
                src={post.videoUrl}
                className="w-full h-[260px] md:h-[520px] object-cover bg-black"
                controls
              />
            ) : (
              <img
                src={post.imageUrl || DEFAULT_IMAGE}
                alt={post.title}
                className="w-full h-[260px] md:h-[520px] object-cover"
              />
            )
          ) : (
            <div className="relative">
              <img
                src={postImages[currentIndex] || DEFAULT_IMAGE}
                alt={post.title}
                className="w-full h-[260px] md:h-[520px] object-contain"
              />

              {postImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? postImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 rounded-full w-11 h-11 flex items-center justify-center shadow"
                    aria-label="الصورة السابقة"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev === postImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 rounded-full w-11 h-11 flex items-center justify-center shadow"
                    aria-label="الصورة التالية"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/65 text-white text-sm px-4 py-1.5 rounded-full">
                    {currentIndex + 1} / {postImages.length}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {postImages.length > 1 && !isVideo && (
          <div className="px-6 pt-4 flex gap-3 overflow-x-auto">
            {postImages.map((image, index) => (
              <button
                type="button"
                key={`${post.id}-${index}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentIndex === index ? 'border-[#FDBF00]' : 'border-transparent opacity-70'
                  }`}
              >
                <img src={image} alt={`${post.title}-${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{post.title}</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-5">
            {post.description || 'لا يوجد وصف لهذا المنشور.'}
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold">
              التصنيف: {category}
            </span>
            {!isVideo && (
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold">
                عدد الصور: {postImages.length}
              </span>
            )}
            {!!post.date && (
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold">
                التاريخ: {post.date}
              </span>
            )}
            {isVideo && !!post.duration && (
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold">
                المدة: {post.duration}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
