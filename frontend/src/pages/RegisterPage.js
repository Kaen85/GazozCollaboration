// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiArrowLeft, FiLoader } from 'react-icons/fi';
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
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[2px] dark:bg-black/60 transition-colors duration-300"></div>

      <Link 
        to="/home" 
        className="absolute top-8 left-8 z-20 flex items-center text-gray-900 dark:text-white hover:text-blue-600 transition-colors group font-semibold"
      >
        <div className="p-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full mr-3 group-hover:bg-white shadow-sm backdrop-blur-md">
             <FiArrowLeft size={20} />
        </div>
        <span className="bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-fade-in-up">
         
         <div className="flex flex-col items-center justify-center mb-6">
            <img 
                src={LogoImage} 
                alt="Logo" 
                className="h-32 w-32 mb-4 object-contain brightness-0 dark:brightness-100 transition-all" 
            />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">GazozHub</h1>
        </div>

         <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Create Account</h2>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* USERNAME */}
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              id="username"
              type="text"
              required
              className="w-full py-3 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                         bg-white dark:bg-gray-800 
                         border-gray-300 dark:border-gray-600 
                         text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiMail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              className="w-full py-3 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                         bg-white dark:bg-gray-800 
                         border-gray-300 dark:border-gray-600 
                         text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* PASSWORD */}
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full py-3 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                         bg-white dark:bg-gray-800 
                         border-gray-300 dark:border-gray-600 
                         text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600 font-bold text-center bg-red-100 p-2 rounded border border-red-300">{error}</p>}
          {success && <p className="text-sm text-green-600 font-bold text-center bg-green-100 p-2 rounded border border-green-300">{success}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-70"
            >
              {loading ? <FiLoader className="animate-spin mr-2"/> : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;