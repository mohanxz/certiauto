import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../../components/ui/Button";

const BatchTable = ({ batches, onToggleStatus, onEdit }) => {
  const navigate = useNavigate();

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
      className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm relative custom-scrollbar"
      style={{ maxHeight: 'calc(100vh - 140px)' }}
    >
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          border: 2px solid #f3f4f6;
          transition: all 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: scale(1.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #f3f4f6;
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f3f4f6;
        }
        
        /* Smooth scrolling */
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
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky -top-1 z-10 shadow-sm border-b border-blue-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-layer-group mr-2"></i>
                  Batch Name
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-hashtag mr-2"></i>
                  Code
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-project-diagram mr-2"></i>
                  Program
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-toggle-on mr-2"></i>
                  Status
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Courses
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Created Date
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-cog mr-2"></i>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {batches.map((batch) => (
              <tr 
                key={batch._id} 
                className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 ${
                  !batch.isActive ? 'opacity-70' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      batch.isActive 
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" 
                        : "bg-gray-100"
                    }`}>
                      <i className={`fas fa-layer-group ${
                        batch.isActive ? "text-white" : "text-gray-400"
                      } text-sm`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {batch.batchName}
                      </div>
                      {batch.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs bg-gray-50 p-1.5 rounded border border-gray-100 mt-1">
                          {batch.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm font-mono font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 inline-block">
                    {batch.batchCode || '-'}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">
                    {getProgramInfo(batch)}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      batch.isActive 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-green-200' 
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
                    className={`text-sm font-medium flex items-center px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      batch.isActive
                        ? "text-blue-700 hover:text-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 hover:shadow-md transform hover:scale-105"
                        : "text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                    }`}
                  >
                    <i className="fas fa-graduation-cap mr-2"></i>
                    View Courses ({batch.courseCount || 0})
                  </button>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 flex items-center">
                    <i className="fas fa-calendar-alt text-gray-400 mr-2"></i>
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1.5">
                    <Button
                      onClick={() => onEdit(batch)}
                      className="p-2 text-gray-500  mx-4 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 transform hover:scale-105 border border-gray-200 hover:border-blue-200 shadow-sm"
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