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
    <header className="bg-gradient-to-r from-white to-slate-50 shadow-lg sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" state={{ clearFilters: true }} className="flex flex-col hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ShopSphere
            </h1>
            <p className="text-xs text-slate-500 tracking-wide">Your One-Stop Shop</p>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                placeholder="Search for products or stores..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-slate-300 transition-all"
              />
            </form>
          </div>
          
          {/* Navigation & User Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => navigate('/loyalty')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FaGift className="text-sm" />
                  <span className="font-medium text-sm">Rewards</span>
                </button>
                
                <button
                  onClick={() => navigate('/my-orders')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                >
                  <FaShoppingBag className="text-sm" />
                  <span className="font-medium text-sm">Orders</span>
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-900 hover:to-black transition-all relative shadow-md hover:shadow-lg"
                >
                  <FaShoppingCart className="text-sm" />
                  <span className="font-medium text-sm">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full h-6 min-w-6 flex items-center justify-center shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                  title="View Profile"
                >
                  <FaUser className="text-slate-600 text-sm" />
                  <span className="font-medium text-slate-700 text-sm max-w-[100px] truncate">{user?.name}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md hover:shadow-lg"
                >
                  <FaSignOutAlt className="text-sm" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
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
