// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 1. FiArrowLeft'i ekle
import { FiUser, FiLock, FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import BackgroundImage from '../assets/background.jpg';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { register, loading } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // ... submit kodları aynı ...
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
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* 2. BURAYA EKLE: Geri Dön Butonu */}
      <Link 
        to="/home" 
        className="absolute top-8 left-8 z-20 flex items-center text-gray-300 hover:text-white transition-colors"
      >
        <FiArrowLeft className="mr-2" size={24} />
        <span className="font-semibold text-lg">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl backdrop-blur-sm">
         {/* ... Form Kodları Aynı ... */}
         <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">Join the Project Hub</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-gray-500" />
            </div>
            <input
              id="username"
              type="text"
              required
              className="w-full py-3 pl-10 pr-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiMail className="w-5 h-5 text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              required
              className="w-full py-3 pl-10 pr-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-gray-500" />
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full py-3 pl-10 pr-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          {success && <p className="text-sm text-green-400 text-center">{success}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;