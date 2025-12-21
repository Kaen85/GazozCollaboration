import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiBox, FiUsers, 
  FiChevronsLeft, FiChevronsRight 
} from 'react-icons/fi';

function Sidebar({ isCollapsed, toggleSidebar }) {
  
  // Settings menüden tamamen çıkarıldı
  const navItems = [
    { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
    { name: 'My Projects', icon: <FiBox size={20} />, path: '/my-projects' },
    { name: 'Shared', icon: <FiUsers size={20} />, path: '/shared-projects' },
  ];

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 relative shadow-xl pt-4`}
    >
      {/* LOGO ve HUB YAZISI BURADAN SİLİNDİ */}

      {/* MENU LİSTESİ */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group relative ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            {/* İkon */}
            <span className="flex-shrink-0">{item.icon}</span>

            {/* Metin (Collapsed ise gizle) */}
            {!isCollapsed && (
              <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>
            )}
            
            {/* Menü kapalıyken üzerine gelince çıkan yazı (Tooltip) */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ALT KISIM: SADECE SAĞ/SOL OK İŞARETİ KALDI (Logout silindi) */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isCollapsed ? <FiChevronsRight size={24} /> : <FiChevronsLeft size={24} />}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;