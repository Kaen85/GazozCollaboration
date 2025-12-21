// src/pages/DashboardLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RightSidebar from '../components/layout/RightSidebar';
import { FiChevronsLeft } from 'react-icons/fi';

function DashboardLayout() {
  // Sol Sidebar: Varsayılan açık
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  
  // Sağ Sidebar: Varsayılan açık
  const [isRightOpen, setIsRightOpen] = useState(true);

  return (
    // 1. ANA KAPSAYICI: flex-col yaparak alt alta dizilim sağladık (Header üstte, gövde altta)
    <div className="flex h-screen flex-col bg-gray-900 text-gray-100 overflow-hidden font-sans">
      
      {/* 2. HEADER: En tepede, tam genişlikte */}
      <div className="z-50 shadow-md">
        <Header />
      </div>

      {/* 3. GÖVDE KAPSAYICISI: flex-row yaparak Sidebar, İçerik ve Sağ Sidebar'ı yan yana dizdik */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SOL SIDEBAR */}
        <Sidebar 
          isCollapsed={isLeftCollapsed} 
          toggleSidebar={() => setIsLeftCollapsed(!isLeftCollapsed)} 
        />

        {/* ORTA İÇERİK ALANI (MAIN) */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent relative">
          <Outlet />

          {/* SAĞ SIDEBAR KAPALIYSA GERİ AÇMA BUTONU */}
          {!isRightOpen && (
            <button
              onClick={() => setIsRightOpen(true)}
              className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-all animate-bounce-slow"
              title="Open Right Panel"
            >
              <FiChevronsLeft size={24} />
            </button>
          )}
        </main>

        {/* SAĞ SIDEBAR */}
        <RightSidebar 
          isOpen={isRightOpen} 
          toggleSidebar={() => setIsRightOpen(!isRightOpen)} 
        />
        
      </div>

    </div>
  );
}

export default DashboardLayout;