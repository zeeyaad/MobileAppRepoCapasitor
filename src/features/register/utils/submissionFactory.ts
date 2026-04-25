import type { RegisterFormValues } from '../schemas/validation';

/**
 * File Upload Map Interface
 * Maps UI file input keys to File objects or null
 */
export interface FileUploadMap {
    photo?: File | null;
    id_front?: File | null;
    id_back?: File | null;
    passport?: File | null;
    salary_slip?: File | null;
    medical?: File | null;
    student_proof?: File | null;
    relation_proof?: File | null;
    national_id_front?: File | null;
    national_id_back?: File | null;
    proof?: File | null;
}

/**
 * Submission Result Interface
 * Contains the endpoint and prepared FormData for API submission
 */
export interface SubmissionData {
    endpoint: string;
    formData: FormData;
}

/**
 * Strategy Pattern: File Mapping Configuration
 * Maps UI file keys to backend field names
 */
const FILE_MAPPING: Record<string, string> = {
    photo: 'personal_photo',
    id_front: 'national_id_front',
    id_back: 'national_id_back',
    passport: 'passport_photo',
    salary_slip: 'salary_slip',
    medical: 'medical_report',
    student_proof: 'student_proof',
    relation_proof: 'relation_proof',
    proof: 'proof_document',
};

/**
 * Sport ID to Name Mapping
 * Maps frontend sport IDs to backend team names
 */
export const SPORT_NAME_MAP: Record<string, string> = {
    football: 'Football',
    basketball: 'Basketball',
    volleyball: 'Volleyball',
    tennis: 'Tennis',
    swimming: 'Swimming',
    handball: 'Handball',
    squash: 'Squash',
    athletics: 'Athletics',
};


/**
 * Allowed files for each category
 * Prevents unexpected fields errors from Multer
 */
const ALLOWED_FILES_BY_CATEGORY: Record<string, (keyof FileUploadMap)[]> = {
    visitor: ['photo', 'id_front', 'id_back', 'medical', 'passport'],
    foreigner: ['photo', 'passport', 'medical'], // Foreigners use passport instead of national ID
    student: ['photo', 'id_front', 'id_back', 'medical', 'student_proof'],
    staff: ['photo', 'id_front', 'id_back', 'medical', 'salary_slip'],
    retired: ['photo', 'id_front', 'id_back', 'medical', 'salary_slip'],
    dependent: ['photo', 'id_front', 'id_back', 'medical', 'relation_proof'],
    sports_player: ['photo', 'id_front', 'id_back', 'medical', 'proof'],
};

/**
 * Appends files from the upload map to FormData using correct backend keys
 * Only includes files that are allowed for the given category to prevent Multer errors
 * 
 * @param formData - The FormData object to append files to
 * @param files - The file upload map from the UI
 * @param category - The membership category to filter allowed files
 */
const appendFiles = (formData: FormData, files: FileUploadMap, category: string): void => {
    const allowedFiles = ALLOWED_FILES_BY_CATEGORY[category];
    
    // If category not found, don't append any files to prevent unexpected field errors
    if (!allowedFiles) {
        console.warn(`Unknown category: ${category}. No files will be appended.`);
        return;
    }
    
    // For debugging: show what files are available and what's allowed
    console.log(`📝 Category: ${category}`);
    console.log(`✅ Allowed files:`, allowedFiles);
    console.log(`📂 Available files:`, Object.keys(files).filter(k => files[k as keyof FileUploadMap]));
    
    Object.entries(files).forEach(([key, file]) => {
        if (!file) return; // Skip empty files
        
        const isAllowed = allowedFiles.includes(key as keyof FileUploadMap);
        const isMapped = FILE_MAPPING[key];
        
        if (isAllowed && isMapped) {
            const mappedKey = FILE_MAPPING[key];
            console.log(`✅ Appending: ${key} → ${mappedKey}`);
            formData.append(mappedKey, file);
        } else {
            console.warn(`⏭️  Skipping: ${key} (allowed: ${isAllowed}, mapped: ${!!isMapped})`);
        }
    });
};

/**
 * Submission Factory: Strategy Pattern Implementation
 * 
 * Prepares category-specific data for backend submission including:
 * - Determining the correct API endpoint
 * - Mapping form fields to backend DTOs
 * - Handling file uploads
 * 
 * @param data - Validated form data from React Hook Form + Zod
 * @param memberId - Member ID returned from basic registration step
 * @param files - Uploaded files from file inputs
 * @returns Object containing endpoint path and prepared FormData
 * 
 * @example
 * const { endpoint, formData } = prepareSubmissionData(formValues, 12345, uploadedFiles);
 * await AuthService.submitDetailedInfo(endpoint, formData);
 */
export const prepareSubmissionData = (
    data: RegisterFormValues,
    memberId: number,
    files: FileUploadMap
): SubmissionData => {
    const formData = new FormData();
    
    // Debug: Log what we received
    console.log(`🔍 prepareSubmissionData called with:`, {
        category: data.category,
        memberId,
        filesCount: Object.values(files).filter(f => f).length,
        filesKeys: Object.keys(files).filter(k => files[k as keyof FileUploadMap]),
    });

    // ============================================================================
    // Common Fields (All Categories)
    // ============================================================================
    formData.append('member_id', String(memberId));
    formData.append('address', data.address || '');

    // ============================================================================
    // Category-Specific Strategy Selection
    // ============================================================================

    let endpoint: string;

    switch (data.category) {
        // ------------------------------------------------------------------------
        // VISITOR Strategy
        // ------------------------------------------------------------------------
        case 'visitor': {
            endpoint = 'visitor';

            // Visitor type (VISITOR or VISITOR_HONORARY)
            const visitorType = data.visitor_type || 'VISITOR';
            formData.append('visitor_type', visitorType);

            break;
        }

        // ------------------------------------------------------------------------
        // FOREIGNER Strategy
        // ------------------------------------------------------------------------
        case 'foreigner': {
            endpoint = 'foreigner-seasonal';

            // Seasonal/Foreigner specific fields
            formData.append('seasonal_type', 'seasonal-foreigner');
            formData.append('passport_number', data.passportNumber || '');

            // Country uses the standardized nationality value ("Foreigner")
            formData.append('country', data.nationality || 'Foreigner');

            formData.append('duration_months', data.seasonalDuration || '1');
            formData.append('payment_type', data.paymentType || 'full');

            // Optional: Visa status
            if (data.visaStatus) {
                formData.append('visa_status', data.visaStatus);
            }

            break;
        }

        // ------------------------------------------------------------------------
        // STUDENT Strategy
        // ------------------------------------------------------------------------
        case 'student': {
            endpoint = 'student';

            // Student-specific fields
            formData.append('faculty_id', String(data.facultyId || ''));
            formData.append('graduation_year', String(data.graduationYear || ''));

            // Backend might expect enrollment date
            formData.append('enrollment_date', new Date().toISOString());

            break;
        }

        // ------------------------------------------------------------------------
        // STAFF (Working) Strategy
        // ------------------------------------------------------------------------
        case 'staff': {
            endpoint = 'working';

            // Staff-specific fields
            formData.append('profession_id', String(data.professionId || ''));
            formData.append('salary', String(data.salary || ''));

            // Department (bilingual)
            const department = data.department || 'General';
            formData.append('department_en', department);
            formData.append('department_ar', data.department || 'عام');

            // Employment metadata
            formData.append('employment_start_date', new Date().toISOString());
            formData.append('university_id', '1'); // Default university ID

            break;
        }

        // ------------------------------------------------------------------------
        // RETIRED Strategy
        // ------------------------------------------------------------------------
        case 'retired': {
            endpoint = 'retired';

            // Retired-specific fields - match backend expectations
            const department = data.department || 'General';
            formData.append('former_department_en', department);
            formData.append('former_department_ar', department); // Use same value for both EN and AR
            formData.append('retirement_date', data.retirementDate || '');

            break;
        }

        // ------------------------------------------------------------------------
        // DEPENDENT Strategy
        // ------------------------------------------------------------------------
        case 'dependent': {
            endpoint = 'dependent';

            // Dependent-specific fields (use snake_case for backend compatibility)
            formData.append('related_member_id', String(data.relatedMemberId || ''));
            formData.append('relationship_type', data.relationshipType || '');

            // Note: Backend might apply discount automatically based on relationship

            break;
        }

        // ------------------------------------------------------------------------
        // Default (Should never reach due to Zod validation)
        // ------------------------------------------------------------------------
        default: {
            const category = (data as Record<string, unknown>).category;
            throw new Error(`Unknown category: ${category}`);
        }
    }

    // ============================================================================
    // File Uploads (Category-Specific)
    // ============================================================================
    appendFiles(formData, files, data.category);

    // ============================================================================
    // Return Strategy Result
    // ============================================================================
    return {
        endpoint,
        formData,
    };
};

/**
 * Debug Helper: Logs FormData contents to console
 * Useful for debugging submission issues
 * 
 * @param formData - The FormData to inspect
 */
export const debugFormData = (formData: FormData): void => {
    console.group('📦 FormData Contents');
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`  ${key}:`, `[File] ${value.name} (${value.size} bytes)`);
        } else {
            console.log(`  ${key}:`, value);
        }
    }
    console.groupEnd();
};

/**
 * Determines the correct API endpoint based on category
 * Useful for type-safe endpoint routing
 * 
 * @param category - The membership category
 * @returns The API endpoint path
 */
export const getEndpointByCategory = (
    category: RegisterFormValues['category'] | undefined
): string => {
    const endpointMap: Record<string, string> = {
        visitor: 'visitor',
        foreigner: 'foreigner-seasonal',
        student: 'student',
        staff: 'working',
        retired: 'retired',
        dependent: 'dependent',
    };

    return endpointMap[category || 'visitor'] || 'visitor';
};
