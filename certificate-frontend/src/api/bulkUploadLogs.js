import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const bulkUploadAPI = {
  downloadTemplate: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bulk-upload/download-template`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload Excel file
  uploadExcel: async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/bulk-upload/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upload history
  getUploadHistory: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bulk-upload/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upload job details
  getUploadJobDetails: async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bulk-upload/history/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default bulkUploadAPI;