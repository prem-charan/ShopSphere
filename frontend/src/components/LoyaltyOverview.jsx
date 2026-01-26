import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loyaltyAPI } from '../services/loyaltyAPI';
import { FaUsers, FaCoins, FaEye, FaSearch, FaSpinner } from 'react-icons/fa';

const LoyaltyOverview = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [accountsResponse, statsResponse] = await Promise.all([
        loyaltyAPI.getAllAccounts(),
        loyaltyAPI.getStats(),
      ]);

      setAccounts(accountsResponse.data || []);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error fetching loyalty data:', err);
      setError('Failed to load loyalty data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.userName.toLowerCase().includes(searchLower) ||
      account.userEmail.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Loyalty Program Overview</h2>
        <p className="text-gray-600">Manage and monitor customer loyalty accounts</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Members</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalMembers || 0}</h3>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <FaUsers className="text-blue-600 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Points in Circulation</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalPoints || 0}</h3>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <FaCoins className="text-purple-600 text-3xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loyalty Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Points Balance</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Total Earned</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <tr key={account.loyaltyAccountId} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">
                      {account.userName}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {account.userEmail}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-right text-purple-600">
                      {account.pointsBalance}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600">
                      {account.totalEarned}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/admin/loyalty/${account.userId}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                      >
                        <FaEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    {searchTerm ? 'No customers found matching your search.' : 'No loyalty accounts yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyOverview;
