import api from './axiosInstance';

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

  // Search products
  searchProducts: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),

  // Get low stock products
  getLowStockProducts: () => api.get('/products/low-stock'),

  // Get all categories
  getAllCategories: () => api.get('/products/categories'),

  // Update stock quantity
  updateStockQuantity: (id, quantity) => 
    api.patch(`/products/${id}/stock`, { quantity }),

  // Get low stock count
  getLowStockCount: () => api.get('/products/low-stock/count'),

  // Get products available for campaigns
  getProductsAvailableForCampaigns: (campaignId) => {
    let url = '/products/available-for-campaign';
    if (campaignId) {
      url += `?campaignId=${campaignId}`;
    }
    return api.get(url);
  },
};

export default api;
