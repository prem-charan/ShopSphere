import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import { getOrderById } from '../services/orderAPI';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/userAPI';
import { loyaltyAPI } from '../services/loyaltyAPI';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.includes('/admin/');
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null); // { name, email }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const orderResponse = await getOrderById(orderId);
        setOrder(orderResponse.data);
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

      // Customer view: we already have user name/email in AuthContext
      if (!isAdminView && user && user.userId === order.customerId) {
        setCustomer({ name: user.name, email: user.email });
        return;
      }

      // Admin view: fetch customer details
      if (isAdminView) {
        try {
          // Prefer existing admin endpoint (already used elsewhere)
          const loyaltyRes = await loyaltyAPI.getUserDetails(order.customerId);
          if (loyaltyRes?.data?.userName || loyaltyRes?.data?.userEmail) {
            setCustomer({ name: loyaltyRes.data.userName, email: loyaltyRes.data.userEmail });
            return;
          }

          // Fallback to users endpoint
          const res = await userAPI.getUserById(order.customerId);
          setCustomer({ name: res.data.name, email: res.data.email });
        } catch (err) {
          console.error('Error fetching customer details for invoice:', err);
          setCustomer(null);
        }
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
            <div className="text-right text-sm text-gray-700">
              <div>
                <span className="font-semibold">Invoice #:</span> {order.orderId}
              </div>
              <div>
                <span className="font-semibold">Order Date:</span>{' '}
                {new Date(order.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Payment:</span> {order.paymentStatus}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {order.status}
              </div>
            </div>
          </div>

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

          <div className="mt-10 text-xs text-gray-500 border-t border-gray-200 pt-4">
            This is a system-generated invoice from ShopSphere.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

