import axiosInstance from './axiosConfig';

export const programAPI = {
  // GET /api/program
  getAllPrograms: () => axiosInstance.get('/program/get-all-programs'),

  // POST /api/program
  createProgram: (data) => axiosInstance.post('/program/create-program', data),

  // PUT /api/program/:id
  updateProgram: (id, data) =>
    axiosInstance.put(`/program/${id}`, data),

  // DELETE /api/program/:id
  deleteProgram: (id) =>
    axiosInstance.delete(`/program/${id}`),

  // GET /api/program/:id
  getProgramById: (id) =>
    axiosInstance.get(`/program/${id}`),
};
