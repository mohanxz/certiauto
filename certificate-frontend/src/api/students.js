import axiosInstance from "./axiosConfig";

export const studentAPI = {
  // Create a new student
  createStudent: (data) => axiosInstance.post("/student/create-student", data),

  // Get all students with optional filters (search, batchId, courseId)
  getAllStudents: (params) =>
    axiosInstance.get("/student/get-all-students", { params }),

  // Get a single student by ID
  getStudentById: (id) => axiosInstance.get(`/student/get-student/${id}`),

  // Update a student
  updateStudent: (id, data) =>
    axiosInstance.put(`/student/update-student/${id}`, data),

  // Delete a single student
  deleteStudent: (id) => axiosInstance.delete(`/student/delete-student/${id}`),

  // Delete filtered students (with batch/course filters)
  deleteFilteredStudents: (params) =>
    axiosInstance.delete("/student/delete-filtered-students", { params }),

  // Send certificate email to student
  sendCertificate: (id, data) =>
    axiosInstance.post(`/student/send-certificate/${id}`, data),

  // Send normal email to student
  sendEmail: (id, data) =>
    axiosInstance.post(`/student/send-email/${id}`, data),
};
