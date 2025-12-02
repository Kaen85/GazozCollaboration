// src/components/projects/ProjectEditPage.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext'; 
import { 
  FiUserPlus, FiLoader, FiCheck, FiAlertTriangle, 
  FiUsers, FiTrash2, FiUser, FiGlobe, FiLock, FiSettings, FiShield 
} from 'react-icons/fi';

export default function ProjectEditPage() {
  const { user } = useAuth(); 
  
  const { 
    currentProject, 
    addMember, 
    removeMember,       
    currentMembers,   
    fetchMembers,
    updateProjectVisibility 
  } = useProjectContext();

  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState('viewer'); 
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  // Public/Private State'leri
  const [isPublic, setIsPublic] = useState(currentProject?.is_public || false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const [removingId, setRemovingId] = useState(null); 

  // Proje verisi değiştiğinde state'leri güncelle
  useEffect(() => {
    if (currentProject) {
      fetchMembers(currentProject.id);
      setIsPublic(currentProject.is_public); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="flex justify-center items-center p-12">
        <FiLoader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  // Görünürlük Değiştirme Fonksiyonu
  const handleVisibilityToggle = async () => {
    setUpdatingVisibility(true);
    try {
      const newVisibility = !isPublic; 
      await updateProjectVisibility(currentProject.id, newVisibility);
      setIsPublic(newVisibility); 
    } catch (error) {
      console.error("Failed to update visibility", error);
      alert("Error updating visibility: " + error.message);
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!usernameToAdd) {
      setAddError('Please enter a username.');
      return;
    }
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const addedMember = await addMember(currentProject.id, usernameToAdd, roleToAdd);
      setAddSuccess(`Successfully added ${addedMember.username} as ${addedMember.role}.`);
      setUsernameToAdd(''); 
      setRoleToAdd('viewer'); 
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId, memberUsername) => {
    if (window.confirm(`Are you sure you want to remove ${memberUsername} from this project?`)) {
      setRemovingId(memberId); 
      try {
        await removeMember(currentProject.id, memberId);
      } catch (err) {
        alert("Error: " + err.message); 
      } finally {
        setRemovingId(null); 
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <FiSettings className="mr-3 text-gray-400" />
          Project Settings
        </h2>
        <p className="text-gray-400 mt-1">Manage access, members, and general settings.</p>
      </div>
      
      {/* === 1. BÖLÜM: PROJE GÖRÜNÜRLÜĞÜ === */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              {isPublic ? <FiGlobe className="mr-2 text-green-400" /> : <FiLock className="mr-2 text-red-400" />}
              Project Visibility
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {isPublic 
                ? "Your project is currently visible to everyone on the platform."
                : "Your project is currently private. Only invited members can access it."}
            </p>
          </div>
          
          <button
            onClick={handleVisibilityToggle}
            disabled={updatingVisibility}
            className={`flex items-center justify-center px-5 py-2.5 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 ${
              isPublic
                ? 'bg-gray-700 hover:bg-red-900/30 text-red-400 border border-gray-600 hover:border-red-800 focus:ring-red-500'
                : 'bg-gray-700 hover:bg-green-900/30 text-green-400 border border-gray-600 hover:border-green-800 focus:ring-green-500'
            }`}
          >
            {updatingVisibility ? (
              <FiLoader className="animate-spin mr-2" />
            ) : isPublic ? (
              <><FiLock className="mr-2" /> Make Private</>
            ) : (
              <><FiGlobe className="mr-2" /> Make Public</>
            )}
          </button>
        </div>
      </div>

      {/* === 2. BÖLÜM: ÜYE YÖNETİMİ (EKLEME VE LİSTELEME) === */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FiUserPlus className="mr-2 text-blue-400" />
            Invite Members
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Collaborate with others by adding them to your project.
          </p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleMemberSubmit} className="bg-gray-900/50 p-5 rounded-lg border border-gray-700/50 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label htmlFor="shareUsername" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="shareUsername"
                    value={usernameToAdd}
                    onChange={(e) => {
                      setUsernameToAdd(e.target.value);
                      setAddError(null); 
                      setAddSuccess(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-500"
                    placeholder="Enter username..."
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label htmlFor="shareRole" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Role
                </label>
                <select
                  id="shareRole"
                  value={roleToAdd}
                  onChange={(e) => setRoleToAdd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                  style={{ backgroundImage: 'none' }} // Varsayılan oku kaldırıp custom stil eklenebilir
                >
                  <option value="viewer">Viewer (Read-Only)</option>
                  <option value="editor">Editor (Can Edit)</option>
                </select>
              </div>

              <div className="w-full md:w-auto">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAdding ? <FiLoader className="animate-spin" /> : 'Add'}
                </button>
              </div>
            </div>
            
            {/* Bildirim Mesajları */}
            {(addSuccess || addError) && (
              <div className={`mt-4 p-3 rounded-lg text-sm flex items-center ${addSuccess ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'}`}>
                {addSuccess ? <FiCheck className="mr-2 flex-shrink-0" size={16} /> : <FiAlertTriangle className="mr-2 flex-shrink-0" size={16} />}
                {addSuccess || addError}
              </div>
            )}
          </form>

          {/* Mevcut Üyeler Listesi */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <FiUsers className="mr-2" /> Current Team ({currentMembers.length})
            </h4>
            
            <div className="space-y-2">
              {currentMembers.length > 0 ? (
                currentMembers.map(member => (
                  <div key={member.id} className="group flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${member.role === 'owner' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-700 text-gray-300'}`}>
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.username}</p>
                        <div className="flex items-center mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            member.role === 'owner' ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' :
                            member.role === 'editor' ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' :
                            'bg-gray-700 text-gray-400 border-gray-600'
                          }`}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.username)}
                        disabled={removingId === member.id}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                        title="Remove member"
                      >
                        {removingId === member.id ? <FiLoader className="animate-spin" /> : <FiTrash2 size={18} />}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                  <FiUsers className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                  <p className="text-gray-500">This project has no other members yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* === 3. BÖLÜM: TEHLİKE ALANI === */}
      <div className="bg-gray-800 rounded-xl border border-red-900/30 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-red-500 flex items-center mb-2">
            <FiShield className="mr-2" /> Danger Zone
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Deleting this project will permanently remove all issues, comments, and member associations. This action cannot be undone.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => alert('Proje silme fonksiyonu eklenecek!')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}