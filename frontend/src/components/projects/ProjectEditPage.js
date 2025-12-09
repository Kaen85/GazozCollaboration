// src/components/projects/ProjectEditPage.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
// === DÜZELTME BURADA: 'FiFileText' EKLENDİ ===
import { 
  FiUserPlus, FiLoader, FiCheck, FiAlertTriangle, FiSave,
  FiUsers, FiTrash2, FiUser, FiGlobe, FiLock, FiSettings, FiShield, FiLayout, FiFileText
} from 'react-icons/fi';

export default function ProjectEditPage() {
  const { user } = useAuth(); 
  const navigate = useNavigate(); 
  
  const { 
    currentProject, 
    addMember, 
    removeMember,       
    currentMembers,   
    fetchMembers,
    updateProjectVisibility,
    updateTasksVisibility,
    updateProjectDetails, 
    deleteProject         
  } = useProjectContext();

  // --- 1. STATE TANIMLAMALARI ---

  // Genel Ayarlar Formu
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState(''); // Uzun açıklama state'i
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Invite Form
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState('viewer'); 
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  // Visibility
  const [isPublic, setIsPublic] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [tasksPublic, setTasksPublic] = useState(false);
  const [updatingTasks, setUpdatingTasks] = useState(false);

  // Member Remove
  const [removingId, setRemovingId] = useState(null); 
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // --- 2. VERİ YÜKLEME ---
  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
      setLongDescription(currentProject.long_description || ''); // Uzun açıklamayı yükle
      setIsPublic(currentProject.is_public); 
      setTasksPublic(currentProject.is_tasks_public);
      fetchMembers(currentProject.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  if (!currentProject) return <div className="p-10 text-center"><FiLoader className="animate-spin text-blue-500" /></div>;

  // --- 3. FONKSİYONLAR ---

  // Proje Adı/Açıklama Güncelleme
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsSavingDetails(true);
    setSaveMessage(null);
    try {
      // updateProjectDetails fonksiyonunun 'longDescription'ı aldığından emin olun
      await updateProjectDetails(currentProject.id, name, description, longDescription);
      setSaveMessage({ type: 'success', text: 'Project details updated successfully!' });
    } catch (err) {
      console.error(err);
      // Backend'den gelen gerçek hata mesajını göster
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update.';
      setSaveMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Görünürlük Değiştirme
  const handleVisibilityToggle = async () => {
    setUpdatingVisibility(true);
    try {
      const newVisibility = !isPublic; 
      await updateProjectVisibility(currentProject.id, newVisibility);
      setIsPublic(newVisibility); 
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleTasksVisibilityToggle = async () => {
    setUpdatingTasks(true);
    try {
      const newVisibility = !tasksPublic;
      await updateTasksVisibility(currentProject.id, newVisibility);
      setTasksPublic(newVisibility);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUpdatingTasks(false);
    }
  };

  // Üye Ekleme
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!usernameToAdd) return;
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const addedMember = await addMember(currentProject.id, usernameToAdd, roleToAdd);
      setAddSuccess(`Added ${addedMember.username} as ${addedMember.role}.`);
      setUsernameToAdd(''); 
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Üye Çıkarma
  const handleRemoveMember = async (memberId, memberUsername) => {
    if (window.confirm(`Remove ${memberUsername}?`)) {
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

  // Proje Silme
  const handleDeleteProject = async () => {
    const confirmName = window.prompt(`To delete this project, type its name: "${currentProject.name}"`);
    if (confirmName === currentProject.name) {
      setIsDeletingProject(true);
      try {
        await deleteProject(currentProject.id);
        navigate('/dashboard'); // Ana sayfaya yönlendir
      } catch (err) {
        alert("Failed to delete project: " + err.message);
        setIsDeletingProject(false);
      }
    } else if (confirmName !== null) {
      alert("Project name did not match.");
    }
  };

  // --- 4. RENDER ---
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* BAŞLIK */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <FiSettings className="mr-3 text-gray-400" />
          Project Settings
        </h2>
      </div>
      
      {/* 1. GENEL AYARLAR (AD & AÇIKLAMA) */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          
          {/* İsim */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          {/* Kısa Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Short Description (Header)</label>
            <textarea 
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Uzun Açıklama (Readme) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
              <FiFileText className="mr-1"/> Long Description (Readme / Files Tab)
            </label>
            <textarea 
              rows="6"
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              placeholder="Detailed project documentation, instructions, or readme content..."
            />
          </div>

          <div className="flex items-center justify-between">
            <button 
              type="submit" 
              disabled={isSavingDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center disabled:opacity-50"
            >
              {isSavingDetails ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-2"/>}
              Save Changes
            </button>
            {saveMessage && (
              <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {saveMessage.text}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. GÖRÜNÜRLÜK AYARLARI */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Proje Görünürlüğü */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              {isPublic ? <FiGlobe className="mr-2 text-green-400"/> : <FiLock className="mr-2 text-red-400"/>}
              Project Visibility
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {isPublic ? "Visible to everyone." : "Private. Only members can access."}
            </p>
          </div>
          <button onClick={handleVisibilityToggle} disabled={updatingVisibility} className={`px-4 py-2 rounded-lg font-medium border transition-colors ${isPublic ? 'border-red-500 text-red-400 hover:bg-red-900/20' : 'border-green-500 text-green-400 hover:bg-green-900/20'}`}>
            {updatingVisibility ? <FiLoader className="animate-spin"/> : (isPublic ? "Make Private" : "Make Public")}
          </button>
        </div>

        {/* Görev Görünürlüğü */}
        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FiLayout className="mr-2 text-blue-400"/>
              Tasks Visibility
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {tasksPublic ? "Tasks are visible to public visitors." : "Tasks are hidden from public visitors."}
            </p>
          </div>
          <button onClick={handleTasksVisibilityToggle} disabled={updatingTasks} className={`px-4 py-2 rounded-lg font-medium border transition-colors ${tasksPublic ? 'border-red-500 text-red-400 hover:bg-red-900/20' : 'border-green-500 text-green-400 hover:bg-green-900/20'}`}>
            {updatingTasks ? <FiLoader className="animate-spin"/> : (tasksPublic ? "Hide Tasks" : "Show Tasks")}
          </button>
        </div>
      </div>

      {/* 3. ÜYE YÖNETİMİ */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FiUsers className="mr-2" /> Manage Team
        </h3>
        
        {/* Üye Ekleme Formu */}
        <form onSubmit={handleMemberSubmit} className="bg-gray-900 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-grow w-full">
            <label className="text-xs text-gray-500 uppercase font-bold">Username</label>
            <input 
              type="text" 
              value={usernameToAdd} 
              onChange={(e) => setUsernameToAdd(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
              placeholder="username"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="text-xs text-gray-500 uppercase font-bold">Role</label>
            <select 
              value={roleToAdd} 
              onChange={(e) => setRoleToAdd(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <button disabled={isAdding} type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold flex items-center justify-center disabled:opacity-50">
            {isAdding ? <FiLoader className="animate-spin"/> : <FiUserPlus />}
          </button>
        </form>
        
        {/* Hata/Başarı Mesajları */}
        {(addSuccess || addError) && (
          <div className={`mb-4 p-2 rounded text-sm flex items-center ${addSuccess ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
            {addSuccess ? <FiCheck className="mr-2"/> : <FiAlertTriangle className="mr-2"/>}
            {addSuccess || addError}
          </div>
        )}

        {/* Üye Listesi */}
        <div className="space-y-2">
          {currentMembers.length > 0 ? (
            currentMembers.map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 bg-gray-750 border border-gray-600 rounded hover:bg-gray-700 transition">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold mr-3">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{member.username}</p>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-600 capitalize">
                      {member.role}
                    </span>
                  </div>
                </div>
                {member.role !== 'owner' && (
                  <button 
                    onClick={() => handleRemoveMember(member.id, member.username)}
                    disabled={removingId === member.id}
                    className="text-gray-500 hover:text-red-500 p-2"
                  >
                    {removingId === member.id ? <FiLoader className="animate-spin"/> : <FiTrash2 />}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No members yet.</p>
          )}
        </div>
      </div>

      {/* 4. TEHLİKE BÖLGESİ */}
      <div className="bg-red-900/10 border border-red-900/50 rounded-xl p-6 mt-10">
        <h3 className="text-xl font-bold text-red-500 flex items-center mb-2">
          <FiShield className="mr-2" /> Danger Zone
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Deleting this project will permanently remove all issues, comments, files, and member associations. This action cannot be undone.
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleDeleteProject}
            disabled={isDeletingProject}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
          >
            {isDeletingProject ? <FiLoader className="animate-spin mr-2"/> : <FiTrash2 className="mr-2"/>}
            Delete Project
          </button>
        </div>
      </div>

    </div>
  );
}