import api from './api';

/**
 * Sport interface matching backend response
 */
export interface Sport {
    id: number;
    name_en: string;
    name_ar: string;
    description_en?: string | null;
    description_ar?: string | null;
}

/**
 * API Response interface
 */
interface SportsResponse {
    success: boolean;
    data: Sport[];
    count: number;
}

/**
 * Fetch all active sports from the backend
 * This endpoint is public and does not require authentication
 * 
 * @returns Promise<Sport[]> Array of active sports
 * @throws Error if the request fails
 */
export const fetchActiveSports = async (): Promise<Sport[]> => {
    try {
        const response = await api.get<SportsResponse>('/public/sports');

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        throw new Error('Invalid response format from server');
    } catch (error: unknown) {
        console.error('Error fetching active sports:', error);

        // Rethrow with user-friendly message
        if (error && typeof error === 'object' && 'message' in error) {
            throw new Error(`Failed to load sports: ${(error as { message: string }).message}`);
        }

        throw new Error('Failed to load sports. Please try again.');
    }
};
