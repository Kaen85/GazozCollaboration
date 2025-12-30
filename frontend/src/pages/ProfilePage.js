// src/pages/ProfilePage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiCamera, FiSave, FiLoader, FiCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Yeni şifre (boşsa değişmez)
  
  // Resim işlemleri
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      if (user.profile_picture) {
        setPreviewUrl(`http://localhost:5000/${user.profile_picture}`);
      }
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Önizleme oluştur
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (password) formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);

      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword(''); // Şifre alanını temizle
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto w-full py-6">
        
        <h1 className="text-3xl font-black text-text-main mb-8">My Profile</h1>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* AVATAR UPLOAD SECTION */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-4 border-app overflow-hidden bg-app flex items-center justify-center shadow-lg relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-text-secondary">{username.charAt(0).toUpperCase()}</span>
                  )}
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                    <FiCamera className="text-white text-3xl opacity-80" />
                  </div>
                </div>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-text-secondary mt-3 font-medium">Click photo to change</p>
            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Username</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-text-secondary group-focus-within:text-primary"/>
                    </div>
                    <input 
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-app border border-border rounded-xl text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-text-secondary group-focus-within:text-primary"/>
                    </div>
                    <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-app border border-border rounded-xl text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">New Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-text-secondary group-focus-within:text-primary"/>
                    </div>
                    <input 
                    type="password" 
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-10 pr-4 py-3 bg-app border border-border rounded-xl text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                </div>
              </div>
            
            </div>

            {/* MESSAGE AREA */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message.type === 'success' ? <FiCheck className="mr-2"/> : <FiLoader className="mr-2"/>}
                    {message.text}
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end pt-4 border-t border-border">
                <button 
                type="submit" 
                disabled={loading}
                className="flex items-center px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70"
                >
                {loading ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-2"/>}
                Save Changes
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}