import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const paymentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Payment API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Payment API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
paymentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Payment API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Payment APIs
export const initiatePayment = async (paymentData) => {
  const response = await paymentApi.post('/payments/initiate', paymentData);
  return response.data;
};

export const processPayment = async (paymentId, otp) => {
  const response = await paymentApi.post(`/payments/${paymentId}/process?otp=${otp}`);
  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await paymentApi.get(`/payments/${paymentId}`);
  return response.data;
};

export const getPaymentsByOrder = async (orderId) => {
  const response = await paymentApi.get(`/payments/order/${orderId}`);
  return response.data;
};

export const getPaymentsByCustomer = async (customerId) => {
  const response = await paymentApi.get(`/payments/customer/${customerId}`);
  return response.data;
};

export const getAllPayments = async () => {
  const response = await paymentApi.get('/payments');
  return response.data;
};

export const getPaymentsByStatus = async (status) => {
  const response = await paymentApi.get(`/payments/status/${status}`);
  return response.data;
};

export default paymentApi;
