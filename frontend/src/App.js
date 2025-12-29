import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages - Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Pages - Dashboard & Layout
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import MyProjectsPage from './pages/MyProjectsPage';
import SharedProjectsPage from './pages/SharedProjectsPage';
import SettingsPage from './pages/SettingsPage';
import AdminUsers from './pages/AdminUsers';
import AdminProjects from './pages/AdminProjects';

// Pages - Project Details & Tabs
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFiles from './components/projects/ProjectFiles';
import ProjectTasks from './components/projects/ProjectTasks';
import ProjectIssues from './components/projects/ProjectIssues';
import ProjectDiscussion from './components/projects/ProjectDiscussion';
import ProjectEditPage from './components/projects/ProjectEditPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          
          <Routes>
            {/* === DEĞİŞİKLİK BURADA BAŞLIYOR === */}
            
            {/* 1. Eğer kullanıcı kök dizine (localhost:3000/) gelirse, /home'a yönlendir */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 2. LandingPage artık /home adresinde çalışıyor */}
            <Route path="/home" element={<LandingPage />} />

            {/* === DEĞİŞİKLİK BURADA BİTİYOR === */}

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* === PROTECTED ROUTES (Giriş yapılması zorunlu) === */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="my-projects" element={<MyProjectsPage />} />
              <Route path="shared-projects" element={<SharedProjectsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              

              {/* Project Detail Routes */}
              <Route path="project/:id" element={<ProjectDetailPage />}>
                <Route index element={<ProjectFiles />} /> 
                <Route path="tasks" element={<ProjectTasks />} />
                <Route path="issues" element={<ProjectIssues />} />
                <Route path="discussions" element={<ProjectDiscussion />} />
                <Route path="edit" element={<ProjectEditPage />} />
              </Route>
              <Route path="admin-users" element={<AdminUsers />} />
              <Route path="admin-projects" element={<AdminProjects />} />
              
              {/* Tanımsız bir rota girilirse dashboard'a yönlendir */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

          </Routes>

        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;