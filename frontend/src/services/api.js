import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token and logging
api.interceptors.request.use(
  (config) => {
    // Add token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Product API endpoints
export const productAPI = {
  // Get all products
  getAllProducts: () => api.get('/products'),

  // Get product by ID
  getProductById: (id) => api.get(`/products/${id}`),

  // Create new product
  createProduct: (productData) => api.post('/products', productData),

  // Update product
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),

  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Get products by category
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),

  // Get low stock products
  getLowStockProducts: () => api.get('/products/low-stock'),

  // Search products
  searchProducts: (name) => api.get(`/products/search?name=${name}`),

  // Get all categories
  getAllCategories: () => api.get('/products/categories'),

  // Update stock quantity
  updateStockQuantity: (id, quantity) => 
    api.patch(`/products/${id}/stock`, { quantity }),

  // Get low stock count
  getLowStockCount: () => api.get('/products/low-stock/count'),
};

export default api;
