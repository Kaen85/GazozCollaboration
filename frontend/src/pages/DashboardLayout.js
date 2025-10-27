// src/pages/DashboardLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import RightSidebar from '../components/layout/RightSidebar';
// --- 1. IMPORT THE PROJECTPROVIDER ---
import { ProjectProvider } from '../context/ProjectContext';

function DashboardLayout() {
  return (
    // --- 2. WRAP THE ENTIRE LAYOUT WITH THE PROVIDER ---
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto min-w-0">
            <Outlet />
          </main>
          <RightSidebar />
        </div>
      </div>
    </ProjectProvider>
  );
}
export default DashboardLayout;