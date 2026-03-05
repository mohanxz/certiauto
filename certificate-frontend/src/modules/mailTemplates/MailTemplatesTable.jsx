// src/modules/mailTemplates/MailTemplatesTable.jsx
import React from 'react';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

const MailTemplatesTable = ({ templates, onEdit, onDelete }) => {
  const { isDarkMode } = useTheme();

  const getTemplateTypeColor = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("certificate")) 
      return isDarkMode
        ? "bg-purple-900/30 text-purple-300 border border-purple-800"
        : "bg-purple-100 text-purple-800";
    if (nameLower.includes("welcome")) 
      return isDarkMode
        ? "bg-green-900/30 text-green-300 border border-green-800"
        : "bg-green-100 text-green-800";
    if (nameLower.includes("reminder")) 
      return isDarkMode
        ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
        : "bg-yellow-100 text-yellow-800";
    if (nameLower.includes("notification")) 
      return isDarkMode
        ? "bg-blue-900/30 text-blue-300 border border-blue-800"
        : "bg-blue-100 text-blue-800";
    return isDarkMode
      ? "bg-gray-700 text-gray-300 border border-gray-600"
      : "bg-gray-100 text-gray-800";
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
              <th className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Template Details
              </th>
              <th className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Subject
              </th>
              <th className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Last Updated
              </th>
              <th className={`px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {templates.map((template) => (
              <tr
                key={template._id}
                className={`transition-colors duration-150 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50/50'
                }`}
              >
                {/* Template Details */}
                <td className="px-8 py-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                      }`}>
                        <i className={`fas fa-envelope text-xl ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}></i>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`font-bold text-base ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {template.name}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getTemplateTypeColor(
                            template.name
                          )}`}
                        >
                          {template.name.toLowerCase().includes("certificate")
                            ? "Certificate"
                            : "Email"}
                        </span>
                      </div>
                      <div className={`text-sm line-clamp-2 max-w-lg ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {template.previewBody}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Subject */}
                <td className="px-8 py-5">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {template.subject}
                  </div>
                  <div className={`text-xs flex items-center mt-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <i className="fas fa-tag mr-1.5"></i>
                    {template.subject.length > 50
                      ? template.subject.substring(0, 50) + "..."
                      : template.subject}
                  </div>
                </td>

                {/* Last Updated */}
                <td className="px-8 py-5">
                  <div className="space-y-1">
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {template.formattedDate}
                    </div>
                    <div className={`text-sm flex items-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <i className="fas fa-clock mr-1.5"></i>
                      {template.formattedTime}
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => onEdit(template)}
                      variant="outline"
                      size="small"
                      icon="fas fa-edit"
                      className={isDarkMode 
                        ? 'border-blue-800 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 hover:border-blue-700 shadow-sm' 
                        : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shadow-sm'
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => onDelete(template._id)}
                      variant="outline"
                      size="small"
                      icon="fas fa-trash"
                      className={isDarkMode 
                        ? 'border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-700 shadow-sm' 
                        : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm'
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`px-8 py-4 border-t ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Showing <span className="font-bold">{templates.length}</span> template
            {templates.length !== 1 ? "s" : ""}
          </div>
          <div className={`text-sm flex items-center gap-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <i className="fas fa-info-circle text-blue-400"></i>
            <span>
              Use variables like {"{name}"}, {"{course}"} in your templates
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailTemplatesTable;