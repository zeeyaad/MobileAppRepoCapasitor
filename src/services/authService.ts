import api from '../api/axios';
import type { BasicInfoDTO, QuestionnaireDTO, RegistrationResponse } from '../types';

export const AuthService = {
    /**
     * Step 1: Register Basic Information
     */
    registerBasic: async (data: BasicInfoDTO): Promise<RegistrationResponse> => {
        console.log('📤 [authService.registerBasic] Sending payload:', {
            ...data,
            password: data.password ? '[REDACTED]' : undefined
        });
        const response = await api.post<RegistrationResponse>('/register/basic', data);
        return response.data;
    },

    /**
     * Step 2: Determine Membership Type
     */
    determineMembership: async (data: QuestionnaireDTO): Promise<RegistrationResponse> => {
        const response = await api.post<RegistrationResponse>('/register/determine-membership', data);
        return response.data;
    },
    /**
     * Step 3: Submit Detailed Info & Files
     * Handles FormData automatically
     * NOTE: MUST NOT set Content-Type header for FormData - let browser auto-detect with boundary
     */
    submitDetailedInfo: async (endpoint: string, formData: FormData): Promise<RegistrationResponse> => {
        const response = await api.post<RegistrationResponse>(`/register/details/${endpoint}`, formData, {
            headers: {
                // DO NOT set Content-Type for FormData - browser must auto-detect multipart/form-data with boundary
                'Content-Type': undefined,
            },
        });
        return response.data;
    },

    /**
     * Step 4: Complete Registration
     */
    completeRegistration: async (data: { member_id: number, membership_plan_code: string }) => {
        const response = await api.post('/register/complete', data);
        return response.data;
    },

    /**
     * Get all faculties from database
     */
    getFaculties: async () => {
        const response = await api.get('/faculties/public/list'); // Public endpoint - no auth required
        return response.data;
    },

    /**
     * Team Member: Submit Details (photos and address)
     */
    submitTeamMemberDetails: async (formData: FormData): Promise<RegistrationResponse> => {
        console.log('📤 [authService.submitTeamMemberDetails] Sending FormData');
        const entries = Array.from(formData.entries());
        for (const [key, value] of entries) {
            console.log(`  ${key}: ${value instanceof File ? `[File: ${value.name}]` : value}`);
        }
        const response = await api.post<RegistrationResponse>('/register/details/team-member', formData, {
            headers: {
                'Content-Type': undefined,
            },
        });
        return response.data;
    },


    /**
     * Team Member: Select Teams (Subscribe to teams)
     * Uses new subscription endpoint
     */
    selectTeamMemberTeams: async (data: { member_id: number; teams: string[]; startDate?: string; endDate?: string }): Promise<RegistrationResponse> => {
        const response = await api.post<RegistrationResponse>('/subscriptions/team-members', {
            team_member_id: data.member_id,
            team_id: data.teams[0], // First team selected
            start_date: data.startDate,
            end_date: data.endDate,
            monthly_fee: 0,
        });
        return response.data;
    },

    /**
     * Team Member: Get Status
     */
    getTeamMemberStatus: async (member_id: number): Promise<RegistrationResponse> => {
        const response = await api.get<RegistrationResponse>(`/register/team-member/status/${member_id}`);
        return response.data;
    },

    /**
     * Team Member: Get full details (photo, DOB, address, etc.)
     */
    getTeamMemberDetails: async (member_id: number) => {
        const response = await api.get(`/register/team-member/details/${member_id}`);
        return response.data;
    },

    /**
     * Team Member: Get attendance stats and joined sports
     */
    getTeamMemberAttendanceStats: async (member_id: number) => {
        const response = await api.get(`/attendance/team-member-stats/${member_id}`);
        return response.data;
    },

    /**
     * Member: Get attendance stats and joined sports
     */
    getMemberAttendanceStats: async (member_id: number) => {
        const response = await api.get(`/attendance/member-stats/${member_id}`);
        return response.data;
    },

    /**
     * Team Member: Get subscriptions list (including pending payment/review)
     */
    getTeamMemberSubscriptions: async (member_id: number) => {
        try {
            const response = await api.get(`/team-member-subscriptions/${member_id}/subscriptions`);
            return response.data;
        } catch {
            const fallback = await api.get(`/team-members/${member_id}/subscriptions`);
            return fallback.data;
        }
    },

    /**
     * Login with email and password
     */
    login: async (credentials: { email: string; password: string; national_id?: string }) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    /**
     * Change credentials on first login
     */
    changeCredentials: async (data: { new_email: string; new_password: string }) => {
        const response = await api.post('/auth/change-credentials', data);
        return response.data;
    },

    /**
     * Logout - clear stored authentication data
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get stored JWT token
     */
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    /**
     * Store JWT token
     */
    setToken: (token: string) => {
        localStorage.setItem('token', token);
    },

    /**
     * Remove JWT token
     */
    removeToken: () => {
        localStorage.removeItem('token');
    },

    /**
     * Get stored user information
     */
    getUserInfo: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Store user information
     */
    setUserInfo: (user: Record<string, unknown>) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    /**
     * Get current user profile from backend
     */
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    /**
     * Team Member: Update details
     */
    updateTeamMemberDetails: async (member_id: number, formData: FormData) => {
        console.log(`📤 [authService.updateTeamMemberDetails] Updating member ${member_id}`);
        const response = await api.put(`/register/team-member/details/${member_id}`, formData, {
            headers: {
                // DO NOT set Content-Type for FormData - browser must auto-detect multipart/form-data with boundary
                'Content-Type': undefined,
            },
        });
        return response.data;
    },

    /**
     * Sports: Get all available sports
     */
    getAllSports: async (params?: Record<string, unknown>) => {
        const response = await api.get('/sports', { params });
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        return !!token;
    }
};


