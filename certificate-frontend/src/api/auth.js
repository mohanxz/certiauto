import axiosInstance from './axiosConfig';

export const login = (credentials) => 
  axiosInstance.post('/auth/login', credentials);

export const signup = (userData) => 
  axiosInstance.post('/auth/signup', userData);

export const logout = () => {
  return Promise.resolve();
};

export const getCurrentUser = () => 
  axiosInstance.get('/auth/me');