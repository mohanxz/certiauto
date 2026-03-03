import React from 'react';
import Button from '../../components/ui/Button';

const TemplateCard = ({ template, onDelete }) => {
  const getFileIcon = () => {
    const ext = template.fileExtension?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return {
          icon: 'fas fa-file-pdf',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'docx':
      case 'doc':
        return {
          icon: 'fas fa-file-word',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          icon: 'fas fa-file',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const getTemplateBadgeColor = () => {
    switch (template.templateType) {
      case 'Completion':
        return 'bg-emerald-100 text-emerald-800';
      case 'Excellence':
        return 'bg-purple-100 text-purple-800';
      case 'Participation':
        return 'bg-blue-100 text-blue-800';
      case 'Achievement':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fileIcon = getFileIcon();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${fileIcon.bgColor} flex items-center justify-center shadow-sm`}>
              <i className={`${fileIcon.icon} ${fileIcon.color} text-2xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">
                {template.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{template.originalName}</p>
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
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description || 'No description provided'}
          </p>
        </div>

        {/* File Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">File Type</p>
            <p className="text-sm font-semibold text-gray-800">{template.fileExtension}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">File Size</p>
            <p className="text-sm font-semibold text-gray-800">{template.fileSize}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Uploaded</p>
            <p className="text-sm font-semibold text-gray-800">{template.formattedDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Upload Time</p>
            <p className="text-sm font-semibold text-gray-800">{template.formattedTime}</p>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center text-sm border-t border-gray-100 pt-4">
          <i className="fas fa-user-circle mr-2 text-gray-400"></i>
          <span className="text-gray-500">Created by: </span>
          <span className="font-medium text-gray-800 ml-1">{template.creatorName}</span>
        </div>
      </div>

      {/* Card Footer - Actions */}
      <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={() => onDelete(template._id)}
          variant="outline"
          size="medium"
          icon="fas fa-trash"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm"
        >
          Delete Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;