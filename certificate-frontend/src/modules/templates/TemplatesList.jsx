// src/modules/templates/TemplatesList.jsx
import React, { useState, useEffect } from "react";
import { certificateTemplatesAPI } from "../../api/certificateTemplates";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/Button";
import TemplatesTable from "./TemplatesTable";
import TemplateCard from "./TemplateCard";
import TemplateUploadForm from "./TemplateUploadForm";
import { useToast } from "../../hooks/useToast";
import { useTheme } from "../../context/ThemeContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TemplatesList = () => {
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      const response = await certificateTemplatesAPI.getAllTemplates();
      
      if (response && response.success) {
        const enrichedTemplates = response.data.map((template) => ({
          ...template,
          formattedDate: new Date(template.createdAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          ),
          formattedTime: new Date(template.createdAt).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          fileExtension:
            template.originalName?.split(".").pop()?.toUpperCase() || "PDF",
          templateType: getTemplateType(template),
          usageCount: Math.floor(Math.random() * 50),
          fileSize: "2.5 MB",
          creatorName: "Admin",
        }));

        setTemplates(enrichedTemplates);
      } else {
        showToast(response?.message || "Failed to fetch templates", "error");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateType = (template) => {
    const name = template.name?.toLowerCase() || "";
    const desc = template.description?.toLowerCase() || "";

    if (name.includes("completion") || desc.includes("completion"))
      return "Completion";
    if (name.includes("excellence") || desc.includes("excellence"))
      return "Excellence";
    if (name.includes("participation") || desc.includes("participation"))
      return "Participation";
    if (name.includes("achievement") || desc.includes("achievement"))
      return "Achievement";
    if (name.includes("merit") || desc.includes("merit")) return "Merit";

    return "Certificate";
  };

  const downloadTemplatesPDF = async () => {
    if (filteredTemplates.length === 0) {
      showToast("No templates to download", "warning");
      return;
    }

    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(20);
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.setFont("helvetica", "bold");
      doc.text("Certificate Templates Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated on: ${date}`, 14, 28);

      const tableData = filteredTemplates.map((template, index) => [
        index + 1,
        template.name,
        template.templateType,
        template.fileExtension,
        template.formattedDate,
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["#", "Template Name", "Type", "Format", "Uploaded"]],
        body: tableData,
        theme: "striped",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: isDarkMode ? [60, 60, 60] : [245, 245, 245],
        },
        margin: { left: 14, right: 14 },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        );
      }

      const fileName = `Certificate_Templates_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      showToast("PDF report downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast(`Failed to generate PDF: ${error.message}`, "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleUploadTemplate = async (uploadData) => {
    try {
      const formData = new FormData();
      formData.append("name", uploadData.name);
      formData.append("description", uploadData.description || "");
      formData.append("file", uploadData.file);

      const response = await certificateTemplatesAPI.uploadTemplate(formData);

      if (response && response.success) {
        showToast("Template uploaded successfully!", "success");
        setShowUploadForm(false);
        await fetchTemplates();
      } else {
        showToast(response?.message || "Failed to upload template", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast(`Upload failed: ${error.message}`, "error");
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this template? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await certificateTemplatesAPI.deleteTemplate(id);
      if (response && response.success) {
        showToast("Template deleted successfully", "success");
        await fetchTemplates();
      } else {
        showToast(response?.message || "Failed to delete template", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast(`Delete failed: ${error.message}`, "error");
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      template.name?.toLowerCase().includes(searchLower) ||
      template.originalName?.toLowerCase().includes(searchLower) ||
      (template.templateType &&
        template.templateType.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Certificate Templates
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage certificate templates for automated generation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className={`flex rounded-lg border p-1 mr-2 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "table"
                  ? isDarkMode
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <i className="fas fa-table"></i>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "card"
                  ? isDarkMode
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Card View"
            >
              <i className="fas fa-th-large"></i>
            </button>
          </div>

          {/* Download PDF */}
          <Button
            onClick={downloadTemplatesPDF}
            variant="outline"
            icon={isGeneratingPDF ? "fas fa-spinner fa-spin" : "fas fa-download"}
            size="small"
            disabled={filteredTemplates.length === 0 || isGeneratingPDF}
            className={isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : ''
            }
          >
            {isGeneratingPDF ? "Generating..." : "Export PDF"}
          </Button>

          {/* Upload Button */}
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            icon="fas fa-plus"
            size="small"
          >
            Upload Template
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates by name or type..."
            className={`w-full rounded-md border px-4 py-2 pl-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <i className={`fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`}></i>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        {searchTerm && (
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton type={viewMode} count={6} />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No templates found" : "No templates uploaded"}
          description={
            searchTerm
              ? "Try adjusting your search"
              : "Upload your first certificate template to get started"
          }
          icon="fas fa-certificate"
          actionText="Upload Template"
          onAction={() => setShowUploadForm(true)}
        />
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      ) : (
        <TemplatesTable
          templates={filteredTemplates}
          onDelete={handleDeleteTemplate}
        />
      )}

      {/* Upload Modal */}
      {showUploadForm && (
        <TemplateUploadForm
          onSubmit={handleUploadTemplate}
          onClose={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
};

export default TemplatesList;