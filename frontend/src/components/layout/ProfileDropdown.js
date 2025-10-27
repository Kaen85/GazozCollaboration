// src/components/layout/ProfileDropdown.js

import React from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

// This component is purely presentational. It receives an `isOpen` prop to control its visibility.
function ProfileDropdown({ isOpen }) {
  if (!isOpen) {
    return null; // If not open, render nothing.
  }

  return (
    // Positioned absolutely relative to its parent in the Header
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
        <a href="#logout" className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
          <FiLogOut className="mr-3" />
          Logout
        </a>
      </div>
    </div>
  );
}

export default ProfileDropdown;