import { useState } from 'react';
import { initiatePayment, processPayment } from '../services/paymentAPI';
import { FaMobile, FaMoneyBillWave, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentModal = ({ pendingOrderData, onCreateOrder, onSuccess, onCancel }) => {
  const [step, setStep] = useState('method'); // method, details, otp, processing, success, failed
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total amount from pending order data
  const calculateTotal = () => {
    if (!pendingOrderData) return 0;
    
    let subtotal = 0;
    pendingOrderData.orderItems.forEach(item => {
      subtotal += item.unitPrice * item.quantity;
    });
    
    // Apply discount if present
    if (pendingOrderData.discountAmount) {
      subtotal -= pendingOrderData.discountAmount;
    }
    
    return Math.max(0, subtotal); // Ensure non-negative
  };

  const totalAmount = calculateTotal();
  
  // Debug logging
  console.log('=== PAYMENT MODAL RECEIVED ===');
  console.log('Pending order data:', pendingOrderData);
  console.log('Calculated total amount:', totalAmount);
  console.log('Discount code:', pendingOrderData?.discountCode);
  console.log('Discount amount:', pendingOrderData?.discountAmount);

  const paymentMethods = [
    { id: 'UPI', name: 'UPI Payment', icon: FaMobile, color: 'purple', description: 'Pay using Google Pay, PhonePe, Paytm, etc.' },
    { id: 'COD', name: 'Cash on Delivery', icon: FaMoneyBillWave, color: 'green', description: 'Pay cash when your order is delivered' },
  ];

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
    setError('');
    if (method === 'COD') {
      // COD doesn't need additional details
      handleInitiatePayment(method);
    } else {
      setStep('details');
    }
  };

  const handleInitiatePayment = async (method = paymentMethod) => {
    setIsProcessing(true);
    setError('');
    setStep('processing');

    try {
      console.log('=== CREATING ORDER FIRST ===');
      // Step 1: Create the order first
      const order = await onCreateOrder(method, { upiId: method === 'UPI' ? upiId : null });
      setCreatedOrder(order);
      
      console.log('=== ORDER CREATED, NOW INITIATING PAYMENT ===');
      console.log('Created order:', order);
      
      // Step 2: Initiate payment with the created order
      const paymentRequestData = {
        orderId: order.orderId,
        customerId: order.customerId,
        amount: order.totalAmount,
        paymentMethod: method,
        upiId: method === 'UPI' ? upiId : null,
      };

      const response = await initiatePayment(paymentRequestData);
      setPaymentId(response.data.paymentId);
      setPaymentData(response.data);

      if (method === 'COD') {
        // COD is automatically successful
        setStep('success');
        setTimeout(() => {
          onSuccess(order.orderId);
        }, 2000);
      } else {
        setStep('otp');
      }
    } catch (err) {
      console.error('Error creating order or initiating payment:', err);
      setError(err.response?.data?.message || 'Failed to process order. Please try again.');
      setStep('method'); // Go back to method selection
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      const response = await processPayment(paymentId, otp);
      setPaymentData(response.data);

      if (response.data.status === 'SUCCESS') {
        setStep('success');
        setTimeout(() => {
          onSuccess(createdOrder.orderId);
        }, 2000);
      } else {
        setStep('failed');
        setError(response.data.failureReason || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setStep('failed');
      setError(err.response?.data?.message || 'Payment verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setStep('method');
    setPaymentMethod('');
    setUpiId('');
    setOtp('');
    setPaymentId(null);
    setPaymentData(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              {createdOrder ? (
                <p className="text-indigo-100 mt-1">Order #{createdOrder.orderId}</p>
              ) : (
                <p className="text-indigo-100 mt-1">Preparing your order...</p>
              )}
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              disabled={isProcessing}
            >
              <FaTimes size={24} />
            </button>
          </div>
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
            <p className="text-sm text-indigo-100">Amount to Pay</p>
            <p className="text-3xl font-bold">₹{totalAmount.toFixed(2)}</p>
            {pendingOrderData?.discountCode && pendingOrderData?.discountAmount && (
              <div className="mt-2 text-xs text-green-200 flex items-center gap-2">
                <span className="bg-green-500 bg-opacity-30 px-2 py-1 rounded">
                  {pendingOrderData.discountCode}
                </span>
                <span>Saved ₹{parseFloat(pendingOrderData.discountAmount).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Select Payment Method */}
          {step === 'method' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h3>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full p-4 border-2 rounded-lg hover:shadow-lg transition flex items-center space-x-4
                      ${paymentMethod === method.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    <div className={`p-3 rounded-full bg-${method.color}-100`}>
                      <Icon className={`text-${method.color}-600 text-2xl`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </button>
                );
              })}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Enter UPI ID */}
          {step === 'details' && paymentMethod === 'UPI' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-purple-100 rounded-full mb-3">
                  <FaMobile className="text-purple-600 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Enter UPI ID</h3>
                <p className="text-gray-600 text-sm mt-2">Enter your UPI ID to proceed with payment</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@paytm / yourname@okaxis"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Example: 9876543210@paytm</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={() => handleInitiatePayment()}
                  disabled={!upiId || isProcessing}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition"
                >
                  {isProcessing ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Enter OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-3">
                  <FaMobile className="text-blue-600 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Verify OTP</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Enter the OTP sent to your registered mobile number
                </p>
                <p className="text-xs text-gray-500 mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                  💡 Test OTP: <strong>123456</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isProcessing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition"
                >
                  Verify & Pay
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800">Processing Payment...</h3>
              <p className="text-gray-600 mt-2">Please wait while we process your payment</p>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="text-green-600 text-6xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
              <p className="text-gray-600 mt-2">Your payment has been processed successfully</p>
              {paymentData && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-800">{paymentData.transactionId}</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">Redirecting to order details...</p>
            </div>
          )}

          {/* Step 6: Failed */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                <FaTimesCircle className="text-red-600 text-6xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Payment Failed</h3>
              <p className="text-gray-600 mt-2">{error || 'Something went wrong with your payment'}</p>
              {paymentData?.transactionId && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-800">{paymentData.transactionId}</p>
                </div>
              )}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
