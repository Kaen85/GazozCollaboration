// src/components/layout/ProfileDropdown.js

import React from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
// --- 1. IMPORT useNavigate AND useAuth ---
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProfileDropdown({ isOpen }) {
  const { logout } = useAuth();
  // --- 2. GET THE NAVIGATE FUNCTION ---
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleLogout = () => {
    // --- 3. PERFORM BOTH ACTIONS HERE ---
    logout();      // First, clear the user state
    navigate('/'); // Then, immediately navigate to the login page
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
      <div className="py-1">
        <a href="#profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
          <FiUser className="mr-3" />
          Profile
        </a>
        <a href="#settings" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
          <FiSettings className="mr-3" />
          Settings
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
        >
          <FiLogOut className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;