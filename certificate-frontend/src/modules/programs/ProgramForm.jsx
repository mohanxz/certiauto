import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

const ProgramForm = ({ 
  onSubmit, 
  onClose, 
  initialData,
  title = initialData ? 'Edit Program' : 'Create New Program'
}) => {
  const { showToast } = useToast();
  
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
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

              <div>
             
               
               
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
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
                  className="px-8 bg-blue-600 hover:bg-blue-700"
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