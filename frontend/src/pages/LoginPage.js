// src/pages/LoginPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; 
import BackgroundImage from '../assets/background.jpg'; 
import LogoImage from '../assets/logo.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 

  const navigate = useNavigate();
  const { login, user, loading } = useAuth(); 

  const handleSubmit = async (event) => { 
    event.preventDefault(); 
    setError(null); 

    if (!username || !password) {
        setError("Please enter all fields.");
        return; 
    }
    
    try {
      await login(username, password); 
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]); 

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="relative z-10 w-full max-w-md p-10 space-y-8 bg-gray-900 bg-opacity-90 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-700">
        <div className="text-center">
          
          {/* === DEV LOGO === */}
          <img 
            src={LogoImage} 
            alt="GazozHub Logo" 
            className="h-40 w-40 object-contain mx-auto mb-6 drop-shadow-2xl" 
          />
          
          {/* === DEV BAŞLIK === */}
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Sign In
          </h2>
          <p className="mt-2 text-lg text-gray-300">
            Welcome to <span className="font-extrabold text-blue-500 text-2xl tracking-wide">GazozHub</span>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-4 pointer-events-none">
              <FiUser className="w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full py-4 pl-12 pr-4 text-lg bg-gray-800 text-white border border-gray-600 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-4 pointer-events-none">
              <FiLock className="w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full py-4 pl-12 pr-4 text-lg bg-gray-800 text-white border border-gray-600 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-200 text-center font-medium">
                {error}
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-900/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6 space-y-2">
          <p className="text-base text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-4 transition-colors">
              Sign Up
            </Link>
          </p>
          <div>
            <Link to="/forgot-password" className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;