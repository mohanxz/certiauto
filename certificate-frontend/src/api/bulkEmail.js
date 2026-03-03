import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const normalizeCampaignPayload = (payload) => ({
  ...payload,
  type: payload.type, 
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error(
      " Bulk Email API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const bulkEmailAPI = {
  createCampaign: async (payload) => {
    const cleanPayload = normalizeCampaignPayload(payload);

    const response = await api.post(
      "/bulk-email/create",
      cleanPayload
    );
    return response.data;
  },

  getCampaignHistory: async (params = {}) => {
    const response = await api.get(
      "/bulk-email/history",
      { params }
    );
    return response.data;
  },

  getCampaignDetails: async (campaignId) => {
    const response = await api.get(
      `/bulk-email/${campaignId}`
    );
    return response.data;
  },

  retryCampaign: async (campaignId) => {
    const response = await api.post(
      `/bulk-email/${campaignId}/retry`
    );
    return response.data;
  },
};

export default bulkEmailAPI;