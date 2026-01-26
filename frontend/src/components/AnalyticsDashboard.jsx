import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/analyticsAPI';
import { 
  FaChartLine, FaShoppingCart, FaUsers, FaRupeeSign, FaSpinner,
  FaTrophy, FaBox, FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await analyticsAPI.getSalesAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value) => {
    const num = parseFloat(value || 0);
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-5xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sales Analytics</h2>
        <p className="text-gray-600">Comprehensive insights into your business performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatCurrency(analytics?.totalRevenue)}
              </h3>
              <p className={`text-sm mt-2 flex items-center gap-1 ${
                analytics?.revenueGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics?.revenueGrowthPercentage >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {formatPercent(analytics?.revenueGrowthPercentage)} vs last month
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <FaRupeeSign className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {analytics?.totalOrders || 0}
              </h3>
              <p className={`text-sm mt-2 flex items-center gap-1 ${
                analytics?.orderGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics?.orderGrowthPercentage >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {formatPercent(analytics?.orderGrowthPercentage)} vs last month
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <FaShoppingCart className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatCurrency(analytics?.averageOrderValue)}
              </h3>
              <p className="text-sm text-gray-500 mt-2">Per transaction</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-full">
              <FaChartLine className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {analytics?.totalCustomers || 0}
              </h3>
              <p className="text-sm text-gray-500 mt-2">Registered users</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-full">
              <FaUsers className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <h4 className="text-sm font-semibold mb-4 opacity-90">Today's Performance</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs opacity-75">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics?.revenueToday)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Orders</p>
              <p className="text-xl font-semibold">{analytics?.ordersToday || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
          <h4 className="text-sm font-semibold mb-4 opacity-90">This Week</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs opacity-75">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics?.revenueThisWeek)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Orders</p>
              <p className="text-xl font-semibold">{analytics?.ordersThisWeek || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <h4 className="text-sm font-semibold mb-4 opacity-90">This Month</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs opacity-75">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics?.revenueThisMonth)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Orders</p>
              <p className="text-xl font-semibold">{analytics?.ordersThisMonth || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartLine className="text-indigo-600" />
            Daily Sales (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics?.dailySales && analytics.dailySales.length > 0 ? (
              analytics.dailySales.map((day, index) => {
                const maxRevenue = Math.max(...analytics.dailySales.map(d => parseFloat(d.revenue)));
                const widthPercent = maxRevenue > 0 ? (parseFloat(day.revenue) / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{day.date}</span>
                      <span className="text-gray-800 font-semibold">
                        {formatCurrency(day.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{day.orderCount} orders</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data available</p>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Order Status Distribution</h3>
          <div className="space-y-4">
            {analytics?.statusDistribution && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">Confirmed</span>
                  </div>
                  <span className="font-bold text-gray-800">{analytics.statusDistribution.confirmed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">Shipped</span>
                  </div>
                  <span className="font-bold text-gray-800">{analytics.statusDistribution.shipped || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Delivered</span>
                  </div>
                  <span className="font-bold text-gray-800">{analytics.statusDistribution.delivered || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-700">Cancelled</span>
                  </div>
                  <span className="font-bold text-gray-800">{analytics.statusDistribution.cancelled || 0}</span>
                </div>
              </>
            )}
          </div>

          {/* Visual pie-like representation */}
          {analytics?.statusDistribution && (
            <div className="mt-6">
              <div className="flex h-4 rounded-full overflow-hidden">
                {analytics.statusDistribution.confirmed > 0 && (
                  <div 
                    className="bg-blue-500" 
                    style={{ 
                      width: `${(analytics.statusDistribution.confirmed / (analytics.totalOrders || 1)) * 100}%` 
                    }}
                  ></div>
                )}
                {analytics.statusDistribution.shipped > 0 && (
                  <div 
                    className="bg-purple-500" 
                    style={{ 
                      width: `${(analytics.statusDistribution.shipped / (analytics.totalOrders || 1)) * 100}%` 
                    }}
                  ></div>
                )}
                {analytics.statusDistribution.delivered > 0 && (
                  <div 
                    className="bg-green-500" 
                    style={{ 
                      width: `${(analytics.statusDistribution.delivered / (analytics.totalOrders || 1)) * 100}%` 
                    }}
                  ></div>
                )}
                {analytics.statusDistribution.cancelled > 0 && (
                  <div 
                    className="bg-red-500" 
                    style={{ 
                      width: `${(analytics.statusDistribution.cancelled / (analytics.totalOrders || 1)) * 100}%` 
                    }}
                  ></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Top Selling Products (Last 30 Days)
          </h3>
          <div className="space-y-3">
            {analytics?.topSellingProducts && analytics.topSellingProducts.length > 0 ? (
              analytics.topSellingProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{product.productName}</p>
                      <p className="text-xs text-gray-500">SKU: {product.productSku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{product.totalQuantitySold} sold</p>
                    <p className="text-sm text-gray-600">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No product sales data</p>
            )}
          </div>
        </div>

        {/* Category Sales */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaBox className="text-indigo-600" />
            Sales by Category
          </h3>
          <div className="space-y-3">
            {analytics?.categorySales && analytics.categorySales.length > 0 ? (
              analytics.categorySales.map((category, index) => {
                const maxRevenue = Math.max(...analytics.categorySales.map(c => parseFloat(c.revenue)));
                const widthPercent = maxRevenue > 0 ? (parseFloat(category.revenue) / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">{category.category}</span>
                      <span className="text-sm text-gray-600">{category.productCount} products</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(category.revenue)}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No category data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
