// src/modules/mailTemplates/MailTemplateForm.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../../context/ThemeContext';

const MailTemplateForm = ({ template, onSubmit, onClose }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        body: template.body || ''
      });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBodyChange = (value) => {
    setFormData(prev => ({
      ...prev,
      body: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const variables = [
    { name: '{name}', description: 'Student Name', icon: 'fas fa-user' },
    { name: '{course}', description: 'Course Name', icon: 'fas fa-book' },
    { name: '{batch}', description: 'Batch Name', icon: 'fas fa-layer-group' },
    { name: '{program}', description: 'Program Name', icon: 'fas fa-graduation-cap' },
    { name: '{date}', description: 'Current Date', icon: 'fas fa-calendar' },
    { name: '{mark}', description: 'Final Mark', icon: 'fas fa-percent' },
    { name: '{completionDate}', description: 'Completion Date', icon: 'fas fa-check-circle' },
  ];

  const insertVariable = (variable) => {
    const quill = document.querySelector('.ql-editor');
    if (quill) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(variable));
      quill.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop with blur */}
        <div 
          className={`fixed inset-0 transition-opacity backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-900/80' : 'bg-gray-900/50'
          }`} 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`inline-block w-full max-w-6xl my-8 text-left align-middle transition-all transform rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header with gradient */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {template ? 'Edit Mail Template' : 'Create Mail Template'}
                </h3>
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <i className="fas fa-paint-brush"></i>
                  Design email templates with variables for personalization
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className="flex px-8">
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'edit'
                    ? 'border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-edit"></i>
                Edit Template
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-eye"></i>
                Preview
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {activeTab === 'edit' ? (
                <div className="space-y-6">
                  {/* Template Name */}
                  <div className={`p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50/50 border-gray-200'
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full rounded-xl border-2 px-6 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-base ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 hover:border-blue-400'
                        }`}
                        placeholder="e.g., Certificate Issuance Email"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className={`fas fa-tag ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className={`p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50/50 border-gray-200'
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full rounded-xl border-2 px-6 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-base ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 hover:border-blue-400'
                        }`}
                        placeholder="e.g., Congratulations! Your Course Completion Certificate"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className={`fas fa-heading ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
                      </div>
                    </div>
                  </div>

                  {/* Variables Section */}
                  <div className={`p-6 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800' 
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Available Variables
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {variables.map((variable, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertVariable(variable.name)}
                          className={`group relative flex items-center p-3 rounded-lg border transition-all duration-300 ${
                            isDarkMode 
                              ? 'bg-gray-800 border-blue-800 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/20' 
                              : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md'
                          }`}
                          title={variable.description}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                            isDarkMode 
                              ? 'bg-blue-900/30 group-hover:bg-blue-800/30' 
                              : 'bg-blue-100 group-hover:bg-blue-200'
                          }`}>
                            <i className={`${variable.icon} ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}></i>
                          </div>
                          <div className="flex-1">
                            <code className={`text-sm font-mono ${
                              isDarkMode ? 'text-blue-300' : 'text-blue-700'
                            }`}>
                              {variable.name}
                            </code>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{variable.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className={`text-sm flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <i className="fas fa-info-circle text-blue-500"></i>
                      Click on variables to insert them into your email content
                    </p>
                  </div>

                  {/* Email Body Editor */}
                  <div className={`p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50/50 border-gray-200'
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Body <span className="text-red-500">*</span>
                    </label>
                    <div className={`border-2 rounded-xl overflow-hidden ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <ReactQuill
                        value={formData.body}
                        onChange={handleBodyChange}
                        modules={quillModules}
                        theme="snow"
                        style={{ height: '350px' }}
                        className={`custom-quill ${isDarkMode ? 'dark-quill' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview Tab */
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50/50 border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <i className="fas fa-eye text-blue-600"></i>
                      Email Preview
                    </h3>
                    <div className={`rounded-xl border shadow-inner overflow-hidden ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      {/* Email Header */}
                      <div className={`border-b p-4 ${
                        isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                          }`}>
                            <i className={`fas fa-envelope ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}></i>
                          </div>
                          <div>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Subject:</p>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>{formData.subject || 'No subject'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Email Body */}
                      <div className={`p-6 min-h-[400px] ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {formData.body ? (
                          <div 
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: formData.body }}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <i className={`fas fa-envelope-open text-4xl ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}></i>
                            </div>
                            <p className={`text-lg ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-400'
                            }`}>
                              Email preview will appear here
                            </p>
                            <p className={`text-sm mt-2 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              Start editing your template to see the preview
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-8 py-4 border-t ${
              isDarkMode 
                ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700' 
                : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
            }`}>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className={`border-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  icon={loading ? "fas fa-spinner fa-spin" : "fas fa-save"}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Custom styles for dark mode Quill editor */}
      <style jsx>{`
        .dark-quill .ql-toolbar {
          background-color: #374151;
          border-color: #4B5563;
          color: #E5E7EB;
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
        .dark-quill .ql-editor {
          background-color: #1F2937;
          color: #E5E7EB;
        }
        .dark-quill .ql-editor.ql-blank::before {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default MailTemplateForm;