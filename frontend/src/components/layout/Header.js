// src/components/layout/Header.js

import React, { useState, useEffect, useRef } from 'react';
// FiInfo ikonunu ekledik
import { FiBell, FiChevronDown, FiInfo } from 'react-icons/fi'; 
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../../context/AuthContext';
import LogoImage from '../../assets/logo.png';

// Props'a onToggleRightSidebar eklendi
function Header({ onToggleRightSidebar }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

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
    <header className="bg-black bg-opacity-40 backdrop-blur-md text-white shadow-sm border-b border-white/10 z-30 relative">
      <div className="px-6 py-3 flex justify-between items-center">
        
        {/* Logo ve Marka Alanı */}
        <Link to="/dashboard" className="flex items-center hover:text-gray-300 transition-colors group">
          <img 
            src={LogoImage} 
            alt="Logo" 
            className="h-12 w-12 object-contain mr-3" 
          />
          <div className="flex items-baseline">
            <span className="text-xl font-bold tracking-wide">GazozHub</span>
            <span className="ml-2 text-sm text-gray-400 font-normal">by Gazoz</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          
          {/* === YENİ EKLENEN INFO BUTONU === */}
          <button 
            onClick={onToggleRightSidebar}
            className="p-2 rounded-full hover:bg-white/10 transition text-gray-300 hover:text-white"
            title="Toggle Info Panel"
          >
            <FiInfo size={22} />
          </button>
          {/* ================================ */}

          <button className="p-2 rounded-full hover:bg-white/10 transition">
            <FiBell size={20} />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition"
            >
              <span className="font-medium">{user ? user.username : 'Guest'}</span>
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