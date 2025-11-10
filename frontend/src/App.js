// src/App.js

import React from 'react';
// BrowserRouter'ı index.js yerine buraya alıyoruz (bir önceki adıma göre)
import { Routes, Route, Navigate } from 'react-router-dom';
// ProjectProvider'ı import et (AuthContext'i değil)
import { ProjectProvider } from './context/ProjectContext'; 

// Sayfaları import et
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import MyProjectsPage from './pages/MyProjectsPage';
import SharedProjectsPage from './pages/SharedProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// === 1. YENİ SAYFAYI İMPORT ET ===
import RegisterPage from './pages/RegisterPage'; 

// Proje Detay Sekmelerini import et
import ProjectFiles from './components/projects/ProjectFiles';
import ProjectIssues from './components/projects/ProjectIssues';
import ProjectDiscussion from './components/projects/ProjectDiscussion';
import ProjectEditPage from './components/projects/ProjectEditPage';

function App() {
  return (
    // AuthProvider veya BrowserRouter BURADA DEĞİL
    // (index.js dosyanızda oldukları varsayılarak)
    <Routes>
      {/* === 2. YENİ ROTAYI EKLE === */}
      {/* Bu rotalar 'ProjectProvider'ın DIŞINDA olmalı */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> 
        
      {/* === KORUMALI ALAN (PRIVATE) === */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {/* ProjectProvider SADECE korumalı alanı sarmalar */}
            <ProjectProvider>
              <DashboardLayout />
            </ProjectProvider>
          </ProtectedRoute>
        }
      >
        {/* DashboardLayout içindeki <Outlet> bu alt rotaları gösterir */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverviewPage />} />
        <Route path="my-projects" element={<MyProjectsPage />} />
        <Route path="shared-projects" element={<SharedProjectsPage />} />
          
        {/* İç İçe Proje Rotaları (Sekmeler) */}
        <Route path="project/:id" element={<ProjectDetailPage />}>
          <Route index element={<ProjectFiles />} /> 
          <Route path="issues" element={<ProjectIssues />} />
          <Route path="discussions" element={<ProjectDiscussion />} />
          <Route path="edit" element={<ProjectEditPage />} />
        </Route>
      </Route>
        
      {/* Eşleşmeyen tüm rotaları girişe yönlendir */}
      <Route path="*" element={<Navigate to="/login" />} /> 
        
    </Routes>
  );
}

export default App;