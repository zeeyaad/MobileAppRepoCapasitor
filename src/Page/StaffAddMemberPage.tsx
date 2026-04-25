/**
 * StaffAddMemberPage.tsx
 *
 * Staff-side registration for SOCIAL MEMBERS.
 * Flow: Category → Basic Info → Details → Files
 *
 * Mirrors RegisterPage.tsx API logic exactly, then auto-activates the member.
 */
import { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Users, CheckCircle2, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { registerSchema, type RegisterFormValues } from '../features/register/schemas/validation';
import { prepareSubmissionData, debugFormData, type FileUploadMap } from '../features/register/utils/submissionFactory';
import { AuthService } from '../services/authService';
import { Step1Category } from '../features/register/components/Step1_Category';
import { Step2BasicInfo } from '../features/register/components/Step2_BasicInfo';
import { Step3Details } from '../features/register/components/Step3_Details';
import { Step4Files } from '../features/register/components/Step4_Files';
import api from '../api/axios';
import { useToast } from '../Component/StaffPagesComponents/ui/use-toast';

// ─── Step definitions ─────────────────────────────────────────────────────────
// Step 0 = Category (auto-advances), 1 = BasicInfo, 2 = Details, 3 = Files
const STEPS = ['الفئة', 'البيانات الأساسية', 'تفاصيل العضوية', 'المستندات'];

const STEP_FIELDS: Record<number, readonly (keyof RegisterFormValues)[]> = {
    0: [],
    1: [
        'first_name_ar', 'last_name_ar', 'first_name_en', 'last_name_en',
        'email', 'password', 'confirmPassword', 'phone', 'dob', 'gender',
        'nationality', 'nationalId', 'passportNumber',
    ],
    2: [
        'address', 'facultyId', 'graduationYear',
        'professionId', 'department', 'salary', 'professionCode',
        'retirementDate', 'seasonalDuration', 'visaStatus',
        'relatedMemberId', 'relationshipType',
    ],
    3: [],
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="w-full max-w-3xl mx-auto mb-10" dir="rtl">
        <div className="relative flex justify-between items-center z-0">
            <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 -z-10 rounded-full" />
            <motion.div
                className="absolute top-6 right-0 h-1.5 bg-[#2596be] -z-10 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'circOut' }}
            />
            {STEPS.map((label, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                    <motion.div
                        animate={{ scale: currentStep === idx ? 1.18 : 1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-4 bg-white transition-colors ${currentStep >= idx ? 'border-[#2596be] text-[#2596be]' : 'border-gray-200 text-gray-300'
                            }`}
                    >
                        {currentStep > idx ? <Check size={22} strokeWidth={3} /> : idx + 1}
                    </motion.div>
                    <span className={`text-xs font-bold whitespace-nowrap ${currentStep >= idx ? 'text-[#1a5f7a]' : 'text-gray-400'}`}>
                        {label}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

// ─── mapToBasicDTO — exact clone from RegisterPage ────────────────────────────
const mapToBasicDTO = (data: RegisterFormValues) => {
    const idNumber = data.nationalId?.trim() || data.passportNumber?.trim() || '';
    const membershipTypeMap: Record<string, string> = {
        regular: 'VISITOR',
        visitor: 'VISITOR',
        staff: 'WORKING',
        student: 'STUDENT',
        dependent: 'DEPENDENT',
        foreigner: 'FOREIGNER',
        retired: 'WORKING',
    };
    const membership_type_code = membershipTypeMap[data.category as string] || 'VISITOR';
    return {
        role: 'member',
        email: data.email.trim(),
        first_name_en: data.first_name_en.trim(),
        first_name_ar: data.first_name_ar.trim(),
        last_name_en: data.last_name_en.trim(),
        last_name_ar: data.last_name_ar.trim(),
        phone: data.phone.trim(),
        national_id: idNumber,
        gender: data.gender,
        nationality: data.nationality || 'مصرى',
        birthdate: data.dob,
        password: data.password,
        membership_type_code,
    };
};

// ─── Success Screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({
    name, memberId, onAddAnother,
}: { name: string; memberId: number; onAddAnother: () => void }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-10 text-center flex flex-col items-center gap-6 max-w-lg mx-auto"
        >
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إضافة العضو بنجاح! 🎉</h2>
                <p className="text-gray-500 text-sm">
                    تم تسجيل <strong className="text-gray-800">{name}</strong> وتفعيل عضويته تلقائياً
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                    <CheckCircle2 size={14} />
                    عضو نشط — رقم: {memberId}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button
                    onClick={onAddAnother}
                    className="flex-1 flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-bold text-sm sm:text-base transition-colors text-gray-700 shadow-sm"
                >
                    <RotateCcw size={18} /> إضافة عضو آخر
                </button>
                <button
                    onClick={() => navigate('/staff/dashboard/members/manage')}
                    className="flex-1 flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-xl bg-[#2596be] hover:bg-[#1a7a9a] text-white font-bold text-sm sm:text-base transition-colors shadow-lg"
                >
                    إدارة الأعضاء <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
};

// ─── Inner form context consumer (reads category via watch) ───────────────────
const WizardBody = ({
    step, files, onFileChange, onNext, onPrev, onSubmit, isSubmitting,
}: {
    step: number;
    files: FileUploadMap;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => void;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}) => {
    const { handleSubmit } = useFormContext<RegisterFormValues>();
    switch (step) {
        case 0: return <Step1Category onNext={onNext} />;
        case 1: return <Step2BasicInfo onNext={onNext} onPrev={onPrev} />;
        case 2: return <Step3Details onNext={onNext} onPrev={onPrev} />;
        case 3: return (
            <Step4Files
                files={files}
                onFileChange={onFileChange}
                onPrev={onPrev}
                onSubmit={handleSubmit(onSubmit as unknown as () => void)}
                isSubmitting={isSubmitting}
            />
        );
        default: return null;
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffAddMemberPage = () => {
    const [step, setStep] = useState(0);
    const [files, setFiles] = useState<FileUploadMap>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{ name: string; id: number } | null>(null);
    const { toast } = useToast();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            memberRole: 'social_member',
            selectedSports: [],
            category: 'student',
            citizenship_type: 'egyptian',
            first_name_ar: '', last_name_ar: '', first_name_en: '', last_name_en: '',
            fullName: '', dob: '', gender: 'male', phone: '', email: '',
            password: '', confirmPassword: '', address: '',
            nationality: 'مصرى', nationalId: '', passportNumber: '',
            universityId: '', facultyId: '', graduationYear: '',
            professionId: '', department: '', salary: '',
            professionCode: 'RETIRED_PROF', retirementDate: '',
            seasonalDuration: '1', visaStatus: 'valid', paymentType: 'full',
            relatedMemberId: '', relationshipType: 'spouse', visitor_type: 'VISITOR',
        },
    });

    const { handleSubmit, trigger, reset } = methods;

    const nextStep = async () => {
        const fields = STEP_FIELDS[step] ?? [];
        if (fields.length === 0) { setStep(s => s + 1); return; }
        const ok = await trigger(fields);
        if (ok) setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => {
        if (e.target.files?.[0]) setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    };

    const handleAddAnother = () => {
        reset();
        setFiles({});
        setStep(0);
        setSuccessData(null);
    };

    // ─── Activate immediately after registration ──────────────────────────────
    const activateMember = async (memberId: number) => {
        try {
            await api.patch(`/members/${memberId}/status`, { status: 'active' });
        } catch (err) {
            console.warn('Could not auto-activate; staff can activate manually.', err);
        }
    };

    // ─── Submit — exact logic from RegisterPage ───────────────────────────────
    const onSubmit = async (data: RegisterFormValues): Promise<void> => {
        setIsSubmitting(true);
        try {
            // — File validation (same as RegisterPage) —
            let essentialFiles: readonly string[] = ['photo', 'id_front', 'id_back', 'medical'];
            if (data.category === 'foreigner') essentialFiles = ['photo', 'passport', 'medical'];
            const missingFiles = essentialFiles.filter(k => !files[k as keyof typeof files]);
            if (missingFiles.length > 0) {
                const names: Record<string, string> = {
                    photo: 'صورة شخصية', id_front: 'صورة البطاقة (أمام)',
                    id_back: 'صورة البطاقة (خلف)', passport: 'صورة جواز السفر', medical: 'التقرير الطبي',
                };
                throw new Error(`مستندات مطلوبة غير مرفوعة: ${missingFiles.map(f => names[f] || f).join('، ')}`);
            }

            // 1. Basic registration
            const basicData = mapToBasicDTO(data);
            const basicRes = await AuthService.registerBasic(basicData);
            if (!basicRes.success || !basicRes.data) throw new Error(basicRes.message || 'فشل التسجيل الأساسي');

            const memberId = basicRes.data.member_id || basicRes.data.team_member_id;
            if (!memberId) throw new Error('لم يُعاد معرف العضو');

            // 2. Determine membership
            const determinationData = {
                member_id: memberId,
                is_student: data.category === 'student',
                is_working: data.category === 'staff',
                is_foreign: data.category === 'foreigner',
                is_graduated: false,
                has_relation: data.category === 'dependent',
                is_retired: data.category === 'retired',
                is_sports_player: false,
                selected_sports: [],
                relation_member_id: data.category === 'dependent' ? Number(data.relatedMemberId) : undefined,
            };
            const determineRes = await AuthService.determineMembership(determinationData);

            // 3. Submit detailed info + files
            const { endpoint, formData } = prepareSubmissionData(data, memberId, files);
            debugFormData(formData);
            await AuthService.submitDetailedInfo(endpoint, formData);

            // 4. Complete registration
            await AuthService.completeRegistration({
                member_id: memberId,
                membership_plan_code: determineRes.data?.next_step || 'FULL_ACCESS',
            });

            // 5. ✅ Staff-only: auto-activate
            await activateMember(memberId);

            const fullName = `${data.first_name_ar} ${data.last_name_ar}`;
            setSuccessData({ name: fullName, id: memberId });
            toast({ title: 'تم إضافة العضو', description: `${fullName} — مُفعَّل تلقائياً` });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل';
            toast({ title: 'خطأ', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    if (successData) {
        return (
            <div className="h-full overflow-y-auto p-6 pb-8" dir="rtl">
                <SuccessScreen name={successData.name} memberId={successData.id} onAddAnother={handleAddAnother} />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 pb-8" dir="rtl">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-[#2596be]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">إضافة عضو نادي</h1>
                        <p className="text-sm text-gray-500">سيتم تفعيل العضوية تلقائياً بعد إتمام التسجيل</p>
                    </div>
                </div>

                {/* Activation badge */}
                <div className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm w-fit">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>تسجيل من قِبَل الموظف — العضوية تُفعَّل فور الإتمام</span>
                </div>

                <FormProvider {...methods}>
                    <StepIndicator currentStep={step} />
                    <form onSubmit={handleSubmit((d: RegisterFormValues) => onSubmit(d))}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <WizardBody
                                    step={step}
                                    files={files}
                                    onFileChange={handleFileChange}
                                    onNext={nextStep}
                                    onPrev={prevStep}
                                    onSubmit={handleSubmit((d: RegisterFormValues) => onSubmit(d)) as unknown as () => void}
                                    isSubmitting={isSubmitting}
                                />
                                {step === 0 && (
                                    <p className="text-center text-sm text-gray-400 mt-6">
                                        اختر الفئة للمتابعة تلقائياً
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </FormProvider>

                {/* Submitting overlay */}
                <AnimatePresence>
                    {isSubmitting && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
                        >
                            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-[#2596be] animate-spin" />
                                <div className="text-center">
                                    <p className="font-bold text-gray-800 text-lg">جاري تسجيل العضو...</p>
                                    <p className="text-gray-500 text-sm mt-1">يتم تفعيل العضوية تلقائياً</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StaffAddMemberPage;
