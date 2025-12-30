// src/components/layout/ProfileDropdown.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiUser, FiLogOut, FiLayout, FiHelpCircle, FiSettings 
} from 'react-icons/fi';

function ProfileDropdown({ isOpen }) {
  const { logout, user } = useAuth();

  if (!isOpen) return null;

  // Profil resmi URL'sini oluştur
  const avatarUrl = user?.profile_picture 
    ? `http://localhost:5000/${user.profile_picture}` 
    : null;

  return (
    <div className="absolute right-0 mt-3 w-64 bg-surface rounded-2xl shadow-2xl border border-border py-2 z-50 animate-fade-in origin-top-right">
      
      {/* Header Info */}
      <div className="px-4 py-3 border-b border-border mb-1 flex items-center gap-3">
        {/* Küçük Avatar Önizleme */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden shrink-0">
             {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                 user?.username?.charAt(0).toUpperCase() || 'U'
             )}
        </div>
        <div className="overflow-hidden">
            <p className="text-sm font-bold text-text-main truncate">{user?.username || 'Guest'}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email || 'No email'}</p>
        </div>
      </div>

      <div className="px-2 space-y-1">
        {/* Profile Linki (Yeni) */}
        <Link 
            to="/profile" 
            className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-main hover:bg-app rounded-xl transition-colors font-medium"
        >
          <FiUser className="mr-3 text-blue-500" /> My Profile
        </Link>
        
      </div>

      <div className="border-t border-border mt-2 pt-2 px-2">
        <button
          onClick={logout}
          className="flex w-full items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold"
        >
          <FiLogOut className="mr-3" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;