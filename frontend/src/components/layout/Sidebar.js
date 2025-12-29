// src/components/layout/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiBox, FiUsers, 
  FiChevronsLeft, FiChevronsRight,
  FiUserCheck,
  FiLayers // Projeler yönetimi için yeni ikon
} from 'react-icons/fi';

function Sidebar({ isCollapsed, toggleSidebar }) {
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
      } bg-surface border-r border-border flex flex-col transition-all duration-300 relative shadow-xl pt-4`}
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
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-main'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}

        {/* --- ADMIN BÖLÜMÜ --- */}
        {user && user.role === 'admin' && (
          <>
            <div className="my-4 border-t border-border mx-4 opacity-50" />
            
            {/* ADMIN USERS BUTONU */}
            <NavLink
              to="/admin-users" 
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-red-600/80 text-white'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-main'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0"><FiUserCheck size={20} /></span>
              {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Manage Users</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Users Management
                </div>
              )}
            </NavLink>

            {/* --- YENİ: ADMIN PROJECTS BUTONU --- */}
            <NavLink
              to="/admin-projects" // Mevcut Users sayfasındaki 'Projects' tabını kullanıyorsanız burası /users kalabilir
              state={{ activeTab: 'projects' }} // Sayfaya 'projects' tabı açık gelsin bilgisi gönderiyoruz
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group relative ${
                   // Eğer url /users ise ve state içinde projects varsa aktif gösterilebilir
                   isActive ? 'bg-purple-600/80 text-white' : 'text-text-secondary hover:bg-surface-hover hover:text-text-main'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0"><FiLayers size={20} /></span>
              {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Manage Projects</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  All Projects
                </div>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* ALT KISIM (Collapse Button) */}
      <div className="p-4 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-text-secondary hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
        >
          {isCollapsed ? <FiChevronsRight size={24} /> : <FiChevronsLeft size={24} />}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;