// src/context/AuthContext.js

// 'useEffect' import'u kaldırıldı (terminaldeki uyarı için)
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Backend API adresi
const API_URL = 'http://localhost:5000/api/auth';

// 1. Context'i oluştur
export const AuthContext = createContext();

// 2. 'useAuth' kısayolunu (custom hook) oluştur ve export et
export const useAuth = () => {
  return useContext(AuthContext);
};

// === BEYAZ EKRAN ÇÖZÜMÜ BURADA ===
// localStorage'dan 'user' verisini güvenli bir şekilde okuyan fonksiyon
const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('authUser');
    // Sadece 'storedUser' bir metin ise (boş değilse) parse et
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    // Eğer parse ederken hata olursa (örn: bozuk veri)
    console.error("Failed to parse authUser from localStorage", error);
    localStorage.removeItem('authUser'); // Bozuk veriyi temizle
    return null;
  }
};
// === ÇÖZÜM SONU ===

// 3. Ana 'Provider' component'i
export const AuthProvider = ({ children }) => {
  // State'leri tanımla
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  // 'user' state'i artık çökmemesi için güvenli fonksiyonu kullanıyor
  const [user, setUser] = useState(getInitialUser()); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GİRİŞ FONKSİYONU
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      const { token } = response.data;
      const userPayload = { username: username }; 

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userPayload)); // Kullanıcıyı string olarak kaydet
      setToken(token);
      setUser(userPayload); // State'i güncelle

    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      console.error(err);
      throw new Error(message); 
    } finally {
      setLoading(false);
    }
  };

  // KAYIT FONKSİYONU
  const register = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
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

  // ÇIKIŞ FONKSİYONU
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // Context'in tüm component'lere sağlayacağı değerler
  const value = {
    token,
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};