export interface BasicInfoDTO {
    role: string; // 'member' or 'team_member'
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
    national_id: string; // Changed from nationalId to match backend snake_case if possible, or mapping needed
    nationality: string;
    birthdate: string; // YYYY-MM-DD
    gender: string;
    phone: string;
    email: string;
    password: string;
    membership_type_code?: string; // NEW: Maps to member type (VISITOR, WORKING, STUDENT, etc.)
}

export interface RegistrationResponse {
    success: boolean;
    message: string;
    data?: {
        member_id?: number;
        team_member_id?: number;
        account_id?: number;
        role?: string;
        is_foreign?: boolean;
        next_step?: string;
    };
}

export interface QuestionnaireDTO {
    member_id: number;
    is_student: boolean;
    is_working: boolean;
    is_foreign: boolean;
    is_graduated: boolean;
    has_relation: boolean;
    relation_member_id?: number;
}


// Detailed Info Types (For stricter type checking if needed)
export interface StudentDetailsDTO {
    member_id: number;
    university_id: number;
    faculty_id: number;
    graduation_year: number;
    enrollment_date: string;
}

export interface WorkingDetailsDTO {
    member_id: number;
    profession_id: number;
    department_en: string;
    department_ar: string;
    salary: number;
    employment_start_date: string;
    university_id: number;
}

// Authentication Types
export interface LoginCredentials {
    email: string;
    password: string;
    national_id?: string; // For first-time login
}

export interface UserInfo {
    account_id: number;
    email: string;
    role?: string;
    status?: string;
    staff_id?: number;
    staff_type_id?: number;
    staff_type?: string;
    member_id?: number;
    member_type_id?: number;
    member_type?: string;
    name_en?: string;
    privileges?: string[];
    [key: string]: unknown; // Index signature for compatibility
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: UserInfo;
    requires_credential_change?: boolean;
}

export interface ChangeCredentialsDTO {
    new_email: string;
    new_password: string;
}

