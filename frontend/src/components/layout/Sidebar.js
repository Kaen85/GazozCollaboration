// src/components/layout/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 1. AuthContext eklendi
import { 
  FiHome, FiBox, FiUsers, 
  FiChevronsLeft, FiChevronsRight,
  FiUserCheck // 2. Yeni ikon eklendi (Admin Users için)
} from 'react-icons/fi';

function Sidebar({ isCollapsed, toggleSidebar }) {
  
  // 3. Kullanıcı rolünü kontrol etmek için user bilgisini çekiyoruz
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
    { name: 'My Projects', icon: <FiBox size={20} />, path: '/my-projects' },
    { name: 'Shared', icon: <FiUsers size={20} />, path: '/shared-projects' },
  ];

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-surface border-border flex flex-col transition-all duration-300 relative shadow-xl pt-4`}
    >
      
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
            <span className="flex-shrink-0">{item.icon}</span>

            {!isCollapsed && (
              <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>
            )}
            
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}

        {/* --- 4. ADMIN USERS BUTONU --- */}
        {/* Sadece user varsa ve rolü 'admin' ise bu bloğu göster */}
        {user && user.role === 'admin' && (
          <>
            {/* Ayırıcı Çizgi (İsteğe bağlı, görsel ayrım için) */}
            <div className="my-2 border-t border-gray-700 mx-4 opacity-50" />

            <NavLink
              to="/users" 
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-red-600/80 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              {/* İkon */}
              <span className="flex-shrink-0">
                <FiUserCheck size={20} />
              </span>

              {/* Metin */}
              {!isCollapsed && (
                <span className="ml-3 font-medium whitespace-nowrap">Users</span>
              )}

              {/* Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  Users Management
                </div>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* ALT KISIM */}
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