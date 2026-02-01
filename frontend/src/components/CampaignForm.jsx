import React, { useState, useEffect } from 'react';
import { campaignAPI } from '../services/campaignAPI';

function CampaignForm({ campaign, products, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    bannerImageUrl: '',
    startDate: '',
    endDate: '',
    products: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        bannerImageUrl: campaign.bannerImageUrl || '',
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
        products: []
      });
      
      // Load existing campaign products for editing
      loadCampaignProducts(campaign.campaignId);
    }
  }, [campaign]);

  const loadCampaignProducts = async (campaignId) => {
    try {
      const response = await campaignAPI.getCampaignProducts(campaignId);
      const campaignProducts = response.data || [];
      const productsWithDiscount = campaignProducts.map(cp => ({
        productId: cp.product.productId,
        name: cp.product.name,
        price: cp.product.price,
        discountPercent: cp.discountPercent
      }));
      setSelectedProducts(productsWithDiscount);
    } catch (err) {
      console.error('Error loading campaign products:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (selectedProducts.length === 0) {
      newErrors.products = 'At least one product must be selected';
    }
    
    const productErrors = selectedProducts.map((product, index) => {
      if (!product.discountPercent || product.discountPercent < 0 || product.discountPercent > 100) {
        return `Invalid discount for product ${index + 1}`;
      }
      return null;
    }).filter(Boolean);
    
    if (productErrors.length > 0) {
      newErrors.productDiscounts = productErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.productId === productId);
      if (existing) {
        return prev.filter(p => p.productId !== productId);
      } else {
        return [...prev, { productId, discountPercent: 10 }];
      }
    });
    
    // Clear products error
    if (errors.products) {
      setErrors(prev => ({
        ...prev,
        products: ''
      }));
    }
  };

  const handleDiscountChange = (productId, discountPercent) => {
    setSelectedProducts(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, discountPercent: parseInt(discountPercent) || 0 }
          : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const campaignData = {
        ...formData,
        products: selectedProducts
      };
      
      if (campaign) {
        // Update existing campaign
        await campaignAPI.updateCampaign(campaign.campaignId, campaignData);
        onSuccess('Campaign updated successfully!');
      } else {
        // Create new campaign
        await campaignAPI.createCampaign(campaignData);
        onSuccess('Campaign created successfully!');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.price : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {campaign ? 'Edit Campaign' : 'Create New Campaign'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter campaign title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image URL
          </label>
          <input
            type="url"
            name="bannerImageUrl"
            value={formData.bannerImageUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Products *
          </label>
          {errors.products && (
            <p className="mb-2 text-sm text-red-600">{errors.products}</p>
          )}
          {errors.productDiscounts && (
            <div className="mb-2">
              {errors.productDiscounts.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          )}
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {products.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No products available
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {products.map((product) => {
                  const isSelected = selectedProducts.some(p => p.productId === product.productId);
                  const selectedProduct = selectedProducts.find(p => p.productId === product.productId);
                  
                  return (
                    <div key={product.productId} className="p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProductToggle(product.productId)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{Number(product.price).toFixed(2)} • Stock: {product.stockQuantity}
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center gap-2 ml-4">
                            <label className="text-sm text-gray-600">Discount:</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={selectedProduct?.discountPercent || 0}
                              onChange={(e) => handleDiscountChange(product.productId, e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 pb-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (campaign ? 'Updating...' : 'Creating...') : (campaign ? 'Update Campaign' : 'Create Campaign')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CampaignForm;
