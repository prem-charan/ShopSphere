import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Loyalty API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Loyalty API endpoints
export const loyaltyAPI = {
  // Customer endpoints
  getAccount: (userId) => api.get(`/loyalty/${userId}`),
  
  redeemReward: (redeemData) => api.post('/loyalty/redeem', redeemData),
  
  // Admin endpoints
  getAllAccounts: () => api.get('/loyalty/admin/all'),
  
  getUserDetails: (userId) => api.get(`/loyalty/admin/user/${userId}`),
  
  getStats: () => api.get('/loyalty/admin/stats'),
};

export default loyaltyAPI;
