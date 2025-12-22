// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiArrowLeft, FiLoader } from 'react-icons/fi';
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

      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-fade-in-up">
         <div className="text-center">
          <h2 className="text-3xl font-bold text-text-main">Create Account</h2>
          <p className="mt-2 text-sm text-text-secondary">Join the Project Hub</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-text-secondary" />
            </div>
            <input
              id="username"
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
              <FiMail className="w-5 h-5 text-text-secondary" />
            </div>
            <input
              id="email"
              type="email"
              required
              className="w-full py-3 pl-10 pr-4 text-text-main bg-app/80 border border-border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-text-secondary" />
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full py-3 pl-10 pr-4 text-text-main bg-app/80 border border-border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">{error}</p>}
          {success && <p className="text-sm text-green-500 text-center bg-green-100 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">{success}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-70"
            >
              {loading ? <FiLoader className="animate-spin mr-2"/> : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;