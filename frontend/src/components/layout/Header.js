// src/components/layout/Header.js

import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth(); // AuthContext'ten kullanıcıyı al

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
      <div className="px-6 py-3 flex justify-between items-center">
        
        {/* Sol Taraf - Logo (Link olarak doğru ayarlanmış) */}
        <Link to="/dashboard" className="flex items-baseline hover:text-gray-300 transition-colors">
          <span className="text-xl font-bold">Project Collaboration Hub</span>
          <span className="ml-2 text-sm text-gray-400 font-normal">by Gazoz</span>
        </Link>

        {/* Right Side: Icons and User Menu */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FiBell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FiMessageSquare size={20} />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700"
            >
              {/* DÜZELTME BURADA: 
                AuthContext'te 'user' objesini { username: '...' } olarak 
                kaydettiğimiz için 'user.name' yerine 'user.username' 
                kullanıyoruz.
              */}
              <span>{user ? user.username : 'Guest'}</span>
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