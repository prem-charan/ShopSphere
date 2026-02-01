import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersByCustomer, cancelOrder } from '../services/orderAPI';
import { useAuth } from '../context/AuthContext';
import CustomerHeader from './CustomerHeader';
import { FaShoppingBag, FaTruck, FaCheckCircle, FaTimes, FaTag, FaEye } from 'react-icons/fa';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (user && user.userId) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrdersByCustomer(user.userId);
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      await cancelOrder(orderId);
      
      // Update the order status locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, status: 'CANCELLED' }
            : order
        )
      );
      
      // Show success message
      alert('Order cancelled successfully. If payment was made, refund will be processed in 3-5 business days.');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (order) => {
    return order.status === 'CONFIRMED' || order.status === 'SHIPPED';
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <FaShoppingBag className="text-blue-600" />;
      case 'SHIPPED':
        return <FaTruck className="text-purple-600" />;
      case 'DELIVERED':
        return <FaCheckCircle className="text-green-600" />;
      case 'CANCELLED':
        return <FaTimes className="text-red-600" />;
      default:
        return <FaShoppingBag className="text-gray-600" />;
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

  const getStatusDescription = (status) => {
    const descriptions = {
      CONFIRMED: 'Your order has been confirmed and will be shipped soon.',
      SHIPPED: 'Your order is on its way!',
      DELIVERED: 'Your order has been delivered.',
      CANCELLED: 'This order has been cancelled.',
    };
    return descriptions[status] || 'Order status unknown';
  };

  const getOrderTitle = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      return 'Order';
    }

    const firstItem = order.orderItems[0].productName;
    const remainingCount = order.orderItems.length - 1;

    if (remainingCount === 0) {
      return firstItem;
    } else {
      return `${firstItem} + ${remainingCount} more`;
    }
  };

  if (loading) {
    return (
      <div>
        <CustomerHeader />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl text-gray-600">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FaShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders found</h2>
          <p className="text-gray-500 mb-6">
            {filter === 'ALL' 
              ? "You haven't placed any orders yet." 
              : `You don't have any ${filter.toLowerCase()} orders.`}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {getOrderTitle(order)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                    {order.discountAmount && (
                      <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                        <FaTag /> Saved ₹{parseFloat(order.discountAmount).toFixed(2)}
                      </p>
                    )}
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">{getStatusDescription(order.status)}</p>
                  {order.trackingNumber && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Tracking:</span> {order.trackingNumber}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{order.orderItems.length}</span> item(s) • {' '}
                      <span className="font-semibold">{order.orderType}</span> order
                      {order.orderType === 'IN_STORE' && order.storeLocation && (
                        <span> • {order.storeLocation}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          disabled={cancellingOrderId === order.orderId}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <FaTimes className="mr-2" />
                          {cancellingOrderId === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/order/${order.orderId}`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaEye className="mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyOrders;
