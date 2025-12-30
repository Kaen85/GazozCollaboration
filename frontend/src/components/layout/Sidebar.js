// src/components/layout/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiBox, FiUsers, 
  FiChevronsLeft, FiChevronsRight,
  FiUserCheck,
  FiLayers 
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
      } bg-surface border-r border-border flex flex-col transition-all duration-300 relative shadow-sm pt-4 z-20`}
    >
      
      {/* MENU LİSTESİ */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden mt-2">
        {navItems.map((item) => (
          <NavLink
             key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative font-medium ${
                isActive
                  ? 'bg-primary text-white shadow-md' // Aktif: Primary renk
                  : 'text-text-secondary hover:bg-app hover:text-text-main' // Pasif: Temiz hover
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
            
             {isCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}

        {/* --- ADMIN BÖLÜMÜ --- */}
        {user && user.role === 'admin' && (
          <>
            <div className="my-4 border-t border-border mx-4 opacity-50" />
            
            <NavLink
               to="/admin-users" 
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative font-medium ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-text-secondary hover:bg-app hover:text-text-main'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0"><FiUserCheck size={20} /></span>
              {!isCollapsed && <span className="ml-3 whitespace-nowrap">Manage Users</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Users Management
                </div>
              )}
            </NavLink>

            <NavLink
              to="/admin-projects"
              state={{ activeTab: 'projects' }} 
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative font-medium ${
                   isActive ? 'bg-purple-600 text-white shadow-md' : 'text-text-secondary hover:bg-app hover:text-text-main'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0"><FiLayers size={20} /></span>
              {!isCollapsed && <span className="ml-3 whitespace-nowrap">Manage Projects</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
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
          className="w-full flex items-center justify-center py-2 text-text-secondary hover:text-text-main hover:bg-app rounded-lg transition-colors"
        >
          {isCollapsed ? <FiChevronsRight size={24} /> : <FiChevronsLeft size={24} />}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;