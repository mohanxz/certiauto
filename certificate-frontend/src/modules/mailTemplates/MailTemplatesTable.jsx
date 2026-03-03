import Button from "../../components/ui/Button";

const MailTemplatesTable = ({ templates, onEdit, onDelete }) => {
  const getTemplateTypeColor = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("certificate")) return "bg-purple-100 text-purple-800";
    if (nameLower.includes("welcome")) return "bg-green-100 text-green-800";
    if (nameLower.includes("reminder")) return "bg-yellow-100 text-yellow-800";
    if (nameLower.includes("notification")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Template Details
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr
                key={template._id}
                className="hover:bg-blue-50/50 transition-colors duration-150"
              >
                {/* Template Details */}
                <td className="px-8 py-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                        <i className="fas fa-envelope text-blue-600 text-xl"></i>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-gray-900 text-base">
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
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-lg">
                        {template.previewBody}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Subject */}
                <td className="px-8 py-5">
                  <div className="font-medium text-gray-900">
                    {template.subject}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center mt-1">
                    <i className="fas fa-tag mr-1.5"></i>
                    {template.subject.length > 50
                      ? template.subject.substring(0, 50) + "..."
                      : template.subject}
                  </div>
                </td>

                {/* Last Updated */}
                <td className="px-8 py-5">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">
                      {template.formattedDate}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
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
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shadow-sm"
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => onDelete(template._id)}
                      variant="outline"
                      size="small"
                      icon="fas fa-trash"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm"
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
      <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm font-medium text-gray-700">
            Showing <span className="font-bold">{templates.length}</span> template
            {templates.length !== 1 ? "s" : ""}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
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
