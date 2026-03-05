// src/components/bulk-email/StudentSelector.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useTheme } from '../../context/ThemeContext';

const StudentSelector = ({ onSelectionChange, onFilterChange, filters, selectedStudents }) => {
  const { isDarkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    programId: '',
    batchId: '',
    courseId: '',
    status: 'active',
    search: ''
  });
  const { showToast } = useToast();

  // Initialize with parent filters
  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  // Load programs on mount
  useEffect(() => {
    loadPrograms();
  }, []);

  // Load batches when program changes
  useEffect(() => {
    if (localFilters.programId) {
      loadBatches(localFilters.programId);
    } else {
      setBatches([]);
      setCourses([]);
      setLocalFilters(prev => ({ ...prev, batchId: '', courseId: '' }));
    }
  }, [localFilters.programId]);

  // Load courses when batch changes
  useEffect(() => {
    if (localFilters.batchId) {
      loadCourses(localFilters.batchId);
    } else {
      setCourses([]);
      setLocalFilters(prev => ({ ...prev, courseId: '' }));
    }
  }, [localFilters.batchId]);

  // Load students when filters change
  useEffect(() => {
    const hasFilters = localFilters.programId || localFilters.batchId || localFilters.courseId || localFilters.status !== 'active';
    if (hasFilters) {
      loadFilteredStudents();
    } else if (localFilters.search) {
      loadAllStudents();
    } else {
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [localFilters.programId, localFilters.batchId, localFilters.courseId, localFilters.status]);

  const loadPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/program/get-all-programs', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.data || []);
      } else {
        showToast(data.message || 'Failed to load programs', 'error');
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      showToast('Failed to load programs', 'error');
    }
  };

  const loadBatches = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/batch/get-all-batches', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const filteredBatches = data.data.filter(batch => {
          const batchProgramId = batch.programId?._id || batch.programId;
          return batchProgramId === programId;
        });
        setBatches(filteredBatches);
      } else {
        setBatches([]);
        showToast(data.message || 'Failed to load batches', 'error');
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      setBatches([]);
      showToast('Failed to load batches', 'error');
    }
  };

  const loadCourses = async (batchId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/course/get-all-courses', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data || []);
      } else {
        setCourses([]);
        showToast(data.message || 'Failed to load courses', 'error');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
      showToast('Failed to load courses', 'error');
    }
  };

  const loadAllStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (localFilters.status) params.append('status', localFilters.status);
      if (localFilters.search) params.append('search', localFilters.search);
      params.append('limit', '1000');

      const response = await fetch(`http://localhost:5000/api/student/get-all-students?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        const fetchedStudents = data.data || [];
        setStudents(fetchedStudents);
        
        if (localFilters.search) {
          const searchLower = localFilters.search.toLowerCase();
          const filtered = fetchedStudents.filter(student =>
            (student.name && student.name.toLowerCase().includes(searchLower)) ||
            (student.email && student.email.toLowerCase().includes(searchLower)) ||
            (student.studentCode && student.studentCode.toLowerCase().includes(searchLower))
          );
          setFilteredStudents(filtered);
        } else {
          setFilteredStudents(fetchedStudents);
        }
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredStudents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (localFilters.programId) params.append('programId', localFilters.programId);
      if (localFilters.batchId) params.append('batchId', localFilters.batchId);
      if (localFilters.courseId) params.append('courseId', localFilters.courseId);
      if (localFilters.status) params.append('status', localFilters.status);
      if (localFilters.search) params.append('search', localFilters.search);
      params.append('limit', '1000');

      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/student/get-all-students?${params}`;
      console.log('Loading students from:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Students API response:', data);

      if (data.success) {
        const fetchedStudents = data.data || [];
        setStudents(fetchedStudents);
        setFilteredStudents(fetchedStudents);
        
        onFilterChange(localFilters);
      } else {
        setStudents([]);
        setFilteredStudents([]);
        showToast(data.message || 'Failed to load students', 'error');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      setFilteredStudents([]);
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setLocalFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      
      if (name === 'programId') {
        newFilters.batchId = '';
        newFilters.courseId = '';
        setBatches([]);
        setCourses([]);
      }
      
      if (name === 'batchId') {
        newFilters.courseId = '';
        setCourses([]);
      }
      
      return newFilters;
    });
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setLocalFilters(prev => ({ ...prev, search: searchValue }));
    
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const filtered = students.filter(student =>
        (student.name && student.name.toLowerCase().includes(searchLower)) ||
        (student.email && student.email.toLowerCase().includes(searchLower)) ||
        (student.studentCode && student.studentCode.toLowerCase().includes(searchLower))
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  const handleStudentSelect = (student) => {
    const isSelected = selectedStudents.some(s => s._id === student._id);
    let newSelection;

    if (isSelected) {
      newSelection = selectedStudents.filter(s => s._id !== student._id);
    } else {
      newSelection = [...selectedStudents, student];
    }

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const newSelected = [...selectedStudents];

    filteredStudents.forEach(student => {
      if (!newSelected.some(s => s._id === student._id)) {
        newSelected.push(student);
      }
    });

    onSelectionChange(
      filteredStudents.every(f =>
        selectedStudents.some(s => s._id === f._id)
      )
        ? selectedStudents.filter(
            s => !filteredStudents.some(f => f._id === s._id)
          )
        : newSelected
    );
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      programId: '',
      batchId: '',
      courseId: '',
      status: 'active',
      search: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    onSelectionChange([]);
    setStudents([]);
    setFilteredStudents([]);
    setBatches([]);
    setCourses([]);
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Filter and Select Students
      </h3>

      <div className={`rounded-lg p-6 space-y-4 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Program Filter */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Program
            </label>
            <select
              name="programId"
              value={localFilters.programId || ''}
              onChange={handleFilterChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Programs</option>
              {programs.map(program => (
                <option key={program._id} value={program._id}>
                  {program.programName}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Batch
            </label>
            <select
              name="batchId"
              value={localFilters.batchId || ''}
              onChange={handleFilterChange}
              disabled={!localFilters.programId}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
              }`}
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchName} ({batch.batchCode})
                </option>
              ))}
            </select>
            {!localFilters.programId && (
              <div className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Select program first</div>
            )}
          </div>

          {/* Course Filter */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Course
            </label>
            <select
              name="courseId"
              value={localFilters.courseId || ''}
              onChange={handleFilterChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </label>
            <select
              name="status"
              value={localFilters.status || 'active'}
              onChange={handleFilterChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="">All</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search
            </label>
            <input
              type="text"
              name="search"
              value={localFilters.search || ''}
              onChange={handleSearchChange}
              placeholder="Name, email, ID..."
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {filteredStudents.length} students found
            {localFilters.programId && ` • Filter applied`}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="small"
              icon="fas fa-times"
              className={isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }
            >
              Clear Filters
            </Button>
            <Button
              onClick={loadFilteredStudents}
              variant="primary"
              size="small"
              icon="fas fa-filter"
              loading={loading}
              disabled={!localFilters.programId && !localFilters.batchId && !localFilters.courseId}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className={`rounded-lg border overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              onChange={handleSelectAll}
              disabled={filteredStudents.length === 0}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className={`ml-2 text-sm font-medium ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
                ? 'Deselect All'
                : 'Select All'} ({filteredStudents.length} students)
            </span>
          </div>
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {selectedStudents.length} selected
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <i className="fas fa-users text-3xl mb-4 opacity-30"></i>
              <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No students found
              </p>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {localFilters.programId || localFilters.batchId || localFilters.courseId 
                  ? 'Try adjusting your filters or click "Apply Filters"'
                  : 'Select filters to load students'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Select</th>
                  <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Student</th>
                  <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Program & Batch</th>
                  <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Courses</th>
                  <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {filteredStudents.map(student => {
                  const isSelected = selectedStudents.some(s => s._id === student._id);
                  return (
                    <tr 
                      key={student._id} 
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? isDarkMode ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100'
                          : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStudentSelect(student)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                          }`}>
                            <i className={`fas fa-user ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}></i>
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {student.name || 'No Name'}
                            </div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {student.email || 'No Email'}
                            </div>
                            {student.studentCode && (
                              <div className={`text-xs ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                ID: {student.studentCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {student.batchId?.batchName || 'No Batch'} • {student.batchId?.batchCode || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {student.enrolledCourseIds?.length > 0 
                            ? student.enrolledCourseIds.slice(0, 2).map(c => 
                                typeof c === 'object' ? c.courseName : 'Course'
                              ).join(', ')
                            : 'No courses'}
                        </div>
                        {student.enrolledCourseIds?.length > 2 && (
                          <div className={`text-xs ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-500'
                          }`}>
                            +{student.enrolledCourseIds.length - 2} more
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.isActive 
                            ? isDarkMode
                              ? 'bg-green-900/30 text-green-300 border border-green-800'
                              : 'bg-green-100 text-green-800'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 border border-gray-600'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSelector;