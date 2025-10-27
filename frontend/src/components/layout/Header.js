// src/components/layout/Header.js

import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import ProfileDropdown from './ProfileDropdown';

function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = { name: 'Kaan' };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-gray-800 text-white shadow-md">
      {/* MODIFICATION: Removed 'container' and 'mx-auto' to make the header full-width.
        Increased padding from px-4 to px-6 for better spacing from the screen edges.
      */}
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Left Side: Brand Name */}
        <div className="text-xl font-bold">
          Project Collaboration Hub
        </div>

        {/* Right Side: Icons and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications Icon Button */}
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FiBell size={20} />
          </button>
          
          {/* Messages Icon Button */}
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FiMessageSquare size={20} />
          </button>
          
          {/* Profile Button and Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700"
            >
              <span>{user.name}</span>
              <FiChevronDown size={16} />
            </button>
            <ProfileDropdown isOpen={isDropdownOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;