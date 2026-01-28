import api from './api';

export const campaignAPI = {
  getActiveCampaigns: () => api.get('/campaigns/active'),
  getCampaignProducts: (id) => api.get(`/campaigns/${id}/products`),
};

export default campaignAPI;

