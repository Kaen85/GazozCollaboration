// src/components/layout/ProfileDropdown.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

function ProfileDropdown({ isOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
      
      {/* Menü Linkleri */}
      <div className="py-2">
        {/* Profile ve Help linkleri kaldırıldı */}
        
        <Link 
          to="/settings" 
          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <FiSettings className="mr-3 text-gray-400" size={16} />
          Settings
        </Link>
      </div>

      {/* Logout Kısmı */}
      <div className="border-t border-gray-700 py-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
        >
          <FiLogOut className="mr-3" size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;