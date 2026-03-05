// src/modules/programs/ProgramForm.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context/ThemeContext';

const ProgramForm = ({ 
  onSubmit, 
  onClose, 
  initialData,
  title = initialData ? 'Edit Program' : 'Create New Program'
}) => {
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    programName: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        programName: initialData.programName || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.programName.trim()) {
      newErrors.programName = 'Program name is required';
    } else if (formData.programName.length < 2) {
      newErrors.programName = 'Program name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const submissionData = {
        programName: formData.programName.trim(),
        description: formData.description.trim(),
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      showToast(error.message || 'Failed to save program', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className={`
          inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl 
          transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        `}>
          {/* Header */}
          <div className={`
            px-6 py-4 border-b
            ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className={`
                  transition-colors
                  ${isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-400 hover:text-gray-500'
                  }
                `}
                disabled={loading}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              <Input
                label="Program Name *"
                name="programName"
                value={formData.programName}
                onChange={handleChange}
                placeholder="e.g., Full Stack Development, Data Science"
                required
                error={errors.programName}
                icon="fas fa-project-diagram"
                disabled={loading}
              />

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`
                    w-full px-4 py-2 rounded-lg border transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }
                  `}
                  placeholder="Enter program description (optional)"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className={`mt-6 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                  disabled={loading}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {initialData ? 'Update Program' : 'Create Program'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;