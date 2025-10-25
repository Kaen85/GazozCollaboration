import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --------------------------
// Simple auth utility
// --------------------------
const authKey = "project_collab_auth_user";
const saveAuth = (user) => localStorage.setItem(authKey, JSON.stringify(user));
const clearAuth = () => localStorage.removeItem(authKey);
const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(authKey));
  } catch {
    return null;
  }
};

// --------------------------
// Login Page Component
// --------------------------
const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --------------------------
  // Login handler
  // --------------------------
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    // Demo auth object
    saveAuth({ username });
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Project Collaboration Hub - Login
        </h1>
        <form onSubmit={handleLogin}>
          <label className="block mb-2 text-sm">Username</label>
          <input
            className="w-full p-2 mb-4 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoFocus
          />
          <label className="block mb-2 text-sm">Password</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {error && <div className="text-red-600 mb-3">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded bg-indigo-600 text-white font-medium"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          Demo mode: any non-empty input allows login.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
export { getAuth, clearAuth }; // reusable auth functions
