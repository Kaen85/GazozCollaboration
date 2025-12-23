// src/pages/ResetPasswordPage.js

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiLoader, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

export default function ResetPasswordPage() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

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
      // AuthContext'teki resetPassword fonksiyonunu çağırır
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
      <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[2px] dark:bg-black/60 transition-colors duration-300"></div>

      {/* Back Button */}
      <Link 
        to="/login" 
        className="absolute top-8 left-8 z-20 flex items-center text-gray-900 dark:text-white hover:text-blue-600 transition-colors group font-semibold"
      >
        <div className="p-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full mr-3 shadow-sm backdrop-blur-md">
             <FiArrowLeft size={20} />
        </div>
        <span className="bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">Back to Login</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-fade-in-up">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-6">
            <img 
                src={LogoImage} 
                alt="Logo" 
                className="h-24 w-24 mb-4 object-contain brightness-0 dark:brightness-100 transition-all" 
            />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">GazozHub</h1>
        </div>

        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-6 uppercase tracking-widest">Set New Password</h2>
        
        {/* Feedback Messages */}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm font-bold flex items-center"><FiCheckCircle className="mr-2"/> {message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiLock className="text-gray-500" />
            </div>
            <input
              type="password"
              required
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiLock className="text-gray-500" />
            </div>
            <input
              type="password"
              required
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
