import axios from 'axios';

// Sadece temel ayar, otomatik token ekleme YOK.
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;