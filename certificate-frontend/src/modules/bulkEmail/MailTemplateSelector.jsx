import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { mailTemplatesAPI } from '../../api/temp';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';

const MailTemplateSelector = ({ onSelect, selectedTemplateId, showCreateNew = false }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: ''
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await mailTemplatesAPI.getAllTemplates();
      console.log('Mail Template Selector - API Response:', response);
      console.log('Response structure:', {
        success: response?.success,
        data: response?.data,
        message: response?.message,
        'response.data?.success': response?.data?.success,
        'response.data?.data': response?.data?.data
      });

      // Try multiple response structures to find the correct one
      let templateData = [];
      
      if (Array.isArray(response)) {
        // If response is directly an array
        templateData = response;
      } else if (response && response.success && Array.isArray(response.data)) {
        // If response has {success: true, data: [...]}
        templateData = response.data;
      } else if (response && response.data && response.data.success && Array.isArray(response.data.data)) {
        // If response has {data: {success: true, data: [...]}}
        templateData = response.data.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response has {data: [...]}
        templateData = response.data;
      } else if (response && response.data && Array.isArray(response.data.templates)) {
        // If response has {data: {templates: [...]}}
        templateData = response.data.templates;
      }
      
      console.log('Final template data:', templateData);
      
      if (templateData.length > 0) {
        setTemplates(templateData);
        showToast(`Loaded ${templateData.length} templates`, 'success');
      } else {
        console.warn('No templates found or empty array');
        setTemplates([]);
        showToast('No templates available', 'info');
      }
    } catch (error) {
      console.error("Error fetching mail templates in selector:", error);
      showToast(`Error: ${error.message}`, "error");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const testAPICall = async () => {
    try {
      console.log('Testing API call...');
      const response = await mailTemplatesAPI.getAllTemplates();
      console.log('Test API Response:', response);
      console.log('Type of response:', typeof response);
      console.log('Is array?', Array.isArray(response));
      
      if (response && typeof response === 'object') {
        console.log('Response keys:', Object.keys(response));
        for (const key in response) {
          console.log(`${key}:`, response[key]);
        }
      }
      
      alert('Check browser console for API response details');
    } catch (error) {
      console.error('Test API error:', error);
      alert('API Error: ' + error.message);
    }
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    
    if (templateId === '') {
      // Clear selection
      if (onSelect) onSelect(null);
      return;
    }
    
    const selectedTemplate = templates.find(t => t._id === templateId);
    if (selectedTemplate && onSelect) {
      onSelect(selectedTemplate);
      showToast(`Template "${selectedTemplate.name}" selected`, 'success');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!newTemplate.name.trim()) {
        showToast('Template name is required', 'error');
        return;
      }
      if (!newTemplate.subject.trim()) {
        showToast('Email subject is required', 'error');
        return;
      }
      if (!newTemplate.body.trim()) {
        showToast('Email body is required', 'error');
        return;
      }

      let response;
      if (editingTemplate) {
        response = await mailTemplatesAPI.updateTemplate(editingTemplate._id, newTemplate);
      } else {
        response = await mailTemplatesAPI.createTemplate(newTemplate);
      }
      
      console.log('Create/Update response:', response);
      
      // Handle different response structures
      let success = false;
      let message = '';
      
      if (response && response.success) {
        success = true;
        message = response.message;
      } else if (response && response.data && response.data.success) {
        success = true;
        message = response.data.message;
      }
      
      if (success) {
        showToast(
          editingTemplate ? 'Template updated successfully' : 'Template created successfully', 
          'success'
        );
        setShowModal(false);
        setNewTemplate({ name: '', subject: '', body: '' });
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        showToast(message || 'Failed to save template', 'error');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showToast(error.response?.data?.message || 'Failed to save template', 'error');
    }
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t._id === selectedTemplateId);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-blue-500 mr-2"></i>
            <p className="text-sm text-blue-700">
              Found {templates.length} templates. 
              {templates.length === 0 && ' Try refreshing or check API connection.'}
            </p>
          </div>
          <Button
            onClick={testAPICall}
            variant="ghost"
            size="extra-small"
            icon="fas fa-bug"
            className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
          >
            Test API
          </Button>
        </div>
      </div>

      {/* Template Selection Dropdown */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Email Template
        </label>
        <div className="flex gap-2">
          <select
            value={selectedTemplateId || ''}
            onChange={handleTemplateSelect}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Choose a template --</option>
            {templates.length === 0 ? (
              <option value="" disabled>No templates available</option>
            ) : (
              templates.map(template => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))
            )}
          </select>
          
          <Button
            onClick={fetchTemplates}
            variant="outline"
            size="small"
            icon="fas fa-sync"
            className="whitespace-nowrap"
            title="Refresh templates"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Debug Details (Collapsible) */}
      {templates.length === 0 && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-yellow-800 font-medium">Troubleshooting</h4>
            <button
              onClick={testAPICall}
              className="text-yellow-700 hover:text-yellow-900 text-sm underline"
            >
              Test API Connection
            </button>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Check if API endpoint is working</li>
            <li>• Verify response structure in console</li>
            <li>• Make sure you have templates created</li>
            <li>• Check network tab for API errors</li>
          </ul>
        </div>
      )}

      {/* Selected Template Preview */}
      {selectedTemplateId && getSelectedTemplate() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                <i className="fas fa-check text-green-600 text-sm"></i>
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">
                  {getSelectedTemplate().name}
                </div>
                <div className="text-xs text-green-600">
                  Selected Template
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-gray-500 hover:text-gray-700 text-sm"
              title="Clear selection"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Template Details */}
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <i className="fas fa-tag text-xs mr-2 text-gray-400"></i>
              <span>Subject: {getSelectedTemplate().subject}</span>
            </div>
            <div className="line-clamp-2">
              <i className="fas fa-align-left text-xs mr-2 text-gray-400"></i>
              {getSelectedTemplate().body?.replace(/<[^>]*>/g, '').substring(0, 80)}...
            </div>
          </div>
        </div>
      )}

      {/* Create New Template Button */}
      {showCreateNew && (
        <div className="pt-2">
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setNewTemplate({ name: '', subject: '', body: '' });
              setShowModal(true);
            }}
            variant="outline"
            icon="fas fa-plus"
            className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Create New Template
          </Button>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                    setNewTemplate({ name: '', subject: '', body: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Welcome Email"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                    placeholder="e.g., Welcome to Our Platform!"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body *
                  </label>
                  <textarea
                    value={newTemplate.body}
                    onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                    rows={6}
                    placeholder="Dear {name}, ..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Available placeholders: {'{name}'}, {'{program}'}, {'{course}'}, {'{batch}'}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      setNewTemplate({ name: '', subject: '', body: '' });
                    }}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    variant="primary"
                    icon="fas fa-save"
                  >
                    {editingTemplate ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailTemplateSelector;