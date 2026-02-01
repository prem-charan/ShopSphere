import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loyaltyAPI } from '../services/loyaltyAPI';
import CustomerHeader from '../components/CustomerHeader';
import RewardSuccessModal from '../components/RewardSuccessModal';
import { FaGift, FaCoins, FaTrophy, FaHistory, FaSpinner } from 'react-icons/fa';

const LoyaltyPage = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rewardDetails, setRewardDetails] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  // Hardcoded rewards
  const rewards = [
    { id: 1, name: '₹50 Off', points: 500, discount: 50, description: 'Save ₹50 on your next purchase' },
    { id: 2, name: '₹150 Off', points: 1500, discount: 150, description: 'Save ₹150 on your next purchase' },
    { id: 3, name: '₹500 Off', points: 5000, discount: 500, description: 'Save ₹500 on your next purchase' },
  ];

  useEffect(() => {
    if (user && user.userId) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await loyaltyAPI.getAccount(user.userId);
      setLoyaltyData(response.data);
    } catch (err) {
      console.error('Error fetching loyalty data:', err);

      // Check if it's a new user account creation issue
      const errorMessage = err.response?.data?.message || '';
      const isNewUserError = errorMessage.includes('insert into loyalty_accounts') ||
                            errorMessage.includes('Connection is read-only');

      // For new users or non-critical errors, set default data
      if (isNewUserError || err.response?.status === 404 || (err.response?.status >= 400 && err.response?.status < 500)) {
        setLoyaltyData({ pointsBalance: 0, totalEarned: 0, recentTransactions: [] });
      } else if (!err.response) {
        // Only show error for network failures
        setError('Failed to load loyalty information. Please try again.');
      } else {
        // Set default data for other errors too
        setLoyaltyData({ pointsBalance: 0, totalEarned: 0, recentTransactions: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!loyaltyData || loyaltyData.pointsBalance < reward.points) {
      return;
    }

    if (!window.confirm(`Claim ${reward.name} for ${reward.points} points?`)) {
      return;
    }

    try {
      setRedeeming(true);
      const redeemData = {
        userId: user.userId,
        points: reward.points,
        rewardName: reward.name,
      };

      const response = await loyaltyAPI.redeemReward(redeemData);
      
      if (response.data.success) {
        setRewardDetails({
          name: reward.name,
          code: response.data.discountCode,
          points: reward.points,
        });
        setShowSuccessModal(true);
        // Refresh loyalty data
        await fetchLoyaltyData();
      }
    } catch (err) {
      console.error('Error redeeming reward:', err);
      alert(err.response?.data?.message || 'Failed to claim reward. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Loyalty Rewards</h1>
          <p className="text-gray-600">Earn points with every purchase and redeem for exciting rewards!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-2">Your Points Balance</p>
              <h2 className="text-5xl font-bold flex items-center gap-3">
                <FaCoins className="text-yellow-300" />
                {loyaltyData?.pointsBalance || 0}
              </h2>
              <p className="text-blue-100 mt-4">Total Earned: {loyaltyData?.totalEarned || 0} points</p>
            </div>
            <div className="hidden md:block">
              <FaTrophy className="text-yellow-300 text-8xl opacity-20" />
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How it works:</h3>
          <p className="text-blue-800 text-sm">
            Earn <strong>1 point</strong> for every <strong>₹100</strong> you spend. 
            Points are automatically added when your order is confirmed. 
            Redeem points for discount codes and use them on your next purchase!
          </p>
        </div>

        {/* Available Rewards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaGift className="text-purple-600" />
            Available Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = loyaltyData && loyaltyData.pointsBalance >= reward.points;
              return (
                <div
                  key={reward.id}
                  className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                    canAfford ? 'border-green-300 hover:shadow-lg' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="inline-block p-4 bg-purple-100 rounded-full mb-3">
                      <FaGift className="text-purple-600 text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{reward.name}</h3>
                    <p className="text-gray-600 text-sm mt-2">{reward.description}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 text-center">Required Points</p>
                    <p className="text-3xl font-bold text-center text-purple-600">
                      {reward.points}
                    </p>
                  </div>

                  <button
                    onClick={() => handleClaimReward(reward)}
                    disabled={!canAfford || redeeming}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      canAfford && !redeeming
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming ? 'Processing...' : canAfford ? 'Claim Reward' : 'Not Enough Points'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            Transaction History
          </h2>

          {loyaltyData?.recentTransactions && loyaltyData.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Points</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyData.recentTransactions.map((transaction) => (
                    <tr key={transaction.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.displayType === 'EARNED'
                              ? 'bg-green-100 text-green-800'
                              : transaction.displayType === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.displayType || transaction.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
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
            <p className="text-center text-gray-500 py-8">
              No transactions yet. Start shopping to earn points!
            </p>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && rewardDetails && (
        <RewardSuccessModal
          reward={rewardDetails}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default LoyaltyPage;
