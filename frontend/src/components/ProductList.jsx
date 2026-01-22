import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductForm from './ProductForm';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getAllProducts();
      setProducts(response.data.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getAllCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        showSuccessMessage('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleFormSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.productId, productData);
        showSuccessMessage('Product updated successfully');
      } else {
        await productAPI.createProduct(productData);
        showSuccessMessage('Product created successfully');
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading products...</div>;
  }

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold m-0 mb-2">Product Catalog</h2>
          <p className="text-slate-500 m-0">Manage your product inventory</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors border-0 cursor-pointer"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-4">{successMessage}</div>}

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-5">
        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[250px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Category Filter */}
          <div className="relative flex items-center">
            <FaFilter className="absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-3 py-2.5 border border-slate-200 rounded-md text-sm min-w-[200px] cursor-pointer focus:outline-none focus:border-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">ID</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Name</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Category</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Price</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Stock</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Location</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Status</th>
                  <th className="p-3 text-left bg-slate-50 font-semibold text-slate-800 border-b border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.productId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 border-b border-slate-200">#{product.productId}</td>
                    <td className="p-3 border-b border-slate-200">
                      <div className="flex flex-col gap-1">
                        <strong>{product.name}</strong>
                        {product.sku && <span className="text-xs text-slate-500">SKU: {product.sku}</span>}
                      </div>
                    </td>
                    <td className="p-3 border-b border-slate-200">
                      <span className="inline-block bg-slate-50 px-3 py-1 rounded text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-3 border-b border-slate-200 font-semibold text-blue-600">${product.price}</td>
                    <td className="p-3 border-b border-slate-200">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isLowStock 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="p-3 border-b border-slate-200 text-sm leading-tight">
                      {product.warehouseLocation && <div>WH: {product.warehouseLocation}</div>}
                      {product.storeLocation && <div>Store: {product.storeLocation}</div>}
                      {!product.warehouseLocation && !product.storeLocation && '-'}
                    </td>
                    <td className="p-3 border-b border-slate-200">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 border-b border-slate-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                          className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors border-0 cursor-pointer flex items-center justify-center"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.productId)}
                          title="Delete"
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors border-0 cursor-pointer flex items-center justify-center"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg mb-5">No products found</p>
            <button 
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors border-0 cursor-pointer"
            >
              <FaPlus /> Add Your First Product
            </button>
          </div>
        )}
      </div>

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

export default ProductList;
