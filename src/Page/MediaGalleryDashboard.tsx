import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './staffDashboard.css';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Plus, Image as ImageIcon, Video, Calendar, Trash2, Edit3, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";

// ========== TYPE DEFINITIONS ==========
interface MediaPost {
    id: string;
    title: string;
    description: string;
    category: "صور" | "فيديو" | "فعاليات" | "عرض ترويجي" | "حدث" | "إعلان" | "أخبار" | "الصيانة";
    images?: string[];
    videoUrl?: string;
    videoDuration?: string;
    date: string;
    photoCount?: number;
}

type FilterType = "الكل" | "الصور" | "الفيديوهات" | "الفعاليات" | "العروض الترويجية" | "الأحداث" | "الإعلانات" | "الأخبار" | "الصيانة";

const BACKEND_URL = "http://localhost:3000";

const normalizeImages = (post?: MediaPost | null) =>
    post?.images?.map(img => (img.startsWith('http') ? img : `${BACKEND_URL}${img}`)) || [];

// ========== HERO SECTION ==========
const HeroSection: React.FC = () => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-l from-[var(--huc-primary-dark)] to-[var(--huc-primary-blue)] py-12 sm:py-20 lg:py-28 rtl" dir="rtl">
            {/* Decorative Blur Circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--huc-accent-blue)]/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-400/10 rounded-full blur-[100px] -ml-40 -mb-40 animate-pulse delay-700"></div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-center leading-tight mb-3 sm:mb-4 drop-shadow-sm font-['Cairo']">
                    معرض الوسائط والفعاليات
                </h1>
                <p className="text-[var(--huc-accent-blue)]/90 text-sm sm:text-lg text-center max-w-2xl font-['Cairo']">
                    استكشف أجمل اللحظات والفعاليات في نادي جامعة حلوان من خلال الصور والفيديوهات
                </p>
            </div>

            {/* Premium Curved Bottom */}
            <div className="absolute bottom-0 left-0 right-0 leading-none">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 lg:h-16" preserveAspectRatio="none">
                    <path d="M0 60H1440V0C1440 0 1100 60 720 60C340 60 0 0 0 0V60Z" fill="var(--huc-background)" />
                </svg>
            </div>
        </div>
    );
};

// ========== FILTER TABS ==========
interface MediaTabsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const MediaTabs: React.FC<MediaTabsProps> = ({ activeFilter, onFilterChange }) => {
    const tabs: FilterType[] = ["الكل", "الصور", "الفيديوهات", "الفعاليات", "العروض الترويجية", "الأحداث", "الإعلانات", "الأخبار", "الصيانة"];

    return (
        <div className="w-full overflow-x-auto scrollbar-hide flex sm:flex-wrap gap-2 sm:gap-3 justify-start sm:justify-center mt-4 sm:mt-6 p-1 sm:p-2 font-['Cairo'] pb-2 sm:pb-0">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onFilterChange(tab)}
                    className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform active:scale-95 border-2 whitespace-nowrap ${activeFilter === tab
                        ? 'bg-[var(--huc-primary-dark)] text-white border-[var(--huc-primary-dark)] shadow-lg scale-105'
                        : 'bg-white text-slate-600 border-transparent shadow-sm hover:bg-slate-100 hover:text-[var(--huc-primary-dark)]'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

// ========== ALBUM CARD ==========
interface AlbumCardProps {
    post: MediaPost;
    onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ post, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-80 font-['Cairo']"
        >
            <img
                src={post.images?.[0]?.startsWith('http') ? post.images[0] : `${BACKEND_URL}${post.images?.[0]}`}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Image Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="bg-[var(--huc-accent-blue)]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {post.category}
                    </span>
                </div>
                <h3 className="text-xl font-bold mb-2 leading-tight drop-shadow-md">
                    {post.title}
                </h3>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                    </div>
                    {post.photoCount && (
                        <div className="flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <ImageIcon size={14} />
                            <span>{post.photoCount} صور</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ========== VIDEO CARD ==========
interface VideoCardProps {
    post: MediaPost;
    onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ post, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group font-['Cairo']"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={post.images?.[0]?.startsWith('http') ? post.images[0] : (post.images?.[0] ? `${BACKEND_URL}${post.images[0]}` : "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800")}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />

                {/* Duration Badge */}
                {post.videoDuration && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold shadow-lg">
                        {post.videoDuration}
                    </div>
                )}

                {/* Premium Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--huc-accent-orange)] flex items-center justify-center transition-all duration-300 group-hover:scale-125 shadow-xl group-hover:opacity-90 ring-4 ring-white/30">
                        <Play size={28} className="text-white fill-current mr-[-2px]" />
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[var(--huc-accent-orange)] bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        فيديو
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 leading-tight transition-colors duration-300 group-hover:text-[var(--huc-primary-dark)]">
                    {post.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium pt-3 border-t border-slate-50">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                </div>
            </div>
        </div>
    );
};

// ========== IMAGE PREVIEW SLIDER (In Modal) ==========
interface ImagePreviewSliderProps {
    images: string[];
    onRemove: (index: number) => void;
}

const ImagePreviewSlider: React.FC<ImagePreviewSliderProps> = ({ images, onRemove }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (images.length === 0) return null;

    return (
        <div className="space-y-4 font-['Cairo']">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-inner bg-slate-100 group aspect-video lg:aspect-[21/9]">
                <img
                    src={images[currentIndex]}
                    alt={`صورة ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                />

                {/* Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-lg hover:bg-white hover:scale-110 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-lg hover:bg-white hover:scale-110 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Counter & Remove */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <button
                        onClick={() => onRemove(currentIndex)}
                        className="w-8 h-8 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-110 flex items-center justify-center transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition-all ${currentIndex === index ? 'border-[var(--huc-accent-blue)] scale-105 shadow-md' : 'border-transparent opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ========== CREATE MEDIA MODAL ==========
interface CreateMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editPost?: MediaPost | null;
}

const CreateMediaModal: React.FC<CreateMediaModalProps> = ({ isOpen, onClose, onSuccess, editPost }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'صور' as "صور" | "فيديو" | "فعاليات" | "عرض ترويجي" | "حدث" | "إعلان" | "أخبار" | "الصيانة"
    });
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<{ title?: string; media?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editPost) {
            setFormData({
                title: editPost.title,
                description: editPost.description || '',
                category: editPost.category
            });
            setExistingImages(editPost.images || []);
            setVideoUrl(editPost.videoUrl || '');
        } else {
            setFormData({ title: '', description: '', category: 'صور' });
            setExistingImages([]);
            setUploadedImages([]);
            setPreviewImages([]);
            setVideoUrl('');
            setVideoFile(null);
        }
    }, [editPost, isOpen]);

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileList = Array.from(files);
            setUploadedImages(prev => [...prev, ...fileList]);
            const imageUrls = fileList.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...imageUrls]);
            setErrors(prev => ({ ...prev, media: undefined }));
        }
    };

    const handleRemovePreview = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExisting = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const newErrors: { title?: string; media?: string } = {};
        if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب';
        if (formData.category !== 'فيديو' && uploadedImages.length === 0 && existingImages.length === 0) {
            newErrors.media = 'يجب تحميل صورة واحدة على الأقل';
        }
        if (formData.category === 'فيديو' && !videoUrl.trim() && !videoFile) {
            newErrors.media = 'يجب تحميل فيديو أو إدخال رابط';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('videoUrl', videoUrl);

            uploadedImages.forEach(file => data.append('images', file));

            if (editPost) {
                existingImages.forEach(img => data.append('existingImages', img));
                await api.put(`/media-posts/${editPost.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/media-posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save media post:', error);
            alert('فشل في حفظ المنشور');
        } finally {
            setIsSubmitting(false);
        }
    };

    const combinedImages = [...existingImages.map(img => img.startsWith('http') ? img : `${BACKEND_URL}${img}`), ...previewImages];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 font-['Cairo']" dir="rtl">
                <div className="px-5 sm:px-8 py-4 sm:py-6 border-b flex items-center justify-between bg-white text-right">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                        {editPost ? 'تعديل المنشور' : 'إضافة وسائط جديدة'}
                    </h2>
                    <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                        <X size={18} className="sm:w-5 sm:h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-5 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1 text-right">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">العنوان <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => { setFormData(prev => ({ ...prev, title: e.target.value })); setErrors(prev => ({ ...prev, title: undefined })); }}
                                className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 border rounded-xl sm:rounded-2xl outline-none transition-all focus:ring-4 ${errors.title ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-[var(--huc-accent-blue)]/20 focus:border-[var(--huc-accent-blue)]'} text-sm sm:text-base`}
                                placeholder="عنوان المنشور..."
                            />
                            {errors.title && <p className="mt-2 text-xs text-red-500 font-bold">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">الفئة <span className="text-red-500">*</span></label>
                            <select
                                value={formData.category}
                                onChange={(e) => { setFormData(prev => ({ ...prev, category: e.target.value as any })); setUploadedImages([]); setPreviewImages([]); setErrors({}); }}
                                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl outline-none transition-all focus:ring-4 focus:ring-[var(--huc-accent-blue)]/20 focus:border-[var(--huc-accent-blue)] bg-slate-50 text-sm sm:text-base"
                            >
                                <option value="صور">صور</option>
                                <option value="فيديو">فيديو</option>
                                <option value="فعاليات">فعاليات</option>
                                <option value="عرض ترويجي">عرض ترويجي</option>
                                <option value="حدث">حدث</option>
                                <option value="إعلان">إعلان</option>
                                <option value="أخبار">أخبار</option>
                                <option value="الصيانة">الصيانة</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">الوصف</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl outline-none transition-all focus:ring-4 focus:ring-[var(--huc-accent-blue)]/20 focus:border-[var(--huc-accent-blue)] text-sm sm:text-base"
                            placeholder="وصف تفصيلي..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-3 sm:mb-4">
                            {formData.category === 'فيديو' ? 'رابط الفيديو' : 'تحميل المرفقات'}
                        </label>

                        {formData.category !== 'فيديو' ? (
                            <div className="space-y-4 sm:space-y-6">
                                <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-[var(--huc-accent-blue)] transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-5 sm:pb-6">
                                        <Plus size={24} className="sm:w-8 sm:h-8 text-slate-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs sm:text-sm text-slate-600 font-extrabold mb-1">انقر لاختيار الصور</p>
                                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP حتى 10 ميجابايت</p>
                                    </div>
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                </label>
                                {combinedImages.length > 0 && (
                                    <ImagePreviewSlider
                                        images={combinedImages}
                                        onRemove={(idx) => idx < existingImages.length ? handleRemoveExisting(idx) : handleRemovePreview(idx - existingImages.length)}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                <input
                                    type="text"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl outline-none transition-all focus:ring-4 focus:ring-[var(--huc-accent-blue)]/20 focus:border-[var(--huc-accent-blue)] text-sm sm:text-base"
                                    placeholder="رابط يوتيوب أو فيميو..."
                                />
                                <div className="text-center relative">
                                    <span className="bg-white px-2 sm:px-3 relative z-10 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">أو</span>
                                    <div className="absolute top-1/2 inset-x-0 h-px bg-slate-100"></div>
                                </div>
                                <label className="flex items-center justify-center p-3 sm:p-4 border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors gap-2 sm:gap-3">
                                    <Video size={18} className="sm:w-5 sm:h-5 text-slate-400" />
                                    <span className="text-xs sm:text-sm font-bold text-slate-600">
                                        {videoFile ? `تم اختيار: ${videoFile.name}` : 'رفع فيديو مباشرة من الجهاز'}
                                    </span>
                                    <input type="file" accept="video/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setVideoFile(file); setErrors(prev => ({ ...prev, media: undefined })); } }} className="hidden" />
                                </label>
                            </div>
                        )}
                        {errors.media && <p className="mt-4 text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">{errors.media}</p>}
                    </div>
                </div>

                <div className="px-4 sm:px-8 py-4 sm:py-5 border-t bg-slate-50 flex flex-col sm:flex-row-reverse gap-3 sm:gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3 bg-[var(--huc-primary-dark)] text-white rounded-xl font-bold hover:bg-[var(--huc-primary-blue)] transition-all shadow-lg shadow-[var(--huc-primary-dark)]/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                        {isSubmitting ? <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />}
                        {editPost ? 'تحديث البيانات' : 'حفظ ونشر'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm sm:text-base"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========== MEDIA VIEW MODAL ==========
// (Left in file for possible reuse, but not used by the gallery anymore.)
const MediaViewModal: React.FC<{ post: MediaPost | null; onClose: () => void }> = ({ post, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!post) return null;

    const images = normalizeImages(post);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-8">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative max-w-7xl w-full h-full lg:h-auto lg:max-h-[95vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 select-none">
                <button
                    onClick={onClose}
                    className="absolute top-6 left-6 w-12 h-12 rounded-full bg-slate-800/50 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all z-50 shadow-2xl ring-1 ring-white/10"
                >
                    <X size={24} />
                </button>

                <div className="w-full flex-1 flex flex-col lg:flex-row bg-slate-900 overflow-hidden lg:rounded-3xl shadow-2xl ring-1 ring-white/5">
                    {/* Media Display Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-black min-h-[40vh] lg:min-h-0">
                        {post.category === 'فيديو' ? (
                            <iframe
                                src={post.videoUrl}
                                className="w-full h-full aspect-video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col group">
                                <img
                                    src={images[currentIndex]}
                                    alt={post.title}
                                    className="w-full h-full object-contain"
                                />

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-900/60 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-white/20"
                                        >
                                            <ChevronLeft size={32} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-900/60 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-white/20"
                                        >
                                            <ChevronRight size={32} />
                                        </button>
                                        <div className="absolute bottom-10 inset-x-0 flex justify-center">
                                            <div className="bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-full text-sm text-white font-black tracking-widest shadow-2xl ring-1 ring-white/20">
                                                {currentIndex + 1} / {images.length}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Sidebar */}
                    <div className="w-full lg:w-[400px] bg-white p-8 lg:p-10 flex flex-col justify-between overflow-y-auto text-right font-['Cairo']" dir="rtl">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-[var(--huc-accent-blue)]/10 text-[var(--huc-primary-dark)] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-[var(--huc-accent-blue)]/30">
                                    {post.category}
                                </span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight">
                                {post.title}
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed text-lg font-medium">
                                {post.description || 'لا يوجد وصف متاح لهذا المنشور.'}
                            </p>
                        </div>

                        <div className="pt-8 border-t border-slate-100 space-y-4">
                            <div className="flex items-center gap-3 text-slate-400 font-bold">
                                <Calendar size={18} />
                                <span>تم النشر في: {post.date}</span>
                            </div>
                            {post.photoCount ? (
                                <div className="flex items-center gap-3 text-slate-400 font-bold">
                                    <ImageIcon size={18} />
                                    <span>يتضمن {post.photoCount} صور عالية الجودة</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========== MEDIA POST DETAILS PAGE ==========
export const MediaGalleryPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const statePost = (location.state as any)?.post as MediaPost | undefined;

    const [post, setPost] = useState<MediaPost | null>(statePost ?? null);
    const [loading, setLoading] = useState(!statePost);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (statePost || !id) return;
            try {
                setLoading(true);
                const res = await api.get('/media-posts');
                const list: MediaPost[] = res.data?.data || [];
                const found = list.find(p => String(p.id) === String(id)) || null;
                if (mounted) setPost(found);
            } catch (e) {
                console.error('Failed to fetch post:', e);
                if (mounted) setPost(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [id, statePost]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [post?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--huc-background)] font-['Cairo'] flex items-center justify-center" dir="rtl">
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-[var(--huc-primary-dark)] rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black animate-pulse uppercase tracking-[0.2em]">جاري تحميل المنشور...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[var(--huc-background)] font-['Cairo']" dir="rtl">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all"
                    >
                        رجوع
                    </button>
                    <div className="bg-white rounded-3xl shadow-xl p-10 text-right">
                        <h1 className="text-2xl font-black text-slate-800 mb-3">المنشور غير موجود</h1>
                        <p className="text-slate-500 font-bold">لم نتمكن من العثور على هذا المنشور.</p>
                    </div>
                </div>
            </div>
        );
    }

    const images = normalizeImages(post);

    return (
        <div className="min-h-screen bg-[var(--huc-background)] font-['Cairo'] pb-16" dir="rtl">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all"
                    >
                        رجوع
                    </button>
                    <div className="text-xs font-black text-slate-400 tracking-widest">
                        تفاصيل المنشور
                    </div>
                </div>

                <div className="bg-white overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-100">
                    {/* Media at top */}
                    <div className="relative bg-black">
                        {post.category === 'فيديو' ? (
                            <iframe
                                src={post.videoUrl}
                                className="w-full aspect-video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="relative w-full group">
                                <div className="w-full aspect-video flex items-center justify-center">
                                    <img
                                        src={images[currentIndex]}
                                        alt={post.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-white/20"
                                        >
                                            <ChevronLeft size={28} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-white/20"
                                        >
                                            <ChevronRight size={28} />
                                        </button>
                                        <div className="absolute bottom-5 inset-x-0 flex justify-center">
                                            <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-full text-xs text-white font-black tracking-widest shadow-2xl ring-1 ring-white/20">
                                                {currentIndex + 1} / {images.length}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content below media: Title -> Category -> Description */}
                    <div className="p-8 lg:p-10 text-right">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 leading-tight">
                            {post.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="bg-[var(--huc-accent-blue)]/10 text-[var(--huc-primary-dark)] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-[var(--huc-accent-blue)]/30">
                                {post.category}
                            </span>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                <Calendar size={16} />
                                <span>{post.date}</span>
                            </div>
                            {post.photoCount ? (
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                    <ImageIcon size={16} />
                                    <span>{post.photoCount} صور</span>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-7 pt-7 border-t border-slate-100">
                            <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line">
                                {post.description || 'لا يوجد وصف متاح لهذا المنشور.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========== MAIN MEDIA GALLERY ==========
const MediaGallery: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<FilterType>("الكل");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<MediaPost | null>(null);
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/media-posts');
            if (response.data.success) setPosts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور نهائياً؟')) return;
        try {
            await api.delete(`/media-posts/${id}`);
            fetchPosts();
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('فشل في حذف المنشور');
        }
    };

    const filteredPosts = posts.filter(post => {
        if (activeFilter === "الكل") return true;
        if (activeFilter === "الصور") return post.category === "صور";
        if (activeFilter === "الفيديوهات") return post.category === "فيديو";
        if (activeFilter === "الفعاليات") return post.category === "فعاليات";
        if (activeFilter === "العروض الترويجية") return post.category === "عرض ترويجي";
        if (activeFilter === "الأحداث") return post.category === "حدث";
        if (activeFilter === "الإعلانات") return post.category === "إعلان";
        if (activeFilter === "الأخبار") return post.category === "أخبار";
        if (activeFilter === "الصيانة") return post.category === "الصيانة";
        return true;
    });

    const photoAlbums = filteredPosts.filter(post => post.category !== "فيديو");
    const videos = filteredPosts.filter(post => post.category === "فيديو");

    const openPost = (post: MediaPost) => {
        navigate(`/staff/dashboard/media-gallery/${post.id}`, { state: { post } });
    };

    return (
        <div className="min-h-screen bg-[var(--huc-background)] font-['Cairo'] pb-20 select-none" dir="rtl">
            {/* Cairo Google Font */}
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900;1000&display=swap" rel="stylesheet" />

            <HeroSection />

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-8 mb-8 sm:mb-16">
                    <MediaTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                    {/* Add Media Button */}
                    <RoleGuard privilege="media.create">
                    <button
                        onClick={() => { setSelectedPost(null); setIsCreateModalOpen(true); }}
                        className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 bg-[var(--huc-accent-orange)] hover:opacity-90 text-white rounded-xl sm:rounded-2xl font-black shadow-xl shadow-[var(--huc-accent-orange)]/20 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap w-full lg:w-auto text-sm sm:text-base"
                    >
                        <Plus size={20} className="sm:w-[22px] sm:h-[22px] group-hover:rotate-90 transition-transform duration-300" />
                        <span>إضافة وسائط جديدة</span>
                    </button>
                    </RoleGuard>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-[var(--huc-primary-dark)] rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black animate-pulse uppercase tracking-[0.2em]">جاري تحميل المعرض...</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {/* Photo Albums Section */}
                        {photoAlbums.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10 overflow-hidden">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 whitespace-nowrap">
                                        الألبومات والفعاليات
                                    </h2>
                                    <div className="h-1 lg:h-2 bg-gradient-to-l from-[var(--huc-primary-dark)] via-[var(--huc-primary-dark)]/20 to-transparent flex-1 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {photoAlbums.map(post => (
                                        <div key={post.id} className="relative group/card">
                                            <AlbumCard post={post} onClick={() => openPost(post)} />
                                            {/* Action Buttons Overlay */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover/card:translate-x-0 group-hover/card:opacity-100 transition-all duration-300 z-10">
                                                <RoleGuard privilege="media.edit">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setIsCreateModalOpen(true); }}
                                                    className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-xl text-[var(--huc-accent-blue)] hover:bg-[var(--huc-accent-blue)] hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                </RoleGuard>
                                                <RoleGuard privilege="media.delete">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                                    className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-xl text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                </RoleGuard>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Videos Section */}
                        {videos.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10 overflow-hidden">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 whitespace-nowrap">
                                        مكتبة المرئيات
                                    </h2>
                                    <div className="h-1 lg:h-2 bg-gradient-to-l from-[var(--huc-accent-orange)] via-amber-200 to-transparent flex-1 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {videos.map(post => (
                                        <div key={post.id} className="relative group/vid">
                                            <VideoCard post={post} onClick={() => openPost(post)} />
                                            <div className="absolute top-4 left-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover/vid:translate-x-0 group-hover/vid:opacity-100 transition-all duration-300 z-10">
                                                <RoleGuard privilege="media.edit">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setIsCreateModalOpen(true); }}
                                                    className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-xl text-[var(--huc-accent-blue)] hover:bg-[var(--huc-accent-blue)] hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                </RoleGuard>
                                                <RoleGuard privilege="media.delete">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                                    className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-xl text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                </RoleGuard>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Empty State */}
                        {filteredPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="relative mb-10">
                                    <div className="absolute inset-0 bg-[var(--huc-accent-blue)]/20 rounded-full blur-3xl opacity-50 pulse"></div>
                                    <div className="relative w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-slate-200 ring-1 ring-slate-50">
                                        <ImageIcon size={48} strokeWidth={1} />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">
                                    المعرض فارغ حالياً
                                </h3>
                                <p className="text-slate-400 font-bold max-w-sm">
                                    لم يتم العثور على أي وسائط في هذه الفئة. يمكنك النقر على زر الإضافة للبدء في ملء المعرض.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateMediaModal
                isOpen={isCreateModalOpen}
                onSuccess={fetchPosts}
                onClose={() => { setIsCreateModalOpen(false); setSelectedPost(null); }}
                editPost={selectedPost}
            />
        </div>
    );
};

export default MediaGallery;
