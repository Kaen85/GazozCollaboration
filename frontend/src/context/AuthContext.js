// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/auth';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// localStorage'dan 'user' verisini güvenli bir şekilde okuyan fonksiyon
const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse authUser from localStorage", error);
    localStorage.removeItem('authUser'); 
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(getInitialUser()); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // GİRİŞ FONKSİYONU (Değişiklik yok)
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      const { token, user } = response.data; 

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user)); 
      setToken(token);
      setUser(user); 

      navigate('/dashboard'); 

    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      console.error(err);
      throw new Error(message); 
    } finally {
      setLoading(false);
    }
  };

  // === KAYIT FONKSİYONU (GÜNCELLENDİ) ===
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Artık 'email' verisini de gönderiyoruz
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      console.error(err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

 



  // ÇIKIŞ FONKSİYONU (Değişiklik yok)
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  // Context'in tüm component'lere sağlayacağı değerler
  const value = {
    token,
    user,
    loading,
    error,
    login,
    register, // Güncellenmiş 'register' fonksiyonu
    logout,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};