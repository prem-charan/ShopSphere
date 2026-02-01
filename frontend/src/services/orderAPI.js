import api from './axiosInstance';

// Order APIs
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrdersByCustomer = async (customerId) => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};

export const getOrdersByStatus = async (status) => {
  const response = await api.get(`/orders/status/${status}`);
  return response.data;
};

export const getRecentOrders = async (days = 7) => {
  const response = await api.get(`/orders/recent?days=${days}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, statusData) => {
  const response = await api.patch(`/orders/${orderId}/status`, statusData);
  return response.data;
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  const response = await api.patch(`/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}`);
  return response.data;
};

// Store Inventory APIs
export const addOrUpdateStoreInventory = async (inventoryData) => {
  const response = await api.post('/store-inventory', inventoryData);
  return response.data;
};

export const getInventoryByProduct = async (productId) => {
  const response = await api.get(`/store-inventory/product/${productId}`);
  return response.data;
};

export const getInventoryByStore = async (storeLocation) => {
  const response = await api.get(`/store-inventory/store/${storeLocation}`);
  return response.data;
};

export const getInventoryByProductAndStore = async (productId, storeLocation) => {
  const response = await api.get(`/store-inventory/product/${productId}/store/${storeLocation}`);
  return response.data;
};

export const getStoresWithProduct = async (productId) => {
  const response = await api.get(`/store-inventory/product/${productId}/stores`);
  return response.data;
};

export const checkProductAvailability = async (productId, storeLocation) => {
  const response = await api.get(`/store-inventory/product/${productId}/store/${storeLocation}/available`);
  return response.data;
};

export const updateStoreStock = async (productId, storeLocation, quantity) => {
  const response = await api.patch(
    `/store-inventory/product/${productId}/store/${storeLocation}/stock?quantity=${quantity}`
  );
  return response.data;
};

export const getLowStockAtStore = async (storeLocation, threshold = 10) => {
  const response = await api.get(`/store-inventory/store/${storeLocation}/low-stock?threshold=${threshold}`);
  return response.data;
};

export const getAllStoreLocations = async () => {
  const response = await api.get('/store-inventory/stores');
  return response.data;
};

export const deleteInventory = async (inventoryId) => {
  const response = await api.delete(`/store-inventory/${inventoryId}`);
  return response.data;
};

export default api;
