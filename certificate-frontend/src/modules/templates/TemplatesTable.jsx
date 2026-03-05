// src/modules/templates/TemplatesTable.jsx
import React from 'react';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

const TemplatesTable = ({ templates, onDelete }) => {
  const { isDarkMode } = useTheme();

  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return { 
          icon: `fas fa-file-pdf ${isDarkMode ? 'text-red-400' : 'text-red-500'}`, 
          color: isDarkMode ? 'text-red-400' : 'text-red-600' 
        };
      case 'docx':
      case 'doc':
        return { 
          icon: `fas fa-file-word ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`, 
          color: isDarkMode ? 'text-blue-400' : 'text-blue-600' 
        };
      default:
        return { 
          icon: `fas fa-file ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`, 
          color: isDarkMode ? 'text-gray-400' : 'text-gray-600' 
        };
    }
  };

  const getTemplateBadgeColor = (type) => {
    switch (type) {
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

  return (
    <div className={`rounded-xl border shadow-lg overflow-hidden ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-gray-50 to-blue-50'}>
            <tr>
              <th scope="col" className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Template Details
              </th>
              <th scope="col" className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Type
              </th>
              <th scope="col" className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                File Info
              </th>
              <th scope="col" className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Upload Details
              </th>
              <th scope="col" className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {templates.map((template) => {
              const fileIcon = getFileIcon(template.fileExtension);
              const badgeColor = getTemplateBadgeColor(template.templateType);
              
              return (
                <tr key={template._id} className={`transition-colors duration-150 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50/50'
                }`}>
                  {/* Template Details Column */}
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                        }`}>
                          <i className={`${fileIcon.icon} text-xl`}></i>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-base mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{template.name}</div>
                        <div className={`text-sm truncate max-w-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {template.originalName}
                        </div>
                        {template.description && (
                          <div className={`text-xs mt-2 line-clamp-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Template Type Column */}
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                      <i className="fas fa-tag mr-1.5"></i>
                      {template.templateType}
                    </span>
                  </td>

                  {/* File Info Column */}
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {template.fileExtension}
                        </span>
                        <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {template.fileSize}
                        </span>
                      </div>
                      <div className={`text-xs flex items-center ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <i className="fas fa-fingerprint mr-1.5"></i>
                        ID: {template._id.substring(0, 10)}...
                      </div>
                    </div>
                  </td>

                  {/* Upload Details Column */}
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template.formattedDate}
                      </div>
                      <div className={`text-sm flex items-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <i className="fas fa-clock mr-1.5"></i>
                        {template.formattedTime}
                      </div>
                      <div className={`text-xs flex items-center ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <i className="fas fa-user mr-1.5"></i>
                        {template.creatorName}
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-8 py-5">
                    <Button
                      onClick={() => onDelete(template._id)}
                      variant="outline"
                      size="small"
                      icon="fas fa-trash"
                      className={isDarkMode 
                        ? 'border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-700 shadow-sm' 
                        : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm'
                      }
                      title="Delete Template"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className={`px-8 py-4 border-t ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Showing <span className="font-bold">{templates.length}</span> template{templates.length !== 1 ? 's' : ''}
          </div>
          <div className={`text-sm flex items-center gap-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <i className="fas fa-info-circle text-blue-400"></i>
            <span>Click Delete to remove templates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesTable;