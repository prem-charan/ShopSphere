import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaShoppingBag, FaHome, FaGift } from 'react-icons/fa';
import { FaShoppingCart } from 'react-icons/fa';
import { getCartCount } from '../utils/cart';

const CustomerHeader = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const refresh = () => setCartCount(getCartCount());
    refresh();

    window.addEventListener('cart:updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cart:updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

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
                  onClick={() => navigate('/loyalty')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <FaGift />
                  <span>Rewards</span>
                </button>
                
                <button
                  onClick={() => navigate('/my-orders')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaShoppingBag />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition relative"
                >
                  <FaShoppingCart />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
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
