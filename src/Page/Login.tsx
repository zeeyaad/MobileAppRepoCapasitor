import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const HUCLogo = "/assets/HUC_logo.jpeg";
const HUCPictureFull = "/assets/HUC Picture Full.jpg";
const HUCFootball = "/assets/HUC football.jpg";
import { AuthService } from '../services/authService';
import type { LoginResponse, UserInfo } from '../types';
import { useAuth } from '../context/AuthContext';

// Background images for slideshow
const BG_IMAGES = [HUCPictureFull, HUCFootball];

const Login: React.FC = () => {
  const { i18n } = useTranslation();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', api: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Login type detection: 'email' | 'national_id' | null
  const [loginType, setLoginType] = useState<'email' | 'national_id' | null>(null);

  // Slideshow effect - switch images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isRTL = i18n.language === 'ar';

  //Auto-detect login type
  useEffect(() => {
    const value = formData.email;
    if (/^\d{14}$/.test(value)) {
      setLoginType('national_id');
    } else if (value.length > 0) {
      setLoginType('email');
    } else {
      setLoginType(null);
    }
  }, [formData.email]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateNationalId = (nid: string) => {
    return /^\d{14}$/.test(nid);
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    // For NID mode, only allow digits in identifier field
    if (field === 'email' && loginType === 'national_id' && value.length > 0 && !/^\d*$/.test(value)) {
      return; // Block non-digit input
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate on blur
    if (field === 'email') {
      let emailError = '';
      if (!formData.email) {
        emailError = 'البريد الإلكتروني أو الرقم القومي مطلوب';
      } else if (loginType === 'national_id' && !validateNationalId(formData.email)) {
        emailError = 'الرقم القومي يجب أن يكون 14 رقمًا';
      } else if (loginType === 'email' && !validateEmail(formData.email)) {
        emailError = 'البريد الإلكتروني غير صحيح';
      }
      setErrors(prev => ({ ...prev, email: emailError }));
    } else if (field === 'password') {
      // Skip password validation in NID mode (auto-filled)
      if (loginType === 'national_id') return;
      const passwordError = !formData.password ? 'كلمة المرور مطلوبة' : formData.password.length < 6 ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : '';
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on login type
    let emailError = '';
    let passwordError = '';

    if (!formData.email) {
      emailError = 'البريد الإلكتروني أو الرقم القومي مطلوب';
    } else if (loginType === 'national_id') {
      if (!validateNationalId(formData.email)) {
        emailError = 'الرقم القومي يجب أن يكون 14 رقمًا';
      }
    } else if (loginType === 'email') {
      if (!validateEmail(formData.email)) {
        emailError = 'البريد الإلكتروني غير صحيح';
      }
    }

    // Password validation (skip for NID mode as it's auto-filled)
    if (loginType !== 'national_id') {
      if (!formData.password) {
        passwordError = 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 6) {
        passwordError = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      }
    }

    setErrors({ email: emailError, password: passwordError, api: '' });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    setIsLoading(true);

    try {
      // Build payload based on login type
      const payload = loginType === 'national_id'
        ? { national_id: formData.email, password: formData.email, email: '' }
        : { email: formData.email, password: formData.password };

      // Call the backend login API
      const response: LoginResponse = await AuthService.login(payload);

      if (response.success) {
        // Update global auth context (stores huc_access_token/huc_user)
        authLogin({ token: response.token, user: response.user });

        // Check if credential change is required
        if (response.requires_credential_change) {
          // Set flag in localStorage to show modal after redirect
          localStorage.setItem('huc_requires_credential_change', 'true');
        }

        // Log user privileges for debugging
        console.log('🔐 User Login Details:', {
          role: response.user.role,
          privileges: response.user.privileges || [],
          staff_id: response.user.staff_id,
          name: response.user.name || response.user.name_en,
          email: response.user.email,
          status: response.user.status
        });
        console.log('📋 Available Privileges:', response.user.privileges?.join(', ') || 'None');


        // Role-based redirection
        redirectBasedOnRole(response.user);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل تسجيل الدخول. تحقق من بيانات الدخول وحاول مرة أخرى.';
      setErrors(prev => ({ ...prev, api: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (user: UserInfo) => {
    const role = String(user.role || '').toUpperCase();
    const memberType = String(user.member_type || '').toUpperCase();

    // Check for staff roles first
    if (user.staff_id || role === 'ADMIN' || role === 'STAFF' || role === 'STAFF_MEMBER' || role === 'MEDIA' || role === 'SUPPORT') {
      if (role === 'MEDIA') {
        window.location.href = '/media-gallery-dashboard';
      } else {
        window.location.href = '/staff/dashboard';
      }
      return;
    }

    const isTeamMember = role === 'TEAM_MEMBER' || memberType.includes('TEAM');

    if (isTeamMember) {
      window.location.href = '/team-member/dashboard';
      return;
    }

    if (user.member_id) {
      // Only redirect to pending if status is explicitly 'pending'.
      // Active, empty, or any other status all go to the dashboard.
      const memberStatus = String(user.status ?? '').trim().toLowerCase();
      window.location.href = memberStatus === 'pending' ? '/member/pending' : '/member/dashboard';
      return;
    }

    window.location.href = '/dashboard';
  };

  // Credential change handler removed - now in CredentialChangeModal component

  const handleGoogleSignIn = () => {
    console.log('Google Sign In clicked');
    alert('سيتم تفعيل تسجيل الدخول بجوجل قريبًا');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-['Cairo']">

      {/* Left Side - Background Slideshow */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1"
      >
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={BG_IMAGES[currentImageIndex]}
              alt="نادي جامعة حلوان"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white order-2"
      >
        <div className="w-full max-w-md space-y-8">

          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-slate-600 hover:text-[#2596be] transition-colors font-medium group"
            aria-label={isRTL ? 'الرجوع' : 'Back'}
          >
            {isRTL ? (
              <>
                <span>الرجوع</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <>
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </>
            )}
          </button>

          {/* Logo & Header */}
          <div className="text-center flex flex-col items-center">
            {/* Helwan Club Logo */}
            <div className="mb-6">
              <img src={HUCLogo} alt="نادي جامعة حلوان" className="w-20 h-20 object-contain" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              مرحبًا بك من جديد
            </h1>
            <p className="text-gray-600 mb-10 text-sm md:text-base">
              سجّل دخولك للمتابعة
            </p>
          </div>

          {/* API Error Message */}
          {errors.api && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errors.api}</span>
              </div>
            </div>
          )}

          <div onKeyPress={handleKeyPress}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-base md:text-lg text-gray-700 mb-2 font-medium">
                البريد الإلكتروني أو الرقم القومي
              </label>
              <div className="relative">
                <input
                  id="email"
                  type={loginType === 'national_id' ? 'tel' : 'email'}
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder={loginType === 'national_id' ? '12345678901234' : 'example@email.com'}
                  autoFocus
                  maxLength={loginType === 'national_id' ? 14 : undefined}
                  inputMode={loginType === 'national_id' ? 'numeric' : 'email'}
                  className={`w-full text-left border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl py-4 md:py-5 pr-5 pl-12 text-base md:text-lg focus:outline-none focus:ring-2 ${errors.email && touched.email ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
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

            <div className="mb-3">
              <label htmlFor="password" className="block text-base md:text-lg text-gray-700 mb-2 font-medium">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 pr-12 pl-12 text-base md:text-lg focus:outline-none focus:ring-2 ${errors.password && touched.password ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
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

            <div className="text-left mb-8">
              <a
                className="text-sm md:text-base text-[#2596be] hover:underline transition-all"
                href="/forgot"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#2596be] hover:bg-[#1e7e9e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 md:py-5 rounded-2xl font-bold text-lg mb-4 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التحميل...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>

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
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-4 md:py-5 rounded-2xl font-semibold text-lg mb-6 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            تسجيل الدخول باستخدام جوجل
          </button>

          <p className="text-center text-sm md:text-base text-gray-600">
            ليس لديك حساب؟{' '}
            <a href="/re" className="text-[#2596be] font-semibold hover:underline transition-all">
              سجّل الآن
            </a>
          </p>
        </div>
      </motion.div>

    </div>
  );
};

export default Login;
