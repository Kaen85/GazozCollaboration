import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// --- 1. IMPORT THE AUTHPROVIDER ---
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* --- 2. WRAP THE APP COMPONENT --- */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);