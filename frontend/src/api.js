import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Assuming FastAPI will run on 8000
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
