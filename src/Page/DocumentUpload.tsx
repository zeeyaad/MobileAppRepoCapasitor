import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, X, AlertCircle, CheckCircle2, Lock, Shield, ChevronLeft,
  FileText, Camera, ArrowLeft
} from 'lucide-react';

interface FileWithPreview {
  file: File | null;
  preview: string | null;
}

const DocumentUpload: React.FC = () => {
  const asset = (name: string) => `/assets/${name}`;
  // File refs
  const frontIdRef = useRef<HTMLInputElement>(null);
  const backIdRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [consent, setConsent] = useState(false);

  // File States
  const [files, setFiles] = useState<{
    front: FileWithPreview;
    back: FileWithPreview;
    selfie: FileWithPreview;
  }>({
    front: { file: null, preview: null },
    back: { file: null, preview: null },
    selfie: { file: null, preview: null }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      Object.values(files).forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  // File Upload Handlers
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      return 'حجم الملف يجب أن يكون أقل من 5 ميجابايت';
    }
    if (!allowedTypes.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى رفع JPG, PNG, أو PDF';
    }
    return null;
  };

  const handleFileUpload = (type: 'front' | 'back' | 'selfie', file: File | null) => {
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [type]: error }));
      setTouched(prev => ({ ...prev, [type]: true }));
      return;
    }

    // Cleanup old preview
    if (files[type].preview) {
      URL.revokeObjectURL(files[type].preview);
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    setFiles(prev => ({
      ...prev,
      [type]: { file, preview }
    }));

    setErrors(prev => ({ ...prev, [type]: '' }));
    setTouched(prev => ({ ...prev, [type]: true }));
  };

  const handleFileRemove = (type: 'front' | 'back' | 'selfie') => {
    if (files[type].preview) {
      URL.revokeObjectURL(files[type].preview);
    }
    setFiles(prev => ({
      ...prev,
      [type]: { file: null, preview: null }
    }));

    // Reset file input
    const refs = { front: frontIdRef, back: backIdRef, selfie: selfieRef };
    if (refs[type].current) {
      refs[type].current!.value = '';
    }
    setErrors(prev => ({ ...prev, [type]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate files
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!files.front.file) {
      newErrors.front = 'صورة البطاقة الأمامية مطلوبة';
      isValid = false;
    }
    if (!files.back.file) {
      newErrors.back = 'صورة البطاقة الخلفية مطلوبة';
      isValid = false;
    }
    if (!consent) {
      newErrors.consent = 'يجب الموافقة على الشروط';
      isValid = false;
    }

    setTouched({ front: true, back: true, consent: true });
    setErrors(newErrors);

    if (!isValid) return;

    setIsLoading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        alert('تم إرسال بياناتك بنجاح! سيتم مراجعتها خلال 24-48 ساعة.');
        setIsLoading(false);
        setUploadProgress(0);
        // Navigate to success or dashboard
        window.location.href = '/dashboard';
      }, 500);
    }, 2000);
  };

  const handleBack = () => {
    window.location.href = '/verify';
  };

  const isFormValid = () => {
    return (
      files.front.file &&
      files.back.file &&
      consent &&
      Object.keys(errors).length === 0
    );
  };

  // File Upload Component
  const FileUploadArea = React.forwardRef<HTMLInputElement, {
    type: 'front' | 'back' | 'selfie';
    label: string;
    required?: boolean;
    recommended?: boolean;
  }>(({ type, label, required = true, recommended = false }, fileRef) => {
    const file = files[type];
    const hasError = errors[type] && touched[type];

    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-bold text-gray-700">{label}</label>
          {recommended && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
              موصى به
            </span>
          )}
          {required && <span className="text-red-500">*</span>}
        </div>

        {file.file ? (
          <div className="border-2 border-green-200 rounded-2xl p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <FileText className="w-16 h-16 text-blue-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFileRemove(type)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              if (fileRef && 'current' in fileRef && fileRef.current) {
                fileRef.current.click();
              }
            }}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${hasError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-[#0b2f8f] hover:bg-blue-50'
              }
            `}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={(e) => handleFileUpload(type, e.target.files?.[0] || null)}
              className="hidden"
            />
            <Upload className={`w-12 h-12 mx-auto mb-3 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700 mb-1">
              اسحب الصورة هنا أو انقر للتصفح
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, PDF - الحد الأقصى 5 ميجابايت
            </p>
          </div>
        )}

        {hasError && (
          <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{errors[type]}</span>
          </div>
        )}
      </div>
    );
  });

  FileUploadArea.displayName = 'FileUploadArea';

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* Left Side: Image & Brand Experience */}
      <div className="hidden lg:block lg:w-[45%] relative h-screen overflow-hidden">
        <img
          src={asset("ac-Club-06.jpg")}
          alt="Sports Club"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] hover:scale-110"
        />
        {/* Overlay with Brand Color Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b2f8f]/60 to-black/60 mix-blend-multiply" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            {/* Logo Placeholder */}
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4 leading-tight">رفع المستندات <br /> الخطوة الأخيرة</h2>
            <p className="text-gray-200 leading-relaxed">
              رفع صور واضحة لبطاقة الهوية القومية المصرية. تأكد من أن جميع البيانات واضحة ومقروءة.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex justify-center p-6 bg-white overflow-y-auto min-h-screen">
        <div className="w-full max-w-xl py-8">

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                الخطوة 3 من 3: رفع المستندات
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="mb-10 text-center md:text-right">
            <h1 className="text-4xl font-extrabold text-[#0b2f8f] mb-3 tracking-tight">
              رفع المستندات / Upload Documents
            </h1>
            <p className="text-gray-500 text-lg">
              يرجى رفع صور واضحة لبطاقة الهوية القومية المصرية
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg mb-6">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">جميع بياناتك محمية ومشفرة</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Instructions Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                يرجى رفع صور واضحة لبطاقة الهوية القومية المصرية
              </p>
            </div>

            {/* Front ID */}
            <FileUploadArea
              type="front"
              label="صورة البطاقة - الوجه الأمامي"
              required={true}
              ref={frontIdRef}
            />

            {/* Back ID */}
            <FileUploadArea
              type="back"
              label="صورة البطاقة - الوجه الخلفي"
              required={true}
              ref={backIdRef}
            />

            {/* Selfie with ID */}
            <div>
              <FileUploadArea
                type="selfie"
                label="صورة شخصية (سيلفي) تحمل فيها البطاقة"
                required={false}
                recommended={true}
                ref={selfieRef}
              />
              <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">مثال توضيحي:</span>
                </div>
                <div className="flex items-center justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500">أمسك البطاقة بجانب وجهك</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines Checklist */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">إرشادات الرفع:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'صورة واضحة',
                  'إضاءة جيدة',
                  'لا انعكاسات',
                  'جميع البيانات مقروءة'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>✓ {item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) {
                        setErrors(prev => ({ ...prev, consent: '' }));
                      }
                    }}
                    className="peer sr-only"
                  />
                  <div className={`
                    w-6 h-6 border-2 rounded-lg transition-all duration-200 flex items-center justify-center
                    ${consent ? 'bg-[#0b2f8f] border-[#0b2f8f]' : 'border-gray-300 group-hover:border-[#0b2f8f]'}
                    ${errors.consent && touched.consent ? 'border-red-500' : ''}
                  `}>
                    <CheckCircle2 className={`w-4 h-4 text-white transform transition-transform duration-200 ${consent ? 'scale-100' : 'scale-0'}`} />
                  </div>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  أوافق على رفع وتخزين ومعالجة بطاقة الهوية القومية الخاصة بي للتحقق من الهوية.
                  أفهم أن بياناتي ستُحفظ بشكل مشفر وآمن وفقًا ل{' '}
                  <a href="#" className="text-[#0b2f8f] font-bold hover:underline">سياسة الخصوصية</a>
                  {' '}وقانون حماية البيانات المصري.
                </div>
              </label>
              {errors.consent && touched.consent && (
                <p className="text-red-500 text-xs mt-1 mr-9 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.consent}
                </p>
              )}
            </div>

            {/* Data Rights Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                حقوقك / Your Rights
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                يمكنك طلب الاطلاع على بياناتك، تعديلها، أو حذفها في أي وقت
              </p>
              <a href="#" className="text-sm text-blue-600 hover:underline font-semibold">
                اعرف المزيد عن حقوقك
              </a>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                رجوع / Back
              </button>

              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="flex items-center gap-2 px-8 py-4 bg-[#0b2f8f] text-white rounded-2xl font-bold text-lg hover:bg-[#092570] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>جاري الإرسال... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <span>إرسال للمراجعة / Submit for Review</span>
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
