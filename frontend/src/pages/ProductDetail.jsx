import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { createOrder, getStoresWithProduct, checkProductAvailability, getAllStoreLocations } from '../services/orderAPI';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import CustomerHeader from '../components/CustomerHeader';
import { FaArrowLeft, FaBox, FaWarehouse, FaStore, FaTag, FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('ONLINE');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [availableStores, setAvailableStores] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchStores();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(id);
      setProduct(response.data.data);
      // Fetch stores where this product is available
      const storesResponse = await getStoresWithProduct(id);
      setAvailableStores(storesResponse.data || []);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await getAllStoreLocations();
      setAllStores(response.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
    setOrderError('');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation
    if (quantity < 1) {
      setOrderError('Quantity must be at least 1');
      return;
    }

    if (quantity > product.stockQuantity) {
      setOrderError('Insufficient stock available');
      return;
    }

    if (orderType === 'ONLINE' && !shippingAddress.trim()) {
      setOrderError('Please enter your shipping address');
      return;
    }

    if (orderType === 'IN_STORE' && !selectedStore) {
      setOrderError('Please select a store location');
      return;
    }

    try {
      setOrderLoading(true);
      setOrderError('');

      const orderData = {
        customerId: user.userId,
        orderType: orderType,
        orderItems: [{
          productId: product.productId,
          quantity: quantity,
          unitPrice: product.price
        }],
        shippingAddress: orderType === 'ONLINE' ? shippingAddress : null,
        storeLocation: orderType === 'IN_STORE' ? selectedStore : null,
        notes: ''
      };

      const response = await createOrder(orderData);
      
      // Order created successfully, now show payment modal
      setCreatedOrder(response.data);
      setShowCheckoutModal(false);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Error placing order:', err);
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    // Navigate to order details after successful payment
    navigate(`/order/${createdOrder.orderId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    // Order is created but payment pending, navigate to order details
    navigate(`/order/${createdOrder.orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <CustomerHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Products
        </button>

        {/* Product Detail */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Image Section */}
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaBox className="text-9xl text-gray-300" />
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-5xl font-bold text-blue-600">
                  ₹{product.price}
                </p>
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                  product.isLowStock
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {product.stockQuantity} Available
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-4 mb-8">
                {product.sku && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaTag className="text-blue-600" />
                    <span><strong>SKU:</strong> {product.sku}</span>
                  </div>
                )}
                {product.warehouseLocation && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaWarehouse className="text-blue-600" />
                    <span><strong>Warehouse:</strong> {product.warehouseLocation}</span>
                  </div>
                )}
                {product.storeLocation && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaStore className="text-blue-600" />
                    <span><strong>Store:</strong> {product.storeLocation}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                    min="1"
                    max={product.stockQuantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">
                    (Max: {product.stockQuantity})
                  </span>
                </div>
              </div>

              {/* Store Availability */}
              {availableStores.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Available at stores:</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableStores.map((store, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {store}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockQuantity === 0}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>

              {/* Stock Warning */}
              {product.isLowStock && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm font-medium">
                    ⚠️ Hurry! Only {product.stockQuantity} items left in stock
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600">On orders over ₹500</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-600">100% secure transactions</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-3xl mb-2">↩️</div>
            <h3 className="font-semibold mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600">30-day return policy</p>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>

              {orderError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {orderError}
                </div>
              )}

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span>{product.name}</span>
                  <span>₹{product.price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Quantity</span>
                  <span>x {quantity}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Order Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType('ONLINE')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      orderType === 'ONLINE'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FaShoppingCart className={`text-2xl mx-auto mb-2 ${
                      orderType === 'ONLINE' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="font-medium">Online</div>
                    <div className="text-xs text-gray-600">Ship to address</div>
                  </button>
                  <button
                    onClick={() => setOrderType('IN_STORE')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      orderType === 'IN_STORE'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FaStore className={`text-2xl mx-auto mb-2 ${
                      orderType === 'IN_STORE' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="font-medium">In-Store</div>
                    <div className="text-xs text-gray-600">Pick up from store</div>
                  </button>
                </div>
              </div>

              {/* Conditional Fields */}
              {orderType === 'ONLINE' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-1" />
                    Shipping Address *
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter your complete shipping address"
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaStore className="inline mr-1" />
                    Select Store *
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a store</option>
                    {availableStores.length > 0 ? (
                      availableStores.map((store, index) => (
                        <option key={index} value={store}>
                          {store} (Available)
                        </option>
                      ))
                    ) : (
                      allStores.map((store, index) => (
                        <option key={index} value={store}>
                          {store}
                        </option>
                      ))
                    )}
                  </select>
                  {availableStores.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ This product is available at the selected stores
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setOrderError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  disabled={orderLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && createdOrder && (
        <PaymentModal
          order={createdOrder}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
      </div>
    </div>
  );
}

export default ProductDetail;
