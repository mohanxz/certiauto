// src/modules/students/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { courseAPI } from '../../api/courses';
import { useTheme } from '../../context/ThemeContext';

const StudentForm = ({ 
  onSubmit, 
  onClose, 
  initialData,
  batches,
  courses, 
  title = initialData ? 'Edit Student' : 'Add New Student',
  defaultBatchId,
  defaultCourseIds
}) => {
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    uniqueId: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    finalMark: '',
    completionDate: '',
    batchId: '',
    enrolledCourseIds: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(false);

  // Fetch courses for selected batch
  const fetchCoursesForBatch = async (batchId) => {
    if (!batchId) {
      setFilteredCourses([]);
      return;
    }
    
    setFetchingCourses(true);
    try {
      const response = await courseAPI.getCoursesByBatch(batchId);
      
      if (response.success) {
        const activeCourses = response.data.filter(course => course.isActive);
        setFilteredCourses(activeCourses);
        
        if (formData.enrolledCourseIds.length > 0) {
          const validCourseIds = activeCourses.map(course => course._id);
          const filteredSelectedCourses = formData.enrolledCourseIds.filter(
            courseId => validCourseIds.includes(courseId)
          );
          
          if (filteredSelectedCourses.length !== formData.enrolledCourseIds.length) {
            setFormData(prev => ({
              ...prev,
              enrolledCourseIds: filteredSelectedCourses
            }));
            if (!initialData) {
              showToast('Some selected courses were removed as they do not belong to this batch', 'info');
            }
          }
        }
      } else {
        setFilteredCourses([]);
        showToast('Failed to fetch courses for this batch', 'warning');
      }
    } catch (error) {
      console.error('Error fetching courses for batch:', error);
      setFilteredCourses([]);
      showToast('Error loading courses for this batch', 'error');
    } finally {
      setFetchingCourses(false);
    }
  };

  // When batch changes, fetch courses for that batch
  useEffect(() => {
    if (formData.batchId) {
      fetchCoursesForBatch(formData.batchId);
    } else {
      setFilteredCourses([]);
    }
  }, [formData.batchId]);

  // Initial setup
  useEffect(() => {
    if (initialData) {
      const initialBatchId = initialData.batchId?._id || initialData.batchId || '';
      const initialCourseIds = initialData.enrolledCourseIds?.map(course => 
        typeof course === 'object' ? course._id : course
      ) || [];
      
      setFormData({
        uniqueId: initialData.uniqueId || '',
        name: initialData.name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        address: initialData.address || '',
        finalMark: initialData.finalMark ? initialData.finalMark.toString() : '',
        completionDate: initialData.completionDate 
          ? new Date(initialData.completionDate).toISOString().split('T')[0]
          : '',
        batchId: initialBatchId,
        enrolledCourseIds: initialCourseIds
      });
      
      if (initialBatchId) {
        fetchCoursesForBatch(initialBatchId);
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        completionDate: today
      }));
      
      if (defaultBatchId) {
        setFormData(prev => ({ ...prev, batchId: defaultBatchId }));
        fetchCoursesForBatch(defaultBatchId);
      }
      if (defaultCourseIds && defaultCourseIds.length > 0) {
        setFormData(prev => ({ ...prev, enrolledCourseIds: defaultCourseIds }));
      }
    }
  }, [initialData, defaultBatchId, defaultCourseIds]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const courseId = value;
      setFormData(prev => ({
        ...prev,
        enrolledCourseIds: checked
          ? [...prev.enrolledCourseIds, courseId]
          : prev.enrolledCourseIds.filter(id => id !== courseId)
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.uniqueId.trim()) newErrors.uniqueId = 'Student ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.batchId.trim()) newErrors.batchId = 'Batch selection is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.phoneNumber && !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone must start with 6-9 and be 10 digits';
    }
    
    if (formData.finalMark) {
      const mark = parseFloat(formData.finalMark);
      if (isNaN(mark) || mark < 0 || mark > 100) {
        newErrors.finalMark = 'Mark must be between 0 and 100';
      }
    }
    
    if (formData.completionDate) {
      const date = new Date(formData.completionDate);
      if (isNaN(date.getTime())) {
        newErrors.completionDate = 'Invalid date format';
      }
    }
    
    if (formData.enrolledCourseIds.length === 0) {
      newErrors.enrolledCourseIds = 'At least one course must be selected';
    } else if (formData.batchId) {
      const validCourseIds = filteredCourses.map(course => course._id);
      const invalidCourses = formData.enrolledCourseIds.filter(
        courseId => !validCourseIds.includes(courseId)
      );
      
      if (invalidCourses.length > 0) {
        newErrors.enrolledCourseIds = 'Some selected courses do not belong to this batch';
      }
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
        uniqueId: formData.uniqueId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        address: formData.address.trim() || undefined,
        batchId: formData.batchId.trim(),
        enrolledCourseIds: formData.enrolledCourseIds
      };
      
      if (formData.finalMark) {
        submissionData.finalMark = parseFloat(formData.finalMark);
      }
      
      if (formData.completionDate) {
        submissionData.completionDate = formData.completionDate;
      }
      
      console.log('Submitting student data:', submissionData);
      await onSubmit(submissionData);
      
    } catch (error) {
      showToast(error.message || 'Failed to save student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find(batch => batch._id === formData.batchId);

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
          inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <Input
                  label="Student ID *"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleChange}
                  placeholder="e.g., STU-001, S2024001"
                  required
                  error={errors.uniqueId}
                  icon="fas fa-id-card"
                  disabled={loading}
                />

                <Input
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Arun Kumar"
                  required
                  error={errors.name}
                  icon="fas fa-user"
                  disabled={loading}
                />

                <Input
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="arun.kumar@gmail.com"
                  required
                  error={errors.email}
                  icon="fas fa-envelope"
                  disabled={loading}
                />

                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  error={errors.phoneNumber}
                  icon="fas fa-phone"
                  disabled={loading}
                  helpText="Must start with 6-9 and be 10 digits"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Input
                  label="Final Mark (%)"
                  name="finalMark"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.finalMark}
                  onChange={handleChange}
                  placeholder="e.g., 86"
                  error={errors.finalMark}
                  icon="fas fa-star"
                  disabled={loading}
                  helpText="Must be between 0 and 100"
                />

                <Input
                  label="Completion Date"
                  name="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={handleChange}
                  error={errors.completionDate}
                  icon="fas fa-calendar-alt"
                  disabled={loading}
                />

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
                      onChange={handleChange}
                      disabled={loading}
                      className={`
                        block w-full rounded-lg border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none
                        ${errors.batchId 
                          ? 'border-red-500' 
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }
                        ${loading ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                      required
                    >
                      <option value="">Select a batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batchName}
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
                  {formData.batchId && fetchingCourses && (
                    <div className={`mt-1 text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                      Loading courses for this batch...
                    </div>
                  )}
                  {formData.batchId && !fetchingCourses && (
                    <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>{filteredCourses.length} course(s) available in this batch</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Courses *
                    {formData.batchId && (
                      <span className={`ml-2 text-xs font-normal ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        (for {selectedBatch?.batchName || 'selected batch'})
                      </span>
                    )}
                  </label>
                  <div className={`
                    max-h-48 overflow-y-auto p-3 border rounded-lg
                    ${errors.enrolledCourseIds 
                      ? 'border-red-500' 
                      : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }
                    ${!formData.batchId ? isDarkMode ? 'bg-gray-700' : 'bg-gray-50' : ''}
                  `}>
                    {!formData.batchId ? (
                      <div className="text-center py-4">
                        <i className={`fas fa-info-circle text-lg mb-2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}></i>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Please select a batch first to see available courses
                        </p>
                      </div>
                    ) : fetchingCourses ? (
                      <div className="text-center py-4">
                        <i className={`fas fa-spinner fa-spin text-lg mb-2 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-500'
                        }`}></i>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Loading courses...
                        </p>
                      </div>
                    ) : filteredCourses.length === 0 ? (
                      <div className="text-center py-4">
                        <i className={`fas fa-exclamation-circle text-lg mb-2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}></i>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No courses available in this batch
                        </p>
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          Please check if courses are assigned to this batch
                        </p>
                      </div>
                    ) : (
                      filteredCourses.map((course) => (
                        <label key={course._id} className={`
                          flex items-center mb-2 last:mb-0 p-2 rounded transition-colors
                          ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                        `}>
                          <input
                            type="checkbox"
                            name="enrolledCourseIds"
                            value={course._id}
                            checked={formData.enrolledCourseIds.includes(course._id)}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={loading}
                          />
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {course.courseName}
                            </div>
                            {course.courseCode && (
                              <div className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Code: {course.courseCode}
                              </div>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {errors.enrolledCourseIds && (
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {errors.enrolledCourseIds}
                    </p>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <i className="fas fa-check-circle mr-1"></i>
                      {formData.enrolledCourseIds.length} course(s) selected
                    </p>
                    {formData.enrolledCourseIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enrolledCourseIds: [] }))}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                        disabled={loading}
                      >
                        <i className="fas fa-times mr-1"></i>
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
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
                  disabled={loading || !formData.batchId || formData.enrolledCourseIds.length === 0 || fetchingCourses}
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {initialData ? 'Update Student' : 'Create Student'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;