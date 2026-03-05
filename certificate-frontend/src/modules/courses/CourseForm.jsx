// src/modules/courses/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { courseAPI } from '../../api/courses';
import { useTheme } from '../../context/ThemeContext';

const CourseForm = ({ 
  onSubmit, 
  onClose, 
  initialData,
  batches,
  title = initialData ? 'Edit Course' : 'Create New Course'
}) => {
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    batchId: '',
    courseName: '',
    courseCode: '',
    description: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatingCode, setGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        batchId: initialData.batchId?._id || initialData.batchId || '',
        courseName: initialData.courseName || '',
        courseCode: initialData.courseCode || '',
        description: initialData.description || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setGeneratedCode(initialData.courseCode || '');
    } else {
      setFormData({
        batchId: '',
        courseName: '',
        courseCode: '',
        description: '',
        isActive: true,
      });
      setGeneratedCode('');
    }
  }, [initialData]);

  // Generate course code whenever batch or course name changes
  useEffect(() => {
    const generateAndSetCourseCode = async () => {
      if (initialData) return;

      if (!formData.batchId || !formData.courseName) {
        setGeneratedCode('');
        setFormData(prev => ({ ...prev, courseCode: '' }));
        return;
      }

      setGeneratingCode(true);
      
      try {
        const code = await generateCourseCode(formData.batchId, formData.courseName);
        setGeneratedCode(code);
        setFormData(prev => ({ ...prev, courseCode: code }));
      } catch (error) {
        console.error('Error generating course code:', error);
        const fallbackCode = generateFallbackCode(formData.batchId, formData.courseName);
        setGeneratedCode(fallbackCode);
        setFormData(prev => ({ ...prev, courseCode: fallbackCode }));
      } finally {
        setGeneratingCode(false);
      }
    };

    const timer = setTimeout(() => {
      generateAndSetCourseCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.batchId, formData.courseName, initialData]);

  const generateCourseCode = async (batchId, courseName) => {
    const selectedBatch = batches.find(b => b._id === batchId);
    if (!selectedBatch) throw new Error('Batch not found');

    let nextNumber = 1;
    try {
      const response = await courseAPI.getNextCourseCode(batchId);
      if (response.success && response.nextCode) {
        return response.nextCode;
      }
      
      const existingCourses = await courseAPI.getCoursesByBatch(batchId);
      if (existingCourses.success) {
        nextNumber = (existingCourses.data.length || 0) + 1;
      }
    } catch (error) {
      console.error('Error fetching course count:', error);
    }

    return generateCodeFromBatchAndNumber(selectedBatch, courseName, nextNumber);
  };

  const generateFallbackCode = (batchId, courseName) => {
    const selectedBatch = batches.find(b => b._id === batchId);
    if (!selectedBatch) return '';

    let programCode = 'CRS';
    if (selectedBatch.batchName) {
      programCode = selectedBatch.batchName
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase();
    } else if (selectedBatch.programId?.programCode) {
      programCode = selectedBatch.programId.programCode.substring(0, 3).toUpperCase();
    }

    const timestamp = Date.now().toString().slice(-3);
    return `${programCode}-${timestamp}`;
  };

  const generateCodeFromBatchAndNumber = (batch, courseName, sequenceNumber) => {
    let prefix = 'CRS';
    
    if (batch.programId?.programCode) {
      prefix = batch.programId.programCode.substring(0, 3).toUpperCase();
    } else if (batch.batchName) {
      prefix = batch.batchName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 3)
        .toUpperCase();
    }

    let coursePrefix = courseName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase();

    if (coursePrefix.length < 3) {
      coursePrefix = coursePrefix.padEnd(3, 'X');
    }

    const formattedNumber = sequenceNumber.toString().padStart(3, '0');
    return `${prefix}-${coursePrefix}-${formattedNumber}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFormData(prev => ({
      ...prev,
      batchId
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.batchId.trim()) {
      newErrors.batchId = 'Please select a batch';
    }
    
    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    
    if (initialData && !formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
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
    
    if (!initialData && !formData.courseCode) {
      const code = await generateCourseCode(formData.batchId, formData.courseName);
      setFormData(prev => ({ ...prev, courseCode: code }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setLoading(true);
    
    try {
      const submissionData = {
        batchId: formData.batchId.trim(),
        courseName: formData.courseName.trim(),
        courseCode: formData.courseCode.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      showToast(error.message || 'Failed to save course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeOverride = (e) => {
    const newCode = e.target.value;
    setFormData(prev => ({ ...prev, courseCode: newCode }));
  };

  const resetToAutoGenerated = () => {
    if (generatedCode) {
      setFormData(prev => ({ ...prev, courseCode: generatedCode }));
      showToast('Reset to auto-generated code', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 transition-opacity duration-300 ${
            isDarkMode ? 'bg-gray-900/95' : 'bg-black/50'
          }`}
          onClick={onClose}
        />
        
        <div className={`
          inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        `}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
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

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Batch Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Batch *
                </label>
                <div className="relative">
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleBatchChange}
                    disabled={loading || Boolean(initialData)}
                    className={`
                      block w-full rounded-lg border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none
                      ${errors.batchId 
                        ? 'border-red-500' 
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }
                      ${loading || initialData ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    required
                  >
                    <option value="">Select a batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchName} ({batch.programId?.programName || 'Unknown Program'})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                  </div>
                </div>
                {errors.batchId && (
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.batchId}
                  </p>
                )}
              </div>

              <Input
                label="Course Name *"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, MongoDB"
                required
                error={errors.courseName}
                icon="fas fa-graduation-cap"
                disabled={loading}
              />

              {/* Auto-generated Course Code */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Course Code {!initialData && (
                    <span className={`text-xs ml-1 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>(Auto-generated)</span>
                  )}
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={initialData ? handleCodeOverride : handleChange}
                    placeholder={generatingCode ? "Generating..." : "Enter course code..."}
                    className={`
                      block w-full rounded-lg border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200
                      ${errors.courseCode 
                        ? 'border-red-500' 
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                      }
                      ${!initialData && !generatingCode ? isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50' : ''}
                      ${loading || generatingCode ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    required
                    readOnly={!initialData && !generatingCode}
                    disabled={loading || generatingCode}
                  />
                  
                  {generatingCode && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className={`fas fa-spinner fa-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}></i>
                    </div>
                  )}
                  
                  {!initialData && formData.courseCode && !generatingCode && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className={`fas fa-check-circle ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}></i>
                    </div>
                  )}
                </div>
                
                {errors.courseCode && (
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.courseCode}
                  </p>
                )}
                
                <div className="mt-2 space-y-2">
                  {/* Auto-generation status */}
                  {!initialData && (
                    <div className="flex items-center text-sm">
                      {generatingCode ? (
                        <div className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Generating unique course code...
                        </div>
                      ) : formData.courseCode ? (
                        <div className={`flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          <i className="fas fa-check-circle mr-2"></i>
                          Code generated: <span className={`font-mono ml-1 px-2 py-0.5 rounded ${
                            isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                          }`}>{formData.courseCode}</span>
                        </div>
                      ) : (
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <i className="fas fa-info-circle mr-2"></i>
                          Course code will be auto-generated after entering batch and course name
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Manual override options for editing */}
                  {initialData && formData.courseCode !== generatedCode && (
                    <div className={`flex items-center justify-between p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-yellow-900/20 border-yellow-800' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className={`flex items-center text-sm ${
                        isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                      }`}>
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        You've modified the auto-generated code
                      </div>
                      <button
                        type="button"
                        onClick={resetToAutoGenerated}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode 
                            ? 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        Reset to auto
                      </button>
                    </div>
                  )}
                  
                  {/* Code explanation */}
                  {formData.courseCode && (
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <i className="fas fa-lightbulb mr-1"></i>
                      Format: <span className="font-mono">BATCH-COURSE-001</span> • Auto-incremented for uniqueness
                    </div>
                  )}
                </div>
              </div>

              {/* Course Status */}
              {initialData && (
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Course Status
                      </label>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formData.isActive ? 'Active' : 'Inactive'} courses are available for enrollment
                      </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          formData.isActive 
                            ? 'bg-green-500' 
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        } ${loading ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            formData.isActive ? 'translate-x-6' : ''
                          }`}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              )}
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
                  disabled={loading || (!initialData && (!formData.courseCode || generatingCode))}
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {initialData ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;