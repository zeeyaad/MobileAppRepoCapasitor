import axios from 'axios';

// Create Axios custom instance
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Backend base URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for CORS and Cookies
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // Try to get token from multiple potential storage keys
        const storedUserRaw = localStorage.getItem('huc_token');
        let tokenFromUser;

        if (storedUserRaw) {
            try {
                const parsed = JSON.parse(storedUserRaw);
                tokenFromUser = parsed?.token || parsed?.access_token || parsed?.accessToken;
            } catch (e) {
                // ignore parse error
            }
        }

        const token =
            localStorage.getItem('huc_access_token') ||
            localStorage.getItem('token') ||
            tokenFromUser;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Extract meaningful error message
        const status = error?.response?.status;
        const data = error?.response?.data;
        const message =
            data?.message ||
            data?.error ||
            error.message ||
            'An unexpected error occurred';

        // Custom Error Object
        const customError = {
            status,
            message,
            original: error
        };

        // Log for debugging
        console.error('API Service Error:', customError);

        return Promise.reject(customError);
    }
);

export default api;
