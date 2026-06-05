import axios from 'axios';

export const API_HOST = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
export const API_BASE_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized, clear relevant auth state and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('tenant');
      localStorage.removeItem('subscription');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerToastFn = (toastFn) => {
  window.__showToast = toastFn;
};

export const showApiError = (error) => {
  const message = error?.userMessage || error?.response?.data?.message || error?.message || 'An error occurred';
  if (window.__showToast) {
    window.__showToast(message, 'error');
  }
};

export const showApiSuccess = (message = 'Success') => {
  if (window.__showToast) {
    window.__showToast(message, 'success');
  }
};

export default api;
