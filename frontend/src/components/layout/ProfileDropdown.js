// src/components/layout/ProfileDropdown.js

import React from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProfileDropdown({ isOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    // DROPDOWN KUTUSU
    // bg-surface: Temaya göre Beyaz veya Koyu Gri
    // border-border: Temaya göre kenarlık rengi
    <div className="absolute top-full right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-fade-in-up origin-top-right">
      
      <div className="py-1">
        {/* Profil Linki */}
        <button 
          onClick={() => handleNavigate('/settings')} 
          className="w-full text-left flex items-center px-4 py-3 text-sm text-text-main hover:bg-surface-hover transition-colors group"
        >
          <FiUser className="mr-3 text-text-secondary group-hover:text-primary transition-colors" />
          Profile
        </button>
        
        {/* Ayarlar Linki */}
        <button 
          onClick={() => handleNavigate('/settings')} 
          className="w-full text-left flex items-center px-4 py-3 text-sm text-text-main hover:bg-surface-hover transition-colors group"
        >
          <FiSettings className="mr-3 text-text-secondary group-hover:text-primary transition-colors" />
          Settings
        </button>

        {/* Ayırıcı Çizgi */}
        <div className="border-t border-border my-1 mx-2"></div>
        
        {/* Çıkış Yap Butonu */}
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <FiLogOut className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;