import axiosInstance from './axiosConfig';

export const batchAPI = {
  createBatch: (data) =>
    axiosInstance.post('/batch/create-batch', data),

  getAllBatches: (params) =>
    axiosInstance.get('/batch/get-all-batches', { params }),

  getBatchById: (id) =>
    axiosInstance.get(`/batch/get-batch/${id}`),

  updateBatch: (id, data) =>
    axiosInstance.put(`/batch/update-batch/${id}`, data),

  deleteBatch: (id) =>
    axiosInstance.delete(`/batch/delete-batch/${id}`),

  getBatchesByProgram: (programId, params = {}) =>
    axiosInstance.get('/batch/get-all-batches', {
      params: { ...params, programId },
    }),
};
