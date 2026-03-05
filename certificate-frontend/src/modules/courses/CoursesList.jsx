// src/modules/courses/CoursesList.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../api/courses';
import { batchAPI } from '../../api/batches';
import { studentAPI } from '../../api/students';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/ui/Button';
import CourseCard from './CourseCard';
import CoursesTable from './CoursesTable';
import CourseForm from './CourseForm';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context/ThemeContext';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CoursesList = () => {
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const batchIdFromURL = searchParams.get('batchId');
    const batchNameFromURL = searchParams.get('batchName');
    
    if (batchIdFromURL) {
      setBatchFilter(batchIdFromURL);
      
      if (batchNameFromURL) {
        setSelectedBatch({
          _id: batchIdFromURL,
          batchName: decodeURIComponent(batchNameFromURL)
        });
      }
    }
    
    fetchData();
  }, [searchParams]);

  // Fetch data sequentially
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch batches first
      const batchesResponse = await batchAPI.getAllBatches();
      if (batchesResponse.success) {
        const activeBatches = batchesResponse.data.filter(batch => batch.isActive);
        setBatches(activeBatches);
        
        // 2. Only fetch courses if we have batches
        if (activeBatches.length > 0) {
          await fetchCourses(activeBatches);
        } else {
          setCourses([]);
          setLoading(false);
        }
      } else {
        setBatches([]);
        setCourses([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showToast('Error fetching data', 'error');
      setLoading(false);
    }
  };

  // Fetch courses when filters change (only if batches exist)
  useEffect(() => {
    if (batches.length > 0) {
      fetchCourses(batches);
    }
  }, [batches, batchFilter, statusFilter, searchTerm]);

  const fetchCourses = async (availableBatches = batches) => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (batchFilter !== 'all') params.batchId = batchFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
      
      // Fetch all courses
      const coursesResponse = await courseAPI.getAllCourses(params);
      
      if (coursesResponse.success) {
        // Fetch all students to count enrollments
        const studentsResponse = await studentAPI.getAllStudents({});
        
        if (studentsResponse.success) {
          const allStudents = studentsResponse.data || [];
          
          // Map courses with student counts
          const coursesWithStats = coursesResponse.data.map(course => {
            // Count students enrolled in this course
            let studentCount = 0;
            
            if (course._id) {
              studentCount = allStudents.filter(student => {
                // Check if student is enrolled in this course
                const enrolledCourses = student.enrolledCourseIds || [];
                return enrolledCourses.some(enrolledCourse => {
                  if (typeof enrolledCourse === 'object') {
                    return enrolledCourse._id === course._id;
                  }
                  return enrolledCourse === course._id;
                });
              }).length;
            }
            
            // Count batches for this course (usually 1)
            let batchCount = 0;
            if (course.batchId) {
              if (Array.isArray(course.batchId)) {
                batchCount = course.batchId.length;
              } else {
                batchCount = 1;
              }
            }
            
            return {
              ...course,
              studentCount,
              batchCount,
              courseName: course.courseName || 'Unnamed Course',
              courseCode: course.courseCode || course.courseName?.substring(0, 8).toUpperCase() || 'N/A'
            };
          });
          
          setCourses(coursesWithStats);
        } else {
          // If student fetch fails, just show courses without counts
          const coursesWithStats = coursesResponse.data.map(course => ({
            ...course,
            studentCount: 0,
            batchCount: course.batchId ? 1 : 0,
            courseName: course.courseName || 'Unnamed Course',
            courseCode: course.courseCode || course.courseName?.substring(0, 8).toUpperCase() || 'N/A'
          }));
          setCourses(coursesWithStats);
        }
      } else {
        showToast('Failed to fetch courses', 'error');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('Error fetching courses data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // PDF Generation Function
  const downloadCoursesPDF = () => {
    if (filteredCourses.length === 0) {
      showToast('No courses to download', 'warning');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.setFont('helvetica', 'bold');
      doc.text('COURSES LIST', 14, 20);

      // Add subtitle
      doc.setFontSize(12);
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      doc.setFont('helvetica', 'normal');
      if (selectedBatch) {
        doc.text(`Batch: ${selectedBatch.batchName}`, 14, 28);
      }

      // Add date
      doc.setFontSize(10);
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on: ${date}`, 14, 36);

      // Add filters info
      let filtersText = 'Filters: ';
      if (selectedBatch) filtersText += `Batch: ${selectedBatch.batchName} `;
      if (statusFilter !== 'all') filtersText += `Status: ${statusFilter === 'active' ? 'Active' : 'Inactive'} `;
      if (searchTerm) filtersText += `Search: "${searchTerm}" `;
      if (!selectedBatch && statusFilter === 'all' && !searchTerm) filtersText += 'All courses';
      
      doc.setFontSize(9);
      doc.text(filtersText, 14, 44);

      // Prepare table data
      const tableData = filteredCourses.map((course, index) => [
        index + 1,
        course.courseCode,
        course.courseName,
        course.batchId?.batchName || 'N/A',
        course.duration || 'N/A',
        `${course.studentCount || 0} students`,
        course.isActive ? 'Active' : 'Inactive',
        course.createdAt 
          ? new Date(course.createdAt).toLocaleDateString()
          : 'N/A'
      ]);

      // Add table
      autoTable(doc, {
        startY: 52,
        head: [
          ['#', 'Code', 'Course Name', 'Batch', 'Duration', 'Enrollments', 'Status', 'Created Date']
        ],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [16, 185, 129], // Emerald color
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: isDarkMode ? [60, 60, 60] : [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 10 }, // #
          1: { cellWidth: 20 }, // Code
          2: { cellWidth: 40 }, // Course Name
          3: { cellWidth: 25 }, // Batch
          4: { cellWidth: 20 }, // Duration
          5: { cellWidth: 25 }, // Enrollments
          6: { cellWidth: 20 }, // Status
          7: { cellWidth: 25 }, // Created Date
        },
        margin: { left: 14, right: 14 }
      });

      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.text('SUMMARY STATISTICS', 14, finalY);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      doc.text([
        `Total Courses: ${stats.totalCourses}`,
        `Active Courses: ${stats.activeCourses}`,
        `Inactive Courses: ${stats.inactiveCourses}`,
        `Total Students Enrolled: ${stats.totalStudents}`
      ], 14, finalY + 8);

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Save PDF
      const fileName = `Courses_List_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      showToast('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const response = await courseAPI.createCourse(courseData);
      if (response.success) {
        showToast('Course created successfully', 'success');
        setShowForm(false);
        
        // Refresh the batch list to ensure we have the latest
        const batchesResponse = await batchAPI.getAllBatches();
        if (batchesResponse.success) {
          const activeBatches = batchesResponse.data.filter(batch => batch.isActive);
          setBatches(activeBatches);
          await fetchCourses(activeBatches);
        }
      } else {
        showToast(response.message || 'Failed to create course', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Error creating course', 'error');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleUpdateCourse = async (courseId, updatedData) => {
    try {
      const response = await courseAPI.updateCourse(courseId, updatedData);
      if (response.success) {
        showToast('Course updated successfully', 'success');
        setShowForm(false);
        setEditingCourse(null);
        fetchCourses();
      } else {
        showToast(response.message || 'Failed to update course', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Error updating course', 'error');
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const response = await courseAPI.updateCourse(id, { isActive: newStatus });
      if (response.success) {
        showToast(
          `Course ${newStatus ? 'activated' : 'deactivated'} successfully`,
          'success'
        );
        // Update local state immediately
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course._id === id ? { ...course, isActive: newStatus } : course
          )
        );
      } else {
        showToast(response.message || 'Failed to update status', 'error');
        // Refresh data on error
        fetchCourses();
      }
    } catch (error) {
      showToast(error.message || 'Error updating course status', 'error');
      fetchCourses();
    }
  };

  const handleCreateBatch = () => {
    navigate('/batches/create');
  };

  const clearBatchFilter = () => {
    setBatchFilter('all');
    setSelectedBatch(null);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('batchId');
    newSearchParams.delete('batchName');
    navigate({ search: newSearchParams.toString() });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = batchFilter === 'all' || course.batchId?._id === batchFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? course.isActive : !course.isActive);
    
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const getStats = () => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.isActive).length;
    const inactiveCourses = courses.filter(c => !c.isActive).length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.studentCount || 0), 0);
    
    return { totalCourses, activeCourses, inactiveCourses, totalStudents };
  };

  const stats = getStats();

  if (loading && courses.length === 0 && batches.length === 0) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {selectedBatch ? `${selectedBatch.batchName} Courses` : 'Courses Management'}
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {selectedBatch ? 'Manage courses for this batch' : 'Manage all courses and their enrollments'}
          </p>
          
          {selectedBatch && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center text-sm px-3 py-1 rounded-full border ${
                isDarkMode 
                  ? 'text-blue-300 bg-blue-900/20 border-blue-800' 
                  : 'text-blue-600 bg-blue-50 border-blue-200'
              }`}>
                <i className="fas fa-filter mr-1"></i>
                Filtered by Batch: {selectedBatch.batchName}
              </span>
              <button
                onClick={clearBatchFilter}
                className={`inline-flex items-center text-sm px-2 py-1 rounded transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Show all courses"
              >
                <i className="fas fa-times mr-1"></i>
                Clear
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle - only show if we have courses */}
          {courses.length > 0 && (
            <div className={`flex rounded-lg border p-1 shadow-sm ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'table'
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-800 shadow-sm'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <i className="fas fa-table text-base"></i>
                <span className="hidden sm:inline text-sm font-medium">Table</span>
              </button>

              <button
                onClick={() => setViewMode('card')}
                className={`p-2.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'card'
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-800 shadow-sm'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Card View"
              >
                <i className="fas fa-th-large text-base"></i>
                <span className="hidden sm:inline text-sm font-medium">Cards</span>
              </button>
            </div>
          )}
          
          {/* Download PDF Button */}
          {filteredCourses.length > 0 && (
            <Button
              onClick={downloadCoursesPDF}
              variant="outline"
              icon={isGeneratingPDF ? "fas fa-spinner fa-spin" : "fas fa-download"}
              size="medium"
              disabled={filteredCourses.length === 0 || isGeneratingPDF}
              className={isDarkMode
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200 hover:text-white'
                : 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 hover:text-emerald-800 hover:border-emerald-300'
              }
            >
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          )}
          
          <Button
            onClick={() => {
              if (batches.length === 0) {
                showToast("Please create a batch first", "info");
                navigate("/batches/create");
              } else {
                setEditingCourse(null);
                setShowForm(true);
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            icon="fas fa-plus"
            size="medium"
          >
            <span className="hidden sm:inline">Create Course</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards - only show if we have courses */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-book text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Courses</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-emerald-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.activeCourses}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-pause-circle text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Inactive</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.inactiveCourses}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-purple-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Students</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - only show if we have batches */}
      {batches.length > 0 && (
        <div className={`p-5 rounded-xl border shadow-sm ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Search Courses
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by course name or code..."
                  className={`
                    block w-full rounded-xl border-2 px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                  `}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className={`fas fa-search ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Batch Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Filter by Batch
              </label>
              <div className="relative">
                <select
                  value={batchFilter}
                  onChange={(e) => {
                    setBatchFilter(e.target.value);
                    const selected = batches.find(b => b._id === e.target.value);
                    setSelectedBatch(selected || null);
                  }}
                  className={`
                    block w-full rounded-xl border-2 px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-900'
                    }
                  `}
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Filter by Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`
                    block w-full rounded-xl border-2 px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-900'
                    }
                  `}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active batch filter notification */}
          {selectedBatch && (
            <div className={`mt-4 p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-800' 
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-layer-group text-white"></i>
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Showing courses for batch:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {selectedBatch.batchName}
                      </span>
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Only courses from this batch are displayed
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Click "Download PDF" to export this filtered list
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearBatchFilter}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900/30' 
                      : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <i className="fas fa-times mr-1"></i>
                  Clear Batch Filter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses Content */}
      {batches.length === 0 ? (
        <EmptyState
          title="No Batches Available"
          description="You need to create a batch before you can create courses. Batches are required to organize courses."
          icon="fas fa-layer-group"
          actionText="Create Your First Batch"
          onAction={handleCreateBatch}
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title={
            selectedBatch 
              ? `No courses found for ${selectedBatch.batchName}`
              : 'No courses found'
          }
          description={
            searchTerm || batchFilter !== 'all' || statusFilter !== 'all' || selectedBatch
              ? 'Try changing your search or filters'
              : 'Create your first course to get started'
          }
          icon="fas fa-graduation-cap"
          actionText="Create Course"
          onAction={() => {
            setEditingCourse(null);
            setShowForm(true);
          }}
        />
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditCourse}
            />
          ))}
        </div>
      ) : (
        <CoursesTable
          courses={filteredCourses}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditCourse}
        />
      )}

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          onSubmit={editingCourse ? 
            (data) => handleUpdateCourse(editingCourse._id, data) : 
            handleCreateCourse
          }
          onClose={() => {
            setShowForm(false);
            setEditingCourse(null);
          }}
          initialData={editingCourse}
          batches={batches}
          title={editingCourse ? 'Edit Course' : 'Create New Course'}
          defaultBatchId={batchFilter !== 'all' ? batchFilter : undefined}
        />
      )}
    </div>
  );
};

export default CoursesList;