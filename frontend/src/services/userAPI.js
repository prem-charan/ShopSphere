import api from './axiosInstance';

export const userAPI = {
  getUserById: (id) => api.get(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
};

export default userAPI;

