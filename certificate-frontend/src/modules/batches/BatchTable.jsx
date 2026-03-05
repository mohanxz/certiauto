// src/modules/batches/BatchTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../../components/ui/Button";
import { useTheme } from '../../context/ThemeContext';

const BatchTable = ({ batches, onToggleStatus, onEdit }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const getCourseInfo = (batch) => {
    if (batch.courseId && typeof batch.courseId === 'object') {
      return `${batch.courseId.courseName} (${batch.courseId.courseCode})`;
    }
    return 'Unknown Course';
  };

  const getProgramInfo = (batch) => {
    if (batch.programId && typeof batch.programId === 'object') {
      return batch.programId.programName;
    }
    return 'Unknown Program';
  };

  const handleViewCourses = (batchId, batchName) => {
    navigate(`/courses?batchId=${batchId}&batchName=${encodeURIComponent(batchName)}`);
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
                  <i className="fas fa-layer-group mr-2"></i>
                  Batch Name
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-hashtag mr-2"></i>
                  Code
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-project-diagram mr-2"></i>
                  Program
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
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Courses
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <div className="flex items-center">
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Created Date
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
            {batches.map((batch) => (
              <tr 
                key={batch._id} 
                className={`
                  transition-all duration-200
                  ${isDarkMode 
                    ? 'hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600' 
                    : 'hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30'
                  }
                  ${!batch.isActive ? 'opacity-70' : ''}
                `}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      batch.isActive 
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" 
                        : isDarkMode ? "bg-gray-600" : "bg-gray-100"
                    }`}>
                      <i className={`fas fa-layer-group ${
                        batch.isActive ? "text-white" : isDarkMode ? "text-gray-300" : "text-gray-400"
                      } text-sm`}></i>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {batch.batchName}
                      </div>
                      {batch.description && (
                        <div className={`text-xs truncate max-w-xs p-1.5 rounded border mt-1 ${
                          isDarkMode 
                            ? 'text-gray-400 bg-gray-700 border-gray-600' 
                            : 'text-gray-500 bg-gray-50 border-gray-100'
                        }`}>
                          {batch.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className={`
                    text-sm font-mono font-medium px-2.5 py-1 rounded border inline-block
                    ${isDarkMode 
                      ? 'text-blue-300 bg-blue-900/20 border-blue-800' 
                      : 'text-blue-700 bg-blue-50 border-blue-100'
                    }
                  `}>
                    {batch.batchCode || '-'}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {getProgramInfo(batch)}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      batch.isActive 
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-300 border border-green-800'
                          : 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-green-200'
                        : isDarkMode
                          ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 border border-gray-600'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                    }`}>
                      <i className={`fas fa-circle mr-1.5 text-${batch.isActive ? 'green' : 'gray'}-500 text-xs`}></i>
                      {batch.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={batch.isActive}
                        onChange={() => onToggleStatus(batch._id, !batch.isActive)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors shadow-inner ${
                          batch.isActive 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : isDarkMode
                              ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
                            batch.isActive ? 'translate-x-5' : ''
                          }`}
                        />
                      </div>
                    </label>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleViewCourses(batch._id, batch.batchName)}
                    className={`
                      text-sm font-medium flex items-center px-3 py-1.5 rounded-lg transition-all duration-200
                      ${batch.isActive
                        ? isDarkMode
                          ? 'text-blue-300 bg-gradient-to-r from-blue-900/30 to-blue-800/30 hover:from-blue-900/50 hover:to-blue-800/50 border border-blue-800 hover:shadow-md transform hover:scale-105'
                          : 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 hover:shadow-md transform hover:scale-105'
                        : isDarkMode
                          ? 'text-gray-500 bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600'
                          : 'text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
                      }
                    `}
                  >
                    <i className="fas fa-graduation-cap mr-2"></i>
                    View Courses ({batch.courseCount || 0})
                  </button>
                </td>
                
                <td className="px-6 py-4">
                  <div className={`text-sm flex items-center ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <i className={`fas fa-calendar-alt mr-2 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}></i>
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1.5">
                    <Button
                      onClick={() => onEdit(batch)}
                      className={`
                        p-2 rounded-lg transition-all duration-200 transform hover:scale-105 border shadow-sm
                        ${isDarkMode 
                          ? 'text-gray-300 hover:text-blue-300 bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-blue-700' 
                          : 'text-gray-500 hover:text-blue-600 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-gray-200 hover:border-blue-200'
                        }
                      `}
                      title="Edit Batch"
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

export default BatchTable;