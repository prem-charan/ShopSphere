import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import PaymentModal from '../components/PaymentModal';
import { productAPI } from '../services/api';
import { createOrder, getAllStoreLocations } from '../services/orderAPI';
import { loyaltyAPI } from '../services/loyaltyAPI';
import { useAuth } from '../context/AuthContext';
import { clearCart, getCart, removeFromCart, setCart, updateCartItem } from '../utils/cart';
import { FaArrowLeft, FaMinus, FaPlus, FaStore, FaMapMarkerAlt, FaGift, FaCheck, FaTimes } from 'react-icons/fa';

function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartRows, setCartRows] = useState([]); // [{ product, quantity, unitPrice, campaignId }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderType, setOrderType] = useState('ONLINE');
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [allStores, setAllStores] = useState([]);
  const [orderError, setOrderError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const subtotal = useMemo(() => {
    return cartRows.reduce((sum, row) => {
      const price = row.unitPrice != null ? row.unitPrice : row.product?.price || 0;
      return sum + price * row.quantity;
    }, 0);
  }, [cartRows]);

  const total = useMemo(() => {
    const discount = appliedDiscount ? appliedDiscount.amount : 0;
    return Math.max(0, subtotal - discount);
  }, [subtotal, appliedDiscount]);

  const fetchStores = async () => {
    try {
      const response = await getAllStoreLocations();
      setAllStores(response.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      setError('');
      const cart = getCart();

      if (cart.length === 0) {
        setCartRows([]);
        return;
      }

      const products = await Promise.all(
        cart.map(async (item) => {
          const res = await productAPI.getProductById(item.productId);
          return {
            product: res.data.data,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            campaignId: item.campaignId,
            campaignTitle: item.campaignTitle,
          };
        })
      );

      setCartRows(products.filter((p) => p.product));
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    fetchStores();
    const refresh = () => loadCart();
    window.addEventListener('cart:updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cart:updated', refresh);
      window.removeEventListener('storage', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch and apply active coupon when checkout modal opens
  useEffect(() => {
    if (showCheckoutModal && user?.userId) {
      (async () => {
        try {
          const response = await loyaltyAPI.getActiveCoupon(user.userId);
          if (response.data.hasCoupon && response.data.couponCode) {
            setDiscountCode(response.data.couponCode);
            await handleApplyDiscountAuto(response.data.couponCode);
          }
        } catch (err) {
          console.error('Error fetching active coupon:', err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckoutModal]);

  const handleApplyDiscountAuto = async (code) => {
    try {
      setDiscountValidating(true);
      setDiscountError('');
      const subtotal = calculateSubtotal();
      const response = await loyaltyAPI.validateDiscountCode(code, subtotal);
      if (response.data.valid) {
        setAppliedDiscount({ code: code, amount: response.data.discountAmount });
      } else {
        setDiscountCode('');
        setAppliedDiscount(null);
        setDiscountError(response.data.message);
      }
    } catch (err) {
      console.error('Error auto-applying discount:', err);
      setDiscountCode('');
      setAppliedDiscount(null);
      setDiscountError('Failed to validate discount code');
    } finally {
      setDiscountValidating(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    try {
      setDiscountValidating(true);
      setDiscountError('');
      const subtotal = calculateSubtotal();
      const response = await loyaltyAPI.validateDiscountCode(discountCode.trim(), subtotal);
      if (response.data.valid) {
        setAppliedDiscount({ code: discountCode.trim(), amount: response.data.discountAmount });
        setDiscountError('');
      } else {
        setDiscountError(response.data.message || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (err) {
      console.error('Error validating discount code:', err);
      setDiscountError(err.response?.data?.message || 'Failed to validate discount code. Please try again.');
      setAppliedDiscount(null);
    } finally {
      setDiscountValidating(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
    setDiscountError('');
  };

  const handleQtyChange = (productId, nextQty) => {
    updateCartItem(productId, nextQty);
    setCartRows((prev) =>
      prev.map((row) => (row.product.productId === productId ? { ...row, quantity: Math.max(1, nextQty) } : row))
    );
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    setCartRows((prev) => prev.filter((r) => r.product.productId !== productId));
  };

  const handleProceed = () => {
    if (cartRows.length === 0) return;
    setShowCheckoutModal(true);
    setOrderError('');
  };

  const handlePlaceOrder = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartRows.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    for (const row of cartRows) {
      if (row.quantity < 1) {
        setOrderError('Quantity must be at least 1');
        return;
      }
      if (typeof row.product?.stockQuantity === 'number' && row.quantity > row.product.stockQuantity) {
        setOrderError(`Insufficient stock for ${row.product.name}`);
        return;
      }
    }

    if (orderType === 'ONLINE' && !shippingAddress.trim()) {
      setOrderError('Please enter your shipping address');
      return;
    }

    if (orderType === 'IN_STORE' && !selectedStore) {
      setOrderError('Please select a store location');
      return;
    }

    const orderData = {
      customerId: user.userId,
      orderType,
      orderItems: cartRows.map((row) => ({
        productId: row.product.productId,
        quantity: row.quantity,
        unitPrice: row.unitPrice != null ? row.unitPrice : row.product.price,
      })),
      shippingAddress: orderType === 'ONLINE' ? shippingAddress : null,
      storeLocation: orderType === 'IN_STORE' ? selectedStore : null,
      campaignId: cartRows.find((r) => r.campaignId != null)?.campaignId || null,
      discountCode: appliedDiscount ? appliedDiscount.code : null,
      discountAmount: appliedDiscount ? appliedDiscount.amount : null,
    };

    setPendingOrderData(orderData);
    setShowCheckoutModal(false);
    setShowPaymentModal(true);
  };

  const handleCreateOrderWithPayment = async () => {
    const orderResponse = await createOrder(pendingOrderData);
    return orderResponse.data;
  };

  const handlePaymentSuccess = (orderId) => {
    setShowPaymentModal(false);
    setPendingOrderData(null);
    clearCart();
    navigate(`/order/${orderId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPendingOrderData(null);
    setShowCheckoutModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Continue Shopping
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Cart</h1>
            {cartRows.length > 0 && (
              <button
                onClick={() => {
                  setCart([]);
                  setCartRows([]);
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear cart
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-600">Loading cart...</div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          ) : cartRows.length === 0 ? (
            <div className="py-12 text-center text-gray-600">Your cart is empty.</div>
          ) : (
            <>
              <div className="space-y-4">
                {cartRows.map((row) => (
                  <div
                    key={row.product.productId}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{row.product.name}</div>
                      <div className="text-sm text-gray-600">
                        ₹{(row.unitPrice != null ? row.unitPrice : row.product.price).toFixed(2)}
                        {row.unitPrice != null && (
                          <span className="ml-2 text-xs text-gray-500 line-through">
                            ₹{Number(row.product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {typeof row.product.stockQuantity === 'number' && (
                        <div className="text-xs text-gray-500 mt-1">Stock: {row.product.stockQuantity}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(row.product.productId, Math.max(1, row.quantity - 1))}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                        title="Decrease"
                      >
                        <FaMinus />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleQtyChange(row.product.productId, Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 text-center border border-gray-300 rounded py-2"
                      />
                      <button
                        onClick={() => handleQtyChange(row.product.productId, row.quantity + 1)}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                        title="Increase"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <div className="w-36 text-right font-semibold text-gray-900">
                      ₹{(((row.unitPrice != null ? row.unitPrice : row.product.price) || 0) * row.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleRemove(row.product.productId)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full md:w-96 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between py-2 text-green-700">
                      <span className="font-medium">Discount ({appliedDiscount.code})</span>
                      <span className="font-semibold">- ₹{Number(appliedDiscount.amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-300">
                    <span className="text-gray-800 font-bold">Total</span>
                    <span className="font-bold text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleProceed}
                    className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Checkout Modal (similar to ProductDetail Buy Now flow) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>

            {orderError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {orderError}
              </div>
            )}

            {/* Discount Code Section */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaGift className="text-purple-600 text-lg" />
                Have a Discount Code?
              </label>

              {appliedDiscount ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">{appliedDiscount.code}</p>
                      <p className="text-sm text-green-600">₹{appliedDiscount.amount} discount applied!</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveDiscount}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Remove discount"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountError('');
                      }}
                      placeholder="Enter discount code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={discountValidating || !discountCode.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {discountValidating ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {discountError && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <FaTimes /> {discountError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Summary</h3>
              <div className="space-y-3">
                {cartRows.map((row) => (
                  <div key={row.product.productId} className="flex justify-between items-start">
                    <div className="text-gray-700 flex-1">
                      <div className="font-medium">{row.product.name}</div>
                      <div className="text-xs text-gray-500">x {row.quantity}</div>
                      {row.campaignId && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          🎯 {row.campaignTitle || 'Campaign Offer Applied'}
                          {row.unitPrice != null && row.unitPrice < row.product.price && (
                            <span className="ml-1">
                              (Save ₹{(Number(row.product.price) - Number(row.unitPrice)).toFixed(2)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {row.unitPrice != null && row.unitPrice < row.product.price ? (
                        <>
                          <div className="font-medium text-green-600">
                            ₹{(Number(row.unitPrice) * row.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 line-through">
                            ₹{(Number(row.product.price) * row.quantity).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <div className="font-medium">
                          ₹{(((row.unitPrice != null ? row.unitPrice : row.product.price) || 0) * row.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">Discount ({appliedDiscount.code})</span>
                    <span className="font-semibold">- ₹{Number(appliedDiscount.amount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOrderType('ONLINE')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    orderType === 'ONLINE' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Online</div>
                  <div className="text-xs text-gray-600">Ship to address</div>
                </button>
                <button
                  onClick={() => setOrderType('IN_STORE')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    orderType === 'IN_STORE' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
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
                  {allStores.map((store, index) => (
                    <option key={index} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setOrderError('');
                }}
                className="flex-1 px-4 py-3 bg-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                disabled={orderLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && pendingOrderData && (
        <PaymentModal
          pendingOrderData={pendingOrderData}
          onCreateOrder={handleCreateOrderWithPayment}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}

export default Cart;

