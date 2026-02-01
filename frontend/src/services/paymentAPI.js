import api from './axiosInstance';

// Payment APIs
export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments/initiate', paymentData);
  return response.data;
};

export const processPayment = async (paymentId, otp) => {
  const response = await api.post(`/payments/${paymentId}/process?otp=${otp}`);
  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

export const getPaymentsByOrder = async (orderId) => {
  const response = await api.get(`/payments/order/${orderId}`);
  return response.data;
};

export const getPaymentsByCustomer = async (customerId) => {
  const response = await api.get(`/payments/customer/${customerId}`);
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const getPaymentsByStatus = async (status) => {
  const response = await api.get(`/payments/status/${status}`);
  return response.data;
};

export default api;
