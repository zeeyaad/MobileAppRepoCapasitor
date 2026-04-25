import axios from 'axios';
import { BACKEND_API_BASE } from "../config/backend";

// Create Axios instance
const api = axios.create({
    // Hard-coded backend base URL
    baseURL: BACKEND_API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for CORS if cookies/sessions are used
});

// Request Interceptor (Add Auth Token)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('huc_access_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (Global Error Handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const message =
            data?.message ||
            data?.error ||
            error.message ||
            'An unexpected error occurred';

        console.error(`API Error [${status}]:`, message, '| Full response:', data);

        // Token expired or unauthorized — trigger a global logout event
        if (status === 401) {
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        // Attach response data to a proper Error object so catch blocks can read it
        const customError = new Error(message) as Error & {
            status?: number;
            responseData?: unknown;
            original?: unknown;
        };
        customError.status = status;
        customError.responseData = data;
        customError.original = error;

        return Promise.reject(customError);
    }
);

export default api;
