// src/components/layout/ProfileDropdown.js

import React from 'react';
import { Link } from 'react-router-dom'; // 1. Link'i import et
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

function ProfileDropdown({ isOpen }) {
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700 z-50 animate-fade-in-up">
      
      {/* Profil Linki (Opsiyonel, şimdilik Settings'e gitsin) */}
      <Link 
        to="/settings" 
        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
      >
        <FiUser className="mr-2" /> Profile
      </Link>
      
      {/* === 2. SETTINGS LİNKİ GÜNCELLENDİ === */}
      <Link 
        to="/settings" 
        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
      >
        <FiSettings className="mr-2" /> Settings
      </Link>
      
      <div className="border-t border-gray-700 my-1"></div>
      
      <button 
        onClick={logout}
        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center"
      >
        <FiLogOut className="mr-2" /> Logout
      </button>
    </div>
  );
}

export default ProfileDropdown;