import api from './axiosInstance';

// Loyalty API endpoints
export const loyaltyAPI = {
  // Customer endpoints
  getAccount: (userId) => api.get(`/loyalty/${userId}`),
  
  redeemReward: (redeemData) => api.post('/loyalty/redeem', redeemData),
  
  validateDiscountCode: (code, orderTotal) => {
    const params = orderTotal ? `?orderTotal=${orderTotal}` : '';
    return api.get(`/loyalty/validate-code/${code}${params}`);
  },
  
  getActiveCoupon: (userId) => api.get(`/loyalty/active-coupon/${userId}`),
  
  // Admin endpoints
  getAllAccounts: () => api.get('/loyalty/admin/all'),
  
  getUserDetails: (userId) => api.get(`/loyalty/admin/user/${userId}`),
  
  getStats: () => api.get('/loyalty/admin/stats'),
};

export default loyaltyAPI;
