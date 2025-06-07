import axios from 'axios';

// ======================= DEBUGGING STEP =======================
// We are temporarily hardcoding the backend URL to ensure the connection works.
// This bypasses the .env.local file completely.
const API_URL = 'http://localhost:8000/api/v1';
console.log(`[DEBUG] API is configured to use base URL: ${API_URL}`);
// =============================================================

const api = axios.create({
  baseURL: API_URL, // Use the hardcoded URL
});

// Interceptor to add the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;