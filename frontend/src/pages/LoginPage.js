// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import icons
import { FiUser, FiLock } from 'react-icons/fi';

function LoginPage() {
  // State hooks for form inputs and status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page reload
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { username, password });
      // On success, navigate to the dashboard
      if (response.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    // Main container. These classes are key for centering:
    // - min-h-screen: Takes up the full height of the viewport.
    // - flex: Enables flexbox layout.
    // - items-center: Vertically centers the content.
    // - justify-center: Horizontally centers the content.
    // - bg-gradient...: Applies a modern background.
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
      
      {/* Login Card */}
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome to the Project Hub
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-gray-500" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full py-3 pl-10 pr-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          {/* Password Input */}
          <div className="relative">
            <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-gray-500" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full py-3 pl-10 pr-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm font-medium text-center text-red-300 bg-red-800/50 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;