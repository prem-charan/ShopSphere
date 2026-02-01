import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerHeader from '../components/CustomerHeader';
import FormInput from '../components/common/FormInput';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaSave, FaArrowLeft, FaEdit, FaTimes } from 'react-icons/fa';
import { validatePassword, validatePhone, validateEmail, validateName } from '../utils/validation';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = response.data;
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        password: '',
        phone: profile.phone || ''
      });
      setFetchError(null);
    } catch (err) {
      setFetchError('Failed to load profile. Please try again.');
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSuccessMessage('');

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        // Password is optional for updates - only validate if user entered something
        if (value && value.trim() !== '') {
          const passwordErrors = validatePassword(value);
          error = passwordErrors.length > 0 ? passwordErrors[0] : null;
        }
        // If password is empty, clear any existing error
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      default:
        break;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Only validate password if user entered something
    if (formData.password && formData.password.trim() !== '') {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) newErrors.password = passwordErrors[0];
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    // Clear any existing errors that are no longer relevant
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only mark fields as touched that are required or have values
    const touchedFields = {
      name: true,
      email: true,
      phone: true,
      password: formData.password && formData.password.trim() !== ''
    };
    setTouched(touchedFields);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');

      // Only include password in request if user entered a new one
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        'http://localhost:8080/api/users/profile',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update user in auth context
      updateUser({ name: response.data.name, email: response.data.email });

      setSuccessMessage('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '' }));
      setTouched({});
      setIsEditing(false);
      setErrors({});

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err.response?.data?.data) {
        setErrors(err.response.data.data);
      } else {
        setErrors({ submit: err.response?.data?.message || 'Failed to update profile' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setTouched({});
    setFormData(prev => ({ ...prev, password: '' }));
    fetchProfile();
  };

  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <CustomerHeader />
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <CustomerHeader />
      <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
              >
                <FaArrowLeft /> Back
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                    <FaUser className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-sm text-gray-600">Manage your account information</p>
                  </div>
                </div>
                {!isEditing && !fetchError && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* Fetch Error Message */}
            {fetchError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {fetchError}
              </div>
            )}

            {/* Submit Error Message */}
            {isEditing && errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Profile View/Edit */}
            {!isEditing ? (
              /* Read-only View */
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FaUser className="text-gray-400" /> Full Name
                  </label>
                  <p className="mt-1 text-lg text-gray-800">{formData.name || '-'}</p>
                </div>

                <div className="border-b border-gray-100 pb-4">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" /> Email Address
                  </label>
                  <p className="mt-1 text-lg text-gray-800">{formData.email || '-'}</p>
                </div>

                <div className="border-b border-gray-100 pb-4">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FaPhone className="text-gray-400" /> Phone Number
                  </label>
                  <p className="mt-1 text-lg text-gray-800">{formData.phone || '-'}</p>
                </div>

                <div className="pb-4">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FaLock className="text-gray-400" /> Password
                  </label>
                  <p className="mt-1 text-lg text-gray-800">••••••••</p>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                required
                placeholder="Enter your full name"
                icon={FaUser}
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                required
                placeholder="you@example.com"
                icon={FaEnvelope}
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                required
                placeholder="+91 9876543210"
                icon={FaPhone}
              />

              <div>
                <FormInput
                  label="New Password (Optional)"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  placeholder="Leave blank to keep current password"
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
                {formData.password && <PasswordStrengthIndicator password={formData.password} />}
              </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
}

export default Profile;
