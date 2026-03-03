import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

const TemplateUploadForm = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Accept PDF and DOCX files (based on your API)
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.docx'];
    
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      showToast('Only PDF and DOCX files are allowed', 'error');
      e.target.value = '';
      return;
    }

    // Check file size (max 10MB)
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                <i className="fas fa-upload mr-2"></i>
                Upload Certificate Template
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Course Completion Certificate"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  disabled={uploading}
                />
              </div>

              {/* Description */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description about this template..."
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={uploading}
                />
              </div> */}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="text-center">
                        <i className="fas fa-file text-3xl text-blue-500 mb-2"></i>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                          disabled={uploading}
                        >
                          <i className="fas fa-times mr-1"></i>
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mx-auto"></i>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
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
                        <p className="text-xs text-gray-500">
                          PDF or DOCX files, up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !name.trim() || !file}
                className="bg-emerald-600 hover:bg-emerald-700"
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