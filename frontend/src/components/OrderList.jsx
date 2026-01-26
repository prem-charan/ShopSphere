import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus, getOrdersByStatus } from '../services/orderAPI';
import { FaEye, FaShippingFast, FaCheckCircle, FaTimes, FaFilter, FaTag } from 'react-icons/fa';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', trackingNumber: '', notes: '' });

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      
      if (selectedStatus === 'ALL') {
        response = await getAllOrders();
      } else {
        response = await getOrdersByStatus(selectedStatus);
      }
      
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setError('');
      console.log('=== UPDATING ORDER STATUS ===');
      console.log('Order ID:', selectedOrder.orderId);
      console.log('Update data:', updateData);
      
      const response = await updateOrderStatus(selectedOrder.orderId, updateData);
      
      console.log('=== UPDATE RESPONSE ===');
      console.log('Updated order:', response.data);
      console.log('Tracking number after update:', response.data.trackingNumber);
      
      setShowUpdateModal(false);
      setUpdateData({ status: '', trackingNumber: '', notes: '' });
      
      // Refresh orders list
      await fetchOrders();
      console.log('Orders list refreshed');
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setUpdateData({ status: order.status, trackingNumber: order.trackingNumber || '', notes: '' });
    setShowUpdateModal(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Orders</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      <div>
                        ₹{order.totalAmount.toFixed(2)}
                        {order.discountAmount && (
                          <span className="ml-2 text-xs text-green-600 flex items-center gap-1">
                            <FaTag className="inline" /> -₹{parseFloat(order.discountAmount).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.trackingNumber ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="View Details"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => openUpdateModal(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Update Status"
                      >
                        <FaShippingFast className="inline mr-1" />
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Update Order Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID: #{selectedOrder?.orderId}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: <span className={`px-2 py-1 rounded ${getStatusBadgeClass(selectedOrder?.status)}`}>
                  {selectedOrder?.status}
                </span>
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            {updateData.status === 'SHIPPED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    (Optional - Auto-generated if empty and status is SHIPPED)
                  </span>
                </label>
                <input
                  type="text"
                  value={updateData.trackingNumber}
                  onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for auto-generation (e.g., TRACK-ONL-XX-...)"
                />
                {updateData.status === 'SHIPPED' && !updateData.trackingNumber && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Tracking number will be automatically generated
                  </p>
                )}
                {updateData.trackingNumber && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✓ Using custom tracking number: {updateData.trackingNumber}
                  </p>
                )}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add any notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateData({ status: '', trackingNumber: '', notes: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!updateData.status}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
