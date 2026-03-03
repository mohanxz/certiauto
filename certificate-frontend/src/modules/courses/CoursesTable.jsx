import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

const CoursesTable = ({ courses, onToggleStatus, onEdit }) => {
  const navigate = useNavigate();

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
                  <i className="fas fa-book mr-2"></i>
                  Course Name
                </div>
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-align-left mr-2"></i>
                  Description
                </div>
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-toggle-on mr-2"></i>
                  Status
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-layer-group mr-2"></i>
                  Batches
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  Students
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
            {courses.map((course) => (
              <tr
                key={course._id}
                className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-150 ${
                  !course.isActive ? "opacity-70" : "cursor-pointer"
                }`}
                onClick={() => handleCourseClick(course)}
              >
                {/* Course Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        course.isActive 
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" 
                          : "bg-gray-100"
                      }`}
                    >
                      <i
                        className={`fas fa-graduation-cap ${
                          course.isActive ? "text-white" : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {course.courseName}
                        {course.isActive && (
                          <i className="fas fa-external-link-alt text-xs text-blue-500"></i>
                        )}
                      </div>
                      <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        <i className="fas fa-hashtag mr-1"></i>
                        {course.courseCode || "No code"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Description */}
                {/* <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                    {course.description || (
                      <span className="text-gray-400 italic">No description</span>
                    )}
                  </div>
                </td> */}

                {/* Status */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        course.isActive
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-green-200"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200"
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
                            ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                            : "bg-gradient-to-r from-gray-300 to-gray-400"
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
                            course.isActive ? "translate-x-5" : ""
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
                        ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 border border-gray-200"
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
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      course.isActive
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 hover:from-green-200 hover:to-emerald-200 hover:shadow-md border border-green-200 transform hover:scale-105"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed"
                    }`}
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
                      className="px-2.5 py-1.5  mx-5 text-gray-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-200 shadow-sm transform hover:scale-105 transition-all duration-200"
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