// src/modules/templates/TemplateCard.jsx
import React from 'react';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

const TemplateCard = ({ template, onDelete }) => {
  const { isDarkMode } = useTheme();

  const getFileIcon = () => {
    const ext = template.fileExtension?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return {
          icon: 'fas fa-file-pdf',
          color: isDarkMode ? 'text-red-400' : 'text-red-600',
          bgColor: isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
        };
      case 'docx':
      case 'doc':
        return {
          icon: 'fas fa-file-word',
          color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
          bgColor: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
        };
      default:
        return {
          icon: 'fas fa-file',
          color: isDarkMode ? 'text-gray-400' : 'text-gray-600',
          bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        };
    }
  };

  const getTemplateBadgeColor = () => {
    switch (template.templateType) {
      case 'Completion':
        return isDarkMode
          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800'
          : 'bg-emerald-100 text-emerald-800';
      case 'Excellence':
        return isDarkMode
          ? 'bg-purple-900/30 text-purple-300 border border-purple-800'
          : 'bg-purple-100 text-purple-800';
      case 'Participation':
        return isDarkMode
          ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
          : 'bg-blue-100 text-blue-800';
      case 'Achievement':
        return isDarkMode
          ? 'bg-amber-900/30 text-amber-300 border border-amber-800'
          : 'bg-amber-100 text-amber-800';
      default:
        return isDarkMode
          ? 'bg-gray-700 text-gray-300 border border-gray-600'
          : 'bg-gray-100 text-gray-800';
    }
  };

  const fileIcon = getFileIcon();

  return (
    <div className={`rounded-xl border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Card Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${fileIcon.bgColor} flex items-center justify-center shadow-sm`}>
              <i className={`${fileIcon.icon} ${fileIcon.color} text-2xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {template.name}
              </h3>
              <p className={`text-sm truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{template.originalName}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getTemplateBadgeColor()}`}>
            {template.templateType}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="mb-6">
          <p className={`text-sm line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {template.description || 'No description provided'}
          </p>
        </div>

        {/* File Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <p className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>File Type</p>
            <p className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{template.fileExtension}</p>
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>File Size</p>
            <p className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{template.fileSize}</p>
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Uploaded</p>
            <p className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{template.formattedDate}</p>
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Upload Time</p>
            <p className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{template.formattedTime}</p>
          </div>
        </div>

        {/* Creator Info */}
        <div className={`flex items-center text-sm border-t pt-4 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <i className={`fas fa-user-circle mr-2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}></i>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Created by: </span>
          <span className={`font-medium ml-1 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>{template.creatorName}</span>
        </div>
      </div>

      {/* Card Footer - Actions */}
      <div className={`px-6 py-5 border-t ${
        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'
      }`}>
        <Button
          onClick={() => onDelete(template._id)}
          variant="outline"
          size="medium"
          icon="fas fa-trash"
          className={isDarkMode 
            ? 'w-full border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-700 shadow-sm' 
            : 'w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm'
          }
        >
          Delete Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;