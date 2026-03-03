import React from 'react';
import Button from '../../components/ui/Button';

const TemplatesTable = ({ templates, onDelete }) => {
  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return { icon: 'fas fa-file-pdf text-red-500', color: 'text-red-600' };
      case 'docx':
      case 'doc':
        return { icon: 'fas fa-file-word text-blue-500', color: 'text-blue-600' };
      default:
        return { icon: 'fas fa-file text-gray-500', color: 'text-gray-600' };
    }
  };

  const getTemplateBadgeColor = (type) => {
    switch (type) {
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Template Details
              </th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                File Info
              </th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Upload Details
              </th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => {
              const fileIcon = getFileIcon(template.fileExtension);
              const badgeColor = getTemplateBadgeColor(template.templateType);
              
              return (
                <tr key={template._id} className="hover:bg-blue-50/50 transition-colors duration-150">
                  {/* Template Details Column */}
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                          <i className={`${fileIcon.icon} text-xl`}></i>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-base mb-1">{template.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {template.originalName}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-400 mt-2 line-clamp-1">
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
                        <span className="font-semibold text-gray-900">{template.fileExtension}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">{template.fileSize}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <i className="fas fa-fingerprint mr-1.5"></i>
                        ID: {template._id.substring(0, 10)}...
                      </div>
                    </div>
                  </td>

                  {/* Upload Details Column */}
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900">{template.formattedDate}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <i className="fas fa-clock mr-1.5"></i>
                        {template.formattedTime}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
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
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm"
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
      <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm font-medium text-gray-700">
            Showing <span className="font-bold">{templates.length}</span> template{templates.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-400"></i>
            <span>Click Delete to remove templates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesTable;