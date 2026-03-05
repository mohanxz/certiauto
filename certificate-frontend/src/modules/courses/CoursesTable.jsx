// src/modules/courses/CoursesTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";

const CoursesTable = ({ courses, onToggleStatus, onEdit }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleCourseClick = (course) => {
    if (course.isActive) {
      navigate(`/students?courseId=${course._id}&courseName=${encodeURIComponent(course.courseName)}`);
    }
  };

  const handleViewStudentsClick = (e, course) => {
    e.stopPropagation();
    if (course.isActive) {
      navigate(`/students?courseId=${course._id}&courseName=${encodeURIComponent(course.courseName)}`);
    }
  };

  return (
    <div 
      className={`overflow-x-auto rounded-xl border shadow-sm relative custom-scrollbar ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}
      style={{ maxHeight: 'calc(100vh - 140px)' }}
    >
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#4B5563' : '#3b82f6'};
          border-radius: 10px;
          border: 2px solid ${isDarkMode ? '#1F2937' : '#f3f4f6'};
          transition: all 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#6B7280' : '#2563eb'};
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: ${isDarkMode ? '#1F2937' : '#f3f4f6'};
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${isDarkMode ? '#4B5563 #374151' : '#3b82f6 #f3f4f6'};
        }
        
        .scroll-container {
          scroll-behavior: smooth;
          scrollbar-gutter: stable;
        }
      `}</style>

      <div 
        className="scroll-container"
        style={{ 
          position: 'relative', 
          overflowY: 'auto', 
          maxHeight: 'inherit',
        }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          {/* Sticky header */}
          <thead className={`
            sticky -top-1 z-10 shadow-sm border-b
            ${isDarkMode 
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600' 
              : 'bg-gradient-to-r from-gray-50 to-blue-50 border-blue-100'
            }
          `}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-book mr-2"></i>
                  Course Name
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-toggle-on mr-2"></i>
                  Status
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-layer-group mr-2"></i>
                  Batches
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  Students
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-cog mr-2"></i>
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y ${
            isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-100'
          }`}>
            {courses.map((course) => (
              <tr
                key={course._id}
                className={`
                  transition-all duration-150
                  ${isDarkMode 
                    ? 'hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600' 
                    : 'hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30'
                  }
                  ${!course.isActive ? "opacity-70" : "cursor-pointer"}
                `}
                onClick={() => handleCourseClick(course)}
              >
                {/* Course Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        course.isActive 
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" 
                          : isDarkMode ? "bg-gray-600" : "bg-gray-100"
                      }`}
                    >
                      <i
                        className={`fas fa-graduation-cap ${
                          course.isActive ? "text-white" : isDarkMode ? "text-gray-300" : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {course.courseName}
                        {course.isActive && (
                          <i className={`fas fa-external-link-alt text-xs ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-500'
                          }`}></i>
                        )}
                      </div>
                      <div className={`
                        text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1
                        ${isDarkMode 
                          ? 'text-blue-300 bg-blue-900/20' 
                          : 'text-blue-600 bg-blue-50'
                        }
                      `}>
                        <i className="fas fa-hashtag mr-1"></i>
                        {course.courseCode || "No code"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        course.isActive
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-300 border border-green-800'
                            : 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-green-200'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 border border-gray-600'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <i className={`fas fa-circle mr-1.5 text-${course.isActive ? 'green' : 'gray'}-500 text-xs`}></i>
                      {course.isActive ? "Active" : "Inactive"}
                    </span>

                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={course.isActive}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleStatus(course._id, !course.isActive);
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors shadow-inner ${
                          course.isActive 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : isDarkMode
                              ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
                            course.isActive ? 'translate-x-5' : ''
                          }`}
                        />
                      </div>
                    </label>
                  </div>
                </td>

                {/* Batch Count */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      course.isActive
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-800 shadow-sm'
                          : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm'
                        : isDarkMode
                          ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 border border-gray-600'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 border border-gray-200'
                    }`}
                  >
                    <i className="fas fa-layer-group mr-1.5"></i>
                    {course.batchCount || 0} batch{course.batchCount !== 1 ? 'es' : ''}
                  </span>
                </td>

                {/* Student Count */}
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => handleViewStudentsClick(e, course)}
                    disabled={!course.isActive}
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
                      ${course.isActive
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-300 hover:from-green-900/50 hover:to-emerald-900/50 hover:shadow-md border border-green-800 transform hover:scale-105'
                          : 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 hover:from-green-200 hover:to-emerald-200 hover:shadow-md border border-green-200 transform hover:scale-105'
                        : isDarkMode
                          ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-500 border border-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                      }
                    `}
                  >
                    <i className="fas fa-users mr-1.5"></i>
                    {course.studentCount || 0} student{course.studentCount !== 1 ? 's' : ''}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => onEdit(course)}
                      size="sm"
                      disabled={!course.isActive}
                      className={`
                        px-2.5 py-1.5 mx-5 transform hover:scale-105 transition-all duration-200
                        ${isDarkMode 
                          ? 'text-gray-300 hover:text-blue-300 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-700' 
                          : 'text-gray-500 hover:text-blue-600 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-200 shadow-sm'
                        }
                      `}
                      title="Edit Course"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoursesTable;