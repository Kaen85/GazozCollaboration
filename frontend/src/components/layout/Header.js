// src/components/layout/Header.js

import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../../context/AuthContext';

function Header() {
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
    // === DÜZELTME BURADA ===
    // 'z-20' yerine 'z-50' yapıldı.
    // 'relative' eklendi.
    // Bu sayede Header ve içindeki Dropdown her zaman diğer içeriklerin üstünde görünür.
    <header className="bg-black bg-opacity-40 backdrop-blur-md text-white shadow-sm border-b border-white/10 z-50 relative">
      <div className="px-6 py-3 flex justify-between items-center">
        
        <Link to="/dashboard" className="flex items-baseline hover:text-gray-300 transition-colors">
          <span className="text-xl font-bold tracking-wide">Project Collaboration Hub</span>
          <span className="ml-2 text-sm text-gray-400 font-normal">by Gazoz</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-white/10 transition">
            <FiBell size={20} />
          </button>
          {/* <button className="p-2 rounded-full hover:bg-white/10 transition">
            <FiMessageSquare size={20} />
          </button> 
          */}
          
          {/* Dropdown Kapsayıcısı */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition"
            >
              <span className="font-medium">{user ? user.username : 'Guest'}</span>
              <FiChevronDown size={16} />
            </button>
            
            {/* Dropdown Bileşeni */}
            <ProfileDropdown isOpen={isDropdownOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;