import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { programAPI } from '../../api/programs';

const BatchForm = ({ 
  onSubmit, 
  onClose, 
  initialData,
  title = initialData ? 'Edit Batch' : 'Create New Batch'
}) => {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    batchName: '',
    programId: '',
    description: '',
    ...initialData
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const response = await programAPI.getAllPrograms();
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setPrograms(response.data);
        } else if (response.data.success === true) {
          setPrograms(response.data.data || []);
        } else if (Array.isArray(response.data.data)) {
          setPrograms(response.data.data);
        } else {
          console.error('Unknown response structure:', response.data);
          showToast('Invalid response format from server', 'error');
          setPrograms([]);
        }
      } else {
        showToast('No data received from server', 'error');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      let errorMessage = 'Failed to load programs';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check backend.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Check if backend is running.';
      }
      
      showToast(errorMessage, 'error');
      setPrograms([]);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.batchName.trim()) {
      newErrors.batchName = 'Batch name is required';
    }
    
    if (!formData.programId) {
      newErrors.programId = 'Program is required';
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
        batchName: formData.batchName.trim(),
        programId: formData.programId,
        description: formData.description.trim(),
      };

      await onSubmit(submissionData);
    } catch (error) {
      showToast(error.message || 'Failed to save batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop with gradient */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-95"
          onClick={onClose}
        />
        
        {/* Modal Container */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-600 rounded-t-2xl px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {title}
                </h3>
                <p className="text-blue-100 text-sm">
                  {initialData ? 'Update batch details' : 'Create a new batch for your program'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
                disabled={loading || loadingPrograms}
                aria-label="Close modal"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-8 py-6">
            <div className="space-y-6">
              {/* Batch Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <i className="fas fa-users mr-2 text-purple-500"></i>
                  Batch Name *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="batchName"
                    value={formData.batchName}
                    onChange={handleChange}
                    placeholder="e.g., Web Development Jan 2024"
                    disabled={loading}
                    className={`block w-full rounded-xl border-2 ${
                      errors.batchName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    } px-4 py-3.5 focus:outline-none focus:ring-4 transition-all duration-200 ${
                      loading ? 'bg-gray-50' : 'bg-white hover:border-purple-400'
                    }`}
                    required
                  />
                </div>
                {errors.batchName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1.5"></i>
                    {errors.batchName}
                  </p>
                )}
              </div>

              {/* Program Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <i className="fas fa-graduation-cap mr-2 text-blue-500"></i>
                  Program *
                </label>
                <div className="relative group">
                  <select
                    name="programId"
                    value={formData.programId}
                    onChange={handleChange}
                    disabled={loading || Boolean(initialData) || loadingPrograms}
                    className={`block w-full rounded-xl border-2 ${
                      errors.programId 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } px-4 py-3.5 focus:outline-none focus:ring-4 transition-all duration-200 appearance-none ${
                      loading || initialData || loadingPrograms 
                        ? 'bg-gray-50 cursor-not-allowed' 
                        : 'bg-white cursor-pointer hover:border-blue-400'
                    }`}
                    required
                  >
                    <option value="" className="text-gray-400">Select a program</option>
                    {loadingPrograms ? (
                      <option value="" disabled className="text-gray-400">Loading programs...</option>
                    ) : programs.length === 0 ? (
                      <option value="" disabled className="text-gray-400">No programs available</option>
                    ) : (
                      programs.map((program) => (
                        <option key={program._id} value={program._id} className="py-2">
                          {program.programName} {program.year ? `(${program.year})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <i className={`fas fa-chevron-down ${loadingPrograms ? 'text-gray-400' : 'text-blue-500'}`}></i>
                  </div>
                </div>
                {errors.programId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1.5"></i>
                    {errors.programId}
                  </p>
                )}
              </div>

              {/* Description */}
              {/* <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <i className="fas fa-align-left mr-2 text-green-500"></i>
                  Description
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the batch, curriculum, or any special instructions..."
                    rows={3}
                    className="block w-full rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 px-4 py-3.5 focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-gray-400 resize-none hover:border-green-400"
                    disabled={loading}
                  />
                  <div className="absolute top-3 right-3 text-gray-400">
                    <i className="fas fa-comment-dots"></i>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || loadingPrograms}
                  className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-5 py-2.5 rounded-xl transition-all duration-200 font-medium"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Cancel
                </button>
                
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || loadingPrograms || programs.length === 0}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <i className="fas fa-check-circle mr-2"></i>
                  {initialData ? 'Update Batch' : 'Create Batch'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BatchForm;