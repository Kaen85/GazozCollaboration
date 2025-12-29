// src/pages/DashboardLayout.js

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RightSidebar from '../components/layout/RightSidebar';
import { FiInfo} from 'react-icons/fi';

function DashboardLayout() {
  const location = useLocation();
  
  // Sol Sidebar: Varsayılan açık
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  
  // Sağ Sidebar: Varsayılan kapalı
  const [isRightOpen, setIsRightOpen] = useState(false);

  // --- SAYFA KONTROLLERİ ---
  // Sağ sidebar açma butonu sadece proje sayfasında ve users sayfasında görünmeli
  const isProjectPage = location.pathname.startsWith('/project/');
  const isUsersPage = location.pathname === '/users';
  const shouldShowToggleButton = isProjectPage || isUsersPage;

  return (
    // 1. ANA KAPSAYICI
    <div className="flex h-screen flex-col bg-app text-text-main overflow-hidden font-sans">
      
      {/* 2. HEADER */}
      <div className="z-50 shadow-md">
        <Header />
      </div>

      {/* 3. GÖVDE KAPSAYICISI */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SOL SIDEBAR */}
        <Sidebar 
          isCollapsed={isLeftCollapsed} 
          toggleSidebar={() => setIsLeftCollapsed(!isLeftCollapsed)} 
        />

        {/* ORTA İÇERİK ALANI (MAIN) */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent relative">
          <Outlet />

          {/* SAĞ SIDEBAR KAPALIYSA VE DOĞRU SAYFADAYSAK GERİ AÇMA BUTONU */}
          {shouldShowToggleButton && !isRightOpen && (
            <button
              onClick={() => setIsRightOpen(true)}
              className="fixed bottom-5 right-5 z-40 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-all animate-bounce-slow"
              title="Open Right Panel"
            >
              <FiInfo size={20} />
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