import api from './api';

// Types (Basic definitions to match backend response)
export interface StaffProfileData {
    id: number;
    first_name_en: string;
    first_name_ar: string;
    last_name_en: string;
    last_name_ar: string;
    national_id: string;
    email: string;
    phone: string;
    address: string;
    staff_type_id: number;
    staff_type?: {
        name_en: string;
        name_ar: string;
        code: string;
    };
    employment_start_date: string;
    is_active: boolean;
    created_at: string;
}

export interface PrivilegeData {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    module: string;
}

export interface PrivilegePackageData {
    id: number;
    code: string;
    name_en?: string;
    name_ar?: string;
    description_en?: string;
    description_ar?: string;
    is_active?: boolean;
}

export const StaffService = {
    /**
     * Get Staff Profile by ID
     * GET /staff/:id
     */
    getProfile: async (id: number) => {
        const response = await api.get(`/staff/${id}`);
        return response.data;
    },

    getStaffTypes: async () => {
        const response = await api.get('/staff/types');
        return response.data;
    },

    /**
     * Update Staff Profile
     * PUT /staff/:id
     */
    updateProfile: async (id: number, data: Partial<StaffProfileData>) => {
        const response = await api.put(`/staff/${id}`, data);
        return response.data;
    },

    /**
     * Get Staff Privileges
     * GET /staff/:id/final-privileges
     */
    getPrivileges: async (id: number) => {
        try {
            const response = await api.get(`/staff/${id}/final-privileges`);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to fetch privileges for staff ${id}:`, {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                message: error?.response?.data?.message,
                error: error?.response?.data?.error,
                details: error?.response?.data,
            });
            throw error;
        }
    },

    /**
     * Get Activity Logs
     * GET /staff/:id/activity-logs
     */
    getActivityLogs: async (id: number, limit = 10) => {
        const response = await api.get(`/staff/${id}/activity-logs?limit=${limit}`);
        return response.data;
    },

    /**
     * Get All Privileges
     * GET /staff/privileges
     */
    getAllPrivileges: async () => {
        const response = await api.get('/staff/privileges');
        return response.data;
    },

    /**
     * Get All Privilege Packages
     * GET /staff/packages
     */
    getPackages: async () => {
        const response = await api.get('/staff/packages');
        return response.data;
    },

    /**
     * Get privileges inside one package
     * GET /staff/packages/:packageId/privileges
     */
    getPackagePrivileges: async (packageId: number) => {
        const response = await api.get(`/staff/packages/${packageId}/privileges`);
        return response.data;
    },

    /**
     * Register New Staff
     * POST /staff/register
     */
    registerStaff: async (data: any) => {
        const response = await api.post('/staff/register', data);
        return response.data;
    },

    /**
     * Assign Packages to Staff
     * POST /staff/:id/assign-packages
     */
    assignPackages: async (staffId: number, packageIds: number[]) => {
        const response = await api.post(`/staff/${staffId}/assign-packages`, {
            package_ids: packageIds
        });
        return response.data;
    },

    /**
     * Grant multiple privileges to a staff member
     * POST /staff/:id/grant-privilege
     */
    grantPrivileges: async (staffId: number, privilegeIds: number[], reason?: string) => {
        const uniqueIds = Array.from(
            new Set(
                privilegeIds.filter((id) => Number.isFinite(id) && id > 0)
            )
        );

        if (uniqueIds.length === 0) {
            return { success: true, count: 0, results: [] };
        }

        const response = await api.post(`/staff/${staffId}/grant-privilege`, {
            privilege_ids: uniqueIds,
            ...(reason ? { reason } : {}),
        });
        return response.data;
    },

    /**
     * Change Password / Credentials
     * POST /auth/change-credentials
     */

    changeCredentials: async (data: { new_email: string; new_password: string }) => {
        const response = await api.post('/auth/change-credentials', data);
        return response.data;
    },

    /**
     * Get all staff (unpaginated list for selectors)
     * GET /staff
     */
    getAllStaff: async () => {
        const response = await api.get('/staff');
        return response.data;
    },

    /**
     * Revoke privileges from a staff member
     * POST /staff/:id/revoke-privilege
     * Returns 200 on success, 409 on partial failure with failed_attempts
     */
    revokePrivileges: async (staffId: number, privilegeIds: number[], reason?: string) => {
        try {
            const response = await api.post(`/staff/${staffId}/revoke-privilege`, {
                privilege_ids: privilegeIds,
                ...(reason ? { reason } : {}),
            });
            return response.data;
        } catch (error: any) {
            // Handle 409 Conflict - partial failure with detailed failure info
            if (error?.response?.status === 409 && error?.response?.data) {
                // Return the error data so caller can process failed_attempts
                return error.response.data;
            }
            throw error;
        }
    },
};
