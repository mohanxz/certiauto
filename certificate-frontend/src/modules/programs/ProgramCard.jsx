import React from 'react';
import { Link } from 'react-router-dom';

const ProgramCard = ({ program, batchCount, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <i className="fas fa-project-diagram text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {program.programName}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {program._id.substring(0, 8)}...
              </p>
            </div>
          </div>
          
          {program.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {program.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(program)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Program"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => onDelete(program._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Program"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Batches:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {batchCount} {batchCount === 1 ? 'batch' : 'batches'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {program.createdAt ? `Created: ${formatDate(program.createdAt)}` : 'No date available'}
          </div>
        </div>
        
        <Link
          to={`/batches?programId=${program._id}`}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Batches
          <i className="fas fa-arrow-right ml-1 text-xs"></i>
        </Link>
      </div>
    </div>
  );
};

export default ProgramCard;