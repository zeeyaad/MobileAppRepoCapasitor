import { z } from 'zod';

/**
 * Member Edit Validation Schema for Admin Panel
 * Enhanced validation for editing member information
 */
export const memberEditSchema = z.object({
    // Arabic Names (max 20 characters, Arabic letters only)
    first_name_ar: z.string()
        .min(1, "الاسم الأول بالعربية مطلوب")
        .max(20, "الحد الأقصى 20 حرف")
        .regex(/^[\u0600-\u06FF\s]+$/, "يجب أن يحتوي على أحرف عربية فقط")
        .transform(val => val.trim()),
    
    last_name_ar: z.string()
        .min(1, "اسم العائلة بالعربية مطلوب")
        .max(20, "الحد الأقصى 20 حرف")
        .regex(/^[\u0600-\u06FF\s]+$/, "يجب أن يحتوي على أحرف عربية فقط")
        .transform(val => val.trim()),

    // English Names (max 20 characters, letters only)
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

    // Gender
    gender: z.enum(['male', 'female', 'other'], {
        message: "قيمة غير صالحة للجنس"
    }),

    // Phone: Exactly 11 digits, Egyptian format (010, 011, 012, 015)
    phone: z.string()
        .min(11, "رقم الهاتف يجب أن يكون 11 رقم")
        .max(11, "رقم الهاتف يجب أن يكون 11 رقم")
        .regex(/^01[0125]\d{8}$/, "رقم الهاتف غير صحيح (يجب أن يبدأ ب 010, 011, 012, أو 015)")
        .transform(val => val.replace(/\s/g, '')),

    // Date of Birth with age validation
    birthdate: z.string()
        .min(1, "تاريخ الميلاد مطلوب")
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const minAge = 16;
            const maxAge = 120;
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            
            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
            
            return actualAge >= minAge && actualAge <= maxAge;
        }, "يجب أن يكون العمر بين 16 و 120 سنة"),

    // Nationality
    nationality: z.string()
        .min(1, "الجنسية مطلوبة")
        .max(50, "الحد الأقصى 50 حرف")
        .transform(val => val.trim()),

    // Address (optional but with validation if provided)
    address: z.string()
        .max(200, "الحد الأقصى 200 حرف")
        .transform(val => val.trim())
        .optional()
        .or(z.literal('')),

    // Health Status (optional but with validation if provided)
    health_status: z.string()
        .max(500, "الحد الأقصى 500 حرف")
        .transform(val => val.trim())
        .optional()
        .or(z.literal('')),
});

// Export the Type
export type MemberEditFormValues = z.infer<typeof memberEditSchema>;
