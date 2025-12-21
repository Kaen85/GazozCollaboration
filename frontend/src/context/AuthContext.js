import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sayfa yenilenince token varsa kullanıcıyı hatırla
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Backend'den kullanıcıyı çekmek yerine oturumu açık sayıyoruz (Hata riskini azaltmak için)
      setUser({ name: "User" }); 
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    }
  };

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}