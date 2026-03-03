import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const mailLogsAPI = {
  getMailLogs: async (page = 1, limit = 20) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/maillog/history?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMailLogByCampaign: async (campaignId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/maillog/campaign/${campaignId}`, {
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