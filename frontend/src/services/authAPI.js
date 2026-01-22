import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const auth = {
  // Customer signup
  signup: (data) => authAPI.post('/auth/signup', data),

  // Login (customer or admin)
  login: (data) => authAPI.post('/auth/login', data),

  // Admin signup (requires secret key)
  adminSignup: (data, secretKey) => 
    authAPI.post('/auth/admin/signup', data, {
      headers: { 'X-Admin-Secret-Key': secretKey }
    }),

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = auth.getCurrentUser();
    return user && user.role === 'ADMIN';
  },
};

export default authAPI;
