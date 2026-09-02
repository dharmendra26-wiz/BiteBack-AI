import axios from 'axios';

// In dev: VITE_API_URL is undefined → uses '/api' which Vite proxies to localhost:8080
// In prod (Vercel): VITE_API_URL = 'https://your-backend.railway.app' set in Vercel dashboard
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000, // slightly longer for Railway cold starts
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vesta_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vesta_token');
      localStorage.removeItem('vesta_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

