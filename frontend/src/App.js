// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext'; 

// Sayfaları import et
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import MyProjectsPage from './pages/MyProjectsPage';
import SharedProjectsPage from './pages/SharedProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SettingsPage from './pages/SettingsPage';

// Proje Detay Sekmelerini import et
import ProjectFiles from './components/projects/ProjectFiles';
import ProjectIssues from './components/projects/ProjectIssues';
import ProjectDiscussion from './components/projects/ProjectDiscussion';
import ProjectEditPage from './components/projects/ProjectEditPage';
import ProjectTasks from './components/projects/ProjectTasks';

function App() {
  return (
    <Routes>
      {/* === 1. ANA SAYFA (LANDING PAGE) === */}
      <Route path="/" element={<LandingPage />} />

      {/* === 2. PUBLIC ROTALAR === */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> 
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
        
      {/* === 3. KORUMALI ALAN (PRIVATE) === */}
      {/* Bu bölüm, tüm 'Uygulama İçi' sayfaları kapsar */}
      <Route element={
        <ProtectedRoute>
          <ProjectProvider>
            <DashboardLayout />
          </ProjectProvider>
        </ProtectedRoute>
      }>
        {/* 'dashboard' veya 'my-projects' gibi yollar artık '/' altına değil,
            kendi başlarına (veya /app/... altına) yerleşir. 
            Burada düz yapı kullanıyoruz.
        */}
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/my-projects" element={<MyProjectsPage />} />
        <Route path="/shared-projects" element={<SharedProjectsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* İç İçe Proje Rotaları */}
        <Route path="/project/:id" element={<ProjectDetailPage />}>
          <Route index element={<ProjectFiles />} /> 
          <Route path="tasks" element={<ProjectTasks />} />
          <Route path="issues" element={<ProjectIssues />} />
          <Route path="discussions" element={<ProjectDiscussion />} />
          <Route path="edit" element={<ProjectEditPage />} />
        </Route>
      </Route>
        
      {/* Eşleşmeyen rotalar Ana Sayfaya döner */}
      <Route path="*" element={<Navigate to="/" />} /> 
        
    </Routes>
  );
}

export default App;