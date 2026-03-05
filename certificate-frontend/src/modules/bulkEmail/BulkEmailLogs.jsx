// src/modules/bulkEmail/BulkEmailLogs.jsx
import React, { useState, useEffect } from "react";
import { bulkEmailAPI } from "../../api/bulkEmail";
import { useToast } from "../../hooks/useToast";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";
import CampaignDetails from "./CampaignDetails";
import { useTheme } from "../../context/ThemeContext";

const BulkEmailLogs = () => {
  const { isDarkMode } = useTheme();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true);
      const response = await bulkEmailAPI.getCampaignHistory({
        page,
        limit: pagination.limit,
      });

      if (response && response.success) {
        setCampaigns(response.data || []);
        setPagination(
          response.pagination || {
            page: 1,
            limit: 10,
            total: response.data?.length || 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        );
      } else {
        showToast(response?.message || "Failed to fetch campaigns", "error");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = async (campaign) => {
    if (selectedCampaign?._id === campaign._id) {
      setShowDetails(false);
      setSelectedCampaign(null);
      setCampaignDetails(null);
    } else {
      setSelectedCampaign(campaign);
      setShowDetails(true);
      fetchCampaignDetails(campaign._id);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const response = await bulkEmailAPI.getCampaignDetails(campaignId);
      if (response && response.success) {
        setCampaignDetails(response.data);
      }
    } catch (error) {
      showToast("Failed to load campaign details", "error");
    }
  };

  const handleRetryCampaign = async (campaignId) => {
    if (!window.confirm("Retry sending failed emails in this campaign?"))
      return;

    try {
      setRetryLoading(true);
      const response = await bulkEmailAPI.retryCampaign(campaignId);
      if (response && response.success) {
        showToast(" Campaign retry initiated", "success");
        fetchCampaigns(pagination.page);
        fetchCampaignDetails(campaignId);
      }
    } catch (error) {
      showToast("❌ Failed to retry campaign", "error");
    } finally {
      setRetryLoading(false);
    }
  };

  const getCampaignStats = (campaign) => {
    const recipients = campaign.recipients || [];

    const successCount = recipients.filter((r) => r.status === "SENT").length;
    const failureCount = recipients.filter((r) => r.status === "FAILED").length;
    const pendingCount = recipients.filter(
      (r) => r.status === "PENDING",
    ).length;
    const totalCount = recipients.length;

    return {
      total: totalCount,
      success: successCount,
      failure: failureCount,
      pending: pendingCount,
    };
  };

  const getStatusInfo = (campaign) => {
    const stats = getCampaignStats(campaign);
    const {
      success: successCount,
      failure: failureCount,
      total: totalCount,
    } = stats;

    if (successCount === totalCount && totalCount > 0) {
      return {
        color: isDarkMode 
          ? 'bg-green-900/30 text-green-300 border border-green-800' 
          : 'bg-green-100 text-green-800',
        icon: `fas fa-check-circle ${isDarkMode ? 'text-green-400' : 'text-green-500'}`,
        label: "Completed",
      };
    } else if (successCount > 0 && failureCount > 0) {
      return {
        color: isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
          : 'bg-yellow-100 text-yellow-800',
        icon: `fas fa-exclamation-triangle ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`,
        label: "Partial Success",
      };
    } else if (successCount === 0 && failureCount > 0) {
      return {
        color: isDarkMode 
          ? 'bg-red-900/30 text-red-300 border border-red-800' 
          : 'bg-red-100 text-red-800',
        icon: `fas fa-times-circle ${isDarkMode ? 'text-red-400' : 'text-red-500'}`,
        label: "Failed",
      };
    } else if (totalCount === 0) {
      return {
        color: isDarkMode 
          ? 'bg-gray-700 text-gray-300 border border-gray-600' 
          : 'bg-gray-100 text-gray-800',
        icon: `fas fa-clock ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`,
        label: "No Recipients",
      };
    } else {
      return {
        color: isDarkMode 
          ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
          : 'bg-blue-100 text-blue-800',
        icon: `fas fa-spinner fa-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`,
        label: "Processing",
      };
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "CERTIFICATE":
        return `fas fa-certificate ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`;
      case "EMAIL":
        return `fas fa-envelope ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`;
      default:
        return `fas fa-paper-plane ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return formatDateTime(dateString);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filters.status !== "all") {
      const stats = getCampaignStats(campaign);
      let campaignStatus = "PROCESSING";

      if (stats.success === stats.total && stats.total > 0) {
        campaignStatus = "COMPLETED";
      } else if (stats.success > 0 && stats.failure > 0) {
        campaignStatus = "PARTIAL_SUCCESS";
      } else if (stats.success === 0 && stats.failure > 0) {
        campaignStatus = "FAILED";
      }

      const statusMatch = campaignStatus === filters.status.toUpperCase();
      if (!statusMatch) return false;
    }

    if (
      filters.type !== "all" &&
      campaign.type?.toUpperCase() !== filters.type.toUpperCase()
    ) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        (campaign.title &&
          campaign.title.toLowerCase().includes(searchLower)) ||
        (campaign._id && campaign._id.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const getStats = () => {
    let successful = 0;
    let partial = 0;
    let failed = 0;
    let totalEmails = 0;

    campaigns.forEach((campaign) => {
      const stats = getCampaignStats(campaign);
      totalEmails += stats.total;

      if (stats.success === stats.total && stats.total > 0) {
        successful++;
      } else if (stats.success > 0 && stats.failure > 0) {
        partial++;
      } else if (stats.success === 0 && stats.failure > 0) {
        failed++;
      }
    });

    return {
      total: campaigns.length,
      successful,
      partial,
      failed,
      totalEmails,
    };
  };

  const stats = getStats();

  if (loading && campaigns.length === 0) {
    return <LoadingSkeleton type="card" count={5} />;
  }

  return (
    <div className={`space-y-6 p-4 ${isDarkMode ? 'bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Email Campaign History
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Track and manage your email campaigns
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/bulk-email">
            <Button variant="primary" icon="fas fa-plus" size="small">
              New Campaign
            </Button>
          </Link>
          <Button
            onClick={() => fetchCampaigns(pagination.page)}
            variant="outline"
            icon="fas fa-sync"
            size="small"
            loading={loading}
            className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards - Dark mode aware */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {stats.total}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Campaigns
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border shadow-sm ${
          isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-white border-green-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {stats.successful}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
              Successful
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
              {stats.totalEmails}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              Total Recipients
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner - Dark mode aware */}
      <div className={`rounded-lg border p-4 ${
        isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start">
          <i className={`fas fa-info-circle mr-2 mt-0.5 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-500'
          }`}></i>
          <div>
            <p className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Campaign Overview
            </p>
            <p className={`text-xs ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Click on any campaign to view detailed information. Each campaign
              can contain multiple batches and recipients.
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Dark mode aware */}
      <div className={`p-4 rounded-lg border shadow-sm ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search Campaigns
            </label>
            <div className="relative">
              <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`}></i>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by title, campaign ID, or batch name..."
                className={`w-full pl-10 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PARTIAL_SUCCESS">Partial Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="EMAIL">Regular Email</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description={
              filters.search ||
              filters.status !== "all" ||
              filters.type !== "all"
                ? "Try changing your filters or search terms"
                : "No email campaigns created yet. Start your first campaign!"
            }
            icon="fas fa-paper-plane"
            actionText="Create First Campaign"
            onAction={() => (window.location.href = "/bulk-email")}
          />
        ) : (
          filteredCampaigns.map((campaign) => {
            const statusInfo = getStatusInfo(campaign);
            const stats = getCampaignStats(campaign);
            const progress =
              stats.total > 0
                ? Math.round((stats.success / stats.total) * 100)
                : 0;
            const batchNames =
              campaign.batchIds?.map((b) => b.batchName).join(", ") ||
              "No batches";
            const isSelected = selectedCampaign?._id === campaign._id;

            return (
              <React.Fragment key={campaign._id}>
                <div
                  className={`rounded-lg border shadow-sm overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isSelected
                      ? isDarkMode
                        ? 'border-blue-600 ring-2 ring-blue-900/30'
                        : 'border-blue-300 ring-2 ring-blue-100'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleCampaignClick(campaign)}
                >
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                              isDarkMode 
                                ? 'bg-gradient-to-br from-gray-700 to-gray-600' 
                                : 'bg-gradient-to-br from-blue-50 to-purple-50'
                            }`}>
                              <i className={`${getTypeIcon(campaign.type)} text-lg`}></i>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className={`text-lg font-semibold truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {campaign.title}
                                {isSelected && (
                                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                    isDarkMode 
                                      ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
                                      : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    <i className="fas fa-chevron-down mr-1"></i>
                                    Viewing details
                                  </span>
                                )}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                <i className={`${statusInfo.icon} mr-1 ${statusInfo.label === "Processing" ? "animate-spin" : ""}`}></i>
                                {statusInfo.label}
                              </span>
                            </div>

                            <div className={`flex flex-wrap items-center gap-3 text-sm mb-3 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <div className="flex items-center">
                                <i className={`fas fa-users mr-1.5 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}></i>
                                <span className="font-medium">
                                  {stats.total} recipients
                                </span>
                              </div>
                              <div className="flex items-center">
                                <i className={`fas fa-calendar-alt mr-1.5 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}></i>
                                <span>{getTimeAgo(campaign.createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <i className={`fas fa-layer-group mr-1.5 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}></i>
                                <span
                                  className="truncate max-w-[200px]"
                                  title={batchNames}
                                >
                                  {batchNames}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className={`font-medium ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {stats.success} of {stats.total} emails sent
                                </span>
                                <span className={`font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {progress}%
                                </span>
                              </div>
                              <div className={`w-full rounded-full h-2.5 ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                <div
                                  className="h-2.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${progress}%`,
                                    background:
                                      progress === 100
                                        ? "#10B981"
                                        : progress > 50
                                          ? "linear-gradient(90deg, #3B82F6, #8B5CF6)"
                                          : "#F59E0B",
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-2 text-xs">
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  <span className="font-medium">
                                    {stats.success} successful
                                  </span>
                                </div>
                                {stats.failure > 0 && (
                                  <div className="flex items-center text-red-600 dark:text-red-400">
                                    <i className="fas fa-times-circle mr-1"></i>
                                    <span className="font-medium">
                                      {stats.failure} failed
                                    </span>
                                  </div>
                                )}
                                {stats.pending > 0 && (
                                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                                    <i className="fas fa-clock mr-1"></i>
                                    <span className="font-medium">
                                      {stats.pending} pending
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {stats.failure > 0 && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryCampaign(campaign._id);
                            }}
                            variant="outline"
                            size="small"
                            icon="fas fa-redo"
                            loading={retryLoading}
                            className={isDarkMode 
                              ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
                              : 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400'
                            }
                          >
                            Retry Failed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Show details below selected campaign */}
                {isSelected && showDetails && (
                  <CampaignDetails
                    campaign={selectedCampaign}
                    details={campaignDetails}
                    onClose={() => {
                      setShowDetails(false);
                      setSelectedCampaign(null);
                      setCampaignDetails(null);
                    }}
                    onRetry={handleRetryCampaign}
                    loading={retryLoading}
                  />
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Pagination - Dark mode aware */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            onClick={() => fetchCampaigns(pagination.page - 1)}
            disabled={!pagination.hasPrevious}
            variant="outline"
            size="small"
            icon="fas fa-chevron-left"
            className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {pagination.total} total campaigns
            </span>
          </div>

          <Button
            onClick={() => fetchCampaigns(pagination.page + 1)}
            disabled={!pagination.hasNext}
            variant="outline"
            size="small"
            icon="fas fa-chevron-right"
            iconPosition="right"
            className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BulkEmailLogs;