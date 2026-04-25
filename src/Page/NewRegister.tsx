import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler, type FieldError } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Briefcase,
    Users,
    Plane,
    UserCheck,
    ChevronRight,
    ChevronLeft,
    Check,
    IdCard,
    Loader2,
    UploadCloud,
    Building2,
    HeartHandshake,
    AlertCircle
} from 'lucide-react';

import { AuthService } from '../services/authService';
// Remove mock services
// const RegistrationService = ... (Delete)
// const DetailedRegistrationService = ... (Delete)
// const apiClient = ... (Delete)

// Helper to map form data to BasicInfoDTO
// جوه ملف NewRegister.tsx (غالباً في أول الملف أو آخره بعيد عن الـ Component)

const mapToBasicDTO = (data: IFormInput, category?: string) => {
    // Map category to membership_type_code for backend
    // Categories: 'visitor' | 'staff' | 'student' | 'dependent' | 'foreigner' | 'retired'
    const membershipTypeMap: Record<string, string> = {
        'visitor': 'VISITOR',
        'staff': 'WORKING',
        'student': 'STUDENT',
        'dependent': 'DEPENDENT',
        'foreigner': 'FOREIGNER',
        'retired': 'WORKING'
    };
    const membership_type_code = membershipTypeMap[category as string] || 'VISITOR';
    
    console.log('🗺️ mapToBasicDTO (NewRegister):', {
        category,
        mappedCode: membership_type_code
    });

    return {
        role: 'member', // Default role for social members
        email: (data.email || '').trim(),
        first_name_en: (data.first_name_en || '').trim(),
        first_name_ar: (data.first_name_ar || '').trim(),
        last_name_en: (data.last_name_en || '').trim(),
        last_name_ar: (data.last_name_ar || '').trim(),
        phone: (data.phone || '').trim(),
        // Handle both nationalId (for Egyptians) and passportNumber (for Foreigners)
        national_id: (data.nationalId || data.passportNumber || '').trim(),
        gender: data.gender,
        nationality: data.nationality,
        birthdate: data.dob, // Fixed: dob from form
        password: data.password, // Added: password is required
        membership_type_code // NEW: Pass membership type code to backend
    };
};

// ... (Types remain same) ...

// ... (Inside Component) ...

// --- Types ---
type MemberCategory = 'student' | 'staff' | 'retired' | 'foreigner' | 'dependent' | 'visitor';

interface University {
    id: number;
    name: string;
}

interface Faculty {
    id: number;
    name_ar: string;
}

interface Profession {
    id: number;
    code: string;
    name: string;
}

interface IFormInput {
    // Basic
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
    fullName: string; // Added for frontend logic mapping
    nationalId: string;
    nationality: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    // Details
    address: string;
    universityId?: string;
    facultyId?: string;
    graduationYear?: string;
    professionId?: string;
    professionCode?: string;
    salary?: string;
    department?: string;
    retirementDate?: string;
    seasonalDuration?: '1' | '6' | '12';
    passportNumber?: string;
    visaStatus?: string;
    paymentType?: 'full' | 'installments';
    relatedMemberId?: string;
    relationshipType?: string;
}

// --- Components ---

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { id: 1, label: "نوع العضوية" },
        { id: 2, label: "البيانات الأساسية" },
        { id: 3, label: "التفاصيل" },
        { id: 4, label: "المستندات" }
    ];

    return (
        <div className="w-full max-w-3xl mx-auto mb-12" dir="rtl">
            <div className="relative flex justify-between items-center z-0">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 -z-10 rounded-full" />
                <motion.div
                    className="absolute top-1/2 right-0 h-2 bg-indigo-600 -z-10 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                />

                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center bg-transparent">
                        <motion.div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 bg-white
                                ${currentStep >= step.id ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}
                            animate={{
                                scale: currentStep === step.id ? 1.2 : 1,
                                borderColor: currentStep >= step.id ? '#4f46e5' : '#d1d5db',
                            }}
                        >
                            {currentStep > step.id ? <Check size={24} strokeWidth={3} /> : step.id}
                        </motion.div>
                        <span className={`mt-3 text-sm font-bold transition-colors ${currentStep >= step.id ? 'text-indigo-900' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface InputGroupProps {
    label: string;
    error?: FieldError;
    children: React.ReactNode;
    className?: string;
}

const InputGroup = ({ label, error, children, className = "" }: InputGroupProps) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {children}
        <AnimatePresence>
            {error && (
                <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1 font-medium"
                >
                    <AlertCircle size={12} /> {error.message}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

// --- Main Form Component ---
const ComprehensiveRegistrationForm = () => {
    const [step, setStep] = useState<number>(1);
    const [category, setCategory] = useState<MemberCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Data
    const [universities, setUniversities] = useState<University[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);

    const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<IFormInput>({
        mode: "onChange",
        defaultValues: { nationality: 'مصرى', gender: 'male', paymentType: 'full' }
    });

    const selectedUni = watch("universityId");
    const selectedDuration = watch("seasonalDuration");

    // File state
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const fileRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Form submission handler
    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        setIsSubmitting(true);
        try {
            // 1. Basic Registration
            const basicData = mapToBasicDTO(data, category || undefined);
            console.log('🔍 DEBUG: Basic data being sent:', basicData);
            const basicRes = await AuthService.registerBasic(basicData);

            if (!basicRes.success || !basicRes.data?.member_id) {
                throw new Error(basicRes.message || "Registration Failed");
            }
            const memberId = basicRes.data.member_id;

            // 2. Determine Membership
            const determinationData = {
                member_id: memberId,
                is_student: category === 'student',
                is_working: category === 'staff',
                is_foreign: category === 'foreigner', // Fixed: Derived from category
                is_graduated: false, // Default
                has_relation: category === 'dependent',
                is_retired: category === 'retired',
                relation_member_id: data.relatedMemberId ? Number(data.relatedMemberId) : undefined
            };
            const determineRes = await AuthService.determineMembership(determinationData);

            // 3. Submit Details
            const formData = new FormData();
            formData.append('member_id', String(memberId));
            formData.append('address', data.address);

            // Files - Using keys from renderStep4_Files (id_front, id_back, photo, etc.)
            // Mapping: UI Key -> Backend Key
            if (files.id_front) formData.append('national_id_front', files.id_front);
            if (files.id_back) formData.append('national_id_back', files.id_back);
            if (files.passport) formData.append('national_id_front', files.passport); // Passport serves as ID front for foreigners
            if (files.photo) formData.append('personal_photo', files.photo);
            if (files.salary_slip) formData.append('salary_slip', files.salary_slip);
            if (files.medical) formData.append('medical_report', files.medical);
            // new keys
            if (files.student_proof) formData.append('student_proof', files.student_proof);
            if (files.relation_proof) formData.append('relation_proof', files.relation_proof);

            let endpoint = 'visitor'; // Default
            if (category === 'student') {
                endpoint = 'student';
                formData.append('university_id', data.universityId || '0');
                formData.append('faculty_id', data.facultyId || '0');
                formData.append('graduation_year', data.graduationYear || '2024');
                formData.append('enrollment_date', new Date().toISOString());
            } else if (category === 'staff') {
                endpoint = 'working';
                formData.append('profession_id', data.professionId || '0');
                formData.append('department_en', data.department || 'General');
                formData.append('department_ar', data.department || 'عام');
                formData.append('salary', data.salary || '0');
                formData.append('employment_start_date', new Date().toISOString());
                formData.append('university_id', '1');
            } else if (category === 'retired') {
                endpoint = 'retired';
                formData.append('profession_code', data.professionCode || 'RETIRED');
                formData.append('retirement_date', data.retirementDate || new Date().toISOString());
            } else if (category === 'foreigner') {
                // Endpoint might be different or mapped to existing
                endpoint = 'visitor'; // Or specific endpoint if exists
                formData.append('visitor_type', 'FOREIGNER');
            } else if (category === 'visitor') {
                // Standard visitor category
                endpoint = 'visitor';
                formData.append('visitor_type', 'VISITOR');
            }

            await AuthService.submitDetailedInfo(endpoint, formData);

            // 4. Complete
            await AuthService.completeRegistration({
                member_id: memberId,
                membership_plan_code: determineRes.data?.next_step || 'FULL_ACCESS'
            });

            alert("تم إرسال طلب العضوية بنجاح! سيتم مراجعة البيانات.");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء التسجيل";
            console.error(error);
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        // Init Mock Data
        setUniversities([{ id: 1, name: "جامعة القاهرة" }, { id: 2, name: "جامعة عين شمس" }]);
        setProfessions([
            { id: 1, code: 'PROF', name: 'عضو هيئة تدريس' },
            { id: 2, code: 'TA', name: 'معيد / مدرس مساعد' },
            { id: 3, code: 'STAFF', name: 'موظف إداري' }
        ]);

        // Fetch faculties from backend
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const response = await AuthService.getFaculties();
            if (response.success && response.data) {
                setFaculties(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch faculties:', error);
        }
    };

    useEffect(() => {
        // Faculties are now loaded globally, no need to filter by university
        // In future, you can add university filtering here if needed
    }, [selectedUni]);

    useEffect(() => {
        if (category === 'foreigner') setValue('nationality', '');
        else setValue('nationality', 'مصرى');
    }, [category, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files?.[0]) setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    };

    const nextStep = async () => {
        const isValid = await trigger();
        if (isValid) {
            setStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Styles
    const inputClasses = `
        w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
        focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 
        transition-all duration-200 outline-none placeholder:text-gray-400 text-gray-800
    `;

    // --- Steps ---

    const renderStep1_Category = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
            {[
                { id: 'staff', icon: Briefcase, color: 'blue', title: 'عامل بالجامعة', desc: 'أعضاء هيئة التدريس والموظفين' },
                { id: 'student', icon: GraduationCap, color: 'emerald', title: 'طالب / خريج', desc: 'الطلاب والخريجين' },
                { id: 'retired', icon: UserCheck, color: 'purple', title: 'متقاعد', desc: 'أساتذة وموظفين متقاعدين' },
                { id: 'dependent', icon: HeartHandshake, color: 'pink', title: 'عضو تابع', desc: 'أسرة الأعضاء (زوجة/أبناء)' },
                { id: 'foreigner', icon: Plane, color: 'orange', title: 'أجنبي / موسمي', desc: 'لغير المصريين (مدد محددة)' },
                { id: 'visitor', icon: Users, color: 'gray', title: 'عضو زائر', desc: 'عضويات عامة' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => { setCategory(item.id as MemberCategory); setStep(2); }}
                    className={`group relative flex flex-col items-center p-6 rounded-3xl transition-all duration-300 border-2
                        bg-white hover:shadow-xl hover:-translate-y-1
                        ${category === item.id ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-lg' : 'border-transparent shadow-sm hover:border-indigo-200'}`}
                >
                    <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${item.color}-50`}>
                        <item.icon className={`w-10 h-10 text-${item.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm text-center leading-relaxed">{item.desc}</p>
                </button>
            ))}
        </motion.div>
    );

    const renderStep2_BasicInfo = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-white/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-indigo-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><IdCard className="text-indigo-600" /></div>
                البيانات الأساسية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="الاسم الأول (عربي)" error={errors.first_name_ar}>
                    <input {...register("first_name_ar", { required: "مطلوب" })} className={inputClasses} placeholder="مثال: أحمد" />
                </InputGroup>
                <InputGroup label="اسم العائلة (عربي)" error={errors.last_name_ar}>
                    <input {...register("last_name_ar", { required: "مطلوب" })} className={inputClasses} placeholder="مثال: محمد" />
                </InputGroup>

                <InputGroup label="First Name (En)" className="md:order-3 text-left" error={errors.first_name_en}>
                    <input {...register("first_name_en", { required: "Required" })} className={`${inputClasses} text-left`} placeholder="e.g. Ahmed" dir="ltr" />
                </InputGroup>
                <InputGroup label="Last Name (En)" className="md:order-4 text-left" error={errors.last_name_en}>
                    <input {...register("last_name_en", { required: "Required" })} className={`${inputClasses} text-left`} placeholder="e.g. Mohamed" dir="ltr" />
                </InputGroup>

                <div className="md:col-span-2 md:order-5 h-px bg-gray-100 my-2" />

                <InputGroup label={category === 'foreigner' ? 'رقم جواز السفر' : 'الرقم القومي'} className="md:col-span-2 md:order-6" error={category === 'foreigner' ? errors.passportNumber : errors.nationalId}>
                    <input
                        {...register(category === 'foreigner' ? "passportNumber" : "nationalId", { required: "مطلوب" })}
                        className={`${inputClasses} tracking-widest font-mono text-lg`}
                        placeholder={category === 'foreigner' ? "Passport Number" : "14 رقم"}
                    />
                </InputGroup>

                <InputGroup label="الجنسية" className="md:order-7" error={errors.nationality}>
                    <input {...register("nationality", { required: "مطلوب" })} className={inputClasses} disabled={category !== 'foreigner'} />
                </InputGroup>

                <InputGroup label="تاريخ الميلاد" className="md:order-8" error={errors.dob}>
                    <input type="date" {...register("dob", { required: "مطلوب" })} className={inputClasses} />
                </InputGroup>

                <InputGroup label="رقم الهاتف" className="md:order-9" error={errors.phone}>
                    <input {...register("phone", { required: "مطلوب" })} className={`${inputClasses} font-mono`} placeholder="01xxxxxxxxx" />
                </InputGroup>
                <InputGroup label="البريد الإلكتروني" className="md:order-10" error={errors.email}>
                    <input type="email" {...register("email", { required: "مطلوب" })} className={inputClasses} placeholder="example@email.com" />
                </InputGroup>

                <div className="md:col-span-2 md:order-11 h-px bg-gray-100 my-2" />

                <InputGroup label="كلمة المرور" className="md:order-12" error={errors.password}>
                    <input type="password" {...register("password", { required: "مطلوب" })} className={inputClasses} />
                </InputGroup>
                <InputGroup label="تأكيد كلمة المرور" className="md:order-13" error={errors.confirmPassword}>
                    <input type="password" {...register("confirmPassword", {
                        validate: val => val === watch('password') || "كلمات المرور غير متطابقة"
                    })} className={inputClasses} />
                </InputGroup>
            </div>

            <NavigationButtons onPrev={prevStep} onNext={nextStep} />
        </motion.div>
    );

    const renderStep3_Detailed = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-indigo-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><Building2 className="text-indigo-600" /></div>
                تفاصيل العضوية <span className="text-gray-400 text-lg font-normal">({getCategoryName(category)})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <InputGroup label="العنوان الحالي بالتفصيل" error={errors.address}>
                        <input {...register("address", { required: "مطلوب" })} className={inputClasses} />
                    </InputGroup>
                </div>

                {/* --- Student Logic --- */}
                {category === 'student' && (
                    <>
                        <InputGroup label="الجامعة" error={errors.universityId}>
                            <select {...register("universityId", { required: "مطلوب" })} className={inputClasses}>
                                <option value="">اختر الجامعة</option>
                                {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="الكلية" error={errors.facultyId}>
                            <select {...register("facultyId", { required: "مطلوب" })} className={inputClasses}>
                                <option value="">اختر الكلية</option>
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name_ar}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="سنة التخرج" error={errors.graduationYear}>
                            <input type="number" {...register("graduationYear", { required: "مطلوب" })} className={inputClasses} placeholder="YYYY" />
                            <p className="text-xs text-gray-400 mt-1">يحدد النظام تلقائياً حالة (طالب/خريج)</p>
                        </InputGroup>
                    </>
                )}

                {/* --- Staff Logic --- */}
                {category === 'staff' && (
                    <>
                        <InputGroup label="الدرجة الوظيفية" error={errors.professionId}>
                            <select {...register("professionId", { required: "مطلوب" })} className={inputClasses}>
                                <option value="">اختر المهنة</option>
                                {professions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="القسم / الإدارة" error={errors.department}>
                            <input {...register("department")} className={inputClasses} />
                        </InputGroup>
                        <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <InputGroup label="الراتب الشهري" error={errors.salary}>
                                <div className="relative">
                                    <input type="number" {...register("salary", { required: "مطلوب" })} className={`${inputClasses} bg-white`} placeholder="0.00" />
                                    <span className="absolute left-4 top-3 text-gray-400 text-sm font-bold">EGP</span>
                                </div>
                            </InputGroup>
                            <p className="text-sm text-blue-600 mt-3 flex items-center gap-2">
                                <AlertCircle size={16} /> يتم تحديد رسوم الاشتراك السنوي بناءً على شريحة الراتب.
                            </p>
                        </div>
                    </>
                )}

                {/* --- Retired Logic --- */}
                {category === 'retired' && (
                    <>
                        <InputGroup label="المهنة قبل التقاعد" error={errors.professionCode}>
                            <select {...register("professionCode", { required: "مطلوب" })} className={inputClasses}>
                                <option value="RETIRED_PROF">أستاذ جامعي متقاعد</option>
                                <option value="RETIRED_STAFF">موظف متقاعد</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="آخر راتب قبل التقاعد" error={errors.salary}>
                            <input type="number" {...register("salary", { required: "مطلوب" })} className={inputClasses} />
                        </InputGroup>
                        <InputGroup label="تاريخ التقاعد" error={errors.retirementDate}>
                            <input type="date" {...register("retirementDate", { required: "مطلوب" })} className={inputClasses} />
                        </InputGroup>
                    </>
                )}

                {/* --- Foreigner Logic --- */}
                {category === 'foreigner' && (
                    <>
                        <InputGroup label="مدة العضوية" error={errors.seasonalDuration}>
                            <select {...register("seasonalDuration", { required: "مطلوب" })} className={inputClasses}>
                                <option value="1">شهر واحد</option>
                                <option value="6">6 أشهر</option>
                                <option value="12">سنة كاملة</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="حالة التأشيرة" error={errors.visaStatus}>
                            <select {...register("visaStatus")} className={inputClasses}>
                                <option value="valid">سارية</option>
                                <option value="pending">قيد الإجراءات</option>
                            </select>
                        </InputGroup>
                        {selectedDuration === '12' && (
                            <div className="md:col-span-2 text-sm text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                                <Check size={18} className="text-green-600" />
                                متاح الدفع بالتقسيط (دفعتين) لهذا الاشتراك.
                            </div>
                        )}
                    </>
                )}

                {/* --- Dependent Logic --- */}
                {category === 'dependent' && (
                    <>
                        <InputGroup label="رقم العضوية للعضو الأساسي" className="md:col-span-2" error={errors.relatedMemberId}>
                            <input {...register("relatedMemberId", { required: "مطلوب" })} className={inputClasses} placeholder="رقم العضوية أو الرقم القومي" />
                        </InputGroup>
                        <InputGroup label="صلة القرابة" error={errors.relationshipType}>
                            <select {...register("relationshipType", { required: "مطلوب" })} className={inputClasses}>
                                <option value="spouse">زوج / زوجة</option>
                                <option value="child">ابن / ابنة</option>
                                <option value="parent">والد / والدة</option>
                            </select>
                        </InputGroup>
                        <div className="md:col-span-2 text-sm text-indigo-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-2">
                            <Check size={18} /> سيتم تطبيق خصم التابع (40%) على قيمة الاشتراك.
                        </div>
                    </>
                )}
            </div>

            <NavigationButtons onPrev={prevStep} onNext={nextStep} />
        </motion.div>
    );

    const renderStep4_Files = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-indigo-900 mb-8 text-center">المرفقات والمستندات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <FileBox label="صورة شخصية حديثة" id="photo" files={files} refs={fileRefs} onChange={handleFileChange} />

                {category === 'foreigner' ? (
                    <FileBox label="صورة جواز السفر" id="passport" files={files} refs={fileRefs} onChange={handleFileChange} />
                ) : (
                    <>
                        <FileBox label="صورة البطاقة (أمام)" id="id_front" files={files} refs={fileRefs} onChange={handleFileChange} />
                        <FileBox label="صورة البطاقة (خلف)" id="id_back" files={files} refs={fileRefs} onChange={handleFileChange} />
                    </>
                )}

                {(category === 'staff' || category === 'retired') && (
                    <FileBox label="مفردات مرتب / بيان معاش" id="salary_slip" files={files} refs={fileRefs} onChange={handleFileChange} />
                )}
                {category === 'student' && (
                    <FileBox label="إثبات قيد / شهادة تخرج" id="student_proof" files={files} refs={fileRefs} onChange={handleFileChange} />
                )}
                {category === 'dependent' && (
                    <FileBox label="مستند إثبات القرابة" id="relation_proof" files={files} refs={fileRefs} onChange={handleFileChange} />
                )}
                <FileBox label="تقرير طبي (اختياري)" id="medical" files={files} refs={fileRefs} onChange={handleFileChange} />
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between mt-12 gap-4">
                <button onClick={prevStep} className="px-8 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors flex items-center justify-center gap-2">
                    <ChevronRight size={20} /> السابق
                </button>
                <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1 md:flex-none px-10 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={24} />}
                    {isSubmitting ? 'جاري المعالجة...' : 'تأكيد التسجيل'}
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-sans text-right" dir="rtl">
            <div className="container mx-auto px-4 max-w-6xl">
                <StepIndicator currentStep={step} />
                <AnimatePresence mode="wait">
                    <div key={step}>
                        {step === 1 && renderStep1_Category()}
                        {step === 2 && renderStep2_BasicInfo()}
                        {step === 3 && renderStep3_Detailed()}
                        {step === 4 && renderStep4_Files()}
                    </div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-Components ---

interface FileBoxProps {
    label: string;
    id: string;
    files: { [key: string]: File | null };
    refs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
}

const FileBox = ({ label, id, files, refs, onChange }: FileBoxProps) => (
    <div
        onClick={() => refs.current[id]?.click()}
        className={`
            relative border-2 border-dashed p-8 rounded-2xl cursor-pointer transition-all duration-300 group
            flex flex-col items-center justify-center text-center
            ${files[id] ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-white'}
        `}
    >
        <input type="file" hidden ref={(el) => { refs.current[id] = el; }} onChange={(e) => onChange(e, id)} />

        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors
             ${files[id] ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
            {files[id] ? <Check size={28} /> : <UploadCloud size={28} />}
        </div>

        <p className={`font-bold text-base ${files[id] ? 'text-indigo-900' : 'text-gray-600'}`}>{label}</p>

        <p className="text-sm text-gray-400 mt-2 max-w-[200px] truncate">
            {files[id] ? files[id].name : "اضغط لرفع الملف (PDF, JPG)"}
        </p>
    </div>
);

const NavigationButtons = ({ onPrev, onNext }: { onPrev: () => void, onNext: () => void }) => (
    <div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
        <button onClick={onPrev} className="px-8 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors flex items-center gap-2">
            <ChevronRight size={20} /> السابق
        </button>
        <button onClick={onNext} className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
            التالي <ChevronLeft size={20} />
        </button>
    </div>
);

const getCategoryName = (cat: MemberCategory | null) => {
    switch (cat) {
        case 'student': return 'طالب / خريج';
        case 'staff': return 'عامل بالجامعة';
        case 'retired': return 'متقاعد';
        case 'foreigner': return 'أجنبي / موسمي';
        case 'dependent': return 'عضو تابع';
        case 'visitor': return 'عضو زائر';
        default: return 'عضو';
    }
}

export default ComprehensiveRegistrationForm;