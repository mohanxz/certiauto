// src/modules/students/StudentsTable.jsx
import React, { useState } from "react";
import { useStudentsWithEmailLogs } from "../../hooks/useStudentsWithEmailLogs";
import { getStudentFailureReason } from "../../utils/emailStatusUtils";
import EmailDetailsModal from "./EmailDetailsModal";
import { useTheme } from "../../context/ThemeContext";

const StudentsTable = ({ filters, onEdit, onDelete, onContact }) => {
  const { students, loading, refresh } = useStudentsWithEmailLogs(filters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { isDarkMode } = useTheme();

  const handleViewEmailDetails = (student) => {
    setSelectedStudent(student);
    setShowEmailModal(true);
  };

  const getEmailStatusBadge = (student) => {
    const status = student.emailStatus;

    if (!status || status.totalEmails === 0) {
      return (
        <button
          onClick={() => handleViewEmailDetails(student)}
          className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
          }`}
        >
          <div className="relative">
            <i className={`fas fa-envelope ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`}></i>
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
            }`}></span>
          </div>
          <span className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Not Sent</span>
          <i className={`fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`}></i>
        </button>
      );
    }

    let statusConfig = {
      bg: isDarkMode ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20' : 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: isDarkMode ? 'border-green-800' : 'border-green-200',
      icon: 'fas fa-check-circle text-green-500',
      text: isDarkMode ? 'text-green-300' : 'text-green-700',
      label: "Sent",
      hover: isDarkMode ? 'hover:from-green-900/30 hover:to-emerald-900/30' : 'hover:from-green-100 hover:to-emerald-100',
    };

    if (status.failed > 0 && status.successful === 0) {
      statusConfig = {
        bg: isDarkMode ? 'bg-gradient-to-r from-red-900/20 to-rose-900/20' : 'bg-gradient-to-r from-red-50 to-rose-50',
        border: isDarkMode ? 'border-red-800' : 'border-red-200',
        icon: 'fas fa-times-circle text-red-500',
        text: isDarkMode ? 'text-red-300' : 'text-red-700',
        label: "Failed",
        hover: isDarkMode ? 'hover:from-red-900/30 hover:to-rose-900/30' : 'hover:from-red-100 hover:to-rose-100',
      };
    } else if (status.failed > 0) {
      statusConfig = {
        bg: isDarkMode ? 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20' : 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: isDarkMode ? 'border-yellow-800' : 'border-yellow-200',
        icon: 'fas fa-exclamation-triangle text-yellow-500',
        text: isDarkMode ? 'text-yellow-300' : 'text-yellow-700',
        label: "Partial",
        hover: isDarkMode ? 'hover:from-yellow-900/30 hover:to-amber-900/30' : 'hover:from-yellow-100 hover:to-amber-100',
      };
    }

    return (
      <button
        onClick={() => handleViewEmailDetails(student)}
        className={`group relative inline-flex items-center gap-3 px-3 py-1.5 ${statusConfig.bg} ${statusConfig.hover} rounded-lg border ${statusConfig.border} transition-all duration-200 shadow-sm hover:shadow`}
      >
        <div className="relative">
          <i className={`${statusConfig.icon} text-base`}></i>
          {status.pending > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
          )}
        </div>

        <div className="flex flex-col items-start">
          <span className={`text-xs font-semibold ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
          <div className={`flex items-center gap-1 text-[10px] ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <i className="fas fa-check-circle text-green-400"></i>
            <span>{status.successful}</span>
            {status.failed > 0 && (
              <>
                <i className="fas fa-times-circle text-red-400 ml-1"></i>
                <span>{status.failed}</span>
              </>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white/60 text-gray-600'
        }`}>
          <i className="fas fa-envelope"></i>
          <span>{status.totalEmails}</span>
        </div>

        <i className={`fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-400'
        }`}></i>
      </button>
    );
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 rounded-xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          <div className={`w-16 h-16 border-4 rounded-full ${
            isDarkMode 
              ? 'border-gray-700 border-t-blue-400' 
              : 'border-gray-200 border-t-blue-500'
          } animate-spin`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className={`fas fa-users text-lg ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}></i>
          </div>
        </div>
        <p className={`mt-4 font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>Loading students...</p>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-xl border shadow-sm overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className={`${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100/50'
              }`}>
                <th className="px-6 py-4 text-left">
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-user-circle ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}></i>
                    Student
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-phone-alt ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}></i>
                    Contact
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-layer-group ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}></i>
                    Batch
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-envelope-open-text ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}></i>
                    Email Status
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-chart-line ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}></i>
                    Performance
                  </div>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className={`flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-cog ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}></i>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
            }`}>
              {students.map((student, index) => (
                <tr
                  key={student._id}
                  className={`group transition-all duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600' 
                      : 'hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Student Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                            isDarkMode ? 'border-gray-800' : 'border-white'
                          } ${
                            student.isActive 
                              ? isDarkMode ? 'bg-green-400' : 'bg-green-500'
                              : isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                          }`}
                        ></div>
                      </div>
                      <div>
                        <div className={`font-semibold flex items-center gap-2 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {student.name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {student.uniqueId}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs flex items-center gap-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <i className={`fas fa-calendar-alt text-[10px] ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}></i>
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                          {student.enrolledCourseIds?.length > 0 && (
                            <span className={`text-xs flex items-center gap-1 ${
                              isDarkMode ? 'text-blue-300' : 'text-blue-600'
                            }`}>
                              <i className="fas fa-book-open text-[10px]"></i>
                              {student.enrolledCourseIds.length} courses
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <i className={`fas fa-envelope w-4 text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}></i>
                        <span
                          className="truncate max-w-[150px]"
                          title={student.email}
                        >
                          {student.email}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <i className={`fas fa-phone-alt w-4 text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}></i>
                        <span>{student.phoneNumber || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Batch */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium w-fit ${
                        isDarkMode
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        <i className={`fas fa-users text-[10px] ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-500'
                        }`}></i>
                        {student.batchId?.batchName || "No Batch"}
                      </span>
                      {student.completionDate && (
                        <span className={`text-xs flex items-center gap-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <i className="fas fa-check-circle text-green-500"></i>
                          Completed:{" "}
                          {new Date(
                            student.completionDate,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email Status */}
                  <td className="px-6 py-4">{getEmailStatusBadge(student)}</td>

                  {/* Performance */}
                  <td className="px-6 py-4">
                    {student.finalMark ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className={isDarkMode ? 'text-gray-700' : 'text-gray-200'}
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - Number(student.finalMark) / 100)}`}
                              className={
                                Number(student.finalMark) >= 75
                                  ? isDarkMode ? "text-green-400" : "text-green-500"
                                  : Number(student.finalMark) >= 45
                                    ? isDarkMode ? "text-yellow-400" : "text-yellow-500"
                                    : isDarkMode ? "text-red-400" : "text-red-500"
                              }
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-sm font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-700'
                            }`}>
                              {student.finalMark}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Final Mark
                          </span>
                          <span
                            className={`text-xs ${
                              Number(student.finalMark) >= 75
                                ? isDarkMode ? "text-green-400" : "text-green-600"
                                : Number(student.finalMark) >= 45
                                  ? isDarkMode ? "text-yellow-400" : "text-yellow-600"
                                  : isDarkMode ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {Number(student.finalMark) >= 75
                              ? "Excellent"
                              : Number(student.finalMark) >= 45
                                ? "Good"
                                : "Needs Improvement"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <i className={`fas fa-minus ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}></i>
                        </div>
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>No marks</span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onContact(student)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title="Send Email"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode 
                            ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20' 
                            : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                        }`}
                        title="Edit Student"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => onDelete(student._id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title="Delete Student"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {students.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-20 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-700 to-gray-600' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <i className={`fas fa-users text-3xl ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}></i>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              No students found
            </h3>
            <p className={`text-sm mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Try adjusting your filters or add a new student
            </p>
          </div>
        )}
      </div>

      {/* Email Details Modal */}
      {showEmailModal && selectedStudent && (
        <EmailDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default StudentsTable;