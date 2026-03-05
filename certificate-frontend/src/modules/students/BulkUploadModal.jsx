// src/modules/bulkUpload/BulkUploadModal.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useToast } from "../../hooks/useToast";
import { courseAPI } from "../../api/courses";
import { bulkUploadAPI } from "../../api/bulkUpload";
import { useTheme } from "../../context/ThemeContext";

const BulkUploadModal = ({
  onClose,
  onDownloadTemplate,
  batches,
  courses,
  uploadHistory,
  defaultBatchId,
  defaultCourseIds,
  onUploadSuccess,
}) => {
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    batchId: defaultBatchId || "",
    courseIds: defaultCourseIds || [],
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        const activeCourses = response.data.filter((course) => course.isActive);
        setFilteredCourses(activeCourses);

        if (formData.courseIds.length > 0) {
          const validCourseIds = activeCourses.map((course) => course._id);
          const filteredSelectedCourses = formData.courseIds.filter(
            (courseId) => validCourseIds.includes(courseId),
          );

          if (filteredSelectedCourses.length !== formData.courseIds.length) {
            setFormData((prev) => ({
              ...prev,
              courseIds: filteredSelectedCourses,
            }));
            showToast(
              "Some selected courses were removed as they do not belong to this batch",
              "info",
            );
          }
        }
      } else {
        setFilteredCourses([]);
        showToast("Failed to fetch courses for this batch", "warning");
      }
    } catch (error) {
      console.error("Error fetching courses for batch:", error);
      setFilteredCourses([]);
      showToast("Error loading courses for this batch", "error");
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
    if (defaultBatchId) {
      setFormData((prev) => ({ ...prev, batchId: defaultBatchId }));
      fetchCoursesForBatch(defaultBatchId);
    }
    if (defaultCourseIds && defaultCourseIds.length > 0) {
      setFormData((prev) => ({ ...prev, courseIds: defaultCourseIds }));
    }
  }, [defaultBatchId, defaultCourseIds]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        showToast("Please upload an Excel file (.xlsx or .xls)", "error");
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size should be less than 10MB", "error");
        return;
      }
      
      setFormData((prev) => ({ ...prev, file }));
      setFileName(file.name);
      
      // Clear file error if exists
      if (errors.file) {
        setErrors({ ...errors, file: "" });
      }
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      batchId,
      courseIds: [], // Clear courses when batch changes
    }));

    if (errors.batchId) {
      setErrors({ ...errors, batchId: "" });
    }
    if (errors.courseIds) {
      setErrors({ ...errors, courseIds: "" });
    }
  };

  const handleCourseCheckboxChange = (courseId, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        courseIds: [...prev.courseIds, courseId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        courseIds: prev.courseIds.filter((id) => id !== courseId),
      }));
    }

    if (errors.courseIds) {
      setErrors({ ...errors, courseIds: "" });
    }
  };

  const selectAllCourses = () => {
    if (filteredCourses.length > 0) {
      const allCourseIds = filteredCourses.map(course => course._id);
      setFormData(prev => ({
        ...prev,
        courseIds: allCourseIds
      }));
    }
  };

  const clearAllCourses = () => {
    setFormData(prev => ({
      ...prev,
      courseIds: []
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.batchId) {
      newErrors.batchId = "Please select a batch";
    }

    if (formData.courseIds.length === 0) {
      newErrors.courseIds = "Please select at least one course";
    } else if (formData.batchId) {
      const validCourseIds = filteredCourses.map((course) => course._id);
      const invalidCourses = formData.courseIds.filter(
        (courseId) => !validCourseIds.includes(courseId),
      );

      if (invalidCourses.length > 0) {
        newErrors.courseIds =
          "Some selected courses do not belong to this batch";
      }
    }

    if (!formData.file) {
      newErrors.file = "Please select a file to upload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 90) {
        clearInterval(interval);
        setUploadProgress(90);
      } else {
        setUploadProgress(progress);
      }
    }, 300);
    
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setLoading(true);
    setProcessing(true);
    setUploadProgress(0);

    const progressInterval = simulateUploadProgress();

    try {
      console.log('Starting bulk upload with:', {
        file: formData.file.name,
        batchId: formData.batchId,
        courseIds: formData.courseIds,
        totalCourses: formData.courseIds.length
      });

      const uploadPromise = bulkUploadAPI.uploadExcel(
        formData.file,
        formData.batchId,
        formData.courseIds
      );

      const [response] = await Promise.all([
        uploadPromise,
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);

      console.log('Upload API response:', response);

      setUploadProgress(100);

      if (response.success) {
        showToast(
          response.message || "File uploaded successfully! Processing started.",
          "success"
        );
        
        setTimeout(() => {
          if (onUploadSuccess) {
            onUploadSuccess(response.data);
          }
          
          setFormData({
            batchId: "",
            courseIds: [],
            file: null
          });
          setFileName("");
          
          onClose();
        }, 1000);
      } else {
        showToast(response.message || "Upload failed", "error");
        clearInterval(progressInterval);
      }
    } catch (error) {
      console.error('Upload error details:', error);
      clearInterval(progressInterval);
      
      let errorMessage = "Failed to upload file. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showToast(errorMessage, "error");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      
      setTimeout(() => {
        setProcessing(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  const recentUploads = uploadHistory.slice(0, 3);
  const selectedBatch = batches.find((batch) => batch._id === formData.batchId);

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
          inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full
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
                Bulk Upload Students
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
                disabled={loading || processing}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Processing Overlay */}
          {(processing || loading) && (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
            }`}>
              <div className="w-16 h-16 mb-4">
                <div className="relative w-full h-full">
                  <div className={`absolute inset-0 border-4 rounded-full ${
                    isDarkMode ? 'border-gray-700' : 'border-blue-200'
                  }`}></div>
                  <div className={`absolute inset-0 border-4 rounded-full animate-spin border-t-transparent ${
                    isDarkMode ? 'border-blue-400' : 'border-blue-600'
                  }`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`fas fa-file-upload text-xl ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}></i>
                  </div>
                </div>
              </div>
              
              <h4 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {uploadProgress === 100 ? "Processing Complete!" : "Uploading & Processing..."}
              </h4>
              
              <p className={`text-sm mb-6 max-w-md text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {uploadProgress === 100 
                  ? "Your file has been uploaded successfully. The system is now processing the data."
                  : "Please wait while we upload and validate your file. This may take a moment."}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-md px-6 mb-8">
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Progress</span>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{uploadProgress}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className={`mt-2 text-xs text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {uploadProgress < 50 && "Uploading file..."}
                  {uploadProgress >= 50 && uploadProgress < 90 && "Validating data..."}
                  {uploadProgress >= 90 && uploadProgress < 100 && "Finalizing..."}
                  {uploadProgress === 100 && "Complete! Closing..."}
                </div>
              </div>
              
              {uploadProgress === 100 && (
                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                  <i className="fas fa-check-circle"></i>
                  <span className="text-sm">Upload successful! Students will appear shortly.</span>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload Form */}
              <div className="lg:col-span-2">
                <h4 className={`text-lg font-medium mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Upload Excel File
                </h4>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          disabled={loading || processing || batches.length === 0}
                          className={`
                            block w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none
                            ${errors.batchId
                              ? 'border-red-500'
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-700 text-white'
                                : 'border-gray-300 bg-white text-gray-900'
                            }
                            ${batches.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}
                          `}
                          required
                        >
                          <option value="">Select a batch</option>
                          {batches.length === 0 ? (
                            <option value="" disabled>No batches available</option>
                          ) : (
                            batches.map((batch) => (
                              <option key={batch._id} value={batch._id}>
                                {batch.batchName}
                              </option>
                            ))
                          )}
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
                          <span>
                            {filteredCourses.length} course(s) available in this batch
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Upload Excel File *
                      </label>
                      <div
                        className={`
                          border-2 border-dashed rounded-lg p-4 text-center transition-colors h-full flex flex-col justify-center
                          ${errors.file 
                            ? isDarkMode
                              ? 'border-red-800 bg-red-900/20'
                              : 'border-red-300 bg-red-50'
                            : fileName 
                              ? isDarkMode
                                ? 'border-green-800 bg-green-900/20'
                                : 'border-green-300 bg-green-50'
                              : isDarkMode
                                ? 'border-gray-600 hover:border-blue-500'
                                : 'border-gray-300 hover:border-blue-400'
                          }
                        `}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={loading || processing}
                        />
                        <label 
                          htmlFor="file-upload" 
                          className={`cursor-pointer flex flex-col items-center ${
                            loading || processing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <i className={`fas ${
                            fileName ? "fa-file-excel" : "fa-cloud-upload-alt"
                          } text-3xl mb-2 ${
                            fileName 
                              ? isDarkMode ? 'text-green-400' : 'text-green-500'
                              : isDarkMode ? 'text-gray-400' : 'text-gray-400'
                          }`}></i>
                          <p className={`text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {fileName ? fileName : "Click to upload Excel file"}
                          </p>
                          <p className={`text-xs mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Supports .xlsx or .xls files (max 10MB)
                          </p>
                          {!fileName && !loading && !processing && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isDarkMode
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <i className="fas fa-upload mr-1"></i>
                              Browse Files
                            </span>
                          )}
                        </label>
                      </div>
                      {errors.file && (
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {errors.file}
                        </p>
                      )}
                      {fileName && (
                        <div className="mt-1 mb-3 flex items-center justify-between">
                          <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            <i className="fas fa-check-circle mr-1"></i>
                            File ready for upload
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, file: null }));
                              setFileName("");
                            }}
                            className={`text-xs disabled:opacity-50 ${
                              isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                            }`}
                            disabled={loading || processing}
                          >
                            <i className="fas fa-times mr-1"></i>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Selection */}
                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <label className={`block text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Select Courses *
                        {formData.batchId && (
                          <span className={`ml-2 text-xs font-normal ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            (for {selectedBatch?.batchName || "selected batch"})
                          </span>
                        )}
                      </label>
                    </div>
                    
                    <div
                      className={`
                        border rounded-lg
                        ${errors.courseIds 
                          ? 'border-red-500' 
                          : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }
                        ${!formData.batchId || loading || processing ? isDarkMode ? 'bg-gray-700' : 'bg-gray-50' : ''}
                      `}
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {!formData.batchId ? (
                        <div className="text-center py-8">
                          <i className={`fas fa-info-circle text-2xl mb-2 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}></i>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Please select a batch first to see available courses
                          </p>
                        </div>
                      ) : fetchingCourses ? (
                        <div className="text-center py-8">
                          <i className={`fas fa-spinner fa-spin text-2xl mb-2 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-500'
                          }`}></i>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Loading courses...
                          </p>
                        </div>
                      ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-8">
                          <i className={`fas fa-exclamation-circle text-2xl mb-2 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}></i>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No courses available in this batch
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            Please assign courses to this batch first
                          </p>
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredCourses.map((course) => (
                              <label
                                key={course._id}
                                className={`
                                  flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                                  ${formData.courseIds.includes(course._id)
                                    ? isDarkMode
                                      ? 'bg-blue-900/20 border-blue-800'
                                      : 'bg-blue-50 border-blue-200'
                                    : isDarkMode
                                      ? 'border-gray-600 hover:bg-gray-700'
                                      : 'border-gray-200 hover:bg-gray-50'
                                  }
                                  ${loading || processing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.courseIds.includes(course._id)}
                                  onChange={(e) =>
                                    handleCourseCheckboxChange(
                                      course._id,
                                      e.target.checked,
                                    )
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  disabled={loading || processing}
                                />
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
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
                                    {course.duration && (
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        isDarkMode
                                          ? 'bg-gray-700 text-gray-300'
                                          : 'bg-gray-100 text-gray-500'
                                      }`}>
                                        {course.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {errors.courseIds && (
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {errors.courseIds}
                      </p>
                    )}
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <i className="fas fa-check-circle mr-1"></i>
                          <span className="font-medium">{formData.courseIds.length}</span> course(s) selected
                        </p>
                        {formData.batchId && !fetchingCourses && (
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <i className="fas fa-list-alt mr-1"></i>
                            <span className="font-medium">{filteredCourses.length}</span> available
                          </p>
                        )}
                      </div>
                      
                      {formData.courseIds.length > 0 && (
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <i className="fas fa-info-circle mr-1"></i>
                          Students will be enrolled in all selected courses
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Template Download & Actions */}
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode
                        ? 'bg-blue-900/20 border-blue-800'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className={`text-sm font-medium ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-900'
                          }`}>
                            <i className="fas fa-file-excel mr-2"></i>
                            Need a template?
                          </h5>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-blue-300/70' : 'text-blue-700'
                          }`}>
                            Download our Excel template with proper formatting and example data
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={onDownloadTemplate}
                          variant="outline"
                          size="small"
                          icon="fas fa-download"
                          disabled={loading || processing}
                          className={isDarkMode
                            ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30 disabled:opacity-50'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50'
                          }
                        >
                          Download Template
                        </Button>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className={`flex space-x-3 pt-4 border-t ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        disabled={loading || processing}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={loading}
                        disabled={
                          loading ||
                          processing ||
                          !formData.file ||
                          !formData.batchId ||
                          formData.courseIds.length === 0 ||
                          fetchingCourses
                        }
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        icon={loading ? "fas fa-spinner fa-spin" : "fas fa-upload"}
                      >
                        {loading ? "Uploading..." : "Upload & Process"}
                      </Button>
                    </div>
                    
                    <div className={`text-xs text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <i className="fas fa-info-circle mr-1"></i>
                      Processing may take a few moments depending on file size
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Column - Instructions & History */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div>
                    <h4 className={`text-lg font-medium mb-4 flex items-center ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <i className="fas fa-info-circle mr-2"></i>
                      Instructions
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${
                          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-800'
                          }`}>
                            1
                          </span>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Select Batch & Courses
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Choose the batch and courses where students will be enrolled
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${
                          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-800'
                          }`}>
                            2
                          </span>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Prepare Excel File
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Download the template and fill with student data
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${
                          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-800'
                          }`}>
                            3
                          </span>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Upload & Process
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Upload the Excel file. System will validate and process automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Format */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h5 className={`text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      <i className="fas fa-table mr-2"></i>
                      File Format
                    </h5>
                    <div className={`text-xs space-y-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div className={`font-mono p-2 rounded border overflow-x-auto ${
                        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}># Required columns:</div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          uniqueId, name, email, phoneNumber, address, finalMark, completionDate
                        </div>
                      </div>
                      <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        <i className="fas fa-lightbulb mr-1"></i>
                        <span className="font-medium">Note:</span> Phone number must start with 6-9
                      </div>
                      <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        <i className="fas fa-lightbulb mr-1"></i>
                        <span className="font-medium">Date format:</span> YYYY-MM-DD
                      </div>
                    </div>
                  </div>

                  {/* Recent Uploads */}
                  {recentUploads.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-medium mb-4 flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <i className="fas fa-history mr-2"></i>
                        Recent Uploads
                      </h4>
                      <div className="space-y-3">
                        {recentUploads.map((upload) => (
                          <div
                            key={upload._id}
                            className={`
                              p-3 rounded-lg border transition-colors
                              ${isDarkMode 
                                ? 'bg-gray-700 border-gray-600 hover:border-gray-500' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                upload.status === "COMPLETED"
                                  ? isDarkMode
                                    ? 'bg-green-900/30 text-green-300 border border-green-800'
                                    : 'bg-green-100 text-green-800'
                                  : upload.status === "PROCESSING"
                                  ? isDarkMode
                                    ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  : upload.status === "PENDING"
                                  ? isDarkMode
                                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                                    : 'bg-blue-100 text-blue-800'
                                  : isDarkMode
                                    ? 'bg-red-900/30 text-red-300 border border-red-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {upload.status}
                              </span>
                              <span className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {new Date(upload.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              <div className="truncate" title={upload.fileName}>
                                <i className={`fas fa-file-excel mr-1 ${
                                  isDarkMode ? 'text-green-400' : 'text-green-500'
                                }`}></i>
                                {upload.fileName}
                              </div>
                              <div className="flex justify-between mt-2 text-xs">
                                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  Total: <span className="font-medium">{upload.totalRecords || 0}</span>
                                </div>
                                <div className="flex space-x-3">
                                  <span className="text-green-600 dark:text-green-400">
                                    <i className="fas fa-check mr-1"></i>
                                    {upload.successCount || 0}
                                  </span>
                                  <span className="text-red-600 dark:text-red-400">
                                    <i className="fas fa-times mr-1"></i>
                                    {upload.failureCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {uploadHistory.length > 3 && (
                        <div className="text-center mt-3">
                          <button className={`text-xs ${
                            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                          }`}>
                            View All History <i className="fas fa-arrow-right ml-1"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;