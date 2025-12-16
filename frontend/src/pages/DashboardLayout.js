// src/pages/DashboardLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RightSidebar from '../components/layout/RightSidebar';

const DashboardLayout = () => {
  // 1. Sidebar'ın açık/kapalı durumunu tutan state
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // 2. Aç/Kapa fonksiyonu
  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sol Sidebar */}
      <Sidebar />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Header'a toggle fonksiyonunu gönderiyoruz */}
        <Header onToggleRightSidebar={toggleRightSidebar} />

        {/* Sayfa İçerikleri */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <Outlet /> 
        </main>

        {/* RightSidebar ARTIK BURADA
            (Normal akışın dışında, ekranın üzerine binecek şekilde tasarlandı)
        */}
        <RightSidebar 
          isOpen={isRightSidebarOpen} 
          onClose={() => setIsRightSidebarOpen(false)} 
        />
        
      </div>
    </div>
  );
};

export default DashboardLayout;