// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiLoader } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // URL'den token'ı al
  
  const { resetPassword, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, newPassword);
      alert('Password reset successful! You can now login.');
      navigate('/login');
    } catch (err) {
      // Error context'te işlenir
    }
  };

  if (!token) return <div className="text-white text-center mt-20">Invalid Link</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Set New Password</h2>
        
        {error && <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-500" />
            <input
              type="password"
              required
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button disabled={loading} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold flex justify-center">
            {loading ? <FiLoader className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}