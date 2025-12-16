// src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Varsayılan olarak localStorage'a bak, yoksa 'dark' yap
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Tema değiştiğinde HTML etiketini güncelle
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Önce eski class'ı sil
    root.classList.remove('light', 'dark');
    
    // Yeni class'ı ekle
    root.classList.add(theme);
    
    // Hafızaya kaydet
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};