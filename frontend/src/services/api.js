// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Backend adresiniz
  headers: {
    'Content-Type': 'application/json'
  }
});

// HER İSTEKTE TOKEN'I OTOMATİK EKLE
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Login olurken kaydettiğimiz token
    if (token) {
      config.headers['x-auth-token'] = token; // Backend bu başlığı bekliyor
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;