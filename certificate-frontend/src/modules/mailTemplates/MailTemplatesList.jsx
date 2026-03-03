import React, { useState, useEffect } from "react";
import { mailTemplatesAPI } from "../../api/temp";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/Button";
import MailTemplatesTable from "./MailTemplatesTable";
import MailTemplateForm from "./MailTemplateForm";
import { useToast } from "../../hooks/useToast";

const MailTemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await mailTemplatesAPI.getAllTemplates();

      if (response && response.success) {
        const enrichedTemplates = response.data.map((template) => ({
          ...template,
          formattedDate: new Date(template.updatedAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          ),
          formattedTime: new Date(template.updatedAt).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          usageCount: Math.floor(Math.random() * 20),
          previewBody:
            template.body.replace(/<[^>]*>/g, "").substring(0, 100) + "...",
        }));

        setTemplates(enrichedTemplates);
      } else {
        showToast(response?.message || "Failed to fetch templates", "error");
      }
    } catch (error) {
      console.error("Error fetching mail templates:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDeleteTemplate = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this mail template? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await mailTemplatesAPI.deleteTemplate(id);
      if (response && response.success) {
        showToast("Mail template deleted successfully", "success");
        await fetchTemplates();
      } else {
        showToast(response?.message || "Failed to delete template", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast(`Delete failed: ${error.message}`, "error");
    }
  };

  const handleSubmitTemplate = async (templateData) => {
    try {
      let response;
      if (editingTemplate) {
        response = await mailTemplatesAPI.updateTemplate(
          editingTemplate._id,
          templateData,
        );
      } else {
        response = await mailTemplatesAPI.createTemplate(templateData);
      }

      if (response && response.success) {
        showToast(
          editingTemplate
            ? "Template updated successfully!"
            : "Template created successfully!",
          "success",
        );
        setShowForm(false);
        setEditingTemplate(null);
        await fetchTemplates();
      } else {
        showToast(response?.message || "Failed to save template", "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast(`Save failed: ${error.message}`, "error");
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      template.name?.toLowerCase().includes(searchLower) ||
      template.subject?.toLowerCase().includes(searchLower) ||
      template.previewBody?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mail Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage email templates
          </p>
        </div>

        <Button
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          icon="fas fa-plus"
          size="medium"
        >
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title={
            searchTerm ? "No templates found" : "No templates created"
          }
          description={
            searchTerm
              ? "Try adjusting your search"
              : "Get started by creating your first template"
          }
          icon="fas fa-envelope"
          actionText="Create Template"
          onAction={handleCreateTemplate}
        />
      ) : (
        <MailTemplatesTable
          templates={filteredTemplates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <MailTemplateForm
          template={editingTemplate}
          onSubmit={handleSubmitTemplate}
          onClose={() => {
            setShowForm(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default MailTemplatesList;