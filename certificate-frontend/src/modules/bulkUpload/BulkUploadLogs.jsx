// src/modules/logs/BulkUploadLogs.jsx
import React, { useState, useEffect } from 'react';
import bulkUploadAPI from '../../api/bulkUpload';
import { useToast } from '../../hooks/useToast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { saveAs } from 'file-saver';
import { useTheme } from '../../context/ThemeContext';

const BulkUploadLogs = () => {
  const { isDarkMode } = useTheme();
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
      if (expandedJobId === jobId && jobDetails[jobId]) {
        setExpandedJobId(null);
        return;
      }

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
          color: isDarkMode
            ? 'bg-green-900/30 text-green-300 border border-green-800'
            : 'bg-green-100 text-green-800',
          icon: `fas fa-check-circle ${isDarkMode ? 'text-green-400' : 'text-green-500'}`,
          label: 'Completed'
        };
      case 'PARTIAL_SUCCESS':
        return {
          color: isDarkMode
            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
            : 'bg-yellow-100 text-yellow-800',
          icon: `fas fa-exclamation-triangle ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`,
          label: 'Partial Success'
        };
      case 'FAILED':
        return {
          color: isDarkMode
            ? 'bg-red-900/30 text-red-300 border border-red-800'
            : 'bg-red-100 text-red-800',
          icon: `fas fa-times-circle ${isDarkMode ? 'text-red-400' : 'text-red-500'}`,
          label: 'Failed'
        };
      case 'PROCESSING':
        return {
          color: isDarkMode
            ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
            : 'bg-blue-100 text-blue-800',
          icon: `fas fa-spinner fa-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`,
          label: 'Processing'
        };
      default:
        return {
          color: isDarkMode
            ? 'bg-gray-700 text-gray-300 border border-gray-600'
            : 'bg-gray-100 text-gray-800',
          icon: `fas fa-question-circle ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`,
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
    if (filters.status !== 'all' && job.status?.toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }
    
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
    <div className={`space-y-6 p-4 min-h-screen ${isDarkMode ? 'bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Bulk Upload Logs
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Track student bulk upload activities ({totalRecords} total records)
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            icon="fas fa-download"
            size="small"
            className={isDarkMode 
              ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
              : 'border-green-600 text-green-600 hover:bg-green-50'
            }
          >
            Download Template
          </Button>
          <Button
            onClick={fetchUploadHistory}
            variant="outline"
            icon="fas fa-sync"
            size="small"
            className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {stats.total}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Uploads
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-white border-green-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {stats.completed}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
              Completed
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-white border-yellow-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {stats.partial}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
              Partial
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-white border-red-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {stats.failed}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
              Failed
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-white border-blue-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.successRecords}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              Successful
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-white border-purple-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {stats.failureRecords}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              Failed Records
            </div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className={`rounded-lg border p-4 ${
        isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center">
          <i className={`fas fa-info-circle mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}></i>
          <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            Click "View Details" to expand and see row-by-row results. Multiple jobs can be expanded at once.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border shadow-sm ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by filename, job ID, or batch..."
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
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
          <div className={`mt-3 flex items-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <i className="fas fa-filter mr-2"></i>
            Showing {filteredHistory.length} of {history.length} uploads
            <button
              onClick={() => setFilters({ search: '', status: 'all' })}
              className={`ml-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
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
              <div key={job._id} className={`rounded-lg border shadow-sm overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {/* Job Header */}
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                          }`}>
                            <i className="fas fa-file-excel text-green-500 text-xl"></i>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`text-lg font-semibold truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {job.fileName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <i className={`${statusInfo.icon} mr-1`}></i>
                              {statusInfo.label}
                            </span>
                          </div>
                          
                          <div className={`flex flex-wrap items-center gap-4 text-sm mb-3 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <div className="flex items-center">
                              <i className={`fas fa-database mr-1.5 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}></i>
                              <span>{job.totalRecords} records</span>
                            </div>
                            <div className="flex items-center">
                              <i className={`fas fa-calendar-alt mr-1.5 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}></i>
                              <span>{getRelativeTime(job.createdAt)}</span>
                            </div>
                            {job.targetBatchId && (
                              <div className="flex items-center">
                                <i className={`fas fa-layer-group mr-1.5 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}></i>
                                <span className="truncate max-w-xs">Batch attached</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Progress Stats */}
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className={`text-center p-2 rounded-lg ${
                              isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                            }`}>
                              <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                {job.successCount || 0}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                Successful
                              </div>
                            </div>
                            <div className={`text-center p-2 rounded-lg ${
                              isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                            }`}>
                              <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                {job.failureCount || 0}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                                Failed
                              </div>
                            </div>
                            <div className={`text-center p-2 rounded-lg ${
                              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                            }`}>
                              <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                {successRate}%
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                Success Rate
                              </div>
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
                        className={`${
                          isDarkMode 
                            ? 'border-blue-700 text-blue-400 hover:bg-blue-900/20' 
                            : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                        } ${isExpanded ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                      
                      <div className={`text-xs text-center mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        ID: {job._id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {details ? (
                      <div className={`p-6 space-y-6 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        {/* Job Summary */}
                        <div className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                            Job Summary
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  <i className={`${statusInfo.icon} mr-1`}></i>
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Records</p>
                              <p className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {job.totalRecords || 0}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Successful</p>
                              <p className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {job.successCount || 0}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Failed</p>
                              <p className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                {job.failureCount || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* File Information */}
                        <div className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                            File Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>File Name</label>
                              <p className={`mt-1 text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{job.fileName}</p>
                            </div>
                            <div>
                              <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Uploaded At</label>
                              <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatDateTime(job.createdAt)}
                              </p>
                            </div>
                            <div>
                              <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>File Path</label>
                              <p className={`mt-1 text-sm font-mono text-xs truncate p-2 rounded ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-900'
                              }`}>
                                {job.filePath}
                              </p>
                            </div>
                            <div>
                              <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Updated At</label>
                              <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatDateTime(job.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Target Information */}
                        <div className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                            Target Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {job.targetBatchId && (
                              <div>
                                <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Target Batch ID</label>
                                <p className={`mt-1 text-sm font-mono p-2 rounded ${
                                  isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {job.targetBatchId}
                                </p>
                              </div>
                            )}
                            {job.targetCourseIds && job.targetCourseIds.length > 0 && (
                              <div>
                                <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Target Course IDs ({job.targetCourseIds.length})
                                </label>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {job.targetCourseIds.map((courseId, index) => (
                                    <span 
                                      key={index} 
                                      className={`inline-block px-2 py-1 text-xs font-mono rounded ${
                                        isDarkMode 
                                          ? 'bg-purple-900/30 text-purple-300' 
                                          : 'bg-purple-50 text-purple-800'
                                      }`}
                                    >
                                      {courseId.substring(0, 8)}...
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created By</label>
                              <p className={`mt-1 text-sm font-mono p-2 rounded ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-900'
                              }`}>
                                {job.createdBy}
                              </p>
                            </div>
                            <div>
                              <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processed Records</label>
                              <p className={`mt-1 text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{job.processedRecords || 0} / {job.totalRecords || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Row Details */}
                        {details.rows && details.rows.length > 0 && (
                          <div className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                                Row Details ({details.rows.length} rows)
                              </h4>
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Showing {Math.min(details.rows.length, 50)} rows
                              </span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                  <tr>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Row #</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Status</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Student ID</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Details</th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                  {details.rows.slice(0, 50).map((row, index) => (
                                    <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                      <td className={`px-4 py-3 text-sm font-medium ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                      }`}>#{row.rowNumber || index + 1}</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          row.status === 'SUCCESS' 
                                            ? isDarkMode
                                              ? 'bg-green-900/30 text-green-300 border border-green-800'
                                              : 'bg-green-100 text-green-800'
                                            : row.status === 'WARNING'
                                            ? isDarkMode
                                              ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                            : isDarkMode
                                              ? 'bg-red-900/30 text-red-300 border border-red-800'
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
                                      <td className={`px-4 py-3 text-sm font-mono ${
                                        isDarkMode ? 'text-green-400' : 'text-green-600'
                                      }`}>
                                        {row.studentId ? (
                                          <span>{row.studentId.substring(0, 8)}...</span>
                                        ) : 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        {row.error ? (
                                          <div className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
                                            {row.error}
                                          </div>
                                        ) : row.message ? (
                                          <div className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                                            {row.message}
                                          </div>
                                        ) : (
                                          <div className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                                            No additional details
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {details.rows.length > 50 && (
                                <div className={`mt-3 text-center text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  <i className="fas fa-info-circle mr-1"></i>
                                  Showing first 50 rows out of {details.rows.length}. 
                                  {job.failureCount > 0 && (
                                    <span className={`ml-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
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
                          <div className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-white border-red-200'
                          }`}>
                            <h4 className={`font-medium mb-3 ${
                              isDarkMode ? 'text-red-300' : 'text-red-700'
                            }`}>
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Error Summary
                            </h4>
                            <div className={`p-4 rounded-lg ${
                              isDarkMode ? 'bg-red-900/10' : 'bg-red-50'
                            }`}>
                              <div className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                                <p className="font-medium mb-2">
                                  {job.failureCount} out of {job.totalRecords} records failed to process.
                                </p>
                                {details.errorSummary && (
                                  <div className="mt-2">
                                    <p className="font-medium mb-1">Common errors:</p>
                                    <p className={`whitespace-pre-wrap text-sm p-3 rounded border ${
                                      isDarkMode 
                                        ? 'bg-gray-800 text-red-200 border-red-800' 
                                        : 'bg-white text-red-700 border-red-100'
                                    }`}>
                                      {details.errorSummary}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <i className="fas fa-info-circle mr-1"></i>
                              Job ID: <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job._id}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (job.filePath) {
                                    showToast('File download functionality coming soon', 'info');
                                  }
                                }}
                                variant="outline"
                                size="small"
                                icon="fas fa-download"
                                className={isDarkMode 
                                  ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
                                  : 'border-green-600 text-green-600 hover:bg-green-50'
                                }
                              >
                                Download File
                              </Button>
                              <Button
                                onClick={() => setExpandedJobId(null)}
                                variant="outline"
                                size="small"
                                icon="fas fa-times"
                                className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
                              >
                                Collapse
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-6 flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Loading details...
                        </span>
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
        <div className={`flex flex-col sm:flex-row items-center justify-between pt-6 border-t gap-4 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing page {page} of {totalPages} • {history.length} uploads
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="small"
              icon="fas fa-chevron-left"
              className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
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
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
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
              className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
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