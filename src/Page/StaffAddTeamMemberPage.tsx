/**
 * StaffAddTeamMemberPage.tsx
 *
 * Staff-side registration for SPORTS PLAYERS (team members).
 * Flow: Basic Info → Files  (Sport selection removed — staff handles assignment separately)
 *
 * Mirrors RegisterPage.tsx sports_player branch exactly, then auto-activates.
 */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trophy, CheckCircle2, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { registerSchema, type RegisterFormValues } from '../features/register/schemas/validation';
import { type FileUploadMap } from '../features/register/utils/submissionFactory';
import { AuthService } from '../services/authService';
import { Step2BasicInfo } from '../features/register/components/Step2_BasicInfo';
import { Step4Files } from '../features/register/components/Step4_Files';
import api from '../api/axios';
import { useToast } from '../Component/StaffPagesComponents/ui/use-toast';

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ['البيانات الأساسية', 'المستندات'];

const STEP_FIELDS: Record<number, readonly (keyof RegisterFormValues)[]> = {
    0: [
        'first_name_ar', 'last_name_ar', 'first_name_en', 'last_name_en',
        'email', 'password', 'confirmPassword', 'phone', 'dob', 'gender',
        'nationality', 'nationalId', 'passportNumber',
    ],
    1: [],
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="w-full max-w-2xl mx-auto mb-10" dir="rtl">
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

// ─── mapToBasicDTO (team member variant) ─────────────────────────────────────
const mapToBasicDTO = (data: RegisterFormValues) => {
    const idNumber = data.nationalId?.trim() || data.passportNumber?.trim() || '';
    return {
        role: 'team_member',
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
        membership_type_code: 'VISITOR', // team members use VISITOR base type
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
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-[#2596be]" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إضافة اللاعب بنجاح! 🏆</h2>
                <p className="text-gray-500 text-sm">
                    تم تسجيل <strong className="text-gray-800">{name}</strong> في الفريق وتفعيل عضويته تلقائياً
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#1a5f7a] rounded-full text-sm font-semibold border border-[#2596be]/30">
                    <Trophy size={14} />
                    لاعب نشط — رقم: {memberId}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                    onClick={onAddAnother}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-sm transition-colors text-gray-700"
                >
                    <RotateCcw size={15} /> إضافة لاعب آخر
                </button>
                <button
                    onClick={() => navigate('/staff/dashboard/members/sports')}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2596be] hover:bg-[#1a7a9a] text-white font-semibold text-sm transition-colors shadow-lg"
                >
                    إدارة الرياضيين <ArrowRight size={15} />
                </button>
            </div>
        </motion.div>
    );
};


// ─── Main Component ───────────────────────────────────────────────────────────
const StaffAddTeamMemberPage = () => {
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
            memberRole: 'sports_player',
            selectedSports: [],   // no sport pre-selection — staff assigns sports separately
            category: 'visitor',
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

    const activateMember = async (memberId: number) => {
        try {
            await api.patch(`/members/${memberId}/status`, { status: 'active' });
        } catch (err) {
            console.warn('Could not auto-activate.', err);
        }
    };

    // ── Submit — sports_player branch (no sport selection, staff assigns separately) ──
    const onSubmit = async (data: RegisterFormValues): Promise<void> => {
        setIsSubmitting(true);
        try {
            // File validation
            const essentialFiles = ['photo', 'id_front', 'id_back', 'medical', 'proof'] as const;
            const fileLabels: Record<string, string> = {
                photo: 'صورة شخصية', id_front: 'صورة البطاقة (أمام)',
                id_back: 'صورة البطاقة (خلف)', medical: 'التقرير الطبي', proof: 'مستند إثبات',
            };
            const missingFiles = essentialFiles.filter(k => !files[k]);
            if (missingFiles.length > 0) {
                throw new Error(`مستندات مطلوبة: ${missingFiles.map(f => fileLabels[f]).join('، ')}`);
            }

            // 1. Basic registration
            const basicData = mapToBasicDTO(data);
            const basicRes = await AuthService.registerBasic(basicData);
            if (!basicRes.success || !basicRes.data) throw new Error(basicRes.message || 'فشل التسجيل الأساسي');

            const memberId = basicRes.data.member_id || basicRes.data.team_member_id;
            if (!memberId) throw new Error('لم يُعاد معرف العضو');

            // 2. Determine membership (sports player, no specific sports pre-selected)
            const determinationData = {
                member_id: memberId,
                is_student: false,
                is_working: false,
                is_foreign: false,
                is_graduated: false,
                has_relation: false,
                is_retired: false,
                is_sports_player: true,
                selected_sports: [],   // empty — sports assigned later via SportsMembersPage
            };
            const determineRes = await AuthService.determineMembership(determinationData);

            // 3. Submit team member details + files
            const teamFormData = new FormData();
            teamFormData.append('member_id', String(memberId));
            if (data.address) teamFormData.append('address', data.address);

            if (files.photo) teamFormData.append('personal_photo', files.photo);
            if (files.id_front) teamFormData.append('national_id_front', files.id_front);
            if (files.id_back) teamFormData.append('national_id_back', files.id_back);
            if (files.medical) teamFormData.append('medical_report', files.medical);
            if (files.proof) teamFormData.append('proof', files.proof);

            // Fallback for alt key names
            if (!files.id_front && files.national_id_front) teamFormData.append('national_id_front', files.national_id_front);
            if (!files.id_back && files.national_id_back) teamFormData.append('national_id_back', files.national_id_back);

            console.log('📤 Submitting team member details for ID:', memberId);
            await AuthService.submitTeamMemberDetails(teamFormData);

            // 4. Complete registration
            await AuthService.completeRegistration({
                member_id: memberId,
                membership_plan_code: determineRes.data?.next_step || 'FULL_ACCESS',
            });

            // 5. ✅ Staff-only: auto-activate
            await activateMember(memberId);

            const fullName = `${data.first_name_ar} ${data.last_name_ar}`;
            setSuccessData({ name: fullName, id: memberId });
            toast({ title: 'تم إضافة اللاعب', description: `${fullName} — مُفعَّل تلقائياً` });

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
                        <Trophy className="w-5 h-5 text-[#2596be]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">إضافة لاعب فريق</h1>
                        <p className="text-sm text-gray-500">تسجيل عضو رياضي — سيتم تفعيل العضوية تلقائياً بعد إتمام التسجيل</p>
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
                                {step === 0 && (
                                    <Step2BasicInfo onNext={nextStep} />
                                )}

                                {step === 1 && (
                                    <Step4Files
                                        files={files}
                                        onFileChange={handleFileChange}
                                        onPrev={prevStep}
                                        onSubmit={handleSubmit((d: RegisterFormValues) => onSubmit(d))}
                                        isSubmitting={isSubmitting}
                                    />
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
                                    <p className="font-bold text-gray-800 text-lg">جاري تسجيل اللاعب...</p>
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

export default StaffAddTeamMemberPage;
