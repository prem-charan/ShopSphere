import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import { getOrderById } from '../services/orderAPI';
import { getPaymentsByOrder } from '../services/paymentAPI';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/userAPI';
import { loyaltyAPI } from '../services/loyaltyAPI';
import { FaArrowLeft, FaFilePdf, FaTimesCircle } from 'react-icons/fa';

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.includes('/admin/');
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null); // { name, email, phone }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const orderResponse = await getOrderById(orderId);
        const fetchedOrder = orderResponse.data;

        if (fetchedOrder?.status !== 'DELIVERED') {
          setError('Invoice will be available once your order is delivered.');
          setOrder(null);
          return;
        }

        setOrder(fetchedOrder);

        // Fetch payment details
        try {
          const paymentResponse = await getPaymentsByOrder(orderId);
          setPayments(paymentResponse.data || []);
        } catch (paymentErr) {
          console.error('Error fetching payments:', paymentErr);
          // Don't show error for payments, just log it
        }
      } catch (err) {
        console.error('Error fetching order for invoice:', err);
        setError('Failed to load invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!order?.customerId) return;

      try {
        // Customer viewing their own invoice - use profile endpoint
        if (!isAdminView && user && user.userId === order.customerId) {
          const res = await userAPI.getProfile();
          setCustomer({
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone
          });
        }
        // Admin viewing invoice - fetch from loyalty API or users endpoint
        else if (isAdminView) {
          try {
            const loyaltyRes = await loyaltyAPI.getUserDetails(order.customerId);
            if (loyaltyRes?.data?.userName) {
              setCustomer({
                name: loyaltyRes.data.userName,
                email: loyaltyRes.data.userEmail,
                phone: loyaltyRes.data.userPhone
              });
            } else {
              // Fallback
              setCustomer({ name: 'Customer', email: '—', phone: '—' });
            }
          } catch (err) {
            console.error('Error fetching customer for admin:', err);
            setCustomer({ name: 'Customer', email: '—', phone: '—' });
          }
        }
      } catch (err) {
        console.error('Error fetching customer details for invoice:', err);
        setCustomer({ name: user?.name || 'Customer', email: user?.email || '—', phone: '—' });
      }
    };

    loadCustomer();
  }, [order, isAdminView, user]);

  const subtotal = useMemo(() => {
    if (!order?.orderItems?.length) return 0;
    return order.orderItems.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
  }, [order]);

  const discount = useMemo(() => {
    if (!order?.discountAmount) return 0;
    return Number(order.discountAmount) || 0;
  }, [order]);

  const total = useMemo(() => Number(order?.totalAmount || 0), [order]);

  const getEffectiveOrderPaymentStatus = (orderObj) => {
    const method = orderObj?.paymentMethod || payments?.[0]?.paymentMethod;
    if (method === 'COD' && orderObj?.status !== 'DELIVERED') return 'PENDING';
    return orderObj?.paymentStatus;
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      // Order statuses
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      // Payment statuses
      PENDING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const handlePrintToPdf = () => {
    // Browser "Save as PDF" via print dialog
    window.print();
  };

  if (loading) {
    return (
      <div>
        {!isAdminView && <CustomerHeader />}
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl text-gray-600">Loading invoice...</div>
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
            {error || 'Invoice not found'}
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="no-print flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <button
            onClick={handlePrintToPdf}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <FaFilePdf />
            Download PDF
          </button>
        </div>

        <div className="print-invoice bg-white rounded-lg shadow-sm p-8 print:shadow-none print:p-0">
          <div className="flex justify-between items-start gap-6 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
              <p className="text-sm text-gray-600 mt-1">ShopSphere</p>
            </div>
            <div className="text-left text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Order ID:</span>
                <span>{order.orderId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Payment:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation and Refund Information */}
          {order.status === 'CANCELLED' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <FaTimesCircle className="text-red-600 mt-1 mr-3 text-xl" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800 mb-2">Order Cancelled</p>
                  <p className="text-sm text-red-700 mb-2">This order has been cancelled.</p>
                  
                  {/* Refund Information */}
                  {getEffectiveOrderPaymentStatus(order) === 'COMPLETED' && (
                    <div className="mt-3 p-3 bg-white border border-red-300 rounded">
                      <p className="text-sm font-semibold text-green-800 mb-1">Refund Status</p>
                      <p className="text-xs text-green-700">
                        Your refund of ₹{order.totalAmount.toFixed(2)} will be processed within 3-5 business days.
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Refund will be credited to your original payment method.
                      </p>
                    </div>
                  )}
                  
                  {getEffectiveOrderPaymentStatus(order) === 'PENDING' && (
                    <div className="mt-3 p-3 bg-white border border-orange-300 rounded">
                      <p className="text-sm font-semibold text-orange-800 mb-1">No Refund Required</p>
                      <p className="text-xs text-orange-700">
                        Payment was not completed, so no refund is applicable.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="text-sm">
              <h2 className="font-semibold text-gray-900 mb-2">Billed To</h2>
              <div className="text-gray-700">
                <div>
                  <span className="font-medium">Name:</span> {customer?.name || '—'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {customer?.email || '—'}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {customer?.phone || '—'}
                </div>
                <div>
                  <span className="font-medium">Customer ID:</span> {order.customerId}
                </div>
              </div>
            </div>

            <div className="text-sm">
              <h2 className="font-semibold text-gray-900 mb-2">
                {order.orderType === 'ONLINE' ? 'Shipping' : 'Pickup'}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {order.orderType === 'ONLINE'
                  ? (order.shippingAddress || '—')
                  : (order.storeLocation || '—')}
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderItems?.map((item) => (
                  <tr key={item.orderItemId}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.productSku || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ₹{Number(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      ₹{Number(item.subtotal ?? (item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full md:w-80 text-sm">
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {order.discountCode && discount > 0 && (
                <div className="flex justify-between py-2 text-green-700">
                  <span className="font-medium">Discount ({order.discountCode})</span>
                  <span className="font-semibold">- ₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-gray-300">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-blue-600 font-bold">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {payments.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-4">
                {payments.map((payment) => {
                  const isCod = payment.paymentMethod === 'COD';
                  const status = isCod && order?.status !== 'DELIVERED' ? 'PENDING' : payment.status;
                  const showTxn = !!payment.transactionId && (!isCod || order?.status === 'DELIVERED');

                  return (
                    <div key={payment.paymentId} className="border border-gray-200 rounded-lg p-4 text-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'SUCCESS' || status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">₹{payment.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="ml-2 font-semibold">{payment.paymentMethod}</span>
                        </div>
                        {showTxn && (
                          <div>
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="ml-2 font-mono text-xs">{payment.transactionId}</span>
                          </div>
                        )}
                        {payment.paymentMethod === 'UPI' && payment.upiId && (
                          <div>
                            <span className="text-gray-600">UPI ID:</span>
                            <span className="ml-2 font-semibold">{payment.upiId}</span>
                          </div>
                        )}
                      </div>

                      {payment.status === 'FAILED' && payment.failureReason && (
                        <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-500 text-xs text-red-700">
                          <strong>Failure Reason:</strong> {payment.failureReason}
                        </div>
                      )}

                      {payment.notes && (
                        <div className="mt-2 text-xs text-gray-600 whitespace-pre-line">
                          {payment.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 text-xs text-gray-500 border-t border-gray-200 pt-4">
            This is a system-generated invoice from ShopSphere.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

