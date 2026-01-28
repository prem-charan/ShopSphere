import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { addToCart } from '../utils/cart';
import CustomerHeader from '../components/CustomerHeader';

function Home() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getAllCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId) => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/product/${productId}` } });
    } else {
      navigate(`/product/${productId}`);
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${product.productId}` } });
      return;
    }
    if (product.stockQuantity === 0) return;
    addToCart(product.productId, 1);
  };

  const handleBuyNowFromHome = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${product.productId}` } });
      return;
    }
    if (product.stockQuantity === 0) return;
    navigate(`/product/${product.productId}`, { state: { buyNow: true } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <CustomerHeader />
      
      {/* Admin Quick Access */}
      {isAuthenticated() && user?.role === 'ADMIN' && (
        <div className="bg-indigo-100 border-b border-indigo-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-indigo-700 hover:text-indigo-900 font-medium text-sm"
            >
              → Go to Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to ShopSphere</h2>
          <p className="text-xl mb-8">Discover amazing products at great prices</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.productId}
                onClick={() => handleProductClick(product.productId)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaShoppingCart className="text-6xl" />
                    </div>
                  )}
                  {product.isLowStock && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Low Stock
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{product.price}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.isLowStock
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stockQuantity} in stock
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={(e) => handleBuyNowFromHome(e, product)}
                      disabled={product.stockQuantity === 0}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stockQuantity === 0}
                      className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
