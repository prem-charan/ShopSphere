import api from './axiosInstance';

// Analytics API endpoints
export const analyticsAPI = {
  // Get comprehensive sales analytics
  getSalesAnalytics: () => api.get('/analytics/sales'),
};

export default analyticsAPI;
