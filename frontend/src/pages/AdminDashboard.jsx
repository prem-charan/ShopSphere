import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import LowStockAlert from '../components/LowStockAlert';
import Dashboard from '../components/Dashboard';
import OrderList from '../components/OrderList';
import OrderDetail from '../components/OrderDetail';
import StoreInventoryManagement from '../components/StoreInventoryManagement';
import { FaSignOutAlt, FaHome } from 'react-icons/fa';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/admin/dashboard' && location.pathname === '/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🛡️ Admin Panel
              </h1>
              <p className="text-indigo-200 text-sm">Logged in as {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors no-underline text-white"
              >
                <FaHome /> Customer View
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Sub Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-6 py-3 overflow-x-auto">
            <Link
              to="/admin/dashboard"
              className={`no-underline font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                isActive('/admin/dashboard') || isActive('/admin')
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className={`no-underline font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                isActive('/admin/products')
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`}
            >
              Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className={`no-underline font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                isActive('/admin/orders')
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`}
            >
              Manage Orders
            </Link>
            <Link
              to="/admin/store-inventory"
              className={`no-underline font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                isActive('/admin/store-inventory')
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`}
            >
              Store Inventory
            </Link>
            <Link
              to="/admin/low-stock"
              className={`no-underline font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                isActive('/admin/low-stock')
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`}
            >
              Low Stock Alerts
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-5">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/store-inventory" element={<StoreInventoryManagement />} />
            <Route path="/low-stock" element={<LowStockAlert />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-5">
          <p>&copy; 2026 ShopSphere Admin Panel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;
