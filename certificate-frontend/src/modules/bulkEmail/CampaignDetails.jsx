// src/components/bulk-email/CampaignDetails.jsx
import React from 'react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const CampaignDetails = ({ campaign, details, onClose, onRetry, loading }) => {
  const { isDarkMode } = useTheme();
  
  if (!campaign) return null;

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'CERTIFICATE':
        return 'fas fa-certificate text-purple-500 dark:text-purple-400';
      case 'EMAIL':
        return 'fas fa-envelope text-blue-500 dark:text-blue-400';
      default:
        return 'fas fa-paper-plane text-gray-500 dark:text-gray-400';
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
        return isDarkMode 
          ? 'bg-green-900/30 text-green-300 border border-green-800' 
          : 'bg-green-100 text-green-800';
      case 'FAILED':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-300 border border-red-800' 
          : 'bg-red-100 text-red-800';
      default:
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
          : 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className={`rounded-lg border shadow-lg mt-6 animate-slideDown ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {campaign.title} - Details
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {campaign._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Close details"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {details ? (
          <div className="space-y-6">
            {/* Campaign Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-blue-900/20 border-blue-800' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <i className={`${getTypeIcon(details.type)} text-blue-600 dark:text-blue-400`}></i>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Type
                    </div>
                    <div className={`text-lg font-semibold capitalize ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      {details.type?.toLowerCase() || 'email'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {details.stats?.success || 0}
                  </div>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Successfully Sent
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {details.stats?.total ? 
                      Math.round(((details.stats.success || 0) / details.stats.total) * 100) : 0
                    }% success rate
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {details.recipients?.length || 0}
                  </div>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Recipients
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDateTime(details.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content Preview */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Email Content
              </h4>
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Subject</label>
                  <div className={`text-sm p-3 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-200 border-gray-600' 
                      : 'bg-white text-gray-800 border-gray-200'
                  }`}>
                    {details.subject || 'No subject'}
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Body Preview</label>
                  <div 
                    className={`text-sm p-3 rounded border max-h-32 overflow-y-auto ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 border-gray-600' 
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: details.body || 'No content' }}
                  />
                </div>
              </div>
            </div>

            {/* Batch Information */}
            {details.batchIds && details.batchIds.length > 0 && (
              <div>
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Target Batches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {details.batchIds.map((batch, index) => (
                    <div 
                      key={index} 
                      className={`inline-flex items-center px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-blue-900/20 border-blue-800' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <i className={`fas fa-layer-group mr-2 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}></i>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>
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
                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Recipients ({details.recipients?.length || 0})
                </h4>
                {details.stats?.failure > 0 && details.status !== 'PROCESSING' && (
                  <Button
                    onClick={() => onRetry(campaign._id)}
                    variant="outline"
                    size="small"
                    icon="fas fa-redo"
                    loading={loading}
                    className={isDarkMode 
                      ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
                      : 'border-green-300 text-green-600 hover:bg-green-50'
                    }
                  >
                    Retry Failed Emails
                  </Button>
                )}
              </div>
              <div className={`rounded-lg border max-h-64 overflow-y-auto ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                  {details.recipients?.map((recipient, index) => (
                    <div key={index} className={`p-3 transition-colors ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                          }`}>
                            <i className={`fas fa-user text-sm ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}></i>
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {recipient.studentId?.name || 'Unknown Student'}
                            </div>
                            <div className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {recipient.email}
                              {recipient.studentId?.studentCode && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded ${
                                  isDarkMode 
                                    ? 'bg-gray-600 text-gray-300' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
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
                            <span className={`ml-3 text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
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
            <div className={`pt-6 border-t flex flex-col sm:flex-row justify-end gap-3 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Link to={`/mail-logs?campaign=${campaign._id}`}>
                <Button
                  variant="outline"
                  icon="fas fa-list"
                  className={isDarkMode 
                    ? 'border-blue-700 text-blue-400 hover:bg-blue-900/20' 
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                  }
                >
                  Detailed Email Logs
                </Button>
              </Link>
              <Button
                onClick={onClose}
                variant="secondary"
                className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
              >
                Close Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Loading campaign details...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;