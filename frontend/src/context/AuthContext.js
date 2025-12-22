// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Başlangıçta depodan oku
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa ilk açıldığında veya yenilendiğinde kullanıcıyı doğrula
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Token'ı header'a ekle (api.js interceptor yapıyor ama burası garanti olsun)
        api.defaults.headers.common['x-auth-token'] = storedToken;
        
        // Backend'den "Ben kimim?" sorusunu sor
        const res = await api.get('/api/auth/user');
        
        setUser(res.data);
        setToken(storedToken);
      } catch (err) {
        console.error("Token geçersiz, çıkış yapılıyor...");
        logout(); // Token bozuksa temizle
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // --- LOGIN ---
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { username, password });
      
      // Token ve User verisini al
      const { token, user } = res.data;

      // Depoya kaydet
      localStorage.setItem('token', token);
      
      // State'i güncelle
      setToken(token);
      setUser(user);
      
      return true; // Başarılı
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTER ---
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/register', { username, email, password });
      // Register sonrası otomatik login yapmıyoruz, kullanıcı login sayfasına gitsin
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- RESET PASSWORD ---
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/reset-password', { token, newPassword });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['x-auth-token'];
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};