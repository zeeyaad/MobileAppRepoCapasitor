import { z } from 'zod';

/**
 * Sport type - imported from API service
 * Note: AVAILABLE_SPORTS below is kept as fallback/reference
 */
export type { Sport } from '../../../services/sportsApi';

/**
 * Available Sports for Team Members
 * This is now used as a fallback and for emoji mapping
 * The actual sports list is fetched from the backend
 */
export const AVAILABLE_SPORTS = [
    { id: 'football', label: 'كرة القدم', icon: '⚽' },
    { id: 'basketball', label: 'كرة السلة', icon: '🏀' },
    { id: 'volleyball', label: 'الكرة الطائرة', icon: '🏐' },
    { id: 'tennis', label: 'التنس', icon: '🎾' },
    { id: 'swimming', label: 'السباحة', icon: '🏊' },
    { id: 'handball', label: 'كرة اليد', icon: '🤾' },
    { id: 'squash', label: 'الاسكواش', icon: '🎯' },
    { id: 'athletics', label: 'ألعاب القوى', icon: '🏃' },
] as const;

/**
 * Member Role Enum
 */
export const MemberRoleEnum = z.enum(['social_member', 'sports_player']);

/**
 * Registration Schema for Multi-Step Form
 * 
 * New Flow: Step 0 (Role) -> Step 1 (Sports if Player) -> Step 2 (Basic Info)
 * 
 * Uses passthrough() to allow Step 3 fields without breaking Step 2 validation.
 * Uses superRefine() for conditional validation based on citizenship_type and memberRole.
 */
export const registerSchema = z.object({
    // Step 0: Member Role (replaces old 'category' for role selection)
    memberRole: MemberRoleEnum,

    // Step 1: Sports Selection (validated conditionally via superRefine)
    selectedSports: z.array(z.string()).default([]),
    // Optional preferred time slot per selected sport (key: sportId, value: slotId)
    sportTimeSelections: z.record(z.string(), z.string()).default({}),

    // Legacy: Keep 'category' for backward compatibility with Step 3 logic
    category: z.string().min(1, "نوع العضوية مطلوب").optional(),

    // Step 2: Citizenship Type (determines ID field validation)
    citizenship_type: z.enum(['egyptian', 'non_egyptian']),

    // Step 2: Arabic Names (max 20 characters, Arabic letters only)
    first_name_ar: z.string()
        .min(1, "الاسم الأول بالعربية مطلوب")
        .max(20, "الحد الأقصى 20 حرف")
        .regex(/^[\u0600-\u06FF\s]+$/, "يجب أن يحتوي على أحرف عربية فقط"),
    last_name_ar: z.string()
        .min(1, "اسم العائلة بالعربية مطلوب")
        .max(20, "الحد الأقصى 20 حرف")
        .regex(/^[\u0600-\u06FF\s]+$/, "يجب أن يحتوي على أحرف عربية فقط"),

    // Step 2: English Names (max 20 characters, letters only, proper case)
    first_name_en: z.string()
        .min(1, "First Name is required")
        .max(20, "Maximum 20 characters")
        .regex(/^[a-zA-Z\s]+$/, "Only English letters are allowed")
        .transform(val => val.trim()),
    last_name_en: z.string()
        .min(1, "Last Name is required")
        .max(20, "Maximum 20 characters")
        .regex(/^[a-zA-Z\s]+$/, "Only English letters are allowed")
        .transform(val => val.trim()),

    // Step 2: IDs (conditionally validated via superRefine)
    // National ID: exactly 14 digits, Passport: 5-20 characters
    nationalId: z.string().optional(),
    passportNumber: z.string().max(20, "الحد الأقصى 20 حرف").optional(),

    // Step 2: Personal Details
    nationality: z.string().optional(), // Auto-set based on category
    dob: z.string()
        .min(1, "تاريخ الميلاد مطلوب")
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const minAge = 16; // Minimum age requirement
            const maxAge = 100; // Maximum reasonable age
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

            return actualAge >= minAge && actualAge <= maxAge;
        }, "يجب أن يكون العمر بين 16 و 100 سنة"),
    gender: z.string().min(1, "الجنس مطلوب"),
    // Phone: Exactly 11 digits, Egyptian format (010, 011, 012, 015)
    phone: z.string()
        .min(11, "رقم الهاتف يجب أن يكون 11 رقم")
        .max(11, "رقم الهاتف يجب أن يكون 11 رقم")
        .regex(/^01[0125]\d{8}$/, "رقم الهاتف غير صحيح (يجب أن يبدأ ب 010, 011, 012, أو 015)"),
    email: z.string()
        .min(1, "البريد الإلكتروني مطلوب")
        .email("البريد الإلكتروني غير صحيح")
        .refine((email) => {
            const allowedDomains = [
                'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
                'icloud.com', 'protonmail.com', 'mail.com', 'aol.com',
                'yandex.com', 'zoho.com', 'gmx.com', 'inbox.com'
            ];
            const domain = email.split('@')[1]?.toLowerCase();
            return allowedDomains.includes(domain);
        }, "يرجى استخدام بريد إلكتروني شائع (gmail, yahoo, hotmail, outlook, etc.)"),

    // Step 2: Security
    password: z.string()
        .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        .max(50, "كلمة المرور طويلة جداً")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، ورقم على الأقل")
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, "تحتوي على رموز غير مسموح بها"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),

    // Step 3 fields - all optional to allow step-by-step validation
    address: z.string().optional(),
    universityId: z.string().optional(),
    facultyId: z.string().optional(),
    graduationYear: z.string().optional(),
    professionId: z.string().optional(),
    department: z.string().optional(),
    salary: z.string().optional(),
    professionCode: z.string().optional(),
    retirementDate: z.string().optional(),
    seasonalDuration: z.string().optional(),
    visaStatus: z.string().optional(),
    paymentType: z.string().optional(),
    relatedMemberId: z.string().optional(),
    relationshipType: z.string().optional(),
    visitor_type: z.string().optional(),
    fullName: z.string().optional(),
})
    .passthrough()
    .refine((data) => data.password === data.confirmPassword, {
        message: "كلمات المرور غير متطابقة",
        path: ["confirmPassword"],
    })
    .superRefine((data, ctx) => {
        // ============================================================================
        // Conditional Validation: Sports Selection based on Member Role
        // ============================================================================
        // Conditional Validation: Sports Selection (Currently optional as step is removed)
        /* 
        if (data.memberRole === 'sports_player') {
            // Sports player must select 1-4 sports
            if (!data.selectedSports || data.selectedSports.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'يجب اختيار رياضة واحدة على الأقل',
                    path: ['selectedSports'],
                });
            } else if (data.selectedSports.length > 4) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'الحد الأقصى 4 رياضات',
                    path: ['selectedSports'],
                });
            }
        }
        */
        // Social members don't need sports validation - selectedSports can be empty

        // ============================================================================
        // Conditional Validation: National ID vs Passport based on citizenship
        // Foreigner -> Passport, All others -> National ID
        // ============================================================================
        if (data.citizenship_type === 'non_egyptian' || data.category === 'foreigner') {
            // Non-Egyptian must have a passport number (5-20 characters)
            if (!data.passportNumber || data.passportNumber.length < 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'رقم جواز السفر مطلوب (5-20 حرف)',
                    path: ['passportNumber'],
                });
            }
        } else {
            // Egyptian uses National ID (exactly 14 digits, first digit cannot be 0)
            if (!data.nationalId || !/^[1-9]\d{13}$/.test(data.nationalId)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'الرقم القومي يجب أن يكون 14 رقم ولا يبدأ بصفر',
                    path: ['nationalId'],
                });
            }
        }
    });

// Export the Type
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Export Member Role type for components
export type MemberRole = z.infer<typeof MemberRoleEnum>;
