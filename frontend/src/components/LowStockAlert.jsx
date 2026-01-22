import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { FaExclamationTriangle, FaEdit, FaBox } from 'react-icons/fa';
import ProductForm from './ProductForm';

function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getLowStockProducts();
      setLowStockProducts(response.data.data);
    } catch (err) {
      setError('Failed to fetch low stock products');
      console.error('Error fetching low stock products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = async (productData) => {
    try {
      await productAPI.updateProduct(editingProduct.productId, productData);
      showSuccessMessage('Product updated successfully');
      setShowForm(false);
      setEditingProduct(null);
      fetchLowStockProducts();
    } catch (err) {
      throw err;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleQuickUpdateStock = async (productId, currentStock) => {
    const newStock = prompt(
      `Update stock quantity for this product.\nCurrent stock: ${currentStock}`,
      currentStock
    );

    if (newStock !== null && newStock !== '') {
      const quantity = parseInt(newStock);
      if (!isNaN(quantity) && quantity >= 0) {
        try {
          await productAPI.updateStockQuantity(productId, quantity);
          showSuccessMessage('Stock quantity updated successfully');
          fetchLowStockProducts();
        } catch (err) {
          setError('Failed to update stock quantity');
          console.error('Error updating stock:', err);
        }
      } else {
        alert('Please enter a valid stock quantity');
      }
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading low stock products...</div>;
  }

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="mb-6">
        <div>
          <h2 className="text-3xl font-bold m-0 mb-2 flex items-center gap-3">
            <FaExclamationTriangle className="text-orange-500" />
            Low Stock Alerts
          </h2>
          <p className="text-slate-500 m-0">Products that require immediate attention</p>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-4">{successMessage}</div>}

      {/* Products Grid or Empty State */}
      {lowStockProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lowStockProducts.map((product) => (
            <div 
              key={product.productId} 
              className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 overflow-hidden hover:-translate-y-1 transition-transform"
            >
              {/* Card Header */}
              <div className="p-5 bg-gradient-to-r from-yellow-100 to-orange-100 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold m-0 mb-2">{product.name}</h3>
                  <span className="inline-block bg-white px-3 py-1 rounded text-xs font-medium">
                    {product.category}
                  </span>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                  Low Stock
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                  <span className="text-slate-500 text-sm">Product ID:</span>
                  <span className="font-semibold text-slate-800">#{product.productId}</span>
                </div>

                {product.sku && (
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                    <span className="text-slate-500 text-sm">SKU:</span>
                    <span className="font-semibold text-slate-800">{product.sku}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                  <span className="text-slate-500 text-sm">Price:</span>
                  <span className="font-semibold text-blue-600 text-base">₹{product.price}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-md my-3 border-0">
                  <span className="text-slate-700 text-sm flex items-center gap-1.5">
                    <FaBox /> Current Stock:
                  </span>
                  <span className="font-semibold text-orange-500 text-lg">{product.stockQuantity}</span>
                </div>

                {product.warehouseLocation && (
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                    <span className="text-slate-500 text-sm">Warehouse:</span>
                    <span className="font-semibold text-slate-800">{product.warehouseLocation}</span>
                  </div>
                )}

                {product.storeLocation && (
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                    <span className="text-slate-500 text-sm">Store:</span>
                    <span className="font-semibold text-slate-800">{product.storeLocation}</span>
                  </div>
                )}

                {product.description && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="m-0 text-slate-500 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-slate-50 flex gap-3">
                <button
                  onClick={() => handleQuickUpdateStock(product.productId, product.stockQuantity)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors border-0 cursor-pointer text-sm"
                >
                  <FaBox /> Update Stock
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border-2 border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-sm"
                >
                  <FaEdit /> Edit Product
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <div className="text-6xl text-green-600 mb-5">
            <FaBox className="inline-block" />
          </div>
          <h3 className="text-2xl font-semibold m-0 mb-3 text-green-600">All Good!</h3>
          <p className="text-slate-500 text-base m-0">No products are currently running low on stock</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

export default LowStockAlert;
