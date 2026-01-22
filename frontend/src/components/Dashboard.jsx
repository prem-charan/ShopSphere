import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { FaBox, FaExclamationTriangle, FaChartLine, FaWarehouse } from 'react-icons/fa';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    categories: [],
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, lowStockRes, categoriesRes] = await Promise.all([
        productAPI.getAllProducts(),
        productAPI.getLowStockCount(),
        productAPI.getAllCategories()
      ]);

      const products = productsRes.data.data;
      const recentProducts = products.slice(0, 5);

      setStats({
        totalProducts: products.length,
        lowStockCount: lowStockRes.data.data,
        categories: categoriesRes.data.data,
        recentProducts
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-4">{error}</div>;
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-slate-500">Overview of your product catalog and inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaBox className="text-2xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold m-0">{stats.totalProducts}</h3>
            <p className="text-slate-500 text-sm m-0 mt-1">Total Products</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
            <FaExclamationTriangle className="text-2xl text-orange-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold m-0">{stats.lowStockCount}</h3>
            <p className="text-slate-500 text-sm m-0 mt-1">Low Stock Alerts</p>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <FaChartLine className="text-2xl text-green-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold m-0">{stats.categories.length}</h3>
            <p className="text-slate-500 text-sm m-0 mt-1">Categories</p>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FaWarehouse className="text-2xl text-indigo-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold m-0">{stats.totalProducts > 0 ? 'Active' : 'Inactive'}</h3>
            <p className="text-slate-500 text-sm m-0 mt-1">Inventory Status</p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-xl font-semibold mb-4">Recent Products</h3>
          {stats.recentProducts.length > 0 ? (
            <>
              <div className="flex flex-col gap-3 mb-4">
                {stats.recentProducts.map((product) => (
                  <div key={product.productId} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                    <div>
                      <h4 className="text-base font-semibold m-0">{product.name}</h4>
                      <p className="text-slate-500 text-sm m-0 mt-1">{product.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-blue-600 font-semibold text-base">₹{product.price}</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isLowStock 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {product.stockQuantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-all no-underline"
              >
                View All Products
              </Link>
            </>
          ) : (
            <p className="text-center text-slate-500 py-5 italic">No products available</p>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-xl font-semibold mb-4">Categories</h3>
          {stats.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {stats.categories.map((category, index) => (
                <div key={index} className="bg-slate-50 px-4 py-2 rounded-md border-l-4 border-blue-600">
                  <span className="font-medium">{category}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-5 italic">No categories available</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {stats.lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <FaExclamationTriangle className="text-3xl text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold m-0">Low Stock Alert</h3>
              <p className="text-slate-600 m-0 mt-1">You have {stats.lowStockCount} product(s) running low on stock</p>
            </div>
          </div>
          <Link 
            to="/low-stock" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors no-underline"
          >
            View Low Stock Products
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
