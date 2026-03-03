import axiosInstance from './axiosConfig';

export const studentAPI = {
  createStudent: (data) => axiosInstance.post('/student/create-student', data),
  getAllStudents: (params) => axiosInstance.get('/student/get-all-students', { params }),
  updateStudent: (id, data) => axiosInstance.put(`/student/update-student/${id}`, data),
  deleteStudent: (id) => axiosInstance.delete(`/student/delete-student/${id}`),
    deleteAllStudents: () => axiosInstance.delete('/student/delete-all-students'),

  
};