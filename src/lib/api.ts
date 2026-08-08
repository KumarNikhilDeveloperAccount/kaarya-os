import axios from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:8002' : '');

/** Local Super Node (Whisper + HF + Ollama bridge), default port 9999 */
export const SUPER_NODE_URL =
  process.env.NEXT_PUBLIC_SUPER_NODE_URL || 'http://127.0.0.1:9999';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/** Interview / sensory routes hit the Super Node directly (no session cookie). */
export const superNodeApi = axios.create({
  baseURL: SUPER_NODE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Gracefully handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. User session might be expired or invalid.');
      if (typeof window !== 'undefined') {
        // Only redirect to signup if we are definitely trying to access a secure route 
        // without an active valid token, and we are not already on an auth page.
        const path = window.location.pathname;
        if (!path.startsWith('/signup') && !path.startsWith('/login') && path !== '/') {
           // Optionally redirect, or let the AuthContext handle it
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
