import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const orderApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
orderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Order API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Order API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
orderApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Order API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Order APIs
export const createOrder = async (orderData) => {
  const response = await orderApi.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await orderApi.get(`/orders/${orderId}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await orderApi.get('/orders');
  return response.data;
};

export const getOrdersByCustomer = async (customerId) => {
  const response = await orderApi.get(`/orders/customer/${customerId}`);
  return response.data;
};

export const getOrdersByStatus = async (status) => {
  const response = await orderApi.get(`/orders/status/${status}`);
  return response.data;
};

export const getRecentOrders = async (days = 7) => {
  const response = await orderApi.get(`/orders/recent?days=${days}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, statusData) => {
  const response = await orderApi.patch(`/orders/${orderId}/status`, statusData);
  return response.data;
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  const response = await orderApi.patch(`/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await orderApi.delete(`/orders/${orderId}`);
  return response.data;
};

// Store Inventory APIs
export const addOrUpdateStoreInventory = async (inventoryData) => {
  const response = await orderApi.post('/store-inventory', inventoryData);
  return response.data;
};

export const getInventoryByProduct = async (productId) => {
  const response = await orderApi.get(`/store-inventory/product/${productId}`);
  return response.data;
};

export const getInventoryByStore = async (storeLocation) => {
  const response = await orderApi.get(`/store-inventory/store/${storeLocation}`);
  return response.data;
};

export const getInventoryByProductAndStore = async (productId, storeLocation) => {
  const response = await orderApi.get(`/store-inventory/product/${productId}/store/${storeLocation}`);
  return response.data;
};

export const getStoresWithProduct = async (productId) => {
  const response = await orderApi.get(`/store-inventory/product/${productId}/stores`);
  return response.data;
};

export const checkProductAvailability = async (productId, storeLocation) => {
  const response = await orderApi.get(`/store-inventory/product/${productId}/store/${storeLocation}/available`);
  return response.data;
};

export const updateStoreStock = async (productId, storeLocation, quantity) => {
  const response = await orderApi.patch(
    `/store-inventory/product/${productId}/store/${storeLocation}/stock?quantity=${quantity}`
  );
  return response.data;
};

export const getLowStockAtStore = async (storeLocation, threshold = 10) => {
  const response = await orderApi.get(`/store-inventory/store/${storeLocation}/low-stock?threshold=${threshold}`);
  return response.data;
};

export const getAllStoreLocations = async () => {
  const response = await orderApi.get('/store-inventory/stores');
  return response.data;
};

export const deleteInventory = async (inventoryId) => {
  const response = await orderApi.delete(`/store-inventory/${inventoryId}`);
  return response.data;
};

export default orderApi;
