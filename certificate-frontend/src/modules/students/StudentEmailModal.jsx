// src/modules/students/StudentEmailModal.jsx
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Button from "../../components/ui/Button";
import { useToast } from "../../hooks/useToast";
import { mailTemplatesAPI } from "../../api/temp";
import { certificateTemplatesAPI } from "../../api/certificateTemplates";
import { bulkEmailAPI } from "../../api/bulkEmail";
import { useTheme } from "../../context/ThemeContext";

const StudentEmailModal = ({ student, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [mailTemplates, setMailTemplates] = useState([]);
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  const [certificateType, setCertificateType] = useState("COURSE_CERTIFICATE");

  // Form State
  const [formData, setFormData] = useState({
    senderEmailId: "",
    subject: "",
    body: "",
    mailTemplateId: "",
    includeCertificate: false,
    certificateTemplateId: "",
  });

  const { showToast } = useToast();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const emailsRes = await fetch(`${API_URL}/email-config`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json());

      const mailTemplRes = await mailTemplatesAPI.getAllTemplates();
      const certTemplRes = await certificateTemplatesAPI.getAllTemplates();

      if (emailsRes.success) {
        setEmailConfigs(emailsRes.data);

        const activeEmail = emailsRes.data.find((e) => e.isActive);
        if (activeEmail) {
          setFormData((prev) => ({ ...prev, senderEmailId: activeEmail._id }));
        } else if (emailsRes.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            senderEmailId: emailsRes.data[0]._id,
          }));
          showToast(
            "No active email found. Please activate an email in Bulk Email Campaign first.",
            "warning",
          );
        } else {
          showToast(
            "No email configurations found. Please add one in Bulk Email Campaign.",
            "error",
          );
        }
      }

      if (mailTemplRes.success) {
        setMailTemplates(mailTemplRes.data || []);
      }

      if (certTemplRes.success) {
        setCertificateTemplates(certTemplRes.data || []);
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
    if (!templateId) {
      setFormData((prev) => ({ ...prev, mailTemplateId: "" }));
      return;
    }

    const template = mailTemplates.find((t) => t._id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        mailTemplateId: templateId,
        subject: template.subject,
        body: template.body,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return;
    }

    const selectedEmail = emailConfigs.find(
      (e) => e._id === formData.senderEmailId,
    );
    if (!selectedEmail) {
      showToast("Selected email configuration not found", "error");
      return;
    }

    if (!selectedEmail.isActive) {
      const proceed = window.confirm(
        `The email "${selectedEmail.email}" is not active. Emails may fail to send.\n\n` +
          `Do you want to continue anyway?`,
      );
      if (!proceed) return;
    }

    if (!formData.subject.trim()) {
      showToast("Please enter a subject", "error");
      return;
    }

    if (!formData.body.trim()) {
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
        title: `Individual - ${student.name}`,
        type: formData.includeCertificate ? certificateType : "EMAIL",
        subject: formData.subject,
        body: formData.body,
        senderEmailId: formData.senderEmailId,
        studentIds: [student._id],
        mailTemplateId: formData.mailTemplateId || null,
        certificateTemplateId: formData.includeCertificate
          ? formData.certificateTemplateId
          : null,
        batchIds: student.batchId
          ? [student.batchId._id || student.batchId]
          : [],
        courseIds: student.enrolledCourseIds?.map((c) => c._id || c) || [],
      };

      console.log("Sending email with payload:", {
        ...payload,
        senderEmail: selectedEmail.email,
        isActive: selectedEmail.isActive,
      });

      const response = await bulkEmailAPI.createCampaign(payload);

      if (response.success || response.data?.success) {
        showToast(
          `Email sent successfully to ${student.name} from ${selectedEmail.email}`,
          "success",
        );

        if (window.confetti) {
          window.confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
          });
        }

        if (onSuccess) onSuccess();
        setTimeout(onClose, 1500);
      } else {
        showToast(response.message || "Failed to send email", "error");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showToast(error.message || "Failed to send email", "error");
    } finally {
      setSending(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const debugState = () => {
    console.log("=== DEBUG INFO ===");
    console.log(
      "Email Configs:",
      emailConfigs.map((e) => ({
        email: e.email,
        id: e._id,
        isActive: e.isActive,
      })),
    );
    console.log("Selected Email ID:", formData.senderEmailId);
    const selected = emailConfigs.find((e) => e._id === formData.senderEmailId);
    console.log("Selected Email:", selected);
    console.log("Student:", student);
    console.log("Include Certificate:", formData.includeCertificate);
    console.log("Certificate Type:", certificateType);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className={`absolute inset-0 ${
              isDarkMode ? 'bg-gray-900/80' : 'bg-gray-500/75'
            }`}
            onClick={onClose}
          ></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className={`inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Send Email to{" "}
                <span className="text-blue-600 dark:text-blue-400">{student.name}</span>
              </h3>
              <div className="flex items-center gap-2">
                {/* Debug button - remove in production */}
                <button
                  onClick={debugState}
                  className={`text-xs px-2 py-1 border rounded ${
                    isDarkMode 
                      ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500' 
                      : 'text-gray-400 border-gray-300 hover:text-gray-600'
                  }`}
                  type="button"
                >
                  Debug
                </button>
                <button
                  onClick={onClose}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <i className="fas fa-spinner fa-spin text-3xl text-blue-500 dark:text-blue-400"></i>
              </div>
            ) : emailConfigs.length === 0 ? (
              <div className="text-center py-10">
                <i className={`fas fa-envelope text-4xl mb-3 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-300'
                }`}></i>
                <p className={`mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No email configurations found
                </p>
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Please add an email configuration in Bulk Email Campaign first
                </p>
                <Button onClick={onClose} variant="primary">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sender Email with Status */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    From Email <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.senderEmailId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        senderEmailId: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select Sender Email</option>
                    {emailConfigs.map((config) => (
                      <option key={config._id} value={config._id}>
                        {config.email}{" "}
                        {config.isActive ? "✓ Active" : "⚪ Inactive"}
                      </option>
                    ))}
                  </select>

                  {/* Show selected email status */}
                  {formData.senderEmailId && (
                    <div className="mt-2 text-sm">
                      {(() => {
                        const selected = emailConfigs.find(
                          (e) => e._id === formData.senderEmailId,
                        );
                        return selected ? (
                          <span
                            className={
                              selected.isActive
                                ? "text-green-600 dark:text-green-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }
                          >
                            <i
                              className={`fas ${selected.isActive ? "fa-check-circle" : "fa-exclamation-triangle"} mr-1`}
                            ></i>
                            {selected.isActive
                              ? `Ready to send from ${selected.email}`
                              : `Warning: ${selected.email} is not active. Emails may fail.`}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Template Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Load Template (Optional)
                  </label>
                  <select
                    value={formData.mailTemplateId}
                    onChange={handleMailTemplateChange}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">-- Choose a template --</option>
                    {mailTemplates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Email Subject"
                    required
                  />
                </div>

                {/* Body (Rich Text) */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className={`${isDarkMode ? 'dark-quill' : ''}`}>
                    <ReactQuill
                      theme="snow"
                      value={formData.body}
                      onChange={(content) =>
                        setFormData({ ...formData, body: content })
                      }
                      modules={modules}
                      className={`h-48 mb-12 ${
                        isDarkMode ? 'dark-quill' : ''
                      }`}
                      placeholder="Write your message here... Use {name}, {uniqueId} as placeholders"
                    />
                  </div>
                </div>

                {/* Certificate Option */}
                <div className={`pt-4 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="includeCertificate"
                      checked={formData.includeCertificate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          includeCertificate: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="includeCertificate"
                      className={`ml-2 block text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}
                    >
                      Attach Certificate
                    </label>
                  </div>

                  {formData.includeCertificate && (
                    <div className="pl-6 space-y-3 animate-fadeIn">
                      {/* Certificate Type Selection */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Certificate Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={certificateType}
                          onChange={(e) => setCertificateType(e.target.value)}
                          className={`w-full rounded-lg border px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="COURSE_CERTIFICATE">
                            Course Completion Certificate
                          </option>
                          <option value="INTERNSHIP_CERTIFICATE">
                            Internship Certificate
                          </option>
                        </select>
                      </div>

                      {/* Certificate Template Selection */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Select Certificate Template{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.certificateTemplateId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              certificateTemplateId: e.target.value,
                            })
                          }
                          className={`w-full rounded-lg border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required={formData.includeCertificate}
                        >
                          <option value="">
                            -- Choose Certificate Template --
                          </option>
                          {certificateTemplates.map((template) => (
                            <option key={template._id} value={template._id}>
                              {template.name || template.originalName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Info about placeholders */}
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <i className="fas fa-info-circle mr-1"></i>
                        Certificate will be generated with student data and
                        attached as PDF
                      </p>
                    </div>
                  )}
                </div>

                {/* Student Info Summary */}
                <div className={`p-3 rounded-lg text-sm ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`font-medium mb-1 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Student Details:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>ID:</span>
                    <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {student.uniqueId || "N/A"}
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Batch:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {student.batchId?.batchName || "N/A"}
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Courses:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {student.enrolledCourseIds?.length || 0} enrolled
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex justify-end gap-3 pt-4 border-t mt-4 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    type="button"
                    disabled={sending}
                    className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={sending}
                    icon={
                      sending ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"
                    }
                  >
                    {sending ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Custom styles for dark mode Quill editor */}
      <style jsx="true">{`
        .dark-quill .ql-toolbar {
          background-color: #374151;
          border-color: #4B5563;
          color: #E5E7EB;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        
        .dark-quill .ql-stroke {
          stroke: #E5E7EB;
        }
        
        .dark-quill .ql-fill {
          fill: #E5E7EB;
        }
        
        .dark-quill .ql-picker {
          color: #E5E7EB;
        }
        
        .dark-quill .ql-picker-options {
          background-color: #374151;
          border-color: #4B5563;
        }
        
        .dark-quill .ql-editor {
          background-color: #1F2937;
          color: #E5E7EB;
          min-height: 200px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        
        .dark-quill .ql-editor.ql-blank::before {
          color: #9CA3AF;
        }
        
        .dark-quill .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #4B5563;
          color: #E5E7EB;
        }
        
        .dark-quill .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #4B5563;
        }
        
        .dark-quill .ql-snow .ql-color-picker .ql-picker-label svg,
        .dark-quill .ql-snow .ql-icon-picker .ql-picker-label svg {
          filter: invert(0.9);
        }
      `}</style>
    </div>
  );
};

export default StudentEmailModal;