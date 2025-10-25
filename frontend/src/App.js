import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage, { getAuth } from "./pages/LoginPage";
import Home from "./pages/Home";

/**
 * ProtectedRoute Component
 * - Wraps around routes that require authentication
 * - If user is not logged in, redirects to Login page
 */
function ProtectedRoute({ children }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/" replace />;
  return children;
}

/**
 * Main App Component
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Home Page (protected) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect any unknown route to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
