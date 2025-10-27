// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // --- CHANGE #1: Initialize state from localStorage ---
  // When the app first loads, we try to get the user from localStorage.
  // JSON.parse turns the saved string back into an object.
  // If nothing is found, it defaults to null.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username) => {
    const userObject = { name: username };
    setUser(userObject);
    
    // --- CHANGE #2: Save user to localStorage on login ---
    // JSON.stringify turns the user object into a string so it can be stored.
    localStorage.setItem('user', JSON.stringify(userObject));
  };

  const logout = () => {
    setUser(null);
    
    // --- CHANGE #3: Remove user from localStorage on logout ---
    localStorage.removeItem('user');
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}