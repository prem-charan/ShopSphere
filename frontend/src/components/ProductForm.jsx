import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    description: '',
    sku: '',
    warehouseLocation: '',
    storeLocation: '',
    imageUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || '',
        stockQuantity: product.stockQuantity || '',
        description: product.description || '',
        sku: product.sku || '',
        warehouseLocation: product.warehouseLocation || '',
        storeLocation: product.storeLocation || '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
      };

      await onSubmit(submitData);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-11/12 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold m-0">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            onClick={onCancel}
            className="bg-transparent border-0 text-2xl cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Product Name */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
              {errors.name && <span className="text-red-600 text-xs mt-1 block">{errors.name}</span>}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Electronics, Clothing"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
              {errors.category && <span className="text-red-600 text-xs mt-1 block">{errors.category}</span>}
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
              {errors.price && <span className="text-red-600 text-xs mt-1 block">{errors.price}</span>}
            </div>

            {/* Stock Quantity */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
              {errors.stockQuantity && <span className="text-red-600 text-xs mt-1 block">{errors.stockQuantity}</span>}
            </div>

            {/* SKU */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Enter SKU code"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Warehouse Location */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Warehouse Location</label>
              <input
                type="text"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleChange}
                placeholder="e.g., Warehouse A, Aisle 3"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Store Location */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Store Location</label>
              <input
                type="text"
                name="storeLocation"
                value={formData.storeLocation}
                onChange={handleChange}
                placeholder="e.g., Main Store, Section B"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Image URL */}
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-slate-800">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block mb-1.5 font-medium text-slate-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600 transition-colors resize-vertical"
            />
          </div>

          {/* Checkbox */}
          <div className="my-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-auto cursor-pointer"
              />
              <span className="font-medium">Product is Active</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-transparent border-2 border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-0"
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
