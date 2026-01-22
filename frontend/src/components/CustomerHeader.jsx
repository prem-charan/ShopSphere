import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaShoppingBag, FaHome } from 'react-icons/fa';

const CustomerHeader = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            className="cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h1 className="text-3xl font-bold text-blue-600">ShopSphere</h1>
            <p className="text-sm text-gray-500">Your One-Stop Shop</p>
          </div>
          
          {/* Navigation & User Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <FaHome />
                  <span>Home</span>
                </button>
                
                <button
                  onClick={() => navigate('/my-orders')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaShoppingBag />
                  <span>My Orders</span>
                </button>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <FaUser className="text-gray-600" />
                  <span className="font-medium text-gray-700">{user?.name}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
