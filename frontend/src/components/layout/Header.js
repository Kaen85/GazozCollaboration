// src/components/layout/Header.js

import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiChevronDown, FiInfo } from 'react-icons/fi'; // İkonlar
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../../context/AuthContext';
import LogoImage from '../../assets/logo.png';

function Header({ onToggleRightSidebar }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Dropdown dışına tıklanınca kapatma mantığı
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
    // HEADER KONTEYNERİ
    // bg-surface/80 ve backdrop-blur-md: Buzlu cam efekti verir.
    // border-b border-border: Altına ince bir çizgi çeker (temaya duyarlı).
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md transition-colors duration-300">
      
      <div className="px-6 py-3 flex justify-between items-center">
        
        {/* SOL: LOGO VE MARKA */}
        <Link to="/dashboard" className="flex items-center group">
          <img 
            src={LogoImage} 
            alt="Logo" 
            className="h-20 w-20 object-contain drop-shadow-lg brightness-0 dark:brightness-100 transition-all duration-300" 
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wide text-text-main group-hover:text-primary transition-colors">
              GazozHub
            </span>
          </div>
        </Link>

        {/* SAĞ: BUTONLAR VE PROFİL */}
        <div className="flex items-center space-x-2 md:space-x-4">
          
         
          
          {/* Profil Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-surface-hover border border-transparent hover:border-border transition-all group"
            >
              {/* Avatar Yerine Baş harf veya resim */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                 {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              <span className="font-medium text-sm text-text-main hidden md:block">
                {user ? user.username : 'Guest'}
              </span>
              
              {user?.role === 'admin' && (
                <span className="hidden md:inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 ml-1">
                  ADMIN
                </span>
              )}
              
              <FiChevronDown size={16} className="text-text-secondary group-hover:text-text-main transition-colors" />
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