import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// TOKEN EKLEME INTERCEPTOR'I
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Backend'in beklediği header anahtarı: 'x-auth-token'
      // Eğer backend middleware'inde 'Authorization' bekliyorsan burayı değiştirmen gerekir.
      // Senin backend/middleware/auth.js dosyan 'x-auth-token' bekliyor.
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;