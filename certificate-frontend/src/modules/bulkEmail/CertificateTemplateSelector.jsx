// src/components/bulk-email/CertificateTemplateSelector.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { certificateTemplatesAPI } from "../../api/certificateTemplates";
import { useToast } from "../../hooks/useToast";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import { useTheme } from "../../context/ThemeContext";

const CertificateTemplateSelector = ({ onSelect, selectedTemplateId }) => {
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      const response = await certificateTemplatesAPI.getAllTemplates();

      if (response?.success && Array.isArray(response.data)) {
        setTemplates(response.data);
      } else {
        setTemplates([]);
        showToast("No certificate templates found", "info");
      }
    } catch (error) {
      console.error("Load templates error:", error);
      setTemplates([]);
      showToast("Failed to load certificate templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value || null;
    onSelect?.(templateId);
  };

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".docx") &&
      !file.name.endsWith(".doc")
    ) {
      showToast("Only .docx or .doc files are allowed", "error");
      e.target.value = "";
      return;
    }

    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile || !templateName.trim()) {
      showToast("Template name and file are required", "error");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", templateName.trim());
      if (templateDescription.trim()) {
        formData.append("description", templateDescription.trim());
      }

      const response = await certificateTemplatesAPI.uploadTemplate(formData);

      if (response?.data?.success) {
        showToast("Certificate template uploaded successfully", "success");
        resetUploadForm();
        setShowUploadModal(false);
        loadTemplates();
      } else {
        showToast(response?.data?.message || "Upload failed", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload certificate template", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Delete this certificate template?")) return;

    try {
      const response = await certificateTemplatesAPI.deleteTemplate(templateId);

      if (response?.data?.success) {
        showToast("Template deleted", "success");
        if (templateId === selectedTemplateId) {
          onSelect?.(null);
        }
        loadTemplates();
      } else {
        showToast("Failed to delete template", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete template", "error");
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setTemplateName("");
    setTemplateDescription("");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={2} />;
  }

  return (
    <div className="space-y-4">
      {/* SELECT */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Certificate Template *
        </label>
        <div className="flex gap-2">
          <select
            value={selectedTemplateId || ""}
            onChange={handleTemplateSelect}
            className={`flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">-- Select template --</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.originalName || t.name}
              </option>
            ))}
          </select>

          <Button
            onClick={loadTemplates}
            variant="outline"
            size="small"
            icon="fas fa-sync"
            className={isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : ''
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* SELECTED TEMPLATE INFO */}
      {selectedTemplate && (
        <div className={`rounded-lg border p-4 ${
          isDarkMode 
            ? 'bg-purple-900/20 border-purple-800' 
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className={`font-medium ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              }`}>
                {selectedTemplate.originalName || selectedTemplate.name}
              </div>
              <div className={`text-xs mt-1 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {formatFileSize(selectedTemplate.fileSize)}
              </div>
            </div>

            <button
              onClick={() => handleDeleteTemplate(selectedTemplate._id)}
              className={`hover:text-red-700 transition-colors ${
                isDarkMode ? 'text-red-400' : 'text-red-500'
              }`}
              title="Delete template"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD */}
      <Button
        onClick={() => setShowUploadModal(true)}
        variant="outline"
        icon="fas fa-upload"
        className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
      >
        Upload Certificate Template
      </Button>

      {/* MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg p-6 w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Upload Certificate Template
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Template Name *"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={`w-full border rounded px-3 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />

              <textarea
                placeholder="Description (optional)"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
                className={`w-full border rounded px-3 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />

              <input
                type="file"
                accept=".doc,.docx"
                onChange={handleFileChange}
                className={isDarkMode ? 'text-white' : ''}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetUploadForm();
                  setShowUploadModal(false);
                }}
                className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={uploading}
                onClick={handleUpload}
                disabled={!uploadFile || !templateName.trim()}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplateSelector;