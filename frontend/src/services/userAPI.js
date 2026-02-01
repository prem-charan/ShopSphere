import api from './api';

export const userAPI = {
  getUserById: (id) => api.get(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
};

export default userAPI;

