// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Tema hook'u eklendi
import { Link } from 'react-router-dom';
import { FiMail, FiLoader, FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword, loading } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Tema verisi

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email) { setError("Please enter your email."); return; }
    try {
      await forgotPassword(email);
      setMessage('Success! Check the backend console/terminal for the reset link.');
    } catch (err) {
      setError('Failed to reset password. User may not exist.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300" style={{ backgroundImage: `url(${BackgroundImage})` }}>
      <div className="absolute inset-0 z-0 bg-gray-100/40 dark:bg-black/70 backdrop-blur-[3px] transition-colors duration-300"></div>

      {/* --- ÜST BAR --- */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <Link to="/login" className="flex items-center text-text-main hover:text-primary transition-colors font-bold bg-surface/80 px-4 py-2 rounded-xl shadow-sm border border-border backdrop-blur-md">
            <FiArrowLeft className="mr-2" /> Back
        </Link>
        
        {/* TEMA BUTONU */}
        <div className="bg-surface/80 p-2 rounded-xl shadow-sm border border-border backdrop-blur-md">
            <button
                onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative flex items-center justify-between w-14 h-7 p-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none shadow-inner"
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
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-surface/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl animate-fade-in-up">
        <div className="flex flex-col items-center justify-center mb-6">
            <img src={LogoImage} alt="Logo" className="h-24 w-24 mb-4 object-contain brightness-0 dark:brightness-100 drop-shadow-md" />
            <h1 className="text-3xl font-black text-text-main tracking-tight">Reset Password</h1>
        </div>

        <p className="text-text-secondary text-center mb-6 text-sm font-medium">Enter your email to receive a reset link.</p>
        
        {message && <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-bold text-center">{message}</div>}
        {error && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiMail className="w-5 h-5 text-text-secondary group-focus-within:text-primary" />
            </div>
            <input
              type="email" required placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-border bg-app text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-70">
            {loading ? <FiLoader className="animate-spin mr-2" /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}