import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

const DocxPreview = ({ template, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const loadPreview = () => {
      try {
        setLoading(true);
        
        const htmlContent = `
          <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 15px; border: 2px solid #bae6fd;">
              <h1 style="color: #0369a1; font-size: 42px; margin-bottom: 15px; font-weight: bold;">CERTIFICATE OF ACHIEVEMENT</h1>
              <div style="height: 3px; width: 300px; background: linear-gradient(90deg, #0ea5e9, #10b981); margin: 0 auto 20px;"></div>
              <p style="color: #475569; font-size: 20px; font-style: italic;">This certifies that</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <div style="border: 2px dashed #cbd5e1; padding: 30px; margin: 20px auto; max-width: 500px; border-radius: 10px;">
                <p style="font-size: 36px; color: #1e293b; font-weight: bold; margin: 0;">[RECIPIENT NAME]</p>
              </div>
              
              <p style="color: #64748b; font-size: 20px; margin: 25px 0;">has successfully completed</p>
              
              <div style="background: linear-gradient(135deg, #10b981, #0ea5e9); padding: 20px; border-radius: 10px; display: inline-block; margin: 20px 0;">
                <p style="font-size: 28px; color: white; font-weight: bold; margin: 0;">${template.name}</p>
              </div>
              
              <p style="color: #64748b; font-size: 18px; margin-top: 30px;">and is hereby awarded this certificate</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
              <div style="text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Date of Issue</p>
                <p style="font-weight: bold; color: #1e293b; font-size: 18px;">${template.formattedDate}</p>
              </div>
              <div style="text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Certificate ID</p>
                <p style="font-family: monospace; color: #1e293b; font-size: 16px;">${template._id.substring(0, 8)}</p>
              </div>
              <div style="text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Template Type</p>
                <p style="font-weight: bold; color: #1e293b; font-size: 18px;">${template.templateType}</p>
              </div>
            </div>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between; padding-top: 30px; border-top: 2px solid #e2e8f0;">
              <div style="text-align: center; flex: 1;">
                <div style="height: 1px; width: 200px; background: #374151; margin: 0 auto 15px;"></div>
                <p style="color: #64748b; font-size: 14px;">Authorized Signature</p>
                <p style="font-weight: bold; color: #1e293b;">Certificate Authority</p>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="height: 1px; width: 200px; background: #374151; margin: 0 auto 15px;"></div>
                <p style="color: #64748b; font-size: 14px;">Date</p>
                <p style="font-weight: bold; color: #1e293b;">${new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #10b981;">
              <p style="color: #475569; margin: 0;">
                <strong>Template Information:</strong> ${template.originalName} (${template.fileExtension}) • ${template.fileSize}
                ${template.description ? `<br/><strong>Description:</strong> ${template.description}` : ''}
              </p>
            </div>
          </div>
        `;
        
        setPreviewHtml(htmlContent);
        
      } catch (err) {
        console.error('Preview error:', err);
        setPreviewHtml(`
          <div style="text-align: center; padding: 40px;">
            <h3 style="color: #dc2626;">Preview Error</h3>
            <p style="color: #6b7280;">Failed to generate preview</p>
          </div>
        `);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    loadPreview();
  }, [template]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-eye mr-2"></i>
                  Template Preview: {template.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {template.fileExtension} • {template.fileSize} • Uploaded: {template.formattedDate}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close preview"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading preview...</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-auto max-h-[70vh] p-8 bg-white">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Make sure to export as default
export default DocxPreview;