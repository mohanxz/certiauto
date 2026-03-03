import React, { useState, useEffect } from 'react';
import { mailLogsAPI } from '../../api/mailLog';
import { useToast } from '../../hooks/useToast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';

const EmailLogsList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchEmailLogs();
  }, [page]);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const response = await mailLogsAPI.getMailLogs(page, limit);
      
      if (response && response.success) {
        setLogs(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalRecords(response.pagination?.total || 0);
      } else {
        showToast(response?.message || 'Failed to fetch email logs', 'error');
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const getStatusInfo = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return {
          color: 'bg-green-100 text-green-800',
          icon: 'fas fa-check-circle text-green-500',
          label: 'Success'
        };
      case 'FAILED':
        return {
          color: 'bg-red-100 text-red-800',
          icon: 'fas fa-exclamation-circle text-red-500',
          label: 'Failed'
        };
      case 'SENT':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: 'fas fa-paper-plane text-blue-500',
          label: 'Sent'
        };
      case 'PENDING':
      case 'QUEUED':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'fas fa-clock text-yellow-500',
          label: 'Pending'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: 'fas fa-question-circle text-gray-500',
          label: status || 'Unknown'
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'CERTIFICATE':
        return 'fas fa-certificate text-purple-500';
      case 'BULK':
        return 'fas fa-mail-bulk text-blue-500';
      case 'EMAIL':
        return 'fas fa-envelope text-green-500';
      default:
        return 'fas fa-envelope text-gray-500';
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDateTime(dateString);
  };

  const filteredLogs = logs.filter(log => {
    // Filter by status
    if (filters.status !== 'all' && log.status?.toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }
    
    // Filter by type
    if (filters.type !== 'all' && log.type?.toUpperCase() !== filters.type.toUpperCase()) {
      return false;
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        (log.recipient && log.recipient.toLowerCase().includes(searchLower)) ||
        (log.subject && log.subject.toLowerCase().includes(searchLower)) ||
        (log.studentId?.name && log.studentId.name.toLowerCase().includes(searchLower)) ||
        (log.studentId?.studentCode && log.studentId.studentCode.toLowerCase().includes(searchLower)) ||
        (log._id && log._id.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const getStats = () => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'SUCCESS').length;
    const failed = logs.filter(l => l.status === 'FAILED').length;
    const certificate = logs.filter(l => l.type === 'CERTIFICATE').length;
    const email = logs.filter(l => l.type === 'EMAIL').length;
    
    return { total, success, failed, certificate, email };
  };

  const handleRetrySend = async (logId, recipient) => {
    if (!window.confirm(`Retry sending email to ${recipient}?`)) return;
    
    try {
      // Implement retry logic here
      showToast(`Retrying email to ${recipient}...`, 'info');
      // You might want to call an API endpoint for retry
    } catch (error) {
      showToast('Failed to retry send', 'error');
    }
  };

  const stats = getStats();

  if (loading && page === 1) {
    return <LoadingSkeleton type="card" count={5} />;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Email Logs</h1>
          <p className="text-gray-600">Individual email sending attempts ({totalRecords} total)</p>
        </div>
        
        <Button
          onClick={fetchEmailLogs}
          variant="outline"
          icon="fas fa-sync"
          size="small"
          className="border-gray-300"
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-green-600">Success</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.certificate}</div>
            <div className="text-sm text-purple-600">Certificate</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.email}</div>
            <div className="text-sm text-blue-600">Regular</div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <i className="fas fa-info-circle text-blue-500 mr-2"></i>
          <p className="text-sm text-blue-700">
            Each record represents one email sending attempt. Click on any log to view detailed information.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by email, name, student code..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="SENT">Sent</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="EMAIL">Regular Email</option>
            </select>
          </div>
        </div>

        {/* Filter Results */}
        {(filters.search || filters.status !== 'all' || filters.type !== 'all') && (
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <i className="fas fa-filter mr-2"></i>
            Showing {filteredLogs.length} of {logs.length} logs
            <button
              onClick={() => setFilters({ search: '', status: 'all', type: 'all' })}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Accordion */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No email logs found"
            description={
              filters.search || filters.status !== 'all' || filters.type !== 'all'
                ? "Try changing your filters"
                : "No email sending attempts logged yet"
            }
            icon="fas fa-envelope"
          />
        ) : (
          filteredLogs.map((log) => {
            const statusInfo = getStatusInfo(log.status);
            const student = log.studentId || {};
            
            return (
              <div key={log._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Log Header */}
                <button
                  onClick={() => toggleLogExpansion(log._id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <i className={getTypeIcon(log.type)}></i>
                      </div>
                    </div>
                    
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{log.subject}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <i className={`${statusInfo.icon} mr-1`}></i>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center">
                            <i className="fas fa-user mr-1.5"></i>
                            {student.name || 'Unknown Student'}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-envelope mr-1.5"></i>
                            {log.recipient || 'No email'}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-clock mr-1.5"></i>
                            {getRelativeTime(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-3">
                    <i className={`fas fa-chevron-${expandedLogId === log._id ? 'up' : 'down'} text-gray-400`}></i>
                  </div>
                </button>
                
                {/* Log Details (Collapsible) */}
                {expandedLogId === log._id && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Details</label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Recipient</span>
                              <span className="text-sm font-medium text-gray-900">{log.recipient}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Subject</span>
                              <span className="text-sm font-medium text-gray-900">{log.subject}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Type</span>
                              <div className="flex items-center">
                                <i className={`${getTypeIcon(log.type)} mr-2`}></i>
                                <span className="text-sm font-medium text-gray-900 capitalize">{log.type?.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Timestamps</label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Created</span>
                              <span className="text-sm font-medium text-gray-900">{formatDateTime(log.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Updated</span>
                              <span className="text-sm font-medium text-gray-900">{formatDateTime(log.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Student Information</label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Name</span>
                              <span className="text-sm font-medium text-gray-900">{student.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Student Code</span>
                              <span className="text-sm font-medium text-gray-900 font-mono">{student.studentCode || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Student ID</span>
                              <span className="text-sm font-medium text-gray-900 font-mono truncate max-w-[150px]">{student._id || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Technical Details</label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Log ID</span>
                              <span className="text-sm font-medium text-gray-900 font-mono truncate max-w-[150px]">{log._id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Status</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                                <i className={`${statusInfo.icon} mr-1`}></i>
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Error Details (if any) */}
                    {log.error && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Error Details</label>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-start">
                            <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 mr-2"></i>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800">Delivery Failed</p>
                              <p className="text-sm text-red-700 mt-1 font-mono whitespace-pre-wrap break-all">
                                {log.error}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <i className="fas fa-id-card mr-1"></i>
                        Log ID: {log._id}
                      </div>
                      <div className="flex gap-2">
                        {log.status === 'FAILED' && (
                          <Button
                            onClick={() => handleRetrySend(log._id, log.recipient)}
                            variant="outline"
                            size="small"
                            icon="fas fa-redo"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            Retry Send
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outline"
                          className="border-gray-300"
                          onClick={() => setExpandedLogId(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-600">
            Showing page {page} of {totalPages} • {totalRecords} total records
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="small"
              icon="fas fa-chevron-left"
              className="border-gray-300"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="small"
              icon="fas fa-chevron-right"
              className="border-gray-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailLogsList;