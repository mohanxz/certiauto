import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';

const BatchCard = ({ batch, onToggleStatus, onEdit }) => {
  const isInactive = !batch.isActive;

  const handleViewCourses = (e) => {
    if (!batch.isActive) {
      e.preventDefault();
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isInactive ? "opacity-60" : ""
      }`}
    >
      {/* Active status indicator */}
      <div
        className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${
          batch.isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      />

      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-layer-group text-blue-600 text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {batch.batchName}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {batch.batchCode || "No code"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {batch.description || "No description available"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Status toggle */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <span
                className={`text-xs font-medium ${
                  batch.isActive ? "text-green-700" : "text-gray-600"
                }`}
              >
                {batch.isActive ? "Active" : "Inactive"}
              </span>

              <button
                onClick={() => onToggleStatus(batch._id, !batch.isActive)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  batch.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    batch.isActive ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Edit button */}
            <button
              onClick={() => onEdit(batch)}
              disabled={!batch.isActive}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-40"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-graduation-cap text-gray-400"></i>
            <span className="font-medium">
              {batch.courseCount || 0} Courses
            </span>
          </div>

          <div className="w-px h-3 bg-gray-200"></div>

          <div className="flex items-center gap-1.5">
            <i className="fas fa-users text-gray-400"></i>
            <span className="font-medium">
              {batch.studentCount || 0} Students
            </span>
          </div>

          <div className="w-px h-3 bg-gray-200"></div>

          <div className="flex items-center gap-1.5">
            <i className="fas fa-calendar text-gray-400"></i>
            <span className="font-medium">
              {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            to={`/courses?batchId=${batch._id}&batchName=${encodeURIComponent(batch.batchName)}`}
            onClick={handleViewCourses}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium ${
              batch.isActive
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <i className="fas fa-graduation-cap mr-2"></i>
            View Courses
          </Link>

          <button
            onClick={() => onEdit(batch)}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium ${
              batch.isActive
                ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!batch.isActive}
          >
            <i className="fas fa-edit mr-2"></i>
            Edit
          </button>
        </div>
      </div>
    </Card>
  );
};

export default BatchCard;