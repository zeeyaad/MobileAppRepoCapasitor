import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { IdCard, AlertCircle, ChevronRight, ChevronLeft, User, Mail, Phone, Lock, Calendar, Users, Check, X } from 'lucide-react';
import type { RegisterFormValues } from '../schemas/validation';

interface Step2BasicInfoProps {
    onNext: () => void;
    onPrev?: () => void;  // optional — omit when this is the first step
}

interface InputGroupProps {
    label: string;
    error?: { message?: string };
    children: React.ReactNode;
    className?: string;
    id: string;
    icon?: React.ReactNode;
    required?: boolean;
    isValid?: boolean;
    showValidationIcon?: boolean;
}

/**
 * Input Group Component
 * Renders a labeled input with error display, icons, and accessibility features
 */
const InputGroup = ({ label, error, children, className = '', id, icon, required = false, isValid, showValidationIcon = false }: InputGroupProps) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex items-center justify-between">
            <label
                htmlFor={id}
                className="text-sm font-bold text-gray-700 flex items-center gap-2"
            >
                {icon && <span className="text-[#2596be]">{icon}</span>}
                {label}
                {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            {showValidationIcon && (
                <div className="flex items-center gap-1">
                    {error ? (
                        <X size={16} className="text-red-500" />
                    ) : isValid ? (
                        <Check size={16} className="text-green-500" />
                    ) : null}
                </div>
            )}
        </div>
        {children}
        <AnimatePresence mode="wait">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                >
                    <span
                        className="text-red-500 text-xs flex items-center gap-1.5 font-semibold bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100"
                        role="alert"
                        aria-live="polite"
                    >
                        <AlertCircle size={14} className="flex-shrink-0" />
                        <span>{error.message}</span>
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

interface NavigationButtonsProps {
    onPrev?: () => void;  // optional — back button hidden when undefined
    onNext: () => void;
}

/**
 * Navigation Buttons Component
 */
const NavigationButtons = ({ onPrev, onNext }: NavigationButtonsProps) => (
    <div className={`flex gap-3 mt-8 pt-5 border-t border-gray-200 ${onPrev ? 'justify-between' : 'justify-end'}`}>
        {onPrev && (
            <button
                onClick={onPrev}
                type="button"
                className="flex-1 group px-4 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md border border-gray-200 text-sm sm:text-base sm:px-7"
                aria-label="العودة للخطوة السابقة"
            >
                <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                السابق
            </button>
        )}
        <button
            onClick={onNext}
            type="button"
            className={`${onPrev ? 'flex-1' : 'w-full sm:w-auto'} group px-4 py-3 rounded-xl bg-gradient-to-br from-[#2596be] to-[#1a7a9a] hover:from-[#1a7a9a] hover:to-[#156280] text-white font-bold shadow-lg shadow-[#2596be]/20 hover:shadow-xl hover:shadow-[#2596be]/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base sm:px-7`}
            aria-label="الانتقال للخطوة التالية"
        >
            التالي
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        </button>
    </div>
);

/**
 * Step 2: Basic Information
 * 
 * Collects basic user information including names, contact details, and authentication.
 * Implements conditional logic for citizenship_type based on category:
 * - Visitor: User selects Egyptian/Non-Egyptian
 * - Foreigner: Automatically Non-Egyptian
 * - Others: Automatically Egyptian
 */
export const Step2BasicInfo = ({ onNext, onPrev }: Step2BasicInfoProps) => {
    // Local state to track if user clicked Next button
    const [attemptedNext, setAttemptedNext] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const {
        register,
        watch,
        setValue,
        trigger, // Needed for manual validation before navigation
        formState: { errors, touchedFields },
    } = useFormContext<RegisterFormValues>();

    const category = watch('category');
    const password = watch('password');

    // Determine what to show based on category
    const isForeigner = category === 'foreigner';

    // Password strength calculation
    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        setPasswordStrength(Math.min(strength, 4));
    }, [password]);

    // Phone number formatting
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 11);
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue('phone', formatted.replace(/\s/g, ''), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    };

    // Safe error accessor using optional chaining
    // Show errors only if field is touched OR user attempted to proceed
    const getError = (name: keyof RegisterFormValues) => {
        const error = errors?.[name];
        if (error && (touchedFields?.[name] || attemptedNext)) {
            return error;
        }
        return undefined;
    };

    // Check if field is valid for real-time validation
    const isFieldValid = (name: keyof RegisterFormValues): boolean => {
        const value = watch(name);
        const error = errors?.[name];
        return Boolean(value && !error && touchedFields?.[name]);
    };

    // Password strength colors and labels
    const getStrengthInfo = () => {
        switch (passwordStrength) {
            case 0:
            case 1:
                return { color: 'bg-red-500', label: 'ضعيفة', textColor: 'text-red-500' };
            case 2:
                return { color: 'bg-orange-500', label: 'متوسطة', textColor: 'text-orange-500' };
            case 3:
                return { color: 'bg-yellow-500', label: 'جيدة', textColor: 'text-yellow-500' };
            case 4:
                return { color: 'bg-green-500', label: 'قوية', textColor: 'text-green-500' };
            default:
                return { color: 'bg-gray-300', label: '', textColor: 'text-gray-400' };
        }
    };
    // ============================================================================
    // Handle Next Button Click with Validation
    // ============================================================================
    const handleNext = async () => {
        setAttemptedNext(true);

        // Define Step 2 fields that need validation
        const step2Fields: (keyof RegisterFormValues)[] = [
            'first_name_ar',
            'last_name_ar',
            'first_name_en',
            'last_name_en',
            'email',
            'password',
            'confirmPassword',
            'phone',
            'dob',
            'gender',
        ];

        // Add conditional ID field based on category
        if (isForeigner) {
            step2Fields.push('passportNumber');
        } else {
            step2Fields.push('nationalId');
        }

        // Trigger validation for all Step 2 fields
        const isValid = await trigger(step2Fields);

        // Only proceed if ALL fields are valid
        if (isValid) {
            onNext();
        }
        // If invalid, errors are already showing because attemptedNext is true
    };

    // ============================================================================
    // Reset attemptedNext on component mount
    // ============================================================================
    useEffect(() => {
        setAttemptedNext(false);
    }, []);

    // ============================================================================
    // Auto-set nationality based on category (Foreigner or Egyptian)
    // Nationality is NEVER manually typed - always programmatically set
    // ============================================================================
    useEffect(() => {
        // Guard: only call setValue when category is defined and form is ready
        if (!category || !setValue) return;

        if (category === 'foreigner') {
            // Foreigner -> Non-Egyptian citizenship, nationality = "Foreigner"
            setValue('citizenship_type', 'non_egyptian');
            setValue('nationality', 'Foreigner');
        } else {
            // All other categories -> Egyptian citizenship, nationality = "Egyptian"
            setValue('citizenship_type', 'egyptian');
            setValue('nationality', 'Egyptian');
        }
    }, [category, setValue]);

    // Shared input classes with enhanced styling
    const inputClasses = `
        w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
        focus:bg-white focus:border-[#2596be] focus:ring-4 focus:ring-[#2596be]/10
        transition-all duration-200 outline-none 
        placeholder:text-gray-400 text-gray-800 font-medium
        disabled:bg-gray-50 disabled:cursor-not-allowed
    `;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100 backdrop-blur-sm"
        >
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-[#2596be] to-[#1a7a9a] rounded-2xl shadow-lg shadow-[#2596be]/20">
                        <IdCard className="text-white" size={28} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2596be] to-[#1a7a9a]">
                        البيانات الأساسية
                    </h3>
                </div>
                <p className="text-gray-600 text-sm mr-14">يرجى ملء جميع الحقول المطلوبة بدقة</p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arabic Names Section */}
                <InputGroup
                    id="first_name_ar"
                    label="الاسم الأول (عربي)"
                    error={getError('first_name_ar')}
                    icon={<User size={16} />}
                    required
                    isValid={isFieldValid('first_name_ar')}
                    showValidationIcon={true}
                >
                    <input
                        id="first_name_ar"
                        {...register('first_name_ar')}
                        className={inputClasses}
                        placeholder="مثال: أحمد"
                        maxLength={20}
                        dir="rtl"
                        aria-required="true"
                        aria-invalid={!!getError('first_name_ar')}
                        aria-describedby={getError('first_name_ar') ? 'first_name_ar-error' : undefined}
                    />
                </InputGroup>

                <InputGroup
                    id="last_name_ar"
                    label="اسم العائلة (عربي)"
                    error={getError('last_name_ar')}
                    icon={<User size={16} />}
                    required
                    isValid={isFieldValid('last_name_ar')}
                    showValidationIcon={true}
                >
                    <input
                        id="last_name_ar"
                        {...register('last_name_ar')}
                        className={inputClasses}
                        placeholder="مثال: محمد"
                        maxLength={20}
                        dir="rtl"
                        aria-required="true"
                        aria-invalid={!!getError('last_name_ar')}
                    />
                </InputGroup>

                {/* English Names Section */}
                <InputGroup
                    id="first_name_en"
                    label="First Name (En)"
                    className="text-left"
                    error={getError('first_name_en')}
                    icon={<User size={16} />}
                    required
                >
                    <input
                        id="first_name_en"
                        {...register('first_name_en')}
                        className={`${inputClasses} text-left`}
                        placeholder="e.g. Ahmed"
                        dir="ltr"
                        maxLength={20}
                        aria-required="true"
                        aria-invalid={!!getError('first_name_en')}
                    />
                </InputGroup>

                <InputGroup
                    id="last_name_en"
                    label="Last Name (En)"
                    className="text-left"
                    error={getError('last_name_en')}
                    icon={<User size={16} />}
                    required
                >
                    <input
                        id="last_name_en"
                        {...register('last_name_en')}
                        className={`${inputClasses} text-left`}
                        placeholder="e.g. Mohamed"
                        dir="ltr"
                        maxLength={20}
                        aria-required="true"
                        aria-invalid={!!getError('last_name_en')}
                    />
                </InputGroup>

                {/* Divider */}
                <div className="md:col-span-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

                {/* ================================================================ */}
                {/* Conditional: National ID (Everyone) or Passport (Foreigner only) */}
                {/* ================================================================ */}
                <AnimatePresence mode="wait">
                    {isForeigner ? (
                        <motion.div
                            key="passportNumber"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="md:col-span-2"
                        >
                            <InputGroup
                                id="passportNumber"
                                label="رقم جواز السفر"
                                error={getError('passportNumber')}
                                icon={<IdCard size={16} />}
                                required
                            >
                                <input
                                    id="passportNumber"
                                    {...register('passportNumber')}
                                    className={`${inputClasses} tracking-wide font-mono text-lg`}
                                    placeholder="Passport Number"
                                    maxLength={20}
                                    dir="ltr"
                                    aria-required="true"
                                    aria-invalid={!!getError('passportNumber')}
                                />
                            </InputGroup>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="nationalId"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="md:col-span-2"
                        >
                            <InputGroup
                                id="nationalId"
                                label="الرقم القومي"
                                error={getError('nationalId')}
                                icon={<IdCard size={16} />}
                                required
                            >
                                <input
                                    id="nationalId"
                                    {...register('nationalId')}
                                    className={`${inputClasses} tracking-wide font-mono text-lg`}
                                    placeholder="14 رقم"
                                    maxLength={14}
                                    dir="ltr"
                                    aria-required="true"
                                    aria-invalid={!!getError('nationalId')}
                                />
                            </InputGroup>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Date of Birth */}
                <InputGroup
                    id="dob"
                    label="تاريخ الميلاد"
                    error={getError('dob')}
                    icon={<Calendar size={16} />}
                    required
                >
                    <input
                        id="dob"
                        type="date"
                        {...register('dob')}
                        className={inputClasses}
                        aria-required="true"
                        aria-invalid={!!getError('dob')}
                    />
                </InputGroup>

                {/* Gender */}
                <InputGroup
                    id="gender"
                    label="الجنس"
                    error={getError('gender')}
                    icon={<Users size={16} />}
                    required
                >
                    <select
                        id="gender"
                        {...register('gender')}
                        className={inputClasses}
                        aria-required="true"
                        aria-invalid={!!getError('gender')}
                    >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                    </select>
                </InputGroup>

                {/* Divider */}
                <div className="md:col-span-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

                {/* Phone */}
                <InputGroup
                    id="phone"
                    label="رقم الهاتف"
                    error={getError('phone')}
                    icon={<Phone size={16} />}
                    required
                    isValid={isFieldValid('phone')}
                    showValidationIcon={true}
                >
                    <input
                        id="phone"
                        {...register('phone')}
                        className={`${inputClasses} font-mono`}
                        placeholder="01x xxx xxxx"
                        maxLength={11}
                        dir="ltr"
                        aria-required="true"
                        aria-invalid={!!getError('phone')}
                        onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            e.target.value = formatted;
                            handlePhoneChange(e);
                        }}
                    />
                </InputGroup>

                {/* Email */}
                <InputGroup
                    id="email"
                    label="البريد الإلكتروني"
                    error={getError('email')}
                    icon={<Mail size={16} />}
                    required
                    isValid={isFieldValid('email')}
                    showValidationIcon={true}
                >
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={`${inputClasses} text-left`}
                        placeholder="example@email.com"
                        dir="ltr"
                        aria-required="true"
                        aria-invalid={!!getError('email')}
                    />
                </InputGroup>

                {/* Divider */}
                <div className="md:col-span-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

                {/* Password */}
                <InputGroup
                    id="password"
                    label="كلمة المرور"
                    error={getError('password')}
                    icon={<Lock size={16} />}
                    required
                    isValid={isFieldValid('password')}
                    showValidationIcon={true}
                >
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className={inputClasses}
                        placeholder="••••••••"
                        aria-required="true"
                        aria-invalid={!!getError('password')}
                    />
                    {password && (
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">قوة كلمة المرور</span>
                                <span className={`text-xs font-medium ${getStrengthInfo().textColor}`}>
                                    {getStrengthInfo().label}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthInfo().color}`}
                                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </InputGroup>

                {/* Confirm Password */}
                <InputGroup
                    id="confirmPassword"
                    label="تأكيد كلمة المرور"
                    error={getError('confirmPassword')}
                    icon={<Lock size={16} />}
                    required
                    isValid={isFieldValid('confirmPassword')}
                    showValidationIcon={true}
                >
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className={inputClasses}
                        placeholder="••••••••"
                        aria-required="true"
                        aria-invalid={!!getError('confirmPassword')}
                    />
                </InputGroup>
            </div>

            <NavigationButtons
                onPrev={onPrev}
                onNext={handleNext}
            />
        </motion.div>
    );
};
