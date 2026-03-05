// src/modules/templates/TemplateUploadForm.jsx
import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context/ThemeContext';

const TemplateUploadForm = ({ onSubmit, onClose }) => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.docx'];
    
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      showToast('Only PDF and DOCX files are allowed', 'error');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showToast('Template name is required', 'error');
      return;
    }
    
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    setUploading(true);
    
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        file
      });
    } catch (error) {
      // Error is already handled in onSubmit
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 transition-opacity duration-300 ${
            isDarkMode ? 'bg-gray-900/95' : 'bg-black/50'
          }`}
          onClick={onClose}
        />
        
        <div className={`relative rounded-lg shadow-xl max-w-2xl w-full ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <i className="fas fa-upload mr-2"></i>
                Upload Certificate Template
              </h3>
              <button
                onClick={onClose}
                className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}
                disabled={uploading}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Template Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Course Completion Certificate"
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                  disabled={uploading}
                />
              </div>

              {/* Description */}
              {/* <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description about this template..."
                  rows="3"
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  disabled={uploading}
                />
              </div> */}

              {/* File Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Template File *
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-emerald-500' 
                    : 'border-gray-300 hover:border-emerald-400'
                }`}>
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="text-center">
                        <i className="fas fa-file text-3xl text-blue-500 mb-2"></i>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {file.name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className={`mt-2 text-sm ${
                            isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                          }`}
                          disabled={uploading}
                        >
                          <i className="fas fa-times mr-1"></i>
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <i className={`fas fa-cloud-upload-alt text-3xl mx-auto ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}></i>
                        <div className={`flex text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <label className={`relative cursor-pointer rounded-md font-medium ${
                            isDarkMode 
                              ? 'text-emerald-400 hover:text-emerald-300' 
                              : 'text-emerald-600 hover:text-emerald-500'
                          } focus-within:outline-none`}>
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleFileChange}
                              className="sr-only"
                              disabled={uploading}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          PDF or DOCX files, up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 rounded-b-lg flex justify-end space-x-3 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={uploading}
                className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : ''}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !name.trim() || !file}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Upload Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TemplateUploadForm;