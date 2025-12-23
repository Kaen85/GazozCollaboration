// src/pages/SettingsPage.js

import React, { useState } from 'react';
import { FiUser, FiLock, FiMonitor, FiSave, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext'; // YENİ: Context'i çekiyoruz

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme(); // Tema fonksiyonlarını al

  // Tab İçerikleri
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                    <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-colors" placeholder="Your Name" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
                    <input type="email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-colors" placeholder="email@example.com" disabled />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bio</label>
                    <textarea className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:border-blue-500 outline-none h-24 transition-colors" placeholder="Tell us about yourself..." />
                </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Security & Password
            </h3>
            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                    <input type="password" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                    <input type="password" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-colors" />
                </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Appearance Settings
            </h3>
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Choose how GazozHub looks to you.</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {/* LIGHT MODE BUTONU */}
                  <button 
                    onClick={() => toggleTheme('light')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <FiSun className="mr-2" size={20}/>
                    <span className="font-semibold">Light Mode</span>
                  </button>

                  {/* DARK MODE BUTONU */}
                  <button 
                    onClick={() => toggleTheme('dark')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark' 
                      ? 'border-blue-500 bg-gray-800 text-white' 
                      : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <FiMoon className="mr-2" size={20}/>
                    <span className="font-semibold">Dark Mode</span>
                  </button>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Settings</h1>

      {/* --- TAB MENÜSÜ --- */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto transition-colors">
        <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'profile' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
            }`}
        >
            <FiUser className="mr-2" /> Account
        </button>
        
        

        <button 
            onClick={() => setActiveTab('appearance')} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'appearance' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
            }`}
        >
            <FiMonitor className="mr-2" /> Appearance
        </button>
      </div>

      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm dark:shadow-xl min-h-[400px] transition-colors duration-300">
          {renderContent()}
          
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end transition-colors">
              <button className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg">
                  <FiSave className="mr-2" /> Save Changes
              </button>
          </div>
      </div>
    </div>
  );
}