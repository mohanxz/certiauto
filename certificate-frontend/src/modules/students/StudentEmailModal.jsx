import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { mailTemplatesAPI } from '../../api/temp';
import { certificateTemplatesAPI } from '../../api/certificateTemplates';
import { bulkEmailAPI } from '../../api/bulkEmail';

const StudentEmailModal = ({ student, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailConfigs, setEmailConfigs] = useState([]);
    const [mailTemplates, setMailTemplates] = useState([]);
    const [certificateTemplates, setCertificateTemplates] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        senderEmailId: '',
        subject: '',
        body: '',
        mailTemplateId: '',
        includeCertificate: false,
        certificateTemplateId: ''
    });

    const { showToast } = useToast();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Parallel fetch for resources
            const [emailsRes, mailTemplRes, certTemplRes] = await Promise.all([
                fetch(`${API_URL}/email-config?isActive=true`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()),
                mailTemplatesAPI.getAllTemplates(),
                certificateTemplatesAPI.getAllTemplates()
            ]);

            // Handle Emails
            if (emailsRes.success) {
                setEmailConfigs(emailsRes.data);
                if (emailsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, senderEmailId: emailsRes.data[0]._id }));
                }
            }

            // Handle Mail Templates
            if (mailTemplRes.success) {
                setMailTemplates(mailTemplRes.data || []);
            } else if (mailTemplRes.data?.success) {
                setMailTemplates(mailTemplRes.data.data || []);
            }

            // Handle Certificate Templates
            if (certTemplRes.success) {
                setCertificateTemplates(certTemplRes.data || []);
            } else if (certTemplRes.data?.success) {
                setCertificateTemplates(certTemplRes.data.data || []);
            }

        } catch (error) {
            console.error("Error loading resources:", error);
            showToast("Failed to load email configurations or templates", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleMailTemplateChange = (e) => {
        const templateId = e.target.value;
        const template = mailTemplates.find(t => t._id === templateId);

        if (template) {
            setFormData(prev => ({
                ...prev,
                mailTemplateId: templateId,
                subject: template.subject,
                body: template.body
            }));
        } else {
            setFormData(prev => ({ ...prev, mailTemplateId: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.senderEmailId) {
            showToast("Please select a sender email", "error");
            return;
        }
        if (!formData.subject) {
            showToast("Please enter a subject", "error");
            return;
        }
        if (!formData.body) {
            showToast("Please enter email content", "error");
            return;
        }
        if (formData.includeCertificate && !formData.certificateTemplateId) {
            showToast("Please select a certificate template", "error");
            return;
        }

        try {
            setSending(true);

            const payload = {
                title: `Individual Email - ${student.name}`,
                type: formData.includeCertificate ? "CERTIFICATE" : "EMAIL",
                subject: formData.subject,
                body: formData.body,
                senderEmailId: formData.senderEmailId,
                studentIds: [student._id],
                mailTemplateId: formData.mailTemplateId || null,
                certificateTemplateId: formData.includeCertificate ? formData.certificateTemplateId : null,
                // Required by backend but can be inferred or empty for single student if backend allows, 
                // else we might need to fetch student's batch/course.
                // Assuming backend creates job based on studentIds mainly.
                batchIds: student.batchId ? [student.batchId._id || student.batchId] : [],
                courseIds: []
            };

            const response = await bulkEmailAPI.createCampaign(payload);

            if (response.success || response.data?.success) {
                showToast("Email sent successfully", "success");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                showToast(response.message || "Failed to send email", "error");
            }

        } catch (error) {
            console.error("Error sending email:", error);
            showToast("Failed to send email", "error");
        } finally {
            setSending(false);
        }
    };

    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-gray-900">
                                Send Email to <span className="text-blue-600">{student.name}</span>
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Sender Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        From Email <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.senderEmailId}
                                        onChange={(e) => setFormData({ ...formData, senderEmailId: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Sender Email</option>
                                        {emailConfigs.map(config => (
                                            <option key={config._id} value={config._id}>
                                                {config.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Template Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Load Template (Optional)
                                    </label>
                                    <select
                                        value={formData.mailTemplateId}
                                        onChange={handleMailTemplateChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Choose a template --</option>
                                        {mailTemplates.map(template => (
                                            <option key={template._id} value={template._id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Email Subject"
                                        required
                                    />
                                </div>

                                {/* Body (Rich Text) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <div className="bg-white">
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.body}
                                            onChange={(content) => setFormData({ ...formData, body: content })}
                                            modules={modules}
                                            className="h-48 mb-12"
                                        />
                                    </div>
                                </div>

                                {/* Certificate Option */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center mb-3">
                                        <input
                                            type="checkbox"
                                            id="includeCertificate"
                                            checked={formData.includeCertificate}
                                            onChange={(e) => setFormData({ ...formData, includeCertificate: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="includeCertificate" className="ml-2 block text-sm text-gray-900 font-medium">
                                            Attach Certificate
                                        </label>
                                    </div>

                                    {formData.includeCertificate && (
                                        <div className="pl-6 animate-fadeIn">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Select Certificate Template <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.certificateTemplateId}
                                                onChange={(e) => setFormData({ ...formData, certificateTemplateId: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                                required={formData.includeCertificate}
                                            >
                                                <option value="">-- Choose Certificate Template --</option>
                                                {certificateTemplates.map(template => (
                                                    <option key={template._id} value={template._id}>
                                                        {template.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        type="button"
                                        disabled={sending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={sending}
                                        icon={sending ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}
                                    >
                                        {sending ? "Sending..." : "Send Email"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentEmailModal;
