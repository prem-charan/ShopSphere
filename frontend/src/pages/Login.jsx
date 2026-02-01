import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import FormInput from '../components/common/FormInput';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({ ...formData, role: type === 'admin' ? 'ADMIN' : null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData = { ...formData };
      if (loginData.role === null) {
        delete loginData.role;
      }

      const userData = await login(loginData);

      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-block p-3 bg-gradient-to-r ${
            loginType === 'admin'
              ? 'from-indigo-500 to-purple-500'
              : 'from-blue-500 to-indigo-500'
          } rounded-full mb-4 transition-all`}>
            <FaSignInAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue to ShopSphere</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleLoginTypeChange('customer')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              loginType === 'customer'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleLoginTypeChange('admin')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              loginType === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaUserShield /> Admin
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            icon={FaEnvelope}
          />

          <FormInput
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            icon={FaLock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r ${
              loginType === 'admin'
                ? 'from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950'
                : 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
            } text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              `Sign in as ${loginType === 'admin' ? 'Admin' : 'Customer'}`
            )}
          </button>
        </form>

        {/* Signup Link */}
        {loginType === 'customer' && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
