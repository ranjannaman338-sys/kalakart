import axios from 'axios';

const API_BASE_URL = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL)
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if saved in localStorage (useful fallback for cross-origin or local dev)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kalakart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
