import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loyaltyAPI } from '../services/loyaltyAPI';
import { FaArrowLeft, FaUser, FaCoins, FaTrophy, FaSpinner } from 'react-icons/fa';

const CustomerLoyaltyDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoyaltyDetails();
  }, [userId]);

  const fetchLoyaltyDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await loyaltyAPI.getUserDetails(userId);
      setLoyaltyData(response.data);
    } catch (err) {
      console.error('Error fetching loyalty details:', err);
      setError('Failed to load customer loyalty details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error || !loyaltyData) {
    return (
      <div className="animate-fadeIn">
        <button
          onClick={() => navigate('/admin/loyalty')}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Back to Loyalty Overview
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Customer loyalty data not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/loyalty')}
        className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition"
      >
        <FaArrowLeft className="mr-2" />
        Back to Loyalty Overview
      </button>

      {/* Customer Info Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 rounded-full">
            <FaUser className="text-indigo-600 text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{loyaltyData.userName}</h1>
            <p className="text-gray-600">{loyaltyData.userEmail}</p>
            <p className="text-sm text-gray-500 mt-1">User ID: {loyaltyData.userId}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Points Balance</h3>
            <FaCoins className="text-3xl opacity-80" />
          </div>
          <p className="text-5xl font-bold">{loyaltyData.pointsBalance}</p>
          <p className="text-purple-200 mt-2 text-sm">Available for redemption</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Points Earned</h3>
            <FaTrophy className="text-3xl opacity-80" />
          </div>
          <p className="text-5xl font-bold">{loyaltyData.totalEarned}</p>
          <p className="text-blue-200 mt-2 text-sm">All-time earnings</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>

        {loyaltyData.recentTransactions && loyaltyData.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Points</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loyaltyData.recentTransactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'EARNED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold text-sm ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.orderId ? `#${transaction.orderId}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaCoins className="text-5xl mx-auto mb-4 opacity-30" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p><strong>Account Created:</strong> {new Date(loyaltyData.createdAt).toLocaleDateString('en-IN')}</p>
        <p className="mt-1"><strong>Last Updated:</strong> {new Date(loyaltyData.updatedAt).toLocaleDateString('en-IN')}</p>
      </div>
    </div>
  );
};

export default CustomerLoyaltyDetail;
