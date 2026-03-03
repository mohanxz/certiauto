import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { bulkEmailAPI } from '../../api/bulkEmail';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';

const CampaignHistory = () => {
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
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PARTIAL_SUCCESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'fas fa-certificate text-purple-600';
      case 'EMAIL':
        return 'fas fa-envelope text-blue-600';
      default:
        return 'fas fa-paper-plane text-gray-600';
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
        // Refresh details
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
      <h3 className="text-lg font-semibold text-gray-800">Campaign History</h3>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No Campaigns Yet</h4>
          <p className="text-gray-500 mb-6">Start by creating your first bulk email campaign</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Campaign
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stats
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map(campaign => {
                    const progress = campaign.stats?.total > 0 
                      ? Math.round(((campaign.stats.success + campaign.stats.failure) / campaign.stats.total) * 100)
                      : 0;

                    return (
                      <tr key={campaign._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              <i className={getTypeIcon(campaign.type)}></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {campaign.stats?.total || 0} recipients
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            campaign.type === 'CERTIFICATE' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <i className={`fas ${campaign.type === 'CERTIFICATE' ? 'fa-certificate' : 'fa-envelope'} mr-1.5`}></i>
                            {campaign.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-600 font-medium">
                                {campaign.stats?.success || 0} sent
                              </span>
                              <span className="text-red-600">
                                {campaign.stats?.failure || 0} failed
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                              className="border-blue-200 text-blue-600"
                            >
                              Details
                            </Button>
                            {campaign.stats?.failure > 0 && (
                              <Button
                                onClick={() => handleRetryCampaign(campaign._id)}
                                variant="outline"
                                size="small"
                                icon="fas fa-redo"
                                className="border-yellow-200 text-yellow-600"
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
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      variant="outline"
                      size="small"
                      disabled={pagination.page === 1}
                      className="border-gray-300"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      variant="outline"
                      size="small"
                      disabled={pagination.page === pagination.totalPages}
                      className="border-gray-300"
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

      {selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedCampaign(null)}></div>
            
            <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Campaign Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedCampaign.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="text-lg font-semibold">{selectedCampaign.type}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-lg font-semibold">{selectedCampaign.stats?.total || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Success</div>
                      <div className="text-lg font-semibold text-green-600">{selectedCampaign.stats?.success || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Failed</div>
                      <div className="text-lg font-semibold text-red-600">{selectedCampaign.stats?.failure || 0}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recipients</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedCampaign.recipients?.map(recipient => (
                            <tr key={recipient._id}>
                              <td className="px-3 py-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {recipient.studentId?.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {recipient.email}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  recipient.status === 'SENT' 
                                    ? 'bg-green-100 text-green-800'
                                    : recipient.status === 'FAILED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {recipient.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">
                                {recipient.error || '-'}
                              </td>
                              <td className="px-3 py-2">
                                {recipient.status === 'FAILED' && recipient.studentId && (
                                  <button
                                    onClick={() => handleRetryIndividual(selectedCampaign._id, recipient.studentId._id)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
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

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedCampaign(null)}
                    variant="outline"
                    className="border-gray-300"
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