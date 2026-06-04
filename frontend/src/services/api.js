import axios from 'axios';

export const API_HOST = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: `${API_HOST}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 15000, // 15 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Handle responses & errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = 'An error occurred';
        let statusCode = error.response?.status;

        // Handle different error types
        if (error.response) {
            // Server responded with error status
            switch (statusCode) {
                case 400:
                    message = error.response?.data?.message || 'Invalid request';
                    break;

                case 401:
                    // Unauthorized - token expired or invalid
                    console.warn('Authentication failed, clearing token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('tenant');
                    localStorage.removeItem('subscription');
                    window.location.href = '/login';
                    break;

                case 403:
                    // Forbidden - access denied
                    message = error.response?.data?.message || 'Access denied. Insufficient permissions.';
                    console.warn('Access denied:', message);
                    // Show toast notification (if toast available)
                    if (window.__showToast) {
                        window.__showToast(message, 'error');
                    }
                    break;

                case 404:
                    message = error.response?.data?.message || 'Resource not found';
                    break;

                case 422:
                    // Validation errors
                    message = error.response?.data?.message || 'Validation failed';
                    console.warn('Validation errors:', error.response?.data?.errors);
                    break;

                case 429:
                    // Rate limited
                    message = 'Too many requests. Please wait a moment and try again.';
                    console.warn('Rate limited');
                    if (window.__showToast) {
                        window.__showToast(message, 'warning');
                    }
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    // Server errors
                    message = 'Server error. Please try again later.';
                    console.error('Server error:', statusCode, error.response?.data);
                    if (window.__showToast) {
                        window.__showToast(message, 'error');
                    }
                    break;

                default:
                    message = error.response?.data?.message || `Error: ${statusCode}`;
                    break;
            }
        } else if (error.request) {
            // Request made but no response received
            if (error.code === 'ECONNABORTED') {
                message = 'Request timeout. Please check your connection and try again.';
                console.error('Request timeout');
            } else {
                message = 'Network error. Please check your internet connection.';
                console.error('Network error:', error.message);
            }

            if (window.__showToast) {
                window.__showToast(message, 'error');
            }
        } else {
            // Error in request setup
            message = error.message || 'Unknown error occurred';
            console.error('Client error:', error);
        }

        // Attach meaningful error to response
        error.userMessage = message;
        error.statusCode = statusCode;

        return Promise.reject(error);
    }
);

/**
 * Register a toast notification callback
 * Usage: api.registerToastFn((msg, type) => console.log(msg))
 */
export const registerToastFn = (toastFn) => {
    window.__showToast = toastFn;
};

/**
 * Show API error with toast
 */
export const showApiError = (error) => {
    const message = error?.userMessage || error?.response?.data?.message || error?.message || 'An error occurred';
    if (window.__showToast) {
        window.__showToast(message, 'error');
    }
};

/**
 * Show API success with toast
 */
export const showApiSuccess = (message = 'Success') => {
    if (window.__showToast) {
        window.__showToast(message, 'success');
    }
};

export default api;

