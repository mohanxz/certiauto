import React from 'react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const CampaignDetails = ({ campaign, details, onClose, onRetry, loading }) => {
  if (!campaign) return null;

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'CERTIFICATE':
        return 'fas fa-certificate text-purple-500';
      case 'EMAIL':
        return 'fas fa-envelope text-blue-500';
      default:
        return 'fas fa-paper-plane text-gray-500';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg mt-6 animate-slideDown">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{campaign.title} - Details</h3>
            <p className="text-sm text-gray-600 mt-1">ID: {campaign._id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            title="Close details"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {details ? (
          <div className="space-y-6">
            {/* Campaign Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <i className={`${getTypeIcon(details.type)} text-blue-600`}></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-700">Type</div>
                    <div className="text-lg font-semibold text-blue-900 capitalize">
                      {details.type?.toLowerCase() || 'email'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {details.stats?.success || 0}
                  </div>
                  <div className="text-sm font-medium text-green-700">Successfully Sent</div>
                  <div className="text-xs text-green-600 mt-1">
                    {details.stats?.total ? 
                      Math.round(((details.stats.success || 0) / details.stats.total) * 100) : 0
                    }% success rate
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {details.recipients?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Total Recipients</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatDateTime(details.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content Preview */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Email Content</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <div className="text-sm text-gray-800 bg-white p-3 rounded border">
                    {details.subject || 'No subject'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Body Preview</label>
                  <div 
                    className="text-sm text-gray-600 bg-white p-3 rounded border max-h-32 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: details.body || 'No content' }}
                  />
                </div>
              </div>
            </div>

            {/* Batch Information */}
            {details.batchIds && details.batchIds.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Target Batches</h4>
                <div className="flex flex-wrap gap-2">
                  {details.batchIds.map((batch, index) => (
                    <div 
                      key={index} 
                      className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 border border-blue-200"
                    >
                      <i className="fas fa-layer-group text-blue-500 mr-2"></i>
                      <span className="text-sm font-medium text-blue-800">
                        {batch.batchName || `Batch ${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipients List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Recipients ({details.recipients?.length || 0})</h4>
                {details.stats?.failure > 0 && details.status !== 'PROCESSING' && (
                  <Button
                    onClick={() => onRetry(campaign._id)}
                    variant="outline"
                    size="small"
                    icon="fas fa-redo"
                    loading={loading}
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    Retry Failed Emails
                  </Button>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {details.recipients?.map((recipient, index) => (
                    <div key={index} className="p-3 hover:bg-white transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <i className="fas fa-user text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {recipient.studentId?.name || 'Unknown Student'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {recipient.email}
                              {recipient.studentId?.studentCode && (
                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                                  {recipient.studentId.studentCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recipient.status)}`}>
                            <i className={`fas ${
                              recipient.status === 'SENT' 
                                ? 'fa-check-circle' 
                                : recipient.status === 'FAILED'
                                  ? 'fa-times-circle'
                                  : 'fa-clock'
                            } mr-1`}></i>
                            {recipient.status || 'PENDING'}
                          </span>
                          {recipient.sentAt && (
                            <span className="ml-3 text-xs text-gray-500">
                              {formatDateTime(recipient.sentAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <Link to={`/mail-logs?campaign=${campaign._id}`}>
                <Button
                  variant="outline"
                  icon="fas fa-list"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Detailed Email Logs
                </Button>
              </Link>
              <Button
                onClick={onClose}
                variant="secondary"
                className="border-gray-300"
              >
                Close Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading campaign details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;