// src/modules/programs/ProgramCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const ProgramCard = ({ program, batchCount, onEdit, onDelete }) => {
  const { isDarkMode } = useTheme();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`
      p-6 rounded-xl border transition-all duration-300 group
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700 hover:shadow-gray-900/50' 
        : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:shadow-md'
      } shadow-sm hover:shadow-lg
    `}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <i className="fas fa-project-diagram text-white"></i>
            </div>
            <div>
              <h3 className={`text-lg font-semibold transition-colors ${
                isDarkMode 
                  ? 'text-gray-100 group-hover:text-blue-400' 
                  : 'text-gray-800 group-hover:text-blue-600'
              }`}>
                {program.programName}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ID: {program._id.substring(0, 8)}...
              </p>
            </div>
          </div>
          
          {program.description && (
            <p className={`text-sm mb-4 line-clamp-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {program.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(program)}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }
            `}
            title="Edit Program"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => onDelete(program._id)}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }
            `}
            title="Delete Program"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className={`flex items-center justify-between pt-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Batches:
            </span>
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${isDarkMode 
                ? 'bg-blue-900/30 text-blue-300' 
                : 'bg-blue-100 text-blue-800'
              }
            `}>
              {batchCount} {batchCount === 1 ? 'batch' : 'batches'}
            </span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {program.createdAt ? `Created: ${formatDate(program.createdAt)}` : 'No date available'}
          </div>
        </div>
        
        <Link
          to={`/batches?programId=${program._id}`}
          className={`
            inline-flex items-center text-sm font-medium transition-colors
            ${isDarkMode 
              ? 'text-blue-400 hover:text-blue-300' 
              : 'text-blue-600 hover:text-blue-800'
            }
          `}
        >
          View Batches
          <i className="fas fa-arrow-right ml-1 text-xs"></i>
        </Link>
      </div>
    </div>
  );
};

export default ProgramCard;