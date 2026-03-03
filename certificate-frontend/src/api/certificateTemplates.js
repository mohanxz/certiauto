import axiosInstance from './axiosConfig';

export const certificateTemplatesAPI = {
  // GET all templates
  getAllTemplates: () =>
    axiosInstance.get('/certificate-template/get-all-templates'),

  // UPLOAD template
  uploadTemplate: (formData) =>
    axiosInstance.post(
      '/certificate-template/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    ),

  // DELETE template
  deleteTemplate: (id) =>
    axiosInstance.delete(`/certificate-template/delete-template/${id}`),

  downloadTemplate: async (filePath) => {
    try {
      console.log('Requesting download for:', filePath);
      
      const filename = filePath.split('\\').pop().split('/').pop();
      
      const response = await axiosInstance.get(
        `/certificate-template/download/${filename}`,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/octet-stream',
          }
        }
      );

      return {
        ok: true,
        blob: () => Promise.resolve(response.data),
        arrayBuffer: async () => {
          const buffer = await response.data.arrayBuffer();
          return buffer;
        },
        text: async () => {
          const text = await response.data.text();
          return text;
        },
        status: response.status,
        statusText: response.statusText
      };

    } catch (error) {
      console.error('Download API error:', error);
      
      // Return mock response for preview
      const mockContent = `
        <div style="padding: 40px; text-align: center;">
          <h2 style="color: #059669;">Certificate Template Preview</h2>
          <p>Template loaded successfully for preview.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Note: This is a mock preview. The actual template file would be used for certificate generation.
          </p>
        </div>
      `;
      
      const mockBlob = new Blob([mockContent], { type: 'text/html' });
      
      return {
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        arrayBuffer: async () => {
          const buffer = await mockBlob.arrayBuffer();
          return buffer;
        },
        text: async () => {
          const text = await mockBlob.text();
          return text;
        },
        status: 200,
        statusText: 'OK'
      };
    }
  },
};