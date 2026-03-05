// src/modules/emailConfig/EmailConfigList.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useToast } from "../../hooks/useToast";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmailConfigTable from "./EmailConfigTable";
import EmptyState from "../../components/common/EmptyState";
import { useTheme } from "../../context/ThemeContext";

const EmailConfigList = () => {
    const { isDarkMode } = useTheme();
    const [emailConfigs, setEmailConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailFormData, setEmailFormData] = useState({
        email: "",
        appPassword: "",
        provider: "gmail",
        host: "",
        port: "",
        isActive: true,
    });

    const [editingId, setEditingId] = useState(null);
    const [testingEmail, setTestingEmail] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showPassword, setShowPassword] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
    });

    const { showToast } = useToast();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadEmailConfigs();
    }, [pagination.page, searchTerm, statusFilter]);

    const loadEmailConfigs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
            });

            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active');

            const response = await fetch(`${API_URL}/email-config?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setEmailConfigs(data.data);
                if (data.pagination) {
                    setPagination(prev => ({ 
                        ...prev, 
                        ...data.pagination,
                        hasPrevious: data.pagination.page > 1,
                        hasNext: data.pagination.page < data.pagination.totalPages
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading email configs:', error);
            showToast('Failed to load email configurations', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailFormChange = (e) => {
        const { name, value } = e.target;
        setEmailFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const noSpaces = e.target.value.replace(/\s/g, '');
        setEmailFormData(prev => ({
            ...prev,
            appPassword: noSpaces
        }));
    };

    const handlePasswordPaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const noSpaces = pastedText.replace(/\s/g, '');
        setEmailFormData(prev => ({
            ...prev,
            appPassword: noSpaces
        }));
    };

    const handleEditClick = (config) => {
        setEditingId(config._id);
        setEmailFormData({
            email: config.email,
            appPassword: config.appPassword,
            provider: config.provider || "gmail",
            host: config.host || "",
            port: config.port || "",
            isActive: config.isActive !== undefined ? config.isActive : true,
        });
        setShowEmailForm(true);
    };

    const handleSaveEmailConfig = async (e) => {
        e.preventDefault();

        if (!emailFormData.email || !emailFormData.appPassword) {
            showToast('Email and App Password are required', 'error');
            return;
        }

        if (emailFormData.provider === "custom") {
            if (!emailFormData.host || !emailFormData.port) {
                showToast("Host and Port are required for custom provider", "error");
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${API_URL}/email-config/${editingId}`
                : `${API_URL}/email-config`;

            const method = editingId ? 'PUT' : 'POST';

            const payload = { ...emailFormData };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                showToast(`Email configuration ${editingId ? 'updated' : 'added'} successfully`, 'success');
                setShowEmailForm(false);
                setEditingId(null);
                setEmailFormData({
                    email: '',
                    appPassword: '',
                    provider: 'gmail',
                    host: '',
                    port: '',
                    isActive: true
                });
                loadEmailConfigs();
            } else {
                showToast(data.message || `Failed to ${editingId ? 'update' : 'add'} email configuration`, 'error');
            }
        } catch (error) {
            console.error(`Error ${editingId ? 'updating' : 'adding'} email config:`, error);
            showToast(`Failed to ${editingId ? 'update' : 'add'} email configuration`, 'error');
        }
    };

    const handleCloseForm = () => {
        setShowEmailForm(false);
        setEditingId(null);
        setEmailFormData({
            email: '',
            appPassword: '',
            provider: 'gmail',
            host: '',
            port: '',
            isActive: true
        });
        setShowPassword(false);
    };

    const handleToggleStatus = async (config) => {
        try {
            const token = localStorage.getItem('token');

            if (!config.isActive) {
                const response = await fetch(
                    `${API_URL}/email-config/activate/${config._id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data = await response.json();

                if (data.success) {
                    showToast('Email activated successfully', 'success');
                    loadEmailConfigs();
                } else {
                    showToast(data.message || 'Failed to activate email', 'error');
                }
            } else {
                showToast('Active email cannot be manually deactivated', 'warning');
            }

        } catch (error) {
            console.error('Error updating email status:', error);
            showToast('Failed to update email status', 'error');
        }
    };

    const handleDeleteEmailConfig = async (id) => {
        if (!window.confirm('Are you sure you want to delete this email configuration?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/email-config/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (data.success) {
                showToast('Email configuration deleted successfully', 'success');
                loadEmailConfigs();
            } else {
                showToast(data.message || 'Failed to delete email configuration', 'error');
            }
        } catch (error) {
            console.error('Error deleting email config:', error);
            showToast('Failed to delete email configuration', 'error');
        }
    };

    const handleTestEmail = async (emailConfig) => {
        try {
            setTestingEmail(emailConfig._id);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/email-config/test/${emailConfig._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: emailConfig.email,
                    subject: 'Test Email',
                    message: 'Test email from Mail Config.'
                })
            });

            if (response.status === 404) {
                showToast('Test email functionality not available on backend yet.', 'warning');
                return;
            }

            const data = await response.json();

            if (data.success) {
                showToast(`Test email sent successfully to ${emailConfig.email}`, 'success');
            } else {
                showToast(data.message || 'Failed to send test email', 'error');
            }
        } catch (error) {
            console.error('Error testing email:', error);
            showToast('Failed to send test email', 'error');
        } finally {
            setTestingEmail(null);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className={`space-y-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : ''}`}>
            {/* Clean Header */}
            <div className={`border rounded-lg p-6 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Email Configuration
                        </h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Manage sender email accounts
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowEmailForm(true)}
                        variant="primary"
                        icon="fas fa-plus"
                    >
                        Add New Email
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className={`border rounded-lg p-5 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Search Emails
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by email or provider..."
                                className={`w-full rounded-lg border px-4 py-2.5 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                            />
                            <i className={`fas fa-search absolute left-3 top-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button
                            onClick={loadEmailConfigs}
                            variant="outline"
                            icon="fas fa-sync-alt"
                            className={`flex-1 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
                        >
                            Refresh
                        </Button>
                        {(searchTerm || statusFilter !== 'all') && (
                            <Button
                                onClick={clearFilters}
                                variant="secondary"
                                icon="fas fa-times"
                                className="px-4"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`animate-pulse rounded-lg p-6 h-20 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                        }`}></div>
                    ))}
                </div>
            ) : emailConfigs.length === 0 ? (
                <EmptyState
                    title="No email configurations found"
                    description={
                        searchTerm || statusFilter !== 'all'
                            ? 'Try changing your search or filters'
                            : 'Add your first sender email to get started.'
                    }
                    icon="fas fa-envelope"
                    actionText="Add Email Account"
                    onAction={() => setShowEmailForm(true)}
                />
            ) : (
                <>
                    <EmailConfigTable
                        emailConfigs={emailConfigs}
                        onDelete={handleDeleteEmailConfig}
                        onEdit={handleEditClick}
                        onToggleStatus={handleToggleStatus}
                        onTest={handleTestEmail}
                        testingEmail={testingEmail}
                    />

                    {/* Pagination */}
                    <div className={`border rounded-lg px-4 py-3 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={!pagination.hasPrevious}
                                    className={`px-3 py-1.5 rounded border ${
                                        !pagination.hasPrevious
                                            ? isDarkMode
                                                ? 'bg-gray-700 text-gray-500 border-gray-600'
                                                : 'bg-gray-100 text-gray-400 border-gray-300'
                                            : isDarkMode
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                                : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                
                                <span className={`px-3 py-1.5 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                                    disabled={!pagination.hasNext}
                                    className={`px-3 py-1.5 rounded border ${
                                        !pagination.hasNext
                                            ? isDarkMode
                                                ? 'bg-gray-700 text-gray-500 border-gray-600'
                                                : 'bg-gray-100 text-gray-400 border-gray-300'
                                            : isDarkMode
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                                : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Clean Modal with Auto Space Removal */}
            {showEmailForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className={`fixed inset-0 transition-opacity ${
                            isDarkMode ? 'bg-gray-900/90' : 'bg-gray-500 bg-opacity-75'
                        }`} onClick={handleCloseForm}></div>

                        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <div className={`px-6 pt-6 pb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {editingId ? 'Edit Email Account' : 'Add New Email Account'}
                                    </h3>
                                    <button
                                        onClick={handleCloseForm}
                                        className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <form onSubmit={handleSaveEmailConfig} className="space-y-4" autoComplete="off">
                                    {/* Hidden fields to prevent Chrome autofill */}
                                    <input type="text" name="fakeuser" style={{ display: 'none' }} />
                                    <input type="password" name="fakepass" style={{ display: 'none' }} />

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            autoComplete="off"
                                            value={emailFormData.email}
                                            onChange={handleEmailFormChange}
                                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                            }`}
                                            placeholder="sender@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            App Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="appPassword"
                                                autoComplete="new-password"
                                                value={emailFormData.appPassword}
                                                onChange={handlePasswordChange}
                                                onPaste={handlePasswordPaste}
                                                className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                                }`}
                                                placeholder="Enter app password (spaces removed)"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute inset-y-0 right-0 px-3 flex items-center ${
                                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                            </button>
                                        </div>
                                        <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Spaces are automatically removed
                                        </p>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Provider
                                        </label>
                                        <select
                                            name="provider"
                                            value={emailFormData.provider}
                                            onChange={handleEmailFormChange}
                                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <option value="gmail">Gmail</option>
                                            <option value="outlook">Outlook</option>
                                            <option value="yahoo">Yahoo</option>
                                            <option value="custom">Custom SMTP</option>
                                        </select>
                                    </div>

                                    {emailFormData.provider === "custom" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Host
                                                </label>
                                                <input
                                                    type="text"
                                                    name="host"
                                                    value={emailFormData.host}
                                                    onChange={handleEmailFormChange}
                                                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                                    }`}
                                                    placeholder="smtp.example.com"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Port
                                                </label>
                                                <input
                                                    type="text"
                                                    name="port"
                                                    value={emailFormData.port}
                                                    onChange={handleEmailFormChange}
                                                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                                    }`}
                                                    placeholder="587"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={emailFormData.isActive}
                                            onChange={(e) => setEmailFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isActive" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            Set as active email
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="flex-1"
                                        >
                                            {editingId ? 'Update Email' : 'Add Email'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleCloseForm}
                                            variant="outline"
                                            className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailConfigList;