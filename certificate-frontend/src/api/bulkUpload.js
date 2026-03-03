// api/bulkUpload.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const bulkUploadAPI = {
  // Download Excel template
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

  // UPLOAD STUDENTS - FIXED VERSION
  uploadExcel: async (file, batchId, courseIds) => {
    try {
      const token = localStorage.getItem('token');
      
      // Log what we're sending
      console.log('📤 Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        batchId: batchId,
        courseIds: courseIds,
        courseCount: courseIds.length
      });

      // Create FormData
      const formData = new FormData();
      
      // 1. Add the file
      formData.append('file', file);
      
      // 2. Add batchId
      formData.append('batchId', batchId);
      
      // 3. Add courseIds - TRY DIFFERENT FORMATS
      // Option A: As individual fields with same name (Most common)
      courseIds.forEach(courseId => {
        formData.append('courseIds', courseId);
      });
      
      // Option B: As JSON string (if backend expects it)
      // formData.append('courseIds', JSON.stringify(courseIds));
      
      // Option C: As array format
      // formData.append('courseIds[]', courseIds);

      // Log FormData entries
      console.log('📋 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await axios.post(`${API_URL}/bulk-upload/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        
        },
      
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 Upload Progress: ${percentCompleted}%`);
        }
      });

      console.log(' Upload Response:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received from server');
      }
      
      if (!response.data.success && response.data.message) {
        throw new Error(response.data.message);
      }

      return response.data;

    } catch (error) {
      console.error('❌ Upload Error:', error);
      
      let errorMessage = 'Failed to upload file';
      
      if (error.response) {
        console.error('Server Error Response:', error.response.data);
        console.error('Status:', error.response.status);
        
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
                      
      } else if (error.request) {
        console.error('No Response:', error.request);
        errorMessage = 'No response from server. Check your connection.';
      } else {
        console.error('Request Error:', error.message);
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // ALTERNATIVE UPLOAD METHOD - Try this if above doesn't work
  uploadExcelAlternative: async (formDataObject) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create a proper FormData from the object
      const formData = new FormData();
      
      // Add all fields
      Object.keys(formDataObject).forEach(key => {
        if (key === 'courseIds' && Array.isArray(formDataObject[key])) {
          // Handle courseIds as array
          formDataObject[key].forEach(courseId => {
            formData.append('courseIds', courseId);
          });
        } else if (key === 'file') {
          formData.append('file', formDataObject[key]);
        } else {
          formData.append(key, formDataObject[key]);
        }
      });

      console.log('Alternative Upload - FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(`${API_URL}/bulk-upload/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 60000
      });

      console.log('Alternative Upload Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('Alternative Upload Error:', error);
      throw error;
    }
  },

  getUploadHistory: async (page = 1, limit = 10) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bulk-upload/history?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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
  },

  checkUploadEndpoint: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bulk-upload/health`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload endpoint check failed:', error);
      return { success: false, error: error.message };
    }
  }
};

export default bulkUploadAPI;