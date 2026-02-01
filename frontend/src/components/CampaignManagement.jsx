import React, { useState, useEffect } from 'react';
import { campaignAPI } from '../services/campaignAPI';
import { productAPI } from '../services/api';
import CampaignForm from './CampaignForm';
import { FaPlus, FaChartBar, FaEdit, FaTrash, FaBullhorn, FaCalendarAlt } from 'react-icons/fa';

function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [campaignReport, setCampaignReport] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await campaignAPI.getAllCampaigns();
      setCampaigns(response.data);
    } catch (err) {
      setError('Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateCampaign = async () => {
    setSelectedCampaign(null);
    try {
      const response = await productAPI.getProductsAvailableForCampaigns();
      setProducts(response.data.data || []);
      setShowForm(true);
    } catch (err) {
      console.error('Error fetching products for new campaign:', err);
      setError('Failed to load products.');
    }
  };

  const handleEditCampaign = async (campaign) => {
    setSelectedCampaign(campaign);
    try {
      const response = await productAPI.getProductsAvailableForCampaigns(campaign.campaignId);
      setProducts(response.data.data || []);
      setShowForm(true);
    } catch (err) {
      console.error('Error fetching products for editing campaign:', err);
      setError('Failed to load products for the selected campaign.');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignAPI.deleteCampaign(campaignId);
        fetchCampaigns();
      } catch (err) {
        console.error('Error deleting campaign:', err);
        setError('Failed to delete campaign');
      }
    }
  };

  const handleViewReport = async (campaignId) => {
    try {
      const response = await campaignAPI.getCampaignReport(campaignId);
      setCampaignReport(response.data);
      setShowReport(true);
    } catch (err) {
      console.error('Error fetching campaign report:', err);
      setError('Failed to fetch campaign report');
    }
  };

  const handleFormSuccess = (message) => {
    setSuccessMessage(message);
    setShowForm(false);
    fetchCampaigns();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStatusBadge = (campaign) => {
    const isActive = campaign.isActive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Campaign Management
          </h2>
          <p className="text-gray-600 mt-1">Create and manage marketing campaigns</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FaPlus /> Create Campaign
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Campaigns</h3>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FaBullhorn className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>No campaigns found. Create your first campaign to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.campaignId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" />
                          {formatDate(campaign.startDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(campaign.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.productCount || 0} products
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Edit Campaign"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleViewReport(campaign.campaignId)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                          title="View Report"
                        >
                          <FaChartBar /> Report
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.campaignId)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          title="Delete Campaign"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[85vh] overflow-y-auto">
            <CampaignForm
              campaign={selectedCampaign}
              products={products}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Campaign Report Modal */}
      {showReport && campaignReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Campaign Report</h3>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Orders</div>
                  <div className="text-2xl font-bold text-blue-900">{campaignReport.ordersCount}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Revenue</div>
                  <div className="text-2xl font-bold text-green-900">₹{Number(campaignReport.revenue).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignManagement;
