import React from 'react';

const EmailConfigTable = ({ emailConfigs, onDelete, onEdit, onToggleStatus, onTest, testingEmail }) => {
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
        <div className="overflow-hidden bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 shadow-lg relative">
            {/* Scrollable container with custom scrollbar */}
            <div 
                className="scroll-container"
                style={{
                    position: 'relative',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 140px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3b82f6 #f1f5f9',
                }}
            >
                <style jsx>{`
                    .scroll-container::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    .scroll-container::-webkit-scrollbar-track {
                        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                        border-radius: 10px;
                    }
                    .scroll-container::-webkit-scrollbar-thumb {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        border-radius: 10px;
                        border: 2px solid #f8fafc;
                    }
                    .scroll-container::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    }
                    .table-row-hover:hover {
                        background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
                        transform: translateX(4px);
                        transition: all 0.3s ease;
                    }
                    .action-button {
                        transition: all 0.2s ease;
                    }
                    .action-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                `}</style>

                <table className="min-w-full divide-y divide-blue-100">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky -top-1 z-10">
                        <tr>
                            <th className="px-8 py-4 text-left">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <i className="fas fa-at"></i>
                                    Email Account
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <i className="fas fa-cloud"></i>
                                    Provider
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <i className="fas fa-signal"></i>
                                    Status
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <i className="fas fa-calendar-plus"></i>
                                    Added Date
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <i className="fas fa-cogs"></i>
                                    Actions
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-blue-100">
                        {emailConfigs.map((config, index) => (
                            <tr 
                                key={config._id} 
                                className="table-row-hover transition-all duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Email Account */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center">
                                        <div className={`relative w-12 h-12 rounded-2xl mr-4 bg-gradient-to-br ${config.isActive 
                                            ? 'from-emerald-100 to-green-100 shadow-lg shadow-emerald-200/50' 
                                            : 'from-gray-100 to-gray-200 shadow-lg shadow-gray-200/50'
                                        }`}>
                                            <div className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getProviderColor(config.provider)}`}>
                                                <i className={`${getProviderIcon(config.provider)} text-lg text-white`}></i>
                                            </div>
                                            {config.isActive && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <i className="fas fa-check text-xs text-white"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {config.email}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {config.provider || 'Gmail'} • {config.isActive ? 'Active now' : 'Inactive'}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Provider */}
                                <td className="px-8 py-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <i className={`${getProviderIcon(config.provider)} ${getProviderColor(config.provider).replace('from-', 'text-').split(' ')[0]}`}></i>
                                        <span className="text-sm font-medium text-gray-700 capitalize">
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
                                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
                                        <i className="fas fa-calendar-alt text-gray-400"></i>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(config.createdAt)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Added
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                    

                                        <button
                                            onClick={() => onEdit(config)}
                                            className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-green-100 transition-all duration-300 action-button"
                                            title="Edit Configuration"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>

                                        <button
                                            onClick={() => onDelete(config._id)}
                                            className="p-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 transition-all duration-300 action-button"
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-3 border-t border-blue-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                            <span>{emailConfigs.filter(e => e.isActive).length} Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"></div>
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