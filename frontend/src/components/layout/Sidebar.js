// src/components/layout/Sidebar.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiFolder, FiShare2 } from 'react-icons/fi';
// Logout butonu kaldırıldığı için useAuth ve FiLogOut importları silindi

function Sidebar() {
  const location = useLocation();
  
  // Aktif linki vurgulamak için helper
  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `
    flex items-center px-4 py-3 my-1 transition-colors rounded-lg
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-lg' 
      : 'text-gray-300 hover:bg-white/10 hover:text-white'}
  `;

  return (
    // bg-black bg-opacity-30 backdrop-blur-md ile şeffaflık korunuyor
    <aside className="w-64 bg-black bg-opacity-30 backdrop-blur-md flex flex-col border-r border-white/10 hidden md:flex">
      
      <nav className="flex-1 px-2 py-6 space-y-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          <FiGrid className="mr-3" />
          Dashboard
        </Link>
        <Link to="/my-projects" className={linkClass('/my-projects')}>
          <FiFolder className="mr-3" />
          My Projects
        </Link>
        <Link to="/shared-projects" className={linkClass('/shared-projects')}>
          <FiShare2 className="mr-3" />
          Shared by Others
        </Link>
      </nav>

      {/* Logout butonu buradan kaldırıldı. Artık sadece Header'daki profil menüsünde olacak. */}

    </aside>
  );
}

export default Sidebar;