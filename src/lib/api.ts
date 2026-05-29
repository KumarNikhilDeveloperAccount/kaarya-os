import axios from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

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
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
