// src/modules/emailConfig/EmailConfigTable.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const EmailConfigTable = ({ emailConfigs, onDelete, onEdit, onToggleStatus, onTest, testingEmail }) => {
    const { isDarkMode } = useTheme();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getProviderIcon = (provider) => {
        switch (provider?.toLowerCase()) {
            case 'gmail': return 'fab fa-google';
            case 'outlook': return 'fab fa-microsoft';
            case 'yahoo': return 'fab fa-yahoo';
            default: return 'fas fa-envelope';
        }
    };

    const getProviderColor = (provider) => {
        switch (provider?.toLowerCase()) {
            case 'gmail': return 'from-red-500 to-red-600';
            case 'outlook': return 'from-blue-500 to-blue-600';
            case 'yahoo': return 'from-purple-500 to-purple-600';
            default: return 'from-gray-600 to-gray-700';
        }
    };

    return (
        <div className={`overflow-hidden rounded-2xl border shadow-lg relative ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
                : 'bg-gradient-to-br from-white to-blue-50 border-blue-100'
        }`}>
            {/* Scrollable container with custom scrollbar */}
            <div 
                className="scroll-container"
                style={{
                    position: 'relative',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 140px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: isDarkMode ? '#4B5563 #374151' : '#3b82f6 #f1f5f9',
                }}
            >
                <style jsx>{`
                    .scroll-container::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    .scroll-container::-webkit-scrollbar-track {
                        background: ${isDarkMode ? '#374151' : '#f8fafc'};
                        border-radius: 10px;
                    }
                    .scroll-container::-webkit-scrollbar-thumb {
                        background: ${isDarkMode ? '#4B5563' : '#3b82f6'};
                        border-radius: 10px;
                        border: 2px solid ${isDarkMode ? '#1F2937' : '#f8fafc'};
                    }
                    .scroll-container::-webkit-scrollbar-thumb:hover {
                        background: ${isDarkMode ? '#6B7280' : '#2563eb'};
                    }
                    .table-row-hover:hover {
                        background: ${isDarkMode 
                            ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' 
                            : 'linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)'};
                        transform: translateX(4px);
                        transition: all 0.3s ease;
                    }
                    .action-button {
                        transition: all 0.2s ease;
                    }
                    .action-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, ${isDarkMode ? '0.3' : '0.1'});
                    }
                `}</style>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`sticky -top-1 z-10 ${
                        isDarkMode 
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                    }`}>
                        <tr>
                            <th className="px-8 py-4 text-left">
                                <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <i className="fas fa-at"></i>
                                    Email Account
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <i className="fas fa-cloud"></i>
                                    Provider
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <i className="fas fa-signal"></i>
                                    Status
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <i className="fas fa-calendar-plus"></i>
                                    Added Date
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <i className="fas fa-cogs"></i>
                                    Actions
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-blue-100'}`}>
                        {emailConfigs.map((config, index) => (
                            <tr 
                                key={config._id} 
                                className="table-row-hover transition-all duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Email Account */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center">
                                        <div className={`relative w-12 h-12 rounded-2xl mr-4 ${
                                            config.isActive 
                                                ? isDarkMode
                                                    ? 'from-emerald-900/30 to-green-900/30 shadow-lg shadow-emerald-900/20'
                                                    : 'from-emerald-100 to-green-100 shadow-lg shadow-emerald-200/50'
                                                : isDarkMode
                                                    ? 'from-gray-700 to-gray-600 shadow-lg shadow-gray-800/50'
                                                    : 'from-gray-100 to-gray-200 shadow-lg shadow-gray-200/50'
                                        }`}>
                                            <div className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getProviderColor(config.provider)}`}>
                                                <i className={`${getProviderIcon(config.provider)} text-lg text-white`}></i>
                                            </div>
                                            {config.isActive && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                    <i className="fas fa-check text-xs text-white"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {config.email}
                                            </div>
                                            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {config.provider || 'Gmail'} • {config.isActive ? 'Active now' : 'Inactive'}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Provider */}
                                <td className="px-8 py-5">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                        isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                                    }`}>
                                        <i className={`${getProviderIcon(config.provider)} ${getProviderColor(config.provider).replace('from-', 'text-').split(' ')[0]}`}></i>
                                        <span className={`text-sm font-medium capitalize ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            {config.provider || 'Gmail'}
                                        </span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-8 py-5">
                                    <button
                                        onClick={() => onToggleStatus(config)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 action-button ${
                                            config.isActive
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40'
                                                : isDarkMode
                                                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 shadow-lg shadow-gray-800/30 hover:shadow-xl hover:shadow-gray-800/40'
                                                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40'
                                        }`}
                                        title={`Click to ${config.isActive ? 'deactivate' : 'activate'}`}
                                    >
                                        <i className={`fas ${config.isActive ? 'fa-bolt' : 'fa-pause'} text-sm`}></i>
                                        {config.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>

                                {/* Added Date */}
                                <td className="px-8 py-5">
                                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100'
                                    }`}>
                                        <i className={`fas fa-calendar-alt ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
                                        <div>
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {formatDate(config.createdAt)}
                                            </div>
                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Added
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onTest(config)}
                                            disabled={testingEmail === config._id}
                                            className={`p-3 rounded-xl transition-all duration-300 action-button ${
                                                isDarkMode
                                                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/30'
                                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100'
                                            }`}
                                            title="Test Configuration"
                                        >
                                            <i className={`fas ${testingEmail === config._id ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                                        </button>

                                        <button
                                            onClick={() => onEdit(config)}
                                            className={`p-3 rounded-xl transition-all duration-300 action-button ${
                                                isDarkMode
                                                    ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/30'
                                                    : 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-green-100'
                                            }`}
                                            title="Edit Configuration"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>

                                        <button
                                            onClick={() => onDelete(config._id)}
                                            className={`p-3 rounded-xl transition-all duration-300 action-button ${
                                                isDarkMode
                                                    ? 'bg-red-900/30 text-red-400 hover:bg-red-800/30'
                                                    : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100'
                                            }`}
                                            title="Delete Account"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className={`px-8 py-3 border-t ${
                isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
            }`}>
                <div className={`flex items-center justify-between text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                            <span>{emailConfigs.filter(e => e.isActive).length} Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                                isDarkMode 
                                    ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}></div>
                            <span>{emailConfigs.filter(e => !e.isActive).length} Inactive</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-info-circle text-blue-400"></i>
                        <span>Total: {emailConfigs.length} accounts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfigTable;