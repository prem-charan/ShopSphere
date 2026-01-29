import api from './api';

export const campaignAPI = {
  // Public endpoints
  getActiveCampaigns: () => api.get('/campaigns/active'),
  getCampaign: (id) => api.get(`/campaigns/${id}`),
  getCampaignProducts: (id) => api.get(`/campaigns/${id}/products`),
  
  // Admin endpoints
  getAllCampaigns: () => api.get('/campaigns'),
  createCampaign: (campaignData) => api.post('/campaigns', campaignData),
  updateCampaign: (id, campaignData) => api.put(`/campaigns/${id}`, campaignData),
  deleteCampaign: (id) => api.delete(`/campaigns/${id}`),
  getCampaignReport: (id) => api.get(`/campaigns/${id}/report`),
};

export default campaignAPI;

