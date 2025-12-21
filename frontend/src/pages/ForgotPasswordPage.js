// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
// 1. FiArrowLeft ikonunu ekle
import { FiMail, FiLoader, FiArrowLeft } from 'react-icons/fi';
// 2. Arka plan resmini import et (Görsel bütünlük için buraya da ekleyelim)
import BackgroundImage from '../assets/background.jpg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { forgotPassword, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    // ... kodlar aynı ...
    e.preventDefault();
    try {
      await forgotPassword(email);
      setMessage('Check the backend console/terminal for the reset link!');
    } catch (err) {
      setMessage('');
    }
  };

  return (
    // 3. Arka planı LoginPage ile aynı yapıyoruz
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* 4. BURAYA EKLE: Geri Dön Butonu */}
      <Link 
        to="/home" 
        className="absolute top-8 left-8 z-20 flex items-center text-gray-300 hover:text-white transition-colors"
      >
        <FiArrowLeft className="mr-2" size={24} />
        <span className="font-semibold text-lg">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Reset Password</h2>
        <p className="text-gray-400 text-center mb-6">Enter your email to receive a reset link.</p>
        
        {message && <div className="bg-green-600 text-white p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-500" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex justify-center">
            {loading ? <FiLoader className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}