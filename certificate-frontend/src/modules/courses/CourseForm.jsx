import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { courseAPI } from '../../api/courses'; 

const CourseForm = ({ 
  onSubmit, 
  onClose, 
  initialData,
  batches,
  title = initialData ? 'Edit Course' : 'Create New Course'
}) => {
  const { showToast } = useToast();
  
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
      // For new course, initialize with empty values
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
      if (initialData) return; // Don't auto-generate for editing

      if (!formData.batchId || !formData.courseName) {
        setGeneratedCode('');
        setFormData(prev => ({ ...prev, courseCode: '' }));
        return;
      }

      setGeneratingCode(true);
      
      try {
        // Get the next course code for this batch
        const code = await generateCourseCode(formData.batchId, formData.courseName);
        
        setGeneratedCode(code);
        setFormData(prev => ({ ...prev, courseCode: code }));
      } catch (error) {
        console.error('Error generating course code:', error);
        // Fallback to simple generation
        const fallbackCode = generateFallbackCode(formData.batchId, formData.courseName);
        setGeneratedCode(fallbackCode);
        setFormData(prev => ({ ...prev, courseCode: fallbackCode }));
      } finally {
        setGeneratingCode(false);
      }
    };

    // Debounce to avoid too many API calls
    const timer = setTimeout(() => {
      generateAndSetCourseCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.batchId, formData.courseName, initialData]);

  // Generate course code based on batch and course name
  const generateCourseCode = async (batchId, courseName) => {
    const selectedBatch = batches.find(b => b._id === batchId);
    if (!selectedBatch) throw new Error('Batch not found');

    // Get existing courses count for this batch
    let nextNumber = 1;
    try {
      // Call API to get next sequence number
      const response = await courseAPI.getNextCourseCode(batchId);
      if (response.success && response.nextCode) {
        return response.nextCode;
      }
      
      // If API doesn't return code, calculate manually
      const existingCourses = await courseAPI.getCoursesByBatch(batchId);
      if (existingCourses.success) {
        nextNumber = (existingCourses.data.length || 0) + 1;
      }
    } catch (error) {
      console.error('Error fetching course count:', error);
      // Use fallback method
    }

    // Generate code based on batch and sequence number
    return generateCodeFromBatchAndNumber(selectedBatch, courseName, nextNumber);
  };

  // Fallback generation method
  const generateFallbackCode = (batchId, courseName) => {
    const selectedBatch = batches.find(b => b._id === batchId);
    if (!selectedBatch) return '';

    // Extract program code
    let programCode = 'CRS';
    if (selectedBatch.batchName) {
      // Take first 3 letters from batch name
      programCode = selectedBatch.batchName
        .replace(/[^a-zA-Z]/g, '') // Remove non-letters
        .substring(0, 3)
        .toUpperCase();
    } else if (selectedBatch.programId?.programCode) {
      programCode = selectedBatch.programId.programCode.substring(0, 3).toUpperCase();
    }

    // Use current timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-3);
    return `${programCode}-${timestamp}`;
  };

  // Generate code from batch and number
  const generateCodeFromBatchAndNumber = (batch, courseName, sequenceNumber) => {
    // Extract program/batch prefix
    let prefix = 'CRS';
    
    if (batch.programId?.programCode) {
      prefix = batch.programId.programCode.substring(0, 3).toUpperCase();
    } else if (batch.batchName) {
      // Create prefix from batch name initials
      prefix = batch.batchName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 3)
        .toUpperCase();
    }

    // Extract course prefix from course name
    let coursePrefix = courseName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase();

    if (coursePrefix.length < 3) {
      coursePrefix = coursePrefix.padEnd(3, 'X');
    }

    // Format: BATCHPREFIX-COURSEPREFIX-001
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
    
    // Course code will always be auto-generated, so no validation needed
    // unless it's being edited
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
    
    // Ensure course code is set (for new courses)
    if (!initialData && !formData.courseCode) {
      // Generate one last time before submission
      const code = await generateCourseCode(formData.batchId, formData.courseName);
      setFormData(prev => ({ ...prev, courseCode: code }));
      
      // Wait a moment for state to update
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

  // Handle manual override (admin wants to change auto-generated code)
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch *
                </label>
                <div className="relative">
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleBatchChange}
                    disabled={loading || Boolean(initialData)}
                    className={`block w-full rounded-lg border ${
                      errors.batchId ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none ${
                      loading || initialData ? 'bg-gray-50' : 'bg-white'
                    }`}
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
                    <i className="fas fa-chevron-down text-gray-400"></i>
                  </div>
                </div>
                {errors.batchId && (
                  <p className="mt-1 text-sm text-red-600">{errors.batchId}</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code {!initialData && <span className="text-green-600 text-xs ml-1">(Auto-generated)</span>}
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={initialData ? handleCodeOverride : handleChange}
                    placeholder={generatingCode ? "Generating..." : "Enter course code..."}
                    className={`block w-full rounded-lg border ${
                      errors.courseCode ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder:text-gray-400 ${
                      loading ? 'bg-gray-50' : 'bg-white'
                    } ${!initialData ? 'bg-blue-50' : ''}`}
                    required
                    readOnly={!initialData && !generatingCode}
                    disabled={loading || generatingCode}
                  />
                  
                  {generatingCode && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className="fas fa-spinner fa-spin text-blue-500"></i>
                    </div>
                  )}
                  
                  {!initialData && formData.courseCode && !generatingCode && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className="fas fa-check-circle text-green-500"></i>
                    </div>
                  )}
                </div>
                
                {errors.courseCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseCode}</p>
                )}
                
                <div className="mt-2 space-y-2">
                  {/* Auto-generation status */}
                  {!initialData && (
                    <div className="flex items-center text-sm">
                      {generatingCode ? (
                        <div className="flex items-center text-blue-600">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Generating unique course code...
                        </div>
                      ) : formData.courseCode ? (
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check-circle mr-2"></i>
                          Code generated: <span className="font-mono ml-1 bg-green-100 px-2 py-0.5 rounded">{formData.courseCode}</span>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <i className="fas fa-info-circle mr-2"></i>
                          Course code will be auto-generated after entering batch and course name
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Manual override options for editing */}
                  {initialData && formData.courseCode !== generatedCode && (
                    <div className="flex items-center justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                      <div className="flex items-center text-yellow-700 text-sm">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        You've modified the auto-generated code
                      </div>
                      <button
                        type="button"
                        onClick={resetToAutoGenerated}
                        className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                      >
                        Reset to auto
                      </button>
                    </div>
                  )}
                  
                  {/* Code explanation */}
                  {formData.courseCode && (
                    <div className="text-xs text-gray-500">
                      <i className="fas fa-lightbulb mr-1"></i>
                      Format: <span className="font-mono">BATCH-COURSE-001</span> • Auto-incremented for uniqueness
                    </div>
                  )}
                </div>
              </div>

           

              {/* Course Status */}
              {initialData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Course Status
                      </label>
                      <p className="text-sm text-gray-600">
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
                          formData.isActive ? 'bg-green-500' : 'bg-gray-300'
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
                  disabled={loading || (!initialData && (!formData.courseCode || generatingCode))}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
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