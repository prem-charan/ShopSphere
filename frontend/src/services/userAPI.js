import api from './api';

export const userAPI = {
  getUserById: (id) => api.get(`/users/${id}`),
};

export default userAPI;

