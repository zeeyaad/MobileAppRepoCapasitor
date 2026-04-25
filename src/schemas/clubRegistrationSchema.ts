import { z } from 'zod';

// =============================================================================
// AVAILABLE SPORTS CONFIGURATION
// =============================================================================
export const AVAILABLE_SPORTS = [
    { id: 'football', label: 'كرة القدم', icon: '⚽' },
    { id: 'swimming', label: 'السباحة', icon: '🏊' },
    { id: 'basketball', label: 'كرة السلة', icon: '🏀' },
    { id: 'tennis', label: 'التنس', icon: '🎾' },
    { id: 'volleyball', label: 'الكرة الطائرة', icon: '🏐' },
    { id: 'handball', label: 'كرة اليد', icon: '🤾' },
    { id: 'squash', label: 'الاسكواش', icon: '🎾' },
    { id: 'gym', label: 'الجيم', icon: '🏋️' },
] as const;

// =============================================================================
// CLUB REGISTRATION SCHEMA
// =============================================================================
export const registerSchema = z.object({
    // Membership Type: Club Member vs Team Member
    membershipType: z.enum(['club_member', 'team_member'], {
        message: 'نوع العضوية مطلوب',
    }),

    // Full Name: minimum 3 characters
    fullName: z.string()
        .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),

    // National ID: exactly 14 digits
    nationalId: z.string()
        .length(14, 'الرقم القومي يجب أن يكون 14 رقم بالضبط')
        .regex(/^\d{14}$/, 'الرقم القومي يجب أن يحتوي على أرقام فقط'),

    // Phone: Egyptian format (010, 011, 012, 015) - exactly 11 digits
    phone: z.string()
        .length(11, 'رقم الهاتف يجب أن يكون 11 رقم')
        .regex(
            /^01[0125]\d{8}$/,
            'رقم الهاتف غير صحيح (يجب أن يبدأ ب 010, 011, 012, أو 015)'
        ),

    // Address: minimum 5 characters
    address: z.string()
        .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),

    // Age: number, minimum 1
    age: z.number({ message: 'العمر مطلوب' })
        .min(1, 'العمر مطلوب')
        .max(120, 'العمر غير صحيح'),

    // Selected Sports: array of sport IDs
    selectedSports: z.array(z.string()),
})
    .superRefine((data, ctx) => {
        // =================================================================
        // Conditional Validation: Team Members must select 1-4 sports
        // =================================================================
        if (data.membershipType === 'team_member') {
            if (data.selectedSports.length < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'يجب اختيار رياضة واحدة على الأقل لعضوية الفريق',
                    path: ['selectedSports'],
                });
            }
            if (data.selectedSports.length > 4) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'الحد الأقصى 4 رياضات',
                    path: ['selectedSports'],
                });
            }
        }
    });

// =============================================================================
// EXPORTED TYPES
// =============================================================================
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Type for sport items
export type SportItem = typeof AVAILABLE_SPORTS[number];
