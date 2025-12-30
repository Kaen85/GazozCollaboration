// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiArrowLeft, FiLoader, FiSun, FiMoon } from 'react-icons/fi'; // İkonlar eklendi
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Tema hook'u eklendi
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Tema verisi

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
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="absolute inset-0 z-0 bg-gray-100/40 dark:bg-black/70 backdrop-blur-[3px] transition-colors duration-300"></div>

      {/* --- ÜST BAR (Geri Butonu ve Tema Butonu) --- */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <Link 
            to="/home" 
            className="flex items-center text-text-main hover:text-primary transition-colors font-bold bg-surface/80 px-4 py-2 rounded-xl shadow-sm border border-border backdrop-blur-md"
        >
            <FiArrowLeft className="mr-2" /> Back
        </Link>

        {/* TEMA DEĞİŞTİRME BUTONU (Header'dakiyle aynı mantık) */}
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

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-surface/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl animate-fade-in-up">
        
        <div className="flex flex-col items-center justify-center mb-2">
            <img 
                src={LogoImage} 
                alt="Logo" 
                className="h-28 w-28 mb-2 object-contain brightness-0 dark:brightness-100 drop-shadow-md" 
            />
            <h1 className="text-3xl font-black text-text-main tracking-tight">GazozHub</h1>
            <p className="text-text-secondary text-sm font-medium">Welcome back!</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Inputlar artık 'bg-app' ve 'text-text-main' kullanıyor */}
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
            </div>
            <input
              id="username"
              type="text"
              required
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-border bg-app text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-border bg-app text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {localError && (
            <p className="text-sm text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800 text-center font-medium">
                {localError}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3.5 font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
            >
              {loading ? <FiLoader className="animate-spin mr-2"/> : 'Sign In'}
            </button>
            <div className="flex justify-center mt-4">
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover font-semibold transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>
        </form>
        
        <div className="text-center pt-2 border-t border-border">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;