// src/components/auth/ProtectedRoute.js

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Bu component, App.js'te içine sardığımız
// <ProjectProvider> ve <DashboardLayout> elementlerini 'children' prop'u olarak alır.
const ProtectedRoute = ({ children }) => {
  
  // AuthContext'ten token'ı (giriş durumunu) al
  const { token } = useAuth(); 

  // 1. EĞER TOKEN YOKSA (Kullanıcı giriş yapmamışsa):
  if (!token) {
    // Kullanıcıyı '/login' sayfasına yönlendir.
    // 'replace', tarayıcı geçmişinde 'geri' tuşunun çalışmamasını sağlar.
    // "Beyaz ekran" sorununuzun çözümü bu satırdır.
    return <Navigate to="/login" replace />;
  }

  // 2. EĞER TOKEN VARSA (Kullanıcı giriş yapmışsa):
  // Gitmek istediği sayfayı (children) göster.
  // (Bu, <ProjectProvider><DashboardLayout /></ProjectProvider> olur)
  return children;
};

export default ProtectedRoute;