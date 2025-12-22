import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Başlangıçta localStorage'a bak, yoksa 'dark' olarak başlat (Siz şu an dark kullanıyorsunuz)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Eski class'ı temizle
    root.classList.remove('light', 'dark');
    
    // Yeni class'ı ekle
    root.classList.add(theme);
    
    // LocalStorage'a kaydet
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