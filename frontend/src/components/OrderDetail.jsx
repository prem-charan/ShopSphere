import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrderById } from '../services/orderAPI';
import { getPaymentsByOrder } from '../services/paymentAPI';
import CustomerHeader from './CustomerHeader';
import { FaArrowLeft, FaShoppingBag, FaMapMarkerAlt, FaTruck, FaCreditCard, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if we're in admin context by checking the pathname
  const isAdminView = location.pathname.includes('/admin/');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const orderResponse = await getOrderById(orderId);
      setOrder(orderResponse.data);
      
      // Fetch payment history for this order
      try {
        const paymentResponse = await getPaymentsByOrder(orderId);
        setPayments(paymentResponse.data || []);
      } catch (paymentErr) {
        console.error('Error fetching payments:', paymentErr);
        // Don't show error for payments, just log it
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadgeClass = (status) => {
    const statusClasses = {
      PENDING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadgeClass = (status) => {
    const statusClasses = {
      INITIATED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <FaCheckCircle className="text-green-600" />;
      case 'FAILED':
        return <FaTimesCircle className="text-red-600" />;
      case 'PROCESSING':
        return <FaClock className="text-yellow-600" />;
      default:
        return <FaClock className="text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div>
        {!isAdminView && <CustomerHeader />}
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl text-gray-600">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        {!isAdminView && <CustomerHeader />}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Order not found'}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminView && <CustomerHeader />}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </button>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order #{order.orderId}</h1>
            <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start">
            <FaShoppingBag className="text-blue-600 mt-1 mr-3 text-xl" />
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <p className="font-semibold text-gray-800">{order.orderType}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaCreditCard className="text-green-600 mt-1 mr-3 text-xl" />
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentBadgeClass(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <FaTruck className="text-purple-600 mt-1 mr-3 text-xl" />
            <div>
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-semibold text-gray-800">{order.trackingNumber || 'Not available'}</p>
            </div>
          </div>
        </div>

        {order.orderType === 'ONLINE' && order.shippingAddress && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-red-600 mt-1 mr-3 text-xl" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                <p className="text-gray-800">{order.shippingAddress}</p>
              </div>
            </div>
          </div>
        )}

        {order.orderType === 'IN_STORE' && order.storeLocation && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-red-600 mt-1 mr-3 text-xl" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Store Location</p>
                <p className="text-gray-800">{order.storeLocation}</p>
              </div>
            </div>
          </div>
        )}

        {order.notes && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Order Notes</p>
            <p className="text-gray-800 whitespace-pre-line">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <tr key={item.orderItemId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    {item.storeLocation && (
                      <div className="text-xs text-gray-500">Store: {item.storeLocation}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.productSku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-300">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-lg font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment History</h2>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.paymentId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getPaymentStatusIcon(payment.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusBadgeClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">₹{payment.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="ml-2 font-semibold">{payment.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="ml-2 font-mono text-xs">{payment.transactionId}</span>
                  </div>
                </div>

                {payment.paymentMethod === 'CARD' && payment.cardLastFour && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Card:</span>
                    <span className="ml-2 font-semibold">
                      {payment.cardType} ****{payment.cardLastFour}
                    </span>
                    {payment.cardHolderName && (
                      <span className="ml-2 text-gray-600">({payment.cardHolderName})</span>
                    )}
                  </div>
                )}

                {payment.paymentMethod === 'UPI' && payment.upiId && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">UPI ID:</span>
                    <span className="ml-2 font-semibold">{payment.upiId}</span>
                  </div>
                )}

                {payment.paymentMethod === 'NET_BANKING' && payment.bankName && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Bank:</span>
                    <span className="ml-2 font-semibold">{payment.bankName}</span>
                  </div>
                )}

                {payment.status === 'FAILED' && payment.failureReason && (
                  <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-500 text-sm text-red-700">
                    <strong>Failure Reason:</strong> {payment.failureReason}
                  </div>
                )}

                {payment.notes && (
                  <div className="mt-2 text-xs text-gray-600 whitespace-pre-line">
                    {payment.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OrderDetail;
