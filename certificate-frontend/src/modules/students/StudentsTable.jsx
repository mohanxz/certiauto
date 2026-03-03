import React from 'react';
import Pagination from '../../components/common/Pagination';

const StudentsTable = ({
  students,
  onEdit,
  onDelete,
  onContact,
  // Pagination Props
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  onLimitChange
}) => {
  const getCourses = (student) => {
    if (!student.enrolledCourseIds || student.enrolledCourseIds.length === 0) {
      return 'No courses';
    }
    return student.enrolledCourseIds.map(course => course.courseName).join(', ');
  };

  const getBatch = (student) => {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPerformanceColor = (mark) => {
    if (!mark) return 'gray';
    if (mark >= 80) return 'green';
    if (mark >= 60) return 'yellow';
    return 'red';
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)' }}>
      {/* Scrollbar styles */}
      <style jsx>{`
        .scroll-container::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .scroll-container::-webkit-scrollbar-track {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 10px;
        }
        
        .scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }
        
        .scroll-container::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
        
        /* Firefox */
        .scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
        }
      `}</style>

      <div
        className="scroll-container flex-1"
        style={{
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          {/* Always sticky header */}
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch & Courses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => {
              const performanceColor = getPerformanceColor(student.finalMark);

              return (
                <tr key={student._id} className="hover:bg-gray-50">
                  {/* Student Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-user text-blue-600"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {student.uniqueId || 'No ID'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {student.email}
                      </div>
                      <div className="text-xs text-gray-500">{formatPhone(student.phoneNumber)}</div>
                      {student.address && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {student.address}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Batch & Courses */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <i className="fas fa-layer-group mr-1"></i>
                        {getBatch(student)}
                      </span>
                      <div className="text-xs text-gray-600">
                        {student.enrolledCourseIds?.length || 0} course(s)
                      </div>
                      {student.enrolledCourseIds && student.enrolledCourseIds.length > 0 && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {getCourses(student)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Performance */}
                  <td className="px-6 py-4">
                    {student.finalMark ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${performanceColor === 'green' ? 'bg-green-500' :
                                performanceColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${Math.min(student.finalMark, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {student.finalMark}%
                          </span>
                        </div>
                        <div className={`text-xs ${performanceColor === 'green' ? 'text-green-600' :
                          performanceColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {performanceColor === 'green' ? 'Excellent' :
                            performanceColor === 'yellow' ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No mark</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-gray-600">
                        <i className="fas fa-calendar-plus mr-1"></i>
                        Created: {formatDate(student.createdAt)}
                      </div>
                      {student.completionDate ? (
                        <div className="text-green-600">
                          <i className="fas fa-graduation-cap mr-1"></i>
                          Completed: {formatDate(student.completionDate)}
                        </div>
                      ) : (
                        <div className="text-yellow-600">
                          <i className="fas fa-clock mr-1"></i>
                          In Progress
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onContact(student)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <i className="fas fa-envelope"></i>
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Student"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => onDelete(student._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Student"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Integrated Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        className="rounded-b-none border-x-0 border-b-0"
      />
    </div >
  );
};

export default StudentsTable;