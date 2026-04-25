import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

const SignUp: React.FC = () => {
  const asset = (name: string) => `/assets/${name}`;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Default to VISITOR to avoid accidental WORKING assignment when user doesn't choose
    membershipType: 'VISITOR' // New field for membership plan selection
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    membershipType: ''
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    membershipType: false
  });

  // Membership type options - matches database member_types
  // IMPORTANT: FOUNDER (ID 1) is for the club owner ONLY - not for regular registration
  const membershipTypes = [
    { value: 'VISITOR', label_ar: 'عضوية عادية (زائر)', label_en: 'Regular Member (Visitor)', description_ar: 'للأفراد العاديين' },
    { value: 'WORKING', label_ar: 'عامل بالجامعة', label_en: 'Working Member', description_ar: 'موظفي الجامعة' },
    { value: 'STUDENT', label_ar: 'طالب جامعي', label_en: 'Student Member', description_ar: 'الطلاب الجامعيين' },
    { value: 'DEPENDENT', label_ar: 'عضوية تابع', label_en: 'Dependent Member', description_ar: 'أفراد عائلة الموظفين' },
    { value: 'FOREIGNER', label_ar: 'أجنبي', label_en: 'Foreigner Member', description_ar: 'الأجانب' }
  ];

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{10,15}$/.test(phone.replace(/[\s-]/g, ''));

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    let error = '';
    switch (field) {
      case 'firstName':
        if (!value.trim()) error = 'الاسم الأول مطلوب';
        break;
      case 'lastName':
        if (!value.trim()) error = 'الاسم الثاني مطلوب';
        break;
      case 'email':
        if (!value) error = 'البريد الإلكتروني مطلوب';
        else if (!validateEmail(value)) error = 'البريد الإلكتروني غير صحيح';
        break;
      case 'phone':
        if (!value) error = 'رقم الهاتف مطلوب';
        else if (!validatePhone(value)) error = 'رقم الهاتف غير صحيح';
        break;
      case 'password':
        if (!value) error = 'كلمة المرور مطلوبة';
        else if (value.length < 8) error = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        break;
      case 'confirmPassword':
        if (!value) error = 'تأكيد كلمة المرور مطلوب';
        else if (value !== formData.password) error = 'كلمة المرور غير متطابقة';
        break;
      case 'membershipType':
        if (!value) error = 'اختر نوع العضوية من فضلك';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        validateField(field as keyof typeof formData, '');
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    
    // Prepare data to send to backend
    const registrationData = {
      role: 'member',
      email: formData.email,
      password: formData.password,
      first_name_en: formData.firstName,
      first_name_ar: formData.firstName, // Can be translated by user later
      last_name_en: formData.lastName,
      last_name_ar: formData.lastName,
      phone: formData.phone,
      national_id: '',  // This should be filled in the next step
      membership_type_code: formData.membershipType, // Pass selected membership type
    };

  // TODO: Send to backend API
  // Debug: ensure membership_type_code is correct before sending
  console.log('Registration data (debug):', registrationData);

    setTimeout(() => {
      alert('تم إنشاء الحساب بنجاح!');
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.35fr_1fr]" dir="rtl">
      {/* صورة جانبية */}
      <div className="hidden md:block relative">
        <img src={asset("ac-Club-06.jpg")} alt="Swimming lanes" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* نموذج التسجيل */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-lg md:max-w-xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">إنشاء حساب جديد</h1>
          <p className="text-gray-600 mb-10 text-sm md:text-base">انضم إلينا وابدأ رحلتك</p>

          {/* الاسم الأول والثاني */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1 font-medium">الاسم الأول</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="محمد"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  className={`w-full border ${errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none`}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.firstName && touched.firstName && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.firstName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1 font-medium">الاسم الثاني</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="حسام"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  className={`w-full border ${errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none`}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.lastName && touched.lastName && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* البريد */}
          <div className="mb-5">
            <label className="block text-sm text-gray-700 mb-1 font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 pr-12 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none`}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {errors.email && touched.email && (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* الهاتف */}
          <div className="mb-5">
            <label className="block text-sm text-gray-700 mb-1 font-medium">رقم الهاتف</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="01xxxxxxxxx"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`w-full border ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 pr-12 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none`}
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {errors.phone && touched.phone && (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* اختيار نوع العضوية */}
          <div className="mb-5">
            <label className="block text-sm text-gray-700 mb-2 font-medium">اختر نوع العضوية</label>
            <select
              value={formData.membershipType}
              onChange={(e) => handleChange('membershipType', e.target.value)}
              onBlur={() => handleBlur('membershipType')}
              className={`w-full border ${errors.membershipType && touched.membershipType ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none bg-white`}
            >
              <option value="">-- اختر نوع العضوية --</option>
              {membershipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label_ar} - {type.description_ar}
                </option>
              ))}
            </select>
            {errors.membershipType && touched.membershipType && (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.membershipType}</span>
              </div>
            )}
          </div>

          {/* كلمة المرور */}
          <div className="mb-5">
            <label className="block text-sm text-gray-700 mb-1 font-medium">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 pr-12 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none`}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && touched.password && (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="mb-8">
            <label className="block text-sm text-gray-700 mb-1 font-medium">تأكيد كلمة المرور</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 pr-12 text-base md:text-lg focus:ring-2 focus:ring-[#0b2f8f] outline-none`}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 md:py-5 rounded-2xl font-bold text-lg mb-4 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'جاري التحميل...' : 'إنشاء حساب'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">أو</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-4 md:py-5 rounded-2xl font-semibold text-lg mb-6 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            إنشاء حساب باستخدام جوجل
          </button>

          <p className="text-center text-sm md:text-base text-gray-600">
            عندك حساب بالفعل؟{' '}
            <a href="#/login" className="text-[#0b2f8f] font-semibold hover:underline transition-all">سجل دخول</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
