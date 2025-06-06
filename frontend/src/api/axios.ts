import axios from 'axios';

// Get backend API base URL from environment variables
// This will allow easy switching between local development and deployed backend
const BACKEND_API_BASE_URL = process.env.REACT_APP_BACKEND_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: BACKEND_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here later for things like:
// - Attaching JWT tokens to requests
// - Handling global errors (e.g., 401 Unauthorized redirect to login)

export default api;