// src/modules/students/StudentCard.jsx
import React from 'react';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';

const StudentCard = ({ student, onEdit, onDelete, onContact }) => {
  const { isDarkMode } = useTheme();

  const getCourses = () => {
    if (!student.enrolledCourseIds || student.enrolledCourseIds.length === 0) {
      return 'No courses';
    }
    return student.enrolledCourseIds.map(course => course.courseName).join(', ');
  };

  const getBatch = () => {
    if (student.batchId && typeof student.batchId === 'object') {
      return student.batchId.batchName;
    }
    return 'Unknown Batch';
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (mark) => {
    if (!mark) return 'gray';
    if (mark >= 80) return 'green';
    if (mark >= 60) return 'yellow';
    return 'red';
  };

  const performanceColor = getPerformanceColor(student.finalMark);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-5">
        {/* Header with Avatar and Actions */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100'
              }`}>
                <i className={`fas fa-user text-lg ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}></i>
              </div>
              <div>
                <h3 className={`text-lg font-semibold leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {student.name}
                </h3>
                <p className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ID: {student.uniqueId || 'No ID'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onContact(student)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-green-400 hover:bg-green-900/20' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }
              `}
              title="Send Email"
            >
              <i className="fas fa-envelope text-sm"></i>
            </button>
            <button
              onClick={() => onEdit(student)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }
              `}
              title="Edit Student"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
            <button
              onClick={() => onDelete(student._id)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }
              `}
              title="Delete Student"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className={`flex items-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <i className={`fas fa-envelope w-5 mr-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}></i>
            <span className="truncate">{student.email || 'No email'}</span>
          </div>
          <div className={`flex items-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <i className={`fas fa-phone w-5 mr-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}></i>
            <span>{formatPhone(student.phoneNumber)}</span>
          </div>
          {student.address && (
            <div className={`flex items-center text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <i className={`fas fa-map-marker-alt w-5 mr-2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}></i>
              <span className="truncate">{student.address}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className={`flex items-center justify-between text-xs mb-4 pt-4 border-t ${
          isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-100'
        }`}>
          <div className="flex items-center gap-1.5">
            <i className={`fas fa-layer-group ${
              isDarkMode ? 'text-blue-400' : 'text-blue-400'
            }`}></i>
            <span className="font-medium">{getBatch()}</span>
          </div>

          <div className={`w-px h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

          <div className="flex items-center gap-1.5">
            <i className={`fas fa-graduation-cap ${
              isDarkMode ? 'text-green-400' : 'text-green-400'
            }`}></i>
            <span className="font-medium">
              {student.enrolledCourseIds?.length || 0} Courses
            </span>
          </div>
        </div>

        {/* Courses Badges */}
        {student.enrolledCourseIds && student.enrolledCourseIds.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {student.enrolledCourseIds.slice(0, 2).map((course, index) => (
                <span
                  key={course._id || index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? 'bg-green-900/30 text-green-300 border border-green-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {course.courseName}
                </span>
              ))}
              {student.enrolledCourseIds.length > 2 && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  +{student.enrolledCourseIds.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Final Marks */}
        {student.finalMark && (
          <div className={`
            mb-4 p-2 rounded-lg border
            ${performanceColor === 'green' 
              ? isDarkMode
                ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-800'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
              : performanceColor === 'yellow'
                ? isDarkMode
                  ? 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-800'
                  : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100'
                : isDarkMode
                  ? 'bg-gradient-to-r from-red-900/20 to-rose-900/20 border-red-800'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100'
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className={`fas fa-star mr-2 ${
                  performanceColor === 'green' 
                    ? isDarkMode ? 'text-green-400' : 'text-green-500'
                    : performanceColor === 'yellow'
                      ? isDarkMode ? 'text-yellow-400' : 'text-yellow-500'
                      : isDarkMode ? 'text-red-400' : 'text-red-500'
                }`}></i>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Final Mark</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-16 rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-2 rounded-full ${
                      performanceColor === 'green' 
                        ? isDarkMode ? 'bg-green-400' : 'bg-green-500'
                        : performanceColor === 'yellow'
                          ? isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500'
                          : isDarkMode ? 'bg-red-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(student.finalMark, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {student.finalMark}%
                </span>
              </div>
            </div>
            <div className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {performanceColor === 'green' ? 'Excellent' :
                performanceColor === 'yellow' ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        )}

        {/* Date Info */}
        <div className={`flex items-center justify-between text-xs pt-3 border-t ${
          isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-100'
        }`}>
          <div>
            <i className="fas fa-calendar-plus mr-1"></i>
            {student.createdAt ? formatDate(student.createdAt) : 'N/A'}
          </div>
          {student.completionDate && (
            <div>
              <i className="fas fa-graduation-cap mr-1"></i>
              {formatDate(student.completionDate)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;