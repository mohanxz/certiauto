// src/components/bulk-email/CampaignHistory.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { bulkEmailAPI } from '../../api/bulkEmail';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context/ThemeContext';

const CampaignHistory = () => {
  const { isDarkMode } = useTheme();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, [pagination.page]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await bulkEmailAPI.getCampaignHistory({
        page: pagination.page,
        limit: 10
      });

      if (response.data.success) {
        setCampaigns(response.data.data);
        setPagination({
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.pages || 1,
          totalItems: response.data.pagination?.total || 0
        });
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      showToast('Failed to load campaign history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-300 border border-green-800' 
          : 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
          : 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-300 border border-red-800' 
          : 'bg-red-100 text-red-800';
      case 'PARTIAL_SUCCESS':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
          : 'bg-yellow-100 text-yellow-800';
      default:
        return isDarkMode 
          ? 'bg-gray-700 text-gray-300 border border-gray-600' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'fas fa-check-circle';
      case 'PROCESSING':
        return 'fas fa-sync-alt fa-spin';
      case 'FAILED':
        return 'fas fa-times-circle';
      case 'PARTIAL_SUCCESS':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CERTIFICATE':
        return `fas fa-certificate ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`;
      case 'EMAIL':
        return `fas fa-envelope ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`;
      default:
        return `fas fa-paper-plane ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;
    }
  };

  const handleViewDetails = async (campaignId) => {
    try {
      const response = await bulkEmailAPI.getCampaignDetails(campaignId);
      if (response.data.success) {
        setSelectedCampaign(response.data.data);
      }
    } catch (error) {
      console.error('Error loading campaign details:', error);
      showToast('Failed to load campaign details', 'error');
    }
  };

  const handleRetryCampaign = async (campaignId) => {
    if (!window.confirm('Retry all failed recipients for this campaign?')) return;

    try {
      const response = await bulkEmailAPI.retryCampaign(campaignId);
      if (response.data.success) {
        showToast('Retry initiated! Processing in background.', 'success');
        loadCampaigns();
      }
    } catch (error) {
      console.error('Error retrying campaign:', error);
      showToast('Failed to retry campaign', 'error');
    }
  };

  const handleRetryIndividual = async (campaignId, studentId) => {
    try {
      const response = await bulkEmailAPI.retryIndividual(campaignId, studentId);
      if (response.data.success) {
        showToast('Retry initiated!', 'success');
        handleViewDetails(campaignId);
      }
    } catch (error) {
      console.error('Error retrying individual:', error);
      showToast('Failed to retry', 'error');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Campaign History
      </h3>

      {campaigns.length === 0 ? (
        <div className={`text-center py-12 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <i className={`fas fa-history text-4xl mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-300'
          }`}></i>
          <h4 className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>No Campaigns Yet</h4>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Start by creating your first bulk email campaign
          </p>
        </div>
      ) : (
        <>
          <div className={`rounded-lg border shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Campaign
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Type
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Stats
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Date
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {campaigns.map(campaign => {
                    const progress = campaign.stats?.total > 0 
                      ? Math.round(((campaign.stats.success + campaign.stats.failure) / campaign.stats.total) * 100)
                      : 0;

                    return (
                      <tr key={campaign._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                            }`}>
                              <i className={getTypeIcon(campaign.type)}></i>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {campaign.title}
                              </div>
                              <div className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {campaign.stats?.total || 0} recipients
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            campaign.type === 'CERTIFICATE' 
                              ? isDarkMode
                                ? 'bg-purple-900/30 text-purple-300 border border-purple-800'
                                : 'bg-purple-100 text-purple-800'
                              : isDarkMode
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            <i className={`fas ${campaign.type === 'CERTIFICATE' ? 'fa-certificate' : 'fa-envelope'} mr-1.5`}></i>
                            {campaign.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {campaign.stats?.success || 0} sent
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                {campaign.stats?.failure || 0} failed
                              </span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            <i className={`${getStatusIcon(campaign.status)} mr-1.5`}></i>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                          <div className="text-xs">
                            {new Date(campaign.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleViewDetails(campaign._id)}
                              variant="outline"
                              size="small"
                              icon="fas fa-eye"
                              className={isDarkMode 
                                ? 'border-blue-700 text-blue-400 hover:bg-blue-900/20' 
                                : 'border-blue-200 text-blue-600'
                              }
                            >
                              Details
                            </Button>
                            {campaign.stats?.failure > 0 && (
                              <Button
                                onClick={() => handleRetryCampaign(campaign._id)}
                                variant="outline"
                                size="small"
                                icon="fas fa-redo"
                                className={isDarkMode 
                                  ? 'border-yellow-700 text-yellow-400 hover:bg-yellow-900/20' 
                                  : 'border-yellow-200 text-yellow-600'
                                }
                              >
                                Retry Failed
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      variant="outline"
                      size="small"
                      disabled={pagination.page === 1}
                      className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      variant="outline"
                      size="small"
                      disabled={pagination.page === pagination.totalPages}
                      className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className={`fixed inset-0 transition-opacity ${
              isDarkMode ? 'bg-gray-900 bg-opacity-90' : 'bg-gray-500 bg-opacity-75'
            }`} onClick={() => setSelectedCampaign(null)}></div>
            
            <div className={`inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform rounded-2xl shadow-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Campaign Details
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedCampaign.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</div>
                      <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCampaign.type}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total</div>
                      <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCampaign.stats?.total || 0}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-green-900/20' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-gray-600'}`}>Success</div>
                      <div className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {selectedCampaign.stats?.success || 0}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-red-900/20' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-gray-600'}`}>Failed</div>
                      <div className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {selectedCampaign.stats?.failure || 0}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Recipients
                    </h4>
                    <div className={`rounded-lg p-4 max-h-96 overflow-y-auto ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Student</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Status</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Error</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                          {selectedCampaign.recipients?.map(recipient => (
                            <tr key={recipient._id}>
                              <td className="px-3 py-2">
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {recipient.studentId?.name || 'Unknown'}
                                </div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {recipient.email}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  recipient.status === 'SENT' 
                                    ? isDarkMode
                                      ? 'bg-green-900/30 text-green-300 border border-green-800'
                                      : 'bg-green-100 text-green-800'
                                    : recipient.status === 'FAILED'
                                      ? isDarkMode
                                        ? 'bg-red-900/30 text-red-300 border border-red-800'
                                        : 'bg-red-100 text-red-800'
                                      : isDarkMode
                                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {recipient.status}
                                </span>
                              </td>
                              <td className={`px-3 py-2 text-xs max-w-xs truncate ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {recipient.error || '-'}
                              </td>
                              <td className="px-3 py-2">
                                {recipient.status === 'FAILED' && recipient.studentId && (
                                  <button
                                    onClick={() => handleRetryIndividual(selectedCampaign._id, recipient.studentId._id)}
                                    className={`text-xs ${
                                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                                    }`}
                                  >
                                    <i className="fas fa-redo mr-1"></i>
                                    Retry
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedCampaign(null)}
                    variant="outline"
                    className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;