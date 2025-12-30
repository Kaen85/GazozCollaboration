// src/pages/ResetPasswordPage.js

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Tema hook'u eklendi
import { FiLock, FiLoader, FiArrowLeft, FiCheckCircle, FiSun, FiMoon } from 'react-icons/fi'; // İkonlar eklendi
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

export default function ResetPasswordPage() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Tema verisi

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setMessage('Your password has been successfully updated! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 bg-gray-100/40 dark:bg-black/70 backdrop-blur-[3px] transition-colors duration-300"></div>

      {/* --- ÜST BAR (Geri Butonu ve Tema Butonu) --- */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <Link 
            to="/login" 
            className="flex items-center text-text-main hover:text-primary transition-colors font-bold bg-surface/80 px-4 py-2 rounded-xl shadow-sm border border-border backdrop-blur-md"
        >
            <FiArrowLeft className="mr-2" /> Back to Login
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

      {/* Card Container: bg-surface */}
      <div className="relative z-10 w-full max-w-md p-8 bg-surface/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl animate-fade-in-up">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-6">
            <img 
                src={LogoImage} 
                alt="Logo" 
                className="h-24 w-24 mb-4 object-contain brightness-0 dark:brightness-100 drop-shadow-md" 
            />
            <h1 className="text-3xl font-black text-text-main tracking-tight">GazozHub</h1>
        </div>

        <h2 className="text-lg font-bold text-text-secondary text-center mb-6 uppercase tracking-widest">Set New Password</h2>
        
        {/* Feedback Messages */}
        {message && <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-bold flex items-center justify-center"><FiCheckCircle className="mr-2"/> {message}</div>}
        {error && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="password"
              required
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-border bg-app text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="password"
              required
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-border bg-app text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center items-center px-4 py-3.5 font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
          >
            {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}