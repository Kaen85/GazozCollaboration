// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiArrowLeft, FiLoader } from 'react-icons/fi'; 
import { useAuth } from '../context/AuthContext';
import BackgroundImage from '../assets/background.jpg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleSubmit = async (event) => { 
    event.preventDefault(); 
    setLocalError(null);
    if (!username || !password) {
        setLocalError("Please enter all fields.");
        return;
    }
    
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    // ANA KONTEYNER: Resmi buraya arka plan olarak koyuyoruz
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      
      {/* --- Overlay (Perde) Katmanı --- */}
      {/* Light Mode: Hafif beyazlık (%30) + Çok hafif blur */}
      {/* Dark Mode: %50 Siyahlık (İstediğin gibi) */}
      <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[1px] dark:bg-black/50 transition-colors duration-300"></div>

      {/* Geri Dön Butonu */}
      <Link 
        to="/home" 
        className="absolute top-8 left-8 z-20 flex items-center text-text-main hover:text-primary transition-colors group font-semibold"
      >
        <div className="p-2 bg-surface/80 border border-border rounded-full mr-3 group-hover:bg-surface shadow-sm backdrop-blur-md">
             <FiArrowLeft size={20} />
        </div>
        <span className="bg-surface/50 px-2 py-1 rounded-md backdrop-blur-sm">Back to Home</span>
      </Link>

      {/* LOGIN KARTI */}
      {/* Kartın kendisi de hafif şeffaf (bg-surface/90) ki arkadaki resimle bütünleşsin */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-main">Sign In</h2>
          <p className="mt-2 text-sm text-text-secondary">Welcome back to GazozHub</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-text-secondary" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full py-3 pl-10 pr-4 text-text-main bg-app/80 border border-border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-text-secondary" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full py-3 pl-10 pr-4 text-text-main bg-app/80 border border-border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {localError && (
            <p className="text-sm text-red-500 text-center bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">{localError}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-70"
            >
              {loading ? <FiLoader className="animate-spin mr-2"/> : 'Sign In'}
            </button>
            <div className="flex justify-end mb-4 mt-3">
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover font-medium">
                Forgot Password?
              </Link>
            </div>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;