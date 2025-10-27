// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all pages and the main layout component
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import SharedProjectsPage from './pages/SharedProjectsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* --- 2. WRAP THE LAYOUT ROUTE WITH THE PROTECTEDROUTE COMPONENT --- */}
        <Route 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardOverviewPage />} />
          <Route path="/shared-projects" element={<SharedProjectsPage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;