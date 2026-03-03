import React, { useState, useEffect } from 'react';
import  bulkUploadAPI  from '../../api/bulkUpload';
import { useToast } from '../../hooks/useToast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { saveAs } from 'file-saver';

const BulkUploadLogs = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobDetails, setJobDetails] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchUploadHistory();
  }, [page]);

  const fetchUploadHistory = async () => {
    try {
      setLoading(true);
      const response = await bulkUploadAPI.getUploadHistory(page);
      
      if (response && response.success) {
        setHistory(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalRecords(response.pagination?.total || 0);
      } else {
        showToast(response?.message || 'Failed to fetch upload history', 'error');
      }
    } catch (error) {
      console.error('Error fetching upload history:', error);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId) => {
    try {
      // If already expanded and details are loaded, collapse it
      if (expandedJobId === jobId && jobDetails[jobId]) {
        setExpandedJobId(null);
        return;
      }

      // If details are not loaded yet, fetch them
      if (!jobDetails[jobId]) {
        const response = await bulkUploadAPI.getUploadJobDetails(jobId);
        if (response && response.success) {
          setJobDetails(prev => ({
            ...prev,
            [jobId]: response.data
          }));
        } else {
          showToast(response?.message || 'Failed to load job details', 'error');
          return;
        }
      }

      // Toggle expansion
      setExpandedJobId(expandedJobId === jobId ? null : jobId);
    } catch (error) {
      showToast('Failed to load job details', 'error');
    }
  };

  const downloadTemplate = async () => {
    try {
      const blob = await bulkUploadAPI.downloadTemplate();
      saveAs(blob, 'student_upload_template.xlsx');
      showToast('Template downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast('Failed to download template', 'error');
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return {
          color: 'bg-green-100 text-green-800',
          icon: 'fas fa-check-circle text-green-500',
          label: 'Completed'
        };
      case 'PARTIAL_SUCCESS':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'fas fa-exclamation-triangle text-yellow-500',
          label: 'Partial Success'
        };
      case 'FAILED':
        return {
          color: 'bg-red-100 text-red-800',
          icon: 'fas fa-times-circle text-red-500',
          label: 'Failed'
        };
      case 'PROCESSING':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: 'fas fa-spinner fa-spin text-blue-500',
          label: 'Processing'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: 'fas fa-question-circle text-gray-500',
          label: status || 'Unknown'
        };
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

  const filteredHistory = history.filter(job => {
    // Filter by status
    if (filters.status !== 'all' && job.status?.toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        (job.fileName && job.fileName.toLowerCase().includes(searchLower)) ||
        (job._id && job._id.toLowerCase().includes(searchLower)) ||
        (job.targetBatchId && job.targetBatchId.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const getStats = () => {
    const total = history.length;
    const completed = history.filter(j => j.status === 'COMPLETED').length;
    const failed = history.filter(j => j.status === 'FAILED').length;
    const partial = history.filter(j => j.status === 'PARTIAL_SUCCESS').length;
    const totalRecords = history.reduce((sum, job) => sum + (job.totalRecords || 0), 0);
    const successRecords = history.reduce((sum, job) => sum + (job.successCount || 0), 0);
    const failureRecords = history.reduce((sum, job) => sum + (job.failureCount || 0), 0);
    
    return { 
      total, 
      completed, 
      failed, 
      partial, 
      totalRecords, 
      successRecords, 
      failureRecords 
    };
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
          <h1 className="text-2xl font-bold text-gray-800">Bulk Upload Logs</h1>
          <p className="text-gray-600">Track student bulk upload activities ({totalRecords} total records)</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            icon="fas fa-download"
            size="small"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Download Template
          </Button>
          <Button
            onClick={fetchUploadHistory}
            variant="outline"
            icon="fas fa-sync"
            size="small"
            className="border-gray-300"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Uploads</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
            <div className="text-sm text-yellow-600">Partial</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.successRecords}</div>
            <div className="text-sm text-blue-600">Successful</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.failureRecords}</div>
            <div className="text-sm text-purple-600">Failed Records</div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <i className="fas fa-info-circle text-blue-500 mr-2"></i>
          <p className="text-sm text-blue-700">
            Click "View Details" to expand and see row-by-row results. Multiple jobs can be expanded at once.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by filename, job ID, or batch..."
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
              <option value="COMPLETED">Completed</option>
              <option value="PARTIAL_SUCCESS">Partial Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Filter Results */}
        {(filters.search || filters.status !== 'all') && (
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <i className="fas fa-filter mr-2"></i>
            Showing {filteredHistory.length} of {history.length} uploads
            <button
              onClick={() => setFilters({ search: '', status: 'all' })}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Upload History with Accordion */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No upload history found"
          description={
            filters.search || filters.status !== 'all'
              ? "Try changing your filters"
              : "No bulk uploads have been performed yet"
          }
          icon="fas fa-upload"
          actionText="Download Template"
          onAction={downloadTemplate}
        />
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            const successRate = job.totalRecords > 0 
              ? Math.round((job.successCount / job.totalRecords) * 100) 
              : 0;
            const isExpanded = expandedJobId === job._id;
            const details = jobDetails[job._id];
            
            return (
              <div key={job._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Job Header */}
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <i className="fas fa-file-excel text-green-500 text-xl"></i>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {job.fileName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <i className={`${statusInfo.icon} mr-1`}></i>
                              {statusInfo.label}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <i className="fas fa-database mr-1.5"></i>
                              <span>{job.totalRecords} records</span>
                            </div>
                            <div className="flex items-center">
                              <i className="fas fa-calendar-alt mr-1.5"></i>
                              <span>{getRelativeTime(job.createdAt)}</span>
                            </div>
                            {job.targetBatchId && (
                              <div className="flex items-center">
                                <i className="fas fa-layer-group mr-1.5"></i>
                                <span className="truncate max-w-xs">Batch attached</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Progress Stats */}
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-700">{job.successCount || 0}</div>
                              <div className="text-xs text-green-600">Successful</div>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded-lg">
                              <div className="text-lg font-bold text-red-700">{job.failureCount || 0}</div>
                              <div className="text-xs text-red-600">Failed</div>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-700">{successRate}%</div>
                              <div className="text-xs text-blue-600">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => fetchJobDetails(job._id)}
                        variant="outline"
                        size="small"
                        icon={isExpanded ? "fas fa-chevron-up" : "fas fa-eye"}
                        loading={isExpanded && !details}
                        className={`border-blue-300 text-blue-600 hover:bg-blue-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                      
                      <div className="text-xs text-gray-500 text-center mt-1">
                        ID: {job._id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {details ? (
                      <div className="p-6 space-y-6 bg-gray-50">
                        {/* Job Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Job Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  <i className={`${statusInfo.icon} mr-1`}></i>
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Records</p>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{job.totalRecords || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Successful</p>
                              <p className="text-lg font-semibold text-green-600 mt-1">{job.successCount || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Failed</p>
                              <p className="text-lg font-semibold text-red-600 mt-1">{job.failureCount || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* File Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">File Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-500">File Name</label>
                              <p className="mt-1 text-sm text-gray-900 font-medium">{job.fileName}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500">Uploaded At</label>
                              <p className="mt-1 text-sm text-gray-900">{formatDateTime(job.createdAt)}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500">File Path</label>
                              <p className="mt-1 text-sm text-gray-900 font-mono text-xs truncate bg-gray-50 p-2 rounded">
                                {job.filePath}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500">Updated At</label>
                              <p className="mt-1 text-sm text-gray-900">{formatDateTime(job.updatedAt)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Target Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Target Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {job.targetBatchId && (
                              <div>
                                <label className="block text-sm text-gray-500">Target Batch ID</label>
                                <p className="mt-1 text-sm text-gray-900 font-mono bg-blue-50 p-2 rounded">
                                  {job.targetBatchId}
                                </p>
                              </div>
                            )}
                            {job.targetCourseIds && job.targetCourseIds.length > 0 && (
                              <div>
                                <label className="block text-sm text-gray-500">Target Course IDs ({job.targetCourseIds.length})</label>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {job.targetCourseIds.map((courseId, index) => (
                                    <span 
                                      key={index} 
                                      className="inline-block px-2 py-1 text-xs font-mono bg-purple-50 text-purple-800 rounded"
                                    >
                                      {courseId.substring(0, 8)}...
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm text-gray-500">Created By</label>
                              <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                                {job.createdBy}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500">Processed Records</label>
                              <p className="mt-1 text-sm text-gray-900 font-semibold">{job.processedRecords || 0} / {job.totalRecords || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Row Details */}
                        {details.rows && details.rows.length > 0 && (
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-700">Row Details ({details.rows.length} rows)</h4>
                              <span className="text-sm text-gray-500">
                                Showing {Math.min(details.rows.length, 50)} rows
                              </span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {details.rows.slice(0, 50).map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{row.rowNumber || index + 1}</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          row.status === 'SUCCESS' 
                                            ? 'bg-green-100 text-green-800' 
                                            : row.status === 'WARNING'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          <i className={`mr-1 ${
                                            row.status === 'SUCCESS' 
                                              ? 'fas fa-check-circle' 
                                              : row.status === 'WARNING'
                                              ? 'fas fa-exclamation-triangle'
                                              : 'fas fa-times-circle'
                                          }`}></i>
                                          {row.status || 'UNKNOWN'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                        {row.studentId ? (
                                          <span className="text-green-600">{row.studentId.substring(0, 8)}...</span>
                                        ) : 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-500">
                                        {row.error ? (
                                          <div className="text-red-600">{row.error}</div>
                                        ) : row.message ? (
                                          <div className="text-green-600">{row.message}</div>
                                        ) : (
                                          <div className="text-gray-400">No additional details</div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {details.rows.length > 50 && (
                                <div className="mt-3 text-center text-sm text-gray-500">
                                  <i className="fas fa-info-circle mr-1"></i>
                                  Showing first 50 rows out of {details.rows.length}. 
                                  {job.failureCount > 0 && (
                                    <span className="ml-1 text-red-600">
                                      {job.failureCount} rows failed
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Error Summary */}
                        {job.failureCount > 0 && (
                          <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h4 className="font-medium text-red-700 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Error Summary
                            </h4>
                            <div className="bg-red-50 p-4 rounded-lg">
                              <div className="text-sm text-red-700">
                                <p className="font-medium mb-2">
                                  {job.failureCount} out of {job.totalRecords} records failed to process.
                                </p>
                                {details.errorSummary && (
                                  <div className="mt-2">
                                    <p className="font-medium mb-1">Common errors:</p>
                                    <p className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-red-100">
                                      {details.errorSummary}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              <i className="fas fa-info-circle mr-1"></i>
                              Job ID: <span className="font-mono">{job._id}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  // Download the original file
                                  if (job.filePath) {
                                    // You would need to implement file download logic here
                                    showToast('File download functionality coming soon', 'info');
                                  }
                                }}
                                variant="outline"
                                size="small"
                                icon="fas fa-download"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                Download File
                              </Button>
                              <Button
                                onClick={() => setExpandedJobId(null)}
                                variant="outline"
                                size="small"
                                icon="fas fa-times"
                                className="border-gray-300"
                              >
                                Collapse
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading details...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-600">
            Showing page {page} of {totalPages} • {history.length} uploads
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

export default BulkUploadLogs;