// src/components/layout/Header.js

import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiSun, FiMoon } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LogoImage from '../../assets/logo.png';

function Header({ onToggleRightSidebar }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Dropdown dışına tıklanınca kapatma
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

  // Profil Resmi URL'si
  const avatarUrl = user?.profile_picture 
    ? `http://localhost:5000/${user.profile_picture}` 
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md transition-colors duration-300">
      
      <div className="px-6 py-3 flex justify-between items-center">
        
        {/* SOL: LOGO */}
        <Link to="/dashboard" className="flex items-center group gap-1.5">
          <img 
            src={LogoImage} 
            alt="Logo" 
            className="h-16 w-16 object-contain drop-shadow-lg brightness-0 dark:brightness-100 transition-all duration-300" 
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wide text-text-main group-hover:text-primary transition-colors">
              GazozHub
            </span>
          </div>
        </Link>

        {/* SAĞ: BUTONLAR VE PROFİL */}
        <div className="flex items-center space-x-3 md:space-x-5">
          
          {/* TEMA DEĞİŞTİRME BUTONU (Mevcut Kodun) */}
          <button
            onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex items-center justify-between w-14 h-7 p-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none shadow-inner"
            aria-label="Toggle Theme"
          >
            <div
              className={`absolute w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                theme === 'dark' ? 'translate-x-7 bg-indigo-500' : 'translate-x-0 bg-amber-400'
              }`}
            >
              {theme === 'dark' ? <FiMoon className="text-white w-3 h-3" /> : <FiSun className="text-white w-3 h-3" />}
            </div>
            <FiSun className={`ml-1 w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'opacity-0'}`} />
            <FiMoon className={`mr-1 w-3.5 h-3.5 ${theme === 'light' ? 'text-gray-400' : 'opacity-0'}`} />
          </button>
          
          {/* Profil Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-surface-hover border border-transparent hover:border-border transition-all group"
            >
              {/* AVATAR KISMI GÜNCELLENDİ: Resim varsa göster, yoksa harf */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden border border-border">
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   user?.username?.charAt(0).toUpperCase() || 'U'
                 )}
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
            
            <ProfileDropdown isOpen={isDropdownOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;