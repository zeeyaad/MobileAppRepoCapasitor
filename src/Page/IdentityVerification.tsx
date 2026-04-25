import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle2, Lock, Shield, ChevronRight, // ChevronRight is "Back" in RTL visually if pointing Right
  User, Calendar, MapPin, ArrowLeft, FileText, Home
} from 'lucide-react';

// Egyptian Governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'السادات', 'شمال سيناء', 'جنوب سيناء', 'كفر الشيخ', 'مطروح',
  'الأقصر', 'قنا', 'سوهاج', 'طنطا'
];

const IdentityVerification: React.FC = () => {
  const asset = (name: string) => `/assets/${name}`;
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    streetAddress: '',
    city: '',
    governorate: '',
    fatherName: '',
    motherName: '',
    consent: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-save simulation
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, []);

  // Validation Functions
  const validateNationalId = (id: string) => /^\d{14}$/.test(id);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateField = (field: keyof typeof formData, value: string | boolean) => {
    let error = '';
    switch (field) {
      case 'fullName':
        if (typeof value === 'string' && !value.trim()) error = 'الاسم الكامل مطلوب';
        break;
      case 'dateOfBirth':
        if (typeof value === 'string') {
          if (!value) error = 'تاريخ الميلاد مطلوب';
          else if (calculateAge(value) < 18) error = 'يجب أن يكون عمرك 18 عامًا على الأقل';
        }
        break;
      case 'gender':
        if (typeof value === 'string' && !value) error = 'النوع مطلوب';
        break;
      case 'nationalId':
        if (typeof value === 'string') {
          if (!value) error = 'رقم البطاقة القومية مطلوب';
          else if (!validateNationalId(value)) error = 'يجب أن يتكون من 14 رقمًا';
        }
        break;
      case 'streetAddress':
        if (typeof value === 'string' && !value.trim()) error = 'العنوان مطلوب';
        break;
      case 'city':
        if (typeof value === 'string' && !value.trim()) error = 'المدينة مطلوبة';
        break;
      case 'governorate':
        if (typeof value === 'string' && !value) error = 'المحافظة مطلوبة';
        break;
      case 'consent':
        if (typeof value === 'boolean' && !value) error = 'يجب الموافقة للمتابعة';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setTouched({
      fullName: true, dateOfBirth: true, gender: true,
      nationalId: true, streetAddress: true, city: true,
      governorate: true, consent: true
    });
    setErrors(newErrors);

    if (!isValid) return;

    setIsLoading(true);
    localStorage.setItem('identityData', JSON.stringify(formData));
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/upload-documents';
    }, 1000);
  };

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.dateOfBirth &&
      calculateAge(formData.dateOfBirth) >= 18 &&
      formData.gender &&
      validateNationalId(formData.nationalId) &&
      formData.streetAddress &&
      formData.city &&
      formData.governorate &&
      formData.consent &&
      Object.keys(errors).every(k => !errors[k])
    );
  };

  const renderInput = (
    label: string,
    name: keyof typeof formData,
    type: string = 'text',
    placeholder: string,
    Icon: React.ElementType
  ) => (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="relative group">
        <input
          type={type}
          value={formData[name] as string}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          placeholder={placeholder}
          className={`
            w-full bg-gray-50 border rounded-2xl px-5 py-4 pl-4 pr-12 
            text-gray-900 placeholder-gray-400 transition-all duration-200
            focus:bg-white focus:ring-2 outline-none
            ${errors[name] && touched[name]
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20'}
          `}
        />
        <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 
          ${errors[name] && touched[name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#0b2f8f]'}`}
        />
      </div>
      {errors[name] && touched[name] && (
        <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-3 h-3" />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* Left Side: Image & Brand Experience (Restored for Seamless UX) */}
      <div className="hidden lg:block lg:w-[40%] relative overflow-hidden">
        <img
          src={asset("ac-Club-06.jpg")}
          alt="Sports Club"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b2f8f]/70 to-black/50 mix-blend-multiply" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            <Shield className="w-6 h-6 text-white" />
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#22c55e]" />
              <h2 className="text-2xl font-bold">بياناتك في أمان</h2>
            </div>
            <p className="text-gray-100 leading-relaxed opacity-90">
              نحن نلتزم بأعلى معايير الأمان لحماية بياناتك الشخصية. عملية التحقق تساعدنا في بناء مجتمع رياضي آمن وموثوق للجميع.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex justify-center p-6 bg-white overflow-y-auto h-screen">
        <div className="w-full max-w-2xl py-4">

          {/* Progress Bar */}
          <div className="mb-8 sticky top-0 bg-white z-20 pt-2 pb-4 border-b border-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#0b2f8f]">
                الخطوة 2: التحقق من الهوية
              </span>
              <span className="text-xs text-gray-400 font-medium">60% مكتمل</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#22c55e] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '60%' }}></div>
            </div>
            {autoSaved && (
              <div className="absolute left-0 top-3 text-xs text-[#22c55e] flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3 h-3" />
                تم الحفظ
              </div>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0b2f8f] mb-2 tracking-tight">
              البيانات الشخصية
            </h1>
            <p className="text-gray-500">
              يرجى التأكد من مطابقة البيانات لبطاقة الرقم القومي
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 pb-10">

            {/* Section 1: Personal Info */}
            <section className="space-y-5">
              {renderInput('الاسم الكامل (رباعي)', 'fullName', 'text', 'كما هو مدون في البطاقة', User)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    تاريخ الميلاد
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      onBlur={() => handleBlur('dateOfBirth')}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className={`
                        w-full bg-gray-50 border rounded-2xl px-5 py-4 pr-12 
                        text-gray-900 outline-none transition-all
                        focus:bg-white focus:ring-2 
                        ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20'}
                        `}
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.dateOfBirth && touched.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">النوع</label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      onBlur={() => handleBlur('gender')}
                      className={`
                            w-full bg-gray-50 border rounded-2xl px-5 py-4 text-gray-900 outline-none appearance-none
                            focus:bg-white focus:ring-2
                            ${errors.gender && touched.gender ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20'}
                        `}
                    >
                      <option value="">اختر النوع</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.gender && touched.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Section 2: National ID */}
            <section className="space-y-5">
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم البطاقة القومية</label>
                  <span className={`text-xs font-mono mt-1 ${formData.nationalId.length === 14 ? 'text-[#22c55e]' : 'text-gray-400'}`}>
                    {formData.nationalId.length}/14
                  </span>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                      handleChange('nationalId', value);
                    }}
                    onBlur={() => handleBlur('nationalId')}
                    maxLength={14}
                    placeholder="الـ 14 رقم"
                    className={`
                            w-full bg-gray-50 border rounded-2xl px-5 py-4 pl-4 pr-12 font-mono text-lg tracking-widest
                            text-gray-900 placeholder-gray-400 outline-none transition-all
                            focus:bg-white focus:ring-2
                            ${errors.nationalId && touched.nationalId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20'}
                            `}
                  />
                  <FileText className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.nationalId ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                {errors.nationalId && touched.nationalId && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.nationalId}</span>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Section 3: Location */}
            <section className="space-y-5">
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-[#0b2f8f] font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  تفاصيل العنوان
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={formData.governorate}
                        onChange={(e) => handleChange('governorate', e.target.value)}
                        onBlur={() => handleBlur('governorate')}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20 appearance-none"
                      >
                        <option value="">المحافظة</option>
                        {GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="المدينة / الحي"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20"
                    />
                  </div>

                  <textarea
                    value={formData.streetAddress}
                    onChange={(e) => handleChange('streetAddress', e.target.value)}
                    rows={2}
                    placeholder="اسم الشارع، رقم العقار، الدور، رقم الشقة"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:border-[#0b2f8f] focus:ring-[#0b2f8f]/20 resize-none"
                  />
                </div>
              </div>
            </section>


            {/* Legal Consent */}
            <div className="bg-gray-50 p-4 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => handleChange('consent', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`
                    w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center
                    ${formData.consent ? 'bg-[#0b2f8f] border-[#0b2f8f]' : 'border-gray-400 group-hover:border-[#0b2f8f]'}
                  `}>
                    <CheckCircle2 className={`w-3.5 h-3.5 text-white transform transition-transform ${formData.consent ? 'scale-100' : 'scale-0'}`} />
                  </div>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  أقر بأن جميع البيانات المدخلة صحيحة، وأوافق على <a href="#" className="text-[#0b2f8f] font-bold hover:underline">معالجة البيانات</a> لأغراض التحقق الأمني.
                </div>
              </label>
              {errors.consent && touched.consent && (
                <p className="text-red-500 text-xs mt-2 mr-8">{errors.consent}</p>
              )}
            </div>

            {/* Navigation Buttons (RTL Optimized) */}
            {/* In RTL: justify-between puts first child on Right, last child on Left */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">

              {/* Right Side: Back Button */}
              <button
                type="button"
                onClick={() => window.location.href = '/register'}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold hover:text-[#0b2f8f] hover:bg-blue-50 rounded-xl transition-all"
              >
                <ChevronRight className="w-5 h-5 rotate-180" /> {/* Rotated for visual back in RTL */}
                <span>رجوع</span>
              </button>

              {/* Left Side: Next Button */}
              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="flex items-center gap-3 px-10 py-4 bg-[#22c55e] text-white rounded-2xl font-bold text-lg 
                         hover:bg-[#1ba54d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed 
                         shadow-lg shadow-green-500/20 hover:shadow-green-500/30
                         transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>متابعة</span>
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

export default IdentityVerification;
