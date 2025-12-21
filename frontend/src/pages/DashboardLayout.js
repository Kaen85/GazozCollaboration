// src/pages/DashboardLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import RightSidebar from '../components/layout/RightSidebar';

// 1. Fotoğrafı import et
import BackgroundImage from '../assets/background.jpg';

function DashboardLayout() {
  return (
    // 2. Arka planı EN DIŞ katmana taşıdık
    <div 
      className="flex flex-col h-screen bg-cover bg-center relative"
      style={{ 
        backgroundImage: `url(${BackgroundImage})` 
      }}
    >
      {/* 3. Tüm ekran için Siyah Perde (Overlay) */}
      {/* bg-opacity-80: Resmin ne kadar koyu olacağını belirler. Yazıların okunması için koyu tuttum. */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-80 z-0"></div>

      {/* 4. İçerik Katmanı (z-10 ile perdenin üstünde) */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header (Şeffaflık kendi dosyasında ayarlanacak) */}
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sol Menü (Şeffaflık kendi dosyasında ayarlanacak) */}
          <Sidebar />
          
          {/* Orta Kısım */}
          <main className="flex-1 overflow-y-auto min-w-0 p-6">
            <Outlet />
          </main>
          
          {/* Sağ Menü (Şeffaflık kendi dosyasında ayarlanacak) */}
          <RightSidebar />
          
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;