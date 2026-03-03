import axiosInstance from './axiosConfig';

export const courseAPI = {
  getAllCourses: (params) => axiosInstance.get('/course/get-all-courses', { params }),
  createCourse: (data) => axiosInstance.post('/course/create-course', data),
  updateCourse: (id, data) => axiosInstance.put(`/course/update-course/${id}`, data),
  deleteCourse: (id) => axiosInstance.delete(`/course/delete-course/${id}`),
  
  getCoursesByBatch: (batchId) => 
    axiosInstance.get('/course/get-all-courses', { 
      params: { batchId } 
    }),
};