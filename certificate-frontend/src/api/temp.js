import axiosInstance from './axiosConfig';

export const mailTemplatesAPI = {
  getAllTemplates: async () => {
    return axiosInstance.get('/mailtemplate/get-all-templates');
  },

  getTemplate: async (id) => {
    return axiosInstance.get(`/mailtemplate/get-template/${id}`);
  },

  createTemplate: async (templateData) => {
    return axiosInstance.post('/mailtemplate/create-template', templateData);
  },

  updateTemplate: async (id, templateData) => {
    return axiosInstance.put(`/mailtemplate/update-template/${id}`, templateData);
  },

  deleteTemplate: async (id) => {
    return axiosInstance.delete(`/mailtemplate/delete-template/${id}`);
  }
};