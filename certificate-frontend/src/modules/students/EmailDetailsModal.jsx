// src/modules/students/EmailDetailsModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  SparklesIcon,
  ChevronRightIcon,
  InboxIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { useTheme } from "../../context/ThemeContext";

const EmailDetailsModal = ({ student, onClose }) => {
  const { isDarkMode } = useTheme();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const status = student?.emailStatus || {
    totalEmails: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    campaignHistory: [],
    lastEmailDate: null,
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "SENT":
        return <CheckCircleSolid className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case "FAILED":
        return <ExclamationCircleIcon className={`w-5 h-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />;
      case "PENDING":
        return <ClockIcon className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />;
      default:
        return <EnvelopeIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "SENT":
        return isDarkMode
          ? "bg-emerald-900/30 text-emerald-300 border-emerald-800"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FAILED":
        return isDarkMode
          ? "bg-rose-900/30 text-rose-300 border-rose-800"
          : "bg-rose-50 text-rose-700 border-rose-200";
      case "PENDING":
        return isDarkMode
          ? "bg-amber-900/30 text-amber-300 border-amber-800"
          : "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return isDarkMode
          ? "bg-gray-800 text-gray-300 border-gray-700"
          : "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getFailureReason = (item) => {
    if (item.remarks) return item.remarks;
    if (item.error) return item.error;
    switch (item.status?.toUpperCase()) {
      case "FAILED":
        return "Technical error during delivery";
      default:
        return "Delivery failed";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const failedEmails =
    status.campaignHistory?.filter((item) =>
      ["FAILED"].includes(item.status?.toUpperCase()),
    ) || [];

  const getFilteredEmails = () => {
    if (filter === "all") return status.campaignHistory || [];
    if (filter === "failed") return failedEmails;
    if (filter === "sent")
      return (
        status.campaignHistory?.filter(
          (item) => item.status?.toUpperCase() === "SENT",
        ) || []
      );
    if (filter === "pending")
      return (
        status.campaignHistory?.filter(
          (item) => item.status?.toUpperCase() === "PENDING",
        ) || []
      );
    return status.campaignHistory || [];
  };

  const stats = [
    {
      label: "Sent",
      value: status.successful,
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-green-500",
      bg: isDarkMode ? "bg-emerald-900/20" : "bg-emerald-50",
      text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
      border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
    },
    {
      label: "Failed",
      value: status.failed,
      icon: ExclamationCircleIcon,
      gradient: "from-rose-500 to-pink-500",
      bg: isDarkMode ? "bg-rose-900/20" : "bg-rose-50",
      text: isDarkMode ? "text-rose-300" : "text-rose-700",
      border: isDarkMode ? "border-rose-800" : "border-rose-200",
    },
    {
      label: "Pending",
      value: status.pending || 0,
      icon: ClockIcon,
      gradient: "from-amber-500 to-orange-500",
      bg: isDarkMode ? "bg-amber-900/20" : "bg-amber-50",
      text: isDarkMode ? "text-amber-300" : "text-amber-700",
      border: isDarkMode ? "border-amber-800" : "border-amber-200",
    },
    {
      label: "Success Rate",
      value:
        status.totalEmails > 0
          ? Math.round((status.successful / status.totalEmails) * 100)
          : 0,
      suffix: "%",
      icon: ChartBarIcon,
      gradient: "from-indigo-500 to-purple-500",
      bg: isDarkMode ? "bg-indigo-900/20" : "bg-indigo-50",
      text: isDarkMode ? "text-indigo-300" : "text-indigo-700",
      border: isDarkMode ? "border-indigo-800" : "border-indigo-200",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-sm z-50 ${
          isDarkMode ? 'bg-black/70' : 'bg-black/20'
        }`}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`fixed inset-4 md:inset-8 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header - Keep gradient as is (it's beautiful) */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex-shrink-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">
                    Email History
                  </h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white border border-white/30">
                    {status.totalEmails} total
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-indigo-100 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4" />
                    {student?.name || "Student"}
                  </p>
                  <span className="text-indigo-200 text-sm">•</span>
                  <p className="text-sm text-indigo-100 flex items-center gap-1.5">
                    <EnvelopeIcon className="w-4 h-4" />
                    {student?.email || "No email"}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Stats Cards - 4 per row - Dark mode aware */}
        <div className={`grid grid-cols-4 gap-3 p-4 border-b ${
          isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50/80 border-gray-200'
        }`}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`${stat.bg} rounded-xl p-3 border ${stat.border} transition-all duration-300 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}
                >
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-xl font-bold ${stat.text}`}>
                  {stat.value}
                  {stat.suffix || ""}
                </span>
              </div>
              <p className={`text-sm font-medium ${stat.text}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs - Dark mode aware */}
        <div className={`px-4 pt-3 flex gap-2 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          {["all", "sent", "failed", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-all relative ${
                filter === tab
                  ? isDarkMode ? "text-indigo-300" : "text-indigo-600"
                  : isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {filter === tab && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-t-lg border-t border-l border-r ${
                    isDarkMode 
                      ? 'bg-indigo-900/20 border-indigo-800' 
                      : 'bg-indigo-50 border-indigo-200'
                  }`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "failed" && failedEmails.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    isDarkMode 
                      ? 'bg-rose-900/30 text-rose-300' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {failedEmails.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Grid View - 4 Columns - Dark mode aware */}
        <div className={`flex-1 overflow-y-auto p-4 ${
          isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
        }`}>
          {getFilteredEmails().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getFilteredEmails().map((item, index) => {
                const isFailed = item.status?.toUpperCase() === "FAILED";

                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative"
                  >
                    {/* Card - Dark mode aware */}
                    <div
                      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                        isDarkMode 
                          ? isFailed
                            ? 'bg-gray-800 border-rose-800 hover:border-rose-700'
                            : 'bg-gray-800 border-gray-700 hover:border-indigo-700'
                          : isFailed
                            ? 'bg-white border-rose-200 hover:border-rose-300'
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                      } hover:shadow-lg`}
                    >
                      {/* Card Header */}
                      <div
                        className={`px-4 py-3 flex items-center justify-between border-b ${
                          isDarkMode
                            ? isFailed
                              ? 'border-rose-800 bg-rose-900/20'
                              : 'border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800'
                            : isFailed
                              ? 'border-rose-200 bg-rose-50/50'
                              : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <span className={`text-xs flex items-center gap-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {formatDate(item.date)}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <h4 className={`text-base font-semibold mb-2 line-clamp-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.title || "Untitled Email"}
                        </h4>

                        {item.subject && (
                          <p className={`text-sm mb-3 line-clamp-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Subject:</span>{" "}
                            {item.subject}
                          </p>
                        )}

                        {/* Failed Indicator */}
                        {isFailed && (
                          <div className={`mb-3 p-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-rose-900/20 border-rose-800' 
                              : 'bg-rose-50 border-rose-200'
                          }`}>
                            <p className={`text-xs line-clamp-2 flex items-start gap-1.5 ${
                              isDarkMode ? 'text-rose-300' : 'text-rose-700'
                            }`}>
                              <SparklesIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {getFailureReason(item)}
                            </p>
                          </div>
                        )}

                        {/* Single Action Button - Preview Only */}
                        <button
                          onClick={() => {
                            setSelectedEmail(item);
                            setShowPreview(true);
                          }}
                          className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${
                            isDarkMode
                              ? 'bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/30 border-indigo-800'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                          }`}
                        >
                          <EyeIcon className="w-4 h-4" /> View Details
                        </button>

                        {/* Expand/Collapse */}
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === item.id ? null : item.id,
                            )
                          }
                          className={`w-full mt-3 text-xs flex items-center justify-center gap-1 ${
                            isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {expandedId === item.id ? "Show less" : "Show more"}
                          <ChevronRightIcon
                            className={`w-4 h-4 transition-transform ${expandedId === item.id ? "rotate-90" : ""}`}
                          />
                        </button>

                        {/* Expanded Content */}
                        {expandedId === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mt-3 pt-3 border-t border-dashed space-y-2 ${
                              isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            {item.recipient && (
                              <p className="flex items-center gap-2">
                                <EnvelopeIcon className={`w-4 h-4 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`} />
                                {item.recipient}
                              </p>
                            )}
                            {item.content && (
                              <p className={`text-sm line-clamp-3 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {item.content}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border ${
                  isDarkMode 
                    ? 'bg-indigo-900/20 border-indigo-800' 
                    : 'bg-indigo-50 border-indigo-100'
                }`}>
                  <InboxIcon className={`w-8 h-8 ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-400'
                  }`} />
                </div>
                <p className={`text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>No emails found</p>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`}>
                  No {filter} emails to display
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer - Dark mode aware */}
        <div className={`border-t p-3 flex justify-between items-center ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className={`flex items-center gap-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <ShieldCheckIcon className={`w-4 h-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <span>Secure & Encrypted</span>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 text-sm rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Close
          </button>
        </div>
      </motion.div>

      {/* Preview Modal - Dark mode aware */}
      <AnimatePresence>
        {showPreview && selectedEmail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[60] ${
                isDarkMode ? 'bg-black/80' : 'bg-black/40'
              }`}
              onClick={() => setShowPreview(false)}
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-2xl rounded-xl p-6 shadow-2xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`text-xl font-semibold flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'
                    }`}>
                      <EyeIcon className={`w-5 h-5 ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`} />
                    </div>
                    Email Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Status Badge */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Status</p>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(selectedEmail.status)}`}
                    >
                      {getStatusIcon(selectedEmail.status)}
                      {selectedEmail.status}
                    </span>
                  </div>

                  {/* Email Content */}
                  <div className={`border rounded-lg overflow-hidden ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedEmail.title || "Untitled"}
                      </h4>
                      {selectedEmail.subject && (
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <span className="font-medium">Subject:</span>{" "}
                          {selectedEmail.subject}
                        </p>
                      )}
                    </div>
                    <div className={`p-4 text-base min-h-[150px] ${
                      isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
                    }`}>
                      {selectedEmail.content || (
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                          No content available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Recipient</p>
                    <p className={`text-base flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <EnvelopeIcon className={`w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      {selectedEmail.recipient ||
                        student?.email ||
                        "Not specified"}
                    </p>
                  </div>

                  {/* Failure Reason */}
                  {selectedEmail.status?.toUpperCase() === "FAILED" && (
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-rose-900/20 border-rose-800' 
                        : 'bg-rose-50 border-rose-200'
                    }`}>
                      <p className={`text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-rose-300' : 'text-rose-800'
                      }`}>
                        Failure Reason
                      </p>
                      <p className={`text-base ${
                        isDarkMode ? 'text-rose-300' : 'text-rose-700'
                      }`}>
                        {selectedEmail.remarks ||
                          getFailureReason(selectedEmail)}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`flex justify-end mt-5 pt-4 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`px-5 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default EmailDetailsModal;