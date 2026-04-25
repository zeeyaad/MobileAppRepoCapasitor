import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { registerSchema, type RegisterFormValues } from './schemas/validation';
import { prepareSubmissionData, debugFormData, type FileUploadMap } from './utils/submissionFactory';
import { AuthService } from '../../services/authService';
import Step0_RoleSelection from './components/Step0_RoleSelection';
import { Step1Category } from './components/Step1_Category';
import { Step2BasicInfo } from './components/Step2_BasicInfo';
import { Step3Details } from './components/Step3_Details';
import { Step4Files } from './components/Step4_Files';
import { ModernToast, type ToastType } from '../../Component/ModernToast';
import { fetchActiveSports, type Sport } from '../../services/sportsApi';
const HUCLogo = "/assets/HUC logo.jpeg";

/**
 * Step Configuration
 * 
 * Flow:
 * - Step 0: Role Selection (Social/Player) - ALWAYS
 * - Step 1: Sports Selection - ONLY for 'sports_player'
 * - Step 2: Category Selection
 * - Step 3: Basic Info
 * - Step 4: Details
 * - Step 5: Files
 */
const STEP_FIELDS: Record<number, readonly string[]> = {
    0: ['memberRole'],
    1: ['selectedSports'], // Conditionally validated
    2: ['category'],
    3: [
        'first_name_ar', 'last_name_ar', 'first_name_en', 'last_name_en',
        'email', 'password', 'confirmPassword', 'phone', 'dob', 'gender',
        'nationality', 'nationalId', 'passportNumber',
    ],
    4: [
        'address', 'universityId', 'facultyId', 'graduationYear',
        'professionId', 'department', 'salary', 'professionCode',
        'retirementDate', 'seasonalDuration', 'visaStatus',
        'relatedMemberId', 'relationshipType',
    ],
    5: [], // Files handled separately
};

/**
 * Dynamic Step Indicator Component
 * Adjusts labels based on memberRole
 */
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const { watch } = useFormContext<RegisterFormValues>();
    const memberRole = watch('memberRole');

    // Define steps based on role
    const getSteps = () => {
        if (memberRole === 'sports_player') {
            // Player: Role -> Basic Info -> Files (Sports step removed)
            return [
                { id: 0, label: 'نوع العضوية' },
                { id: 2, label: 'البيانات الأساسية' },
                { id: 4, label: 'المستندات' },
            ];
        } else {
            // Member: Role -> Category -> Basic Info -> Details -> Files
            return [
                { id: 0, label: 'نوع العضوية' },
                { id: 1, label: 'الفئة' },
                { id: 2, label: 'البيانات الأساسية' },
                { id: 3, label: 'التفاصيل' },
                { id: 4, label: 'المستندات' },
            ];
        }
    };

    // Map current internal step to visual progress
    const getVisualStep = () => {
        if (memberRole === 'sports_player') {
            // Player step mapping: 0->0, 2->1, 4->2
            if (currentStep === 2) return 1; // Basic Info
            if (currentStep === 4) return 2; // Files
            return 0; // Role Selection
        } else {
            // Member uses direct mapping
            return currentStep;
        }
    };

    const steps = getSteps();
    const visualStep = getVisualStep();
    const totalSteps = steps.length;

    return (
        <div className="w-full max-w-3xl mx-auto mb-4" dir="rtl">
            <div className="relative flex justify-between items-center z-0">
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 -z-10 rounded-full" />
                <motion.div
                    className="absolute top-1/2 right-0 h-1.5 bg-[#2596be] -z-10 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(visualStep / (totalSteps - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'circOut' }}
                />
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center bg-transparent">
                        <motion.div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border-4 transition-colors duration-300 bg-white ${visualStep >= index ? 'border-[#2596be] text-[#2596be]' : 'border-gray-300 text-gray-300'}`}
                            animate={{
                                scale: visualStep === index ? 1.2 : 1,
                                borderColor: visualStep >= index ? '#4f46e5' : '#d1d5db',
                            }}
                        >
                            {visualStep > index ? <Check size={20} strokeWidth={3} /> : index + 1}
                        </motion.div>
                        <span className={`mt-2 text-xs md:text-sm font-bold transition-colors ${visualStep >= index ? 'text-[#1a5f7a]' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const mapToBasicDTO = (data: RegisterFormValues) => {
    const idNumber = data.nationalId?.trim() || data.passportNumber?.trim() || '';

    // Map frontend role to backend role
    // Frontend: 'social_member' | 'sports_player'
    // Backend expects: 'member' | 'team_member'
    const backendRole = data.memberRole === 'sports_player' ? 'team_member' : 'member';

    // Map category to membership_type_code for backend
    // Categories: 'regular' | 'visitor' | 'staff' | 'student' | 'dependent' | 'foreigner' | 'retired'
    const membershipTypeMap: Record<string, string> = {
        'regular': 'VISITOR',
        'visitor': 'VISITOR',  // Map 'visitor' to VISITOR (ID 4)
        'staff': 'WORKING',
        'student': 'STUDENT',
        'dependent': 'DEPENDENT',
        'foreigner': 'FOREIGNER',
        'retired': 'WORKING'  // Retired employees are categorized as WORKING members
    };
    const membership_type_code = membershipTypeMap[data.category as string] || 'VISITOR';  // Default: VISITOR (for unmapped categories)

    console.log('🗺️ mapToBasicDTO mapping:', {
        receivedCategory: data.category,
        mappedCode: membership_type_code,
        mapKeys: Object.keys(membershipTypeMap),
        mapValue: membershipTypeMap[data.category as string]
    });

    return {
        role: backendRole, // Added: required by backend
        email: data.email.trim(),
        first_name_en: data.first_name_en.trim(),
        first_name_ar: data.first_name_ar.trim(),
        last_name_en: data.last_name_en.trim(),
        last_name_ar: data.last_name_ar.trim(),
        phone: data.phone.trim(),
        national_id: idNumber,
        gender: data.gender,
        nationality: data.nationality || 'مصر ى',
        birthdate: data.dob,
        password: data.password,
        membership_type_code, // NEW: Pass membership type code to backend
    };
};

export const RegisterPage = () => {
    const [step, setStep] = useState<number>(0); // Start at Step 0 (Role Selection)
    const [files, setFiles] = useState<FileUploadMap>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableSportsList, setAvailableSportsList] = useState<Sport[]>([]);
    const navigate = useNavigate();

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false,
    });

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Load sports list on mount to facilitate ID to Name mapping
    useEffect(() => {
        const loadSports = async () => {
            try {
                const sports = await fetchActiveSports();
                setAvailableSportsList(sports);
            } catch (error) {
                console.error('Failed to load sports for mapping:', error);
            }
        };
        loadSports();
    }, []);

    // ============================================================================
    // React Hook Form Setup with Zod Validator
    // ============================================================================
    const methods = useForm<RegisterFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(registerSchema) as any,
        // Use 'onBlur' mode for better UX:
        // - Shows errors when user leaves a field (immediate feedback)
        // - Less intrusive than 'onChange' (doesn't show errors while typing)
        // - Better than 'onSubmit' (shows errors earlier in the process)
        mode: 'onBlur',
        defaultValues: {
            selectedSports: [],
            sportTimeSelections: {},
            category: 'student',
            citizenship_type: 'egyptian',
            first_name_ar: '',
            last_name_ar: '',
            first_name_en: '',
            last_name_en: '',
            fullName: '',
            dob: '',
            gender: 'male',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
            address: '',
            nationality: 'مصرى',
            nationalId: '',
            passportNumber: '',
            universityId: '',
            facultyId: '',
            graduationYear: '',
            professionId: '',
            department: '',
            salary: '',
            professionCode: 'RETIRED_PROF',
            retirementDate: '',
            seasonalDuration: '1',
            visaStatus: 'valid',
            paymentType: 'full',
            relatedMemberId: '',
            relationshipType: 'spouse',
            visitor_type: 'VISITOR',
        },
    });

    const { handleSubmit, trigger, watch } = methods;
    const memberRole = watch('memberRole');

    /**
     * Get the next step considering skip logic
     * 
     * Player Flow: 0 (Role) -> 1 (Sports) -> 2 (Basic Info) -> 3 (Files)
     * Member Flow: 0 (Role) -> 1 (Category) -> 2 (Basic Info) -> 3 (Details) -> 4 (Files)
     */
    const getNextStep = (current: number): number => {
        if (memberRole === 'sports_player') {
            // Player skips Sports (Step 1) and Details (Step 3)
            if (current === 0) return 2; // Role -> Basic Info
            if (current === 2) return 4; // Basic Info -> Files
        }
        return current + 1;
    };

    /**
     * Get the previous step considering skip logic
     */
    const getPrevStep = (current: number): number => {
        if (memberRole === 'sports_player') {
            // Player reverse skip logic
            if (current === 2) return 0; // Basic Info -> Role
            if (current === 4) return 2; // Files -> Basic Info
        }
        return current - 1;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => {
        if (e.target.files?.[0]) {
            setFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = STEP_FIELDS[step];

        // Skip validation for steps with no fields or step 1 for social members
        if (!fieldsToValidate || fieldsToValidate.length === 0) {
            setStep(getNextStep(step));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // For step 1 (sports), only validate if player
        if (step === 1 && memberRole === 'social_member') {
            setStep(getNextStep(step));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const isValid = await trigger(fieldsToValidate as (keyof RegisterFormValues)[]);

        if (isValid) {
            setStep(getNextStep(step));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        const newStep = getPrevStep(step);
        if (newStep >= 0) {
            setStep(newStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit = async (data: RegisterFormValues): Promise<void> => {
        setIsSubmitting(true);

        try {
            // ========================================================================
            // DEBUG: Log form data at submission
            // ========================================================================
            console.log('🎯 onSubmit - FULL FORM DATA:', {
                category: data.category,
                memberRole: data.memberRole,
                email: data.email,
                timestamp: new Date().toISOString()
            });

            // ========================================================================
            // DEBUG: Log files state
            // ========================================================================
            console.log('📁 Files in state:', {
                fileKeys: Object.keys(files),
                filesWithValues: Object.entries(files)
                    .filter(([, f]) => f)
                    .map(([k, f]) => `${k}: ${f instanceof File ? `File(${f.name}, ${f.size} bytes)` : 'null'}`),
            });

            // ========================================================================
            // VALIDATE REQUIRED FILES (ESSENTIAL for all members)
            // ========================================================================
            // File requirements vary by category
            // NOTE: File keys match the FileUploadMap interface in submissionFactory.ts

            let essentialFiles: readonly string[] = ['photo', 'medical']; // Common to all

            // Foreigners use passport instead of national ID
            if (data.category === 'foreigner') {
                essentialFiles = ['photo', 'passport', 'medical'];
            } else {
                // All other categories (visitor, student, staff, retired, dependent) use national ID
                essentialFiles = ['photo', 'id_front', 'id_back', 'medical'];
            }

            const missingEssentialFiles = essentialFiles.filter(fileKey => !files[fileKey as keyof typeof files]);

            if (missingEssentialFiles.length > 0) {
                const missingFileNames = missingEssentialFiles
                    .map(f => {
                        switch (f) {
                            case 'photo': return 'صورة شخصية حديثة';
                            case 'id_front': return 'صورة البطاقة (أمام)';
                            case 'id_back': return 'صورة البطاقة (خلف)';
                            case 'passport': return 'صورة جواز السفر';
                            case 'medical': return 'التقرير الطبي';
                            default: return f;
                        }
                    })
                    .join('، ');

                throw new Error(`المستندات الأساسية المطلوبة غير مرفوعة: ${missingFileNames}`);
            }

            // Validate additional required files for team members (sports_player)
            if (data.memberRole === 'sports_player') {
                const additionalFiles = ['proof'] as const;
                const missingAdditionalFiles = additionalFiles.filter(fileKey => !files[fileKey]);

                if (missingAdditionalFiles.length > 0) {
                    const missingFileNames = missingAdditionalFiles
                        .map(f => {
                            switch (f) {
                                case 'proof': return 'مستند إثبات';
                                default: return f;
                            }
                        })
                        .join('، ');

                    throw new Error(`المستندات الإضافية المطلوبة للاعبي الرياضة غير مرفوعة: ${missingFileNames}`);
                }
            }

            const basicData = mapToBasicDTO(data);
            console.log('🔍 DEBUG: Frontend Form Data Category:', data.category);
            console.log('🔍 DEBUG: Payload being sent to backend:', basicData);
            console.log('🔍 DEBUG: Membership Type Code being sent:', basicData.membership_type_code);
            console.log('🏆 Selected Sports:', data.selectedSports);
            console.log('👤 Member Role:', data.memberRole);

            const basicRes = await AuthService.registerBasic(basicData);

            if (!basicRes.success || !basicRes.data) {
                throw new Error(basicRes.message || 'Registration Failed');
            }

            // Extract the correct ID based on role (member_id for members, team_member_id for team members)
            const memberId = basicRes.data.member_id || basicRes.data.team_member_id;
            const role = basicRes.data.role;

            if (!memberId) {
                throw new Error('No valid ID returned from registration');
            }

            console.log('✅ Basic registration successful. Role:', role, 'ID:', memberId);
            // Keep member id for assignment/printing page
            localStorage.setItem('last_registered_member_id', String(memberId));

            const determinationData = {
                member_id: memberId,
                is_student: data.category === 'student',
                is_working: data.category === 'staff',
                is_foreign: data.category === 'foreigner',
                is_graduated: false,
                has_relation: data.category === 'dependent',
                is_retired: data.category === 'retired',
                is_sports_player: data.memberRole === 'sports_player',
                selected_sports: data.selectedSports,
                relation_member_id:
                    data.category === 'dependent' && 'relatedMemberId' in data
                        ? Number(data.relatedMemberId)
                        : undefined,
            };

            const determineRes = await AuthService.determineMembership(determinationData);
            console.log('✅ Membership determination successful:', determineRes.data);

            // ========================================================================
            // TEAM MEMBER (Sports Player) Flow
            // ========================================================================
            if (data.memberRole === 'sports_player') {
                console.log('🏃 Processing team member registration...');

                // Step 1: Submit team member details (photos and address)
                const teamMemberFormData = new FormData();
                teamMemberFormData.append('member_id', String(memberId));

                if (data.address) {
                    teamMemberFormData.append('address', data.address);
                }

                // Add files
                if (files.photo) {
                    teamMemberFormData.append('personal_photo', files.photo);
                }
                if (files.medical) {
                    teamMemberFormData.append('medical_report', files.medical);
                }
                // Step4 files use id_front/id_back keys; keep fallback for legacy keys.
                const idFrontFile = files.id_front || files.national_id_front;
                const idBackFile = files.id_back || files.national_id_back;
                if (idFrontFile) {
                    teamMemberFormData.append('national_id_front', idFrontFile);
                }
                if (idBackFile) {
                    teamMemberFormData.append('national_id_back', idBackFile);
                }
                if (files.proof) {
                    teamMemberFormData.append('proof', files.proof);
                }

                await AuthService.submitTeamMemberDetails(teamMemberFormData);
                console.log('✅ Team member details submitted successfully');

                // Step 2: Select teams (map sport IDs to team names)
                const teamNames = data.selectedSports
                    .map(sportId => {
                        const sport = availableSportsList.find(s => s.id.toString() === sportId);
                        return sport ? sport.name_en : null;
                    })
                    .filter((name): name is string => name !== null); // Type-safe filter

                if (teamNames.length > 0) {
                    await AuthService.selectTeamMemberTeams({
                        member_id: memberId,
                        teams: teamNames,
                    });
                    console.log('✅ Team selection submitted successfully:', teamNames);
                }
            }
            // ========================================================================
            // SOCIAL MEMBER Flow (Original)
            // ========================================================================
            else {
                const { endpoint, formData } = prepareSubmissionData(data, memberId, files);

                console.log('📦 Submission Strategy:', { category: data.category, endpoint });
                debugFormData(formData);

                await AuthService.submitDetailedInfo(endpoint, formData);
                console.log('✅ Detailed information submitted successfully');
            }

            await AuthService.completeRegistration({
                member_id: memberId,
                membership_plan_code: determineRes.data?.next_step || 'FULL_ACCESS',
            });

            console.log('✅ Registration completed successfully');

            showToast('تم إرسال طلب العضوية بنجاح! سيتم مراجعة البيانات.', 'success');

            // Redirect to assignment page after a short delay
            setTimeout(() => {
                window.location.href = '/assignment';
            }, 1500);

        } catch (error: unknown) {
            console.error('❌ Registration Error:', error);

            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل';
            showToast(errorMessage, 'error');

        } finally {
            setIsSubmitting(false);
        }
    };


    /**
     * Render the current step component
     * 
     * Step mapping:
     * - Step 0: Role Selection (both)
     * - Step 1: Sports (player) OR Category (member)
     * - Step 2: Basic Info (both)
     * - Step 3: Details (member only) - players skip to 4
     * - Step 4: Files (both)
     */
    const renderStep = () => {
        switch (step) {
            case 0:
                return <Step0_RoleSelection />;
            case 1:
                if (memberRole === 'sports_player') {
                    return null; // Skipped
                } else {
                    return <Step1Category onNext={nextStep} />;
                }
            case 2:
                return <Step2BasicInfo onNext={nextStep} onPrev={prevStep} />;
            case 3:
                // Details step - skipped by sports players
                if (memberRole === 'sports_player') return null;
                return <Step3Details onNext={nextStep} onPrev={prevStep} />;
            case 4:
                return (
                    <Step4Files
                        files={files}
                        onFileChange={handleFileChange}
                        onPrev={prevStep}
                        onSubmit={handleSubmit(
                            (data: RegisterFormValues) => onSubmit(data),
                            (errors) => {
                                console.error('📋 Step 4 Form Validation Errors:', errors);
                                showToast('يرجى التأكد من ملء جميع البيانات المطلوبة ورفع كافة المستندات', 'error');
                            }
                        )}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    /**
     * Should show navigation buttons
     */
    const showNavButtons = step === 0 || step === 1;

    return (
        <div className="min-h-[100dvh] bg-slate-50 font-['Cairo'] text-right" dir="rtl">
            <div className="container mx-auto px-4 max-w-6xl py-2 md:py-3">
                {/* Header with Logo and Back Button */}
                <div className="flex items-center justify-between mb-3">
                    {/* Back to Home Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-[#2596be] transition-colors rounded-lg hover:bg-white group"
                        type="button"
                    >
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium">العودة للرئيسية</span>
                    </button>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="no-print"
                    >
                        <img
                            src={HUCLogo}
                            alt="نادي جامعة حلوان"
                            className="h-16 w-auto object-contain"
                        />
                    </motion.div>

                    {/* Empty spacer for balance */}
                    <div className="w-32"></div>
                </div>

                <FormProvider {...methods}>
                    <StepIndicator currentStep={step} />

                    <form onSubmit={handleSubmit(
                        (data: RegisterFormValues) => onSubmit(data),
                        (errors) => {
                            console.error('📋 Form Validation Errors:', errors);
                            showToast('يرجى التأكد من ملء جميع البيانات المطلوبة بشكل صحيح', 'error');
                        }
                    )}>
                        <AnimatePresence mode="wait">
                            <div key={step}>
                                {/* Main Step Content */}
                                {renderStep()}

                                {/* Navigation Buttons for Steps 0 and 1 */}
                                {showNavButtons && (
                                    <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            disabled={step === 0}
                                            className={`
                                                px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2
                                                ${step === 0
                                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                }
                                            `}
                                        >
                                            ← السابق
                                        </button>

                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-5 py-2.5 rounded-xl bg-[#2596be] hover:bg-[#1a7a9a] text-white font-bold shadow-lg shadow-[#2596be]/20 transition-all flex items-center gap-2"
                                        >
                                            التالي →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </AnimatePresence>
                    </form>
                </FormProvider>
            </div>

            {/* Toast Notification */}
            <ModernToast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
};

export default RegisterPage;
