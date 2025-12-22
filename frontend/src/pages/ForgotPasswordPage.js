// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiMail, FiLoader, FiArrowLeft } from 'react-icons/fi';
import BackgroundImage from '../assets/background.jpg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { forgotPassword, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setMessage('Check the backend console/terminal for the reset link!');
    } catch (err) {
      setMessage('');
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Overlay: Light(%30 White) | Dark(%50 Black) */}
      <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[1px] dark:bg-black/50 transition-colors duration-300"></div>

      <Link 
        to="/home" 
        className="absolute top-8 left-8 z-20 flex items-center text-text-main hover:text-primary transition-colors group font-semibold"
      >
        <div className="p-2 bg-surface/80 border border-border rounded-full mr-3 group-hover:bg-surface shadow-sm backdrop-blur-md">
             <FiArrowLeft size={20} />
        </div>
        <span className="bg-surface/50 px-2 py-1 rounded-md backdrop-blur-sm">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-fade-in-up">
        <h2 className="text-2xl font-bold text-text-main text-center mb-4">Reset Password</h2>
        <p className="text-text-secondary text-center mb-6">Enter your email to receive a reset link.</p>
        
        {message && <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded border border-green-200 dark:border-green-800 mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded border border-red-200 dark:border-red-800 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-text-secondary" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 pl-10 pr-4 text-text-main bg-app/80 border border-border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
          
          <button disabled={loading} className="w-full flex justify-center items-center py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-70">
            {loading ? <FiLoader className="animate-spin mr-2" /> : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-primary hover:text-primary-hover text-sm font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}