import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaShoppingBag, FaHome, FaGift, FaSearch } from 'react-icons/fa';
import { FaShoppingCart } from 'react-icons/fa';
import { getCartCount } from '../utils/cart';

const CustomerHeader = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Navigate to home page with search term for live search
    navigate('/', { state: { search: value } });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/', { state: { search: searchTerm.trim() } });
    }
  };

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
          >
            <Link to="/" state={{ clearFilters: true }}>
              <h1 className="text-2xl font-bold text-slate-800">ShopSphere</h1>
            </Link>
            <Link to="/" state={{ clearFilters: true }}>
              <p className="text-sm text-slate-500 hover:text-slate-700 cursor-pointer">Your One-Stop Shop</p>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </form>
          </div>
          
          {/* Navigation & User Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                
                <button
                  onClick={() => navigate('/loyalty')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <FaGift />
                  <span>Rewards</span>
                </button>
                
                <button
                  onClick={() => navigate('/my-orders')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <FaShoppingBag />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors relative"
                >
                  <FaShoppingCart />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  title="View Profile"
                >
                  <FaUser className="text-slate-600" />
                  <span className="font-medium text-slate-700">{user?.name}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
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
