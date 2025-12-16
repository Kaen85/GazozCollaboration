// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; 
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { register, loading } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!username || !email || !password) {
      setError("Please enter all fields.");
      return;
    }

    try {
      await register(username, email, password);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="relative z-10 w-full max-w-md p-10 space-y-6 bg-gray-900 bg-opacity-90 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-700">
        <div className="text-center">
          
          {/* === DEV LOGO === */}
          <img 
            src={LogoImage} 
            alt="GazozHub Logo" 
            className="h-40 w-40 object-contain mx-auto mb-6 drop-shadow-2xl" 
          />
          
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Create Account
          </h2>
          <p className="text-lg text-gray-400 font-medium">
            Join <span className="font-extrabold text-blue-500 tracking-wide">GazozHub</span>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Username Input */}
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-4 pointer-events-none">
              <FiUser className="w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="username"
              type="text"
              required
              className="w-full py-4 pl-12 pr-4 text-lg bg-gray-800 text-white border border-gray-600 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-4 pointer-events-none">
              <FiMail className="w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="email"
              type="email"
              required
              className="w-full py-4 pl-12 pr-4 text-lg bg-gray-800 text-white border border-gray-600 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Password Input */}
          <div className="relative group">
            <div className="absolute top-0 left-0 flex items-center h-full pl-4 pointer-events-none">
              <FiLock className="w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="password"
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
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-sm text-green-200 text-center font-medium">
                {success}
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-900/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-base text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-4 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default RegisterPage;