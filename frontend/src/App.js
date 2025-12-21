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

// Pages - Project Details & Tabs
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFiles from './components/projects/ProjectFiles';
import ProjectTasks from './components/projects/ProjectTasks';
import ProjectIssues from './components/projects/ProjectIssues';
import ProjectDiscussion from './components/projects/ProjectDiscussion';
import ProjectEditPage from './components/projects/ProjectEditPage';

function App() {
  return (
    // 1. Theme, Auth ve Project Context'leri ile uygulamayı sarmalıyoruz.
    // Sıralama önemlidir: Theme > Auth > Project
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          
          <Routes>
            {/* === PUBLIC ROUTES (Giriş yapmadan erişilenler) === */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* === PROTECTED ROUTES (Giriş yapılması zorunlu) === */}
            {/* DashboardLayout içinde Sidebar ve Header var */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* DashboardLayout'un içindeki 'Outlet' kısmına gelecek sayfalar: */}
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="my-projects" element={<MyProjectsPage />} />
              <Route path="shared-projects" element={<SharedProjectsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* === PROJECT DETAIL ROUTES (Nested Routes) === */}
              {/* ProjectDetailPage içinde de bir 'Outlet' var (Sekmeler için) */}
              <Route path="project/:id" element={<ProjectDetailPage />}>
                {/* /project/:id adresine gidince varsayılan olarak Files açılır */}
                <Route index element={<ProjectFiles />} /> 
                
                {/* Sekmeler */}
                <Route path="tasks" element={<ProjectTasks />} />
                <Route path="issues" element={<ProjectIssues />} />
                <Route path="discussions" element={<ProjectDiscussion />} />
                <Route path="edit" element={<ProjectEditPage />} />
              </Route>

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