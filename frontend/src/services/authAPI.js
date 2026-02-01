import api from './axiosInstance';

export const auth = {
  // Customer signup
  signup: (data) => api.post('/auth/signup', data),

  // Login (customer or admin)
  login: (data) => api.post('/auth/login', data),

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

export default api;
