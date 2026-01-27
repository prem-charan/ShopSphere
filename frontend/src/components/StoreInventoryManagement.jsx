import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import {
  addOrUpdateStoreInventory,
  getInventoryByProduct,
  getAllStoreLocations,
  updateStoreStock,
  deleteInventory
} from '../services/orderAPI';
import { FaStore, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const StoreInventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productInventory, setProductInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState({}); // Track local edits: {inventoryId: quantity}
  const [formData, setFormData] = useState({
    productId: '',
    storeLocation: '',
    stockQuantity: 0,
    isAvailable: true
  });

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await getAllStoreLocations();
      setStores(response.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const fetchProductInventory = async (productId) => {
    try {
      setError('');
      const response = await getInventoryByProduct(productId);
      setProductInventory(response.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load product inventory');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    fetchProductInventory(product.productId);
  };

  const handleAddInventory = async () => {
    try {
      setError('');
      if (!formData.productId || !formData.storeLocation) {
        setError('Please select product and store location');
        return;
      }

      await addOrUpdateStoreInventory(formData);
      setShowAddModal(false);
      setFormData({
        productId: '',
        storeLocation: '',
        stockQuantity: 0,
        isAvailable: true
      });
      
      // Refresh both inventory and product list
      if (selectedProduct) {
        await fetchProductInventory(selectedProduct.productId);
      }
      await fetchProducts(); // ✅ Update product list to show new total stock
      
      console.log('Inventory added and product list refreshed');
    } catch (err) {
      console.error('Error adding inventory:', err);
      setError(err.response?.data?.message || 'Failed to add inventory');
    }
  };

  const handleStockChange = (inventoryId, newValue) => {
    // Update local state only (no API call yet)
    setEditingStock({ ...editingStock, [inventoryId]: newValue });
  };

  const handleStockBlur = async (inventory) => {
    const newQuantity = editingStock[inventory.inventoryId];
    
    // If no local edit or same as original, do nothing
    if (newQuantity === undefined || newQuantity === inventory.stockQuantity) {
      return;
    }

    try {
      setError('');
      await updateStoreStock(inventory.productId, inventory.storeLocation, newQuantity);
      
      // Clear local edit state for this inventory
      const updatedEdits = { ...editingStock };
      delete updatedEdits[inventory.inventoryId];
      setEditingStock(updatedEdits);
      
      // Refresh both inventory and products list to show updated total stock
      await fetchProductInventory(inventory.productId);
      await fetchProducts(); // This updates the total stock quantity display
      
      console.log('Stock updated and product list refreshed');
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock');
    }
  };

  const handleStockKeyPress = (e, inventory) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger blur to save
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm('Are you sure you want to delete this inventory record?')) {
      return;
    }

    try {
      setError('');
      await deleteInventory(inventoryId);
      if (selectedProduct) {
        fetchProductInventory(selectedProduct.productId);
      }
    } catch (err) {
      console.error('Error deleting inventory:', err);
      setError('Failed to delete inventory');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Store Inventory Management</h1>
        <button
          onClick={() => {
            setShowAddModal(true);
            setFormData({ ...formData, productId: selectedProduct?.productId || '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaPlus /> Add Store Inventory
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.productId}
                onClick={() => handleProductSelect(product)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedProduct?.productId === product.productId
                    ? 'bg-blue-100 border border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                <p className="text-sm text-gray-600">Total Stock: {product.stockQuantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Store Inventory Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {selectedProduct ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Store Inventory for: {selectedProduct.name}
              </h2>
              {productInventory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaStore className="mx-auto text-6xl mb-4 text-gray-300" />
                  <p>No store inventory records found for this product</p>
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setFormData({ ...formData, productId: selectedProduct.productId });
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Store Inventory
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Store Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Stock Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productInventory.map((inventory) => (
                        <tr key={inventory.inventoryId}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {inventory.storeLocation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={editingStock[inventory.inventoryId] !== undefined 
                                ? editingStock[inventory.inventoryId] 
                                : inventory.stockQuantity}
                              onChange={(e) => handleStockChange(inventory.inventoryId, parseInt(e.target.value) || 0)}
                              onBlur={() => handleStockBlur(inventory)}
                              onKeyPress={(e) => handleStockKeyPress(e, inventory)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                inventory.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {inventory.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteInventory(inventory.inventoryId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaStore className="mx-auto text-6xl mb-4 text-gray-300" />
              <p>Select a product to view store inventory</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Store Inventory</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name} (SKU: {product.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Location
              </label>
              <input
                type="text"
                value={formData.storeLocation}
                onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                placeholder="Enter store location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                list="store-suggestions"
              />
              <datalist id="store-suggestions">
                {stores.map((store, index) => (
                  <option key={index} value={store} />
                ))}
              </datalist>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Available for purchase</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInventory}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreInventoryManagement;
