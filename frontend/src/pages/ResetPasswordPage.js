// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiMail, FiLoader, FiArrowLeft } from 'react-icons/fi';
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfa yenilenmesini engeller
    setMessage('');
    setError('');

    if (!email) {
        setError("Please enter your email.");
        return;
    }

    try {
      await forgotPassword(email);
      // Başarılı olursa:
      setMessage('Success! Check the backend console/terminal for the reset link.');
    } catch (err) {
      // Hata olursa:
      console.error(err);
      setError('Failed to reset password. User may not exist.');
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[2px] dark:bg-black/60 transition-colors duration-300"></div>

      <Link 
        to="/home" 
        className="absolute top-8 left-8 z-20 flex items-center text-gray-900 dark:text-white hover:text-blue-600 transition-colors group font-semibold"
      >
        <div className="p-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full mr-3 shadow-sm backdrop-blur-md">
             <FiArrowLeft size={20} />
        </div>
        <span className="bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-fade-in-up">
        
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center mb-6">
            <img 
                src={LogoImage} 
                alt="Logo" 
                className="h-24 w-24 mb-4 object-contain brightness-0 dark:brightness-100 transition-all" 
            />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">GazozHub</h1>
        </div>

        {/* METİNLER (Renkler sabitlendi) */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 text-center mb-2 uppercase tracking-widest">Reset Password</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm font-medium">
          Enter your email to receive a reset link.
        </p>
        
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm font-bold">{message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiMail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            {/* INPUT AYARLARI: bg-white (Light) / bg-gray-800 (Dark) ve text-gray-900 (Light) / text-white (Dark) */}
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                         bg-white dark:bg-gray-800 
                         border-gray-300 dark:border-gray-600 
                         text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button 
            type="submit" // Bu çok önemli
            disabled={loading} 
            className="w-full flex justify-center items-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? <FiLoader className="animate-spin mr-2" /> : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm font-bold">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}