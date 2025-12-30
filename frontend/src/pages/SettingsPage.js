// src/pages/SettingsPage.js

import React, { useState } from 'react';
import { FiUser, FiLock, FiMonitor, FiSave, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-text-main border-b border-border pb-2">
              Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Full Name</label>
                    {/* Inputlar artık bg-app ve border-border kullanıyor */}
                    <input type="text" className="w-full bg-app border border-border rounded-xl p-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Your Name" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Email</label>
                    <input type="email" className="w-full bg-app border border-border rounded-xl p-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60" placeholder="email@example.com" disabled />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-text-secondary mb-1">Bio</label>
                    <textarea className="w-full bg-app border border-border rounded-xl p-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none h-24 transition-all resize-none" placeholder="Tell us about yourself..." />
                </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-text-main border-b border-border pb-2">
              Security & Password
            </h3>
            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Current Password</label>
                    <input type="password" className="w-full bg-app border border-border rounded-xl p-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">New Password</label>
                    <input type="password" className="w-full bg-app border border-border rounded-xl p-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Confirm New Password</label>
                    <input type="password" className="w-full bg-app border border-border rounded-xl p-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-text-main border-b border-border pb-2">
              Appearance Settings
            </h3>
            <div className="space-y-4">
                <p className="text-text-secondary text-sm">Choose how GazozHub looks to you.</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {/* LIGHT MODE BUTONU */}
                  <button 
                    onClick={() => toggleTheme('light')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'light' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    <FiSun className="mr-2" size={20}/>
                    <span className="font-bold">Light Mode</span>
                  </button>

                  {/* DARK MODE BUTONU */}
                  <button 
                    onClick={() => toggleTheme('dark')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    <FiMoon className="mr-2" size={20}/>
                    <span className="font-bold">Dark Mode</span>
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
    <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            <h1 className="text-3xl font-black text-text-main mb-6 transition-colors">Settings</h1>

            {/* TAB MENÜSÜ */}
            <div className="flex space-x-2 border-b border-border mb-6 overflow-x-auto transition-colors flex-none">
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`flex items-center px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                        activeTab === 'profile' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text-main hover:border-border'
                    }`}
                >
                    <FiUser className="mr-2" /> Account
                </button>

                <button 
                    onClick={() => setActiveTab('security')} 
                    className={`flex items-center px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                        activeTab === 'security' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text-main hover:border-border'
                    }`}
                >
                    <FiLock className="mr-2" /> Security
                </button>

                <button 
                    onClick={() => setActiveTab('appearance')} 
                    className={`flex items-center px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                        activeTab === 'appearance' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text-main hover:border-border'
                    }`}
                >
                    <FiMonitor className="mr-2" /> Appearance
                </button>
            </div>

            {/* KART ALANI */}
            <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm flex-grow overflow-y-auto custom-scrollbar transition-colors duration-300">
                {renderContent()}
                
                <div className="mt-10 pt-6 border-t border-border flex justify-end transition-colors">
                    <button className="flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        <FiSave className="mr-2" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}