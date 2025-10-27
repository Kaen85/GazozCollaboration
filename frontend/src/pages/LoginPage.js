// src/pages/LoginPage.js

import React, { useState, useEffect } from 'react'; // Add useEffect
import { useNavigate } from 'react-router-dom';
// We don't need axios for the mock login
// import axios from 'axios'; 
import { FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // Get the login function and user state from the context
  const { login, user } = useAuth();

  // This function now updates the global state instead of making an API call
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Call the global login function from our context with the entered username
    login(username); 
  };

  // This effect runs whenever the 'user' object in our context changes.
  useEffect(() => {
    // If the user object is not null (meaning login was successful), navigate.
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]); // Dependencies for the effect

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome to the Project Hub
          </p>
        </div>
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
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;