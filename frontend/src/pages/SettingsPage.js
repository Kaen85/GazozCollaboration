// src/pages/SettingsPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// 1. Theme hook'unu import et
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiMail, FiLock, FiSettings, FiGlobe, FiBell, FiShield, FiMoon, FiSun } from 'react-icons/fi';

export default function SettingsPage() {
  const { user } = useAuth();
  
  // 2. Tema verisini al
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');

  // Ortak stil sınıfları (Dark/Light uyumlu)
  const cardClass = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300";
  const textPrimary = "text-gray-900 dark:text-white";
  const textSecondary = "text-gray-500 dark:text-gray-400";
  const inputClass = "bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full";

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4 md:px-0">
      
      {/* Başlık */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-8">
        <h2 className={`text-3xl font-bold flex items-center ${textPrimary}`}>
          <FiSettings className="mr-3 text-gray-400" />
          Settings
        </h2>
        <p className={`${textSecondary} mt-1`}>Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SOL MENÜ */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {/* ... (Butonlar aynı, sadece renk sınıfları güncellenebilir) ... */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white`
              }`}
            >
              <FiUser className="mr-3 text-lg" /> Profile
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full ${
                activeTab === 'general'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white`
              }`}
            >
              <FiSettings className="mr-3 text-lg" /> General
            </button>
          </nav>
        </div>

        {/* İÇERİK ALANI */}
        <div className="flex-1">
          
          {/* --- 1. PROFIL AYARLARI --- */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className={cardClass}>
                <h3 className={`text-xl font-bold mb-6 flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 ${textPrimary}`}>
                  Profile Information
                </h3>
                {/* ... (Profil içeriği aynı, sadece renkler textPrimary/Secondary ile güncellendi) ... */}
                 <div className="space-y-6">
                   <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Username</label>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3">
                      <FiUser className="text-gray-400 mr-3" />
                      <span className={textPrimary}>{user?.username}</span>
                    </div>
                  </div>
                 </div>
              </div>
            </div>
          )}

          {/* --- 2. GENEL (GENERAL) AYARLAR --- */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className={cardClass}>
                <h3 className={`text-xl font-bold mb-6 flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 ${textPrimary}`}>
                  App Preferences
                </h3>
                
                <div className="space-y-6">
                  
                  {/* === TEMA AYARI (BURASI EKLENDİ) === */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {theme === 'dark' ? <FiMoon className="text-purple-400 mr-3" size={24}/> : <FiSun className="text-yellow-500 mr-3" size={24}/>}
                      <div>
                        <h4 className={`${textPrimary} font-medium`}>Appearance</h4>
                        <p className={`text-sm ${textSecondary}`}>Switch between Dark and Light mode.</p>
                      </div>
                    </div>
                    
                    <select 
                      value={theme}
                      onChange={(e) => toggleTheme(e.target.value)}
                      className={inputClass.replace('w-full', 'w-40')}
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  {/* Dil Ayarı (Görsel Güncellendi) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiGlobe className="text-gray-400 mr-3" size={20} />
                      <div>
                        <h4 className={`${textPrimary} font-medium`}>Language</h4>
                        <p className={`text-sm ${textSecondary}`}>Select your preferred language.</p>
                      </div>
                    </div>
                    <select className={inputClass.replace('w-full', 'w-40')}>
                      <option>English (US)</option>
                      <option>Turkish (TR)</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}