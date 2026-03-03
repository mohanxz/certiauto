import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";

const CourseCard = ({ course, onToggleStatus, onEdit }) => {
  const navigate = useNavigate();
  const isInactive = !course.isActive;
  const studentCount = course.studentCount || 0;
  const batchCount = course.batchCount || 0;

  const handleCourseClick = (e) => {
    if (!e.target.closest('button') && !e.target.closest('a') && course.isActive) {
      navigate(`/students?courseId=${course._id}&courseName=${encodeURIComponent(course.courseName)}`);
    }
  };

  const handleViewStudentsClick = (e) => {
    e.stopPropagation();
    if (course.isActive) {
      navigate(`/students?courseId=${course._id}&courseName=${encodeURIComponent(course.courseName)}`);
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        isInactive ? "opacity-60 cursor-default" : "hover:border-blue-300"
      }`}
      onClick={course.isActive ? handleCourseClick : undefined}
    >
      {/* Active status indicator */}
      <div
        className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${
          course.isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      />

      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-blue-600 text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {course.courseName}
                  {course.isActive && (
                    <i className="fas fa-external-link-alt ml-2 text-xs text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                  )}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {course.courseCode || "No code"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-5">
              {course.description || "No description available"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Status toggle */}
            <div 
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className={`text-xs font-medium ${
                  course.isActive ? "text-green-700" : "text-gray-600"
                }`}
              >
                {course.isActive ? "Active" : "Inactive"}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(course._id, !course.isActive);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  course.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    course.isActive ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Edit button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}
              disabled={!course.isActive}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-40"
              title="Edit Course"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-layer-group text-gray-400"></i>
            <span className="font-medium">
              {batchCount} {batchCount === 1 ? 'Batch' : 'Batches'}
            </span>
          </div>

          <div className="w-px h-3 bg-gray-200"></div>

          <div className="flex items-center gap-1.5">
            <i className="fas fa-users text-gray-400"></i>
            <span className="font-medium">
              {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
            </span>
          </div>

          <div className="w-px h-3 bg-gray-200"></div>

          <div
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              course.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {course.isActive ? "Live" : "Paused"}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewStudentsClick}
            disabled={!course.isActive || studentCount === 0}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              course.isActive && studentCount > 0
                ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:shadow-sm border border-blue-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title={studentCount === 0 ? "No students enrolled" : "View enrolled students"}
          >
            <i className="fas fa-eye mr-2"></i>
            {studentCount > 0 ? `View Students (${studentCount})` : 'No Students'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            disabled={!course.isActive}
            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              course.isActive
                ? "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title="Edit Course"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>

        {/* Click hint for active courses */}
        {course.isActive && studentCount > 0 && (
          <div className="mt-3 text-xs text-gray-400 text-center">
            <i className="fas fa-hand-point-up mr-1"></i>
            Click anywhere to view {studentCount} enrolled student{studentCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;