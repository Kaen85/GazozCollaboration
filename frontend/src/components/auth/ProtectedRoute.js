// src/components/auth/ProtectedRoute.js

import React from 'react';
// Navigate component is used for declarative redirection
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// This component acts as a gatekeeper.
// It receives the component to be protected as 'children'.
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // If the user is not logged in (user is null),
    // render the Navigate component to redirect them to the login page.
    // The 'replace' prop prevents the user from going back to the protected page using the browser's back button.
    return <Navigate to="/" replace />;
  }

  // If the user is logged in, render the children (the component they were trying to access).
  return children;
}

export default ProtectedRoute;