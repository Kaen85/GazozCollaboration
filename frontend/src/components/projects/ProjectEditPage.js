// src/components/projects/ProjectEditPage.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { 
  FiUserPlus, FiLoader, FiCheck, FiAlertTriangle, FiSave,
  FiUsers, FiTrash2, FiUser, FiGlobe, FiLock, FiSettings, FiShield, FiLayout, FiFileText
} from 'react-icons/fi';

export default function ProjectEditPage() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const { 
    currentProject, addMember, removeMember, currentMembers, 
    fetchMembers, updateProjectVisibility, updateTasksVisibility, 
    updateProjectDetails, deleteProject, updateMemberRole 
  } = useProjectContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState('viewer');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  const [isPublic, setIsPublic] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [tasksPublic, setTasksPublic] = useState(false);
  const [updatingTasks, setUpdatingTasks] = useState(false);

  const [removingId, setRemovingId] = useState(null); 
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
      setLongDescription(currentProject.long_description || ''); 
      setIsPublic(currentProject.is_public); 
      setTasksPublic(currentProject.is_tasks_public);
      fetchMembers(currentProject.id);
    }
  }, [currentProject]);

  if (!currentProject) return <div className="p-10 text-center"><FiLoader className="animate-spin text-primary" /></div>;

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsSavingDetails(true);
    setSaveMessage(null);
    try {
      await updateProjectDetails(currentProject.id, name, description, longDescription);
      setSaveMessage({ type: 'success', text: 'Project details updated successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update.';
      setSaveMessage({ type: 'error', text: errorMsg });
    } finally { setIsSavingDetails(false); }
  };

  const handleVisibilityToggle = async () => {
    setUpdatingVisibility(true);
    try {
      const newVisibility = !isPublic; 
      await updateProjectVisibility(currentProject.id, newVisibility);
      setIsPublic(newVisibility);
    } catch (error) { alert("Error: " + error.message); } finally { setUpdatingVisibility(false); }
  };

  const handleTasksVisibilityToggle = async () => {
    setUpdatingTasks(true);
    try {
      const newVisibility = !tasksPublic;
      await updateTasksVisibility(currentProject.id, newVisibility);
      setTasksPublic(newVisibility);
    } catch (error) { alert("Error: " + error.message); } finally { setUpdatingTasks(false); }
  };

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
    } catch (err) { setAddError(err.message); } finally { setIsAdding(false); }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setUpdatingRoleId(memberId);
    try {
      await updateMemberRole(currentProject.id, memberId, newRole);
    } catch (err) {
      alert("Failed to update role: " + err.message);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRemoveMember = async (memberId, memberUsername) => {
    if (window.confirm(`Remove ${memberUsername}?`)) {
      setRemovingId(memberId);
      try { await removeMember(currentProject.id, memberId); } 
      catch (err) { alert("Error: " + err.message); } finally { setRemovingId(null); }
    }
  };

  const handleDeleteProject = async () => {
    const confirmName = window.prompt(`To delete this project, type its name: "${currentProject.name}"`);
    if (confirmName === currentProject.name) {
      setIsDeletingProject(true);
      try {
        await deleteProject(currentProject.id);
        navigate('/dashboard');
      } catch (err) { alert("Failed to delete project: " + err.message); setIsDeletingProject(false); }
    } else if (confirmName !== null) { alert("Project name did not match."); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* BAŞLIK */}
      <div className="border-b border-border pb-4">
        <h2 className="text-3xl font-bold text-text-main flex items-center">
          <FiSettings className="mr-3 text-text-secondary" /> Project Settings
        </h2>
      </div>
      
      {/* 1. GENEL AYARLAR */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-xl font-bold text-text-main mb-6">General Settings</h3>
        <form onSubmit={handleDetailsSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Project Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-app border border-border rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors font-medium"/>
          </div>
        
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Short Description</label>
            <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-app border border-border rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center uppercase tracking-wide"><FiFileText className="mr-1"/> Long Description (Readme)</label>
             <textarea rows="6" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className="w-full bg-app border border-border rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary outline-none font-mono text-sm transition-colors" placeholder="Documentation..."/>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button type="submit" disabled={isSavingDetails} className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold flex items-center disabled:opacity-50 transition-colors shadow-md">
              {isSavingDetails ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-2"/>} Save Changes
            </button>
            {saveMessage && <span className={`text-sm font-bold ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{saveMessage.text}</span>}
          </div>
        </form>
      </div>

      {/* 2. GÖRÜNÜRLÜK (AYNI YAPI, RENKLER GÜNCELLENDİ) */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-text-main flex items-center">
               {isPublic ? <FiGlobe className="mr-2 text-green-500"/> : <FiLock className="mr-2 text-red-500"/>} Project Visibility
            </h3>
            <p className="text-text-secondary text-sm mt-1">{isPublic ? "Visible to everyone." : "Private. Only members can access."}</p>
          </div>
          <button onClick={handleVisibilityToggle} disabled={updatingVisibility} className={`px-4 py-2 rounded-lg font-bold border-2 transition-colors text-sm ${isPublic ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}>
            {updatingVisibility ? <FiLoader className="animate-spin"/> : (isPublic ? "Make Private" : "Make Public")}
          </button>
        </div>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-text-main flex items-center"><FiLayout className="mr-2 text-blue-500"/> Tasks Visibility</h3>
            <p className="text-text-secondary text-sm mt-1">{tasksPublic ? "Tasks are visible to public visitors." : "Tasks are hidden from public visitors."}</p>
          </div>
          <button onClick={handleTasksVisibilityToggle} disabled={updatingTasks} className={`px-4 py-2 rounded-lg font-bold border-2 transition-colors text-sm ${tasksPublic ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}>
            {updatingTasks ? <FiLoader className="animate-spin"/> : (tasksPublic ? "Hide Tasks" : "Show Tasks")}
          </button>
        </div>
      </div>

      {/* 3. ÜYE YÖNETİMİ */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-xl font-bold text-text-main mb-6 flex items-center"><FiUsers className="mr-2" /> Manage Team</h3>
        
        <form onSubmit={handleMemberSubmit} className="bg-app p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-3 items-end border border-border">
           <div className="flex-grow w-full">
            <label className="text-xs text-text-secondary uppercase font-bold mb-1 block">Username</label>
            <input type="text" value={usernameToAdd} onChange={(e) => setUsernameToAdd(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-main outline-none focus:border-primary transition-colors" placeholder="username"/>
          </div>
          <div className="w-full md:w-40">
            <label className="text-xs text-text-secondary uppercase font-bold mb-1 block">Role</label>
            <select value={roleToAdd} onChange={(e) => setRoleToAdd(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-main outline-none focus:border-primary cursor-pointer transition-colors">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <button disabled={isAdding} type="submit" className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center disabled:opacity-50 transition-colors shadow-sm">
             {isAdding ? <FiLoader className="animate-spin"/> : <FiUserPlus />}
          </button>
        </form>
        
        {(addSuccess || addError) && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-bold flex items-center ${addSuccess ? 'text-green-700 bg-green-100 border border-green-200' : 'text-red-700 bg-red-100 border border-red-200'}`}>
            {addSuccess ? <FiCheck className="mr-2"/> : <FiAlertTriangle className="mr-2"/>} {addSuccess || addError}
           </div>
        )}

        <div className="space-y-2">
          {currentMembers.length > 0 ? (
            currentMembers.map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-app border border-border flex items-center justify-center text-text-main font-bold mr-3">{member.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-text-main font-bold text-sm">{member.username}</p>
                    {member.role === 'owner' ? (
                      <span className="text-[10px] text-text-secondary bg-app px-2 py-0.5 rounded border border-border uppercase tracking-wider font-bold">Owner</span>
                  ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <select 
                          value={member.role} 
                          disabled={updatingRoleId === member.id}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="text-xs bg-app border border-border rounded px-2 py-1 text-text-main outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                        {updatingRoleId === member.id && <FiLoader className="animate-spin text-xs text-primary"/>}
                      </div>
                    )}
                  </div>
                </div>
                {member.role !== 'owner' && (
                  <button onClick={() => handleRemoveMember(member.id, member.username)} disabled={removingId === member.id} className="text-text-secondary hover:text-red-500 p-2 transition-colors">
                    {removingId === member.id ? <FiLoader className="animate-spin"/> : <FiTrash2 />}
                  </button>
                )}
              </div>
            ))
          ) : (<p className="text-text-secondary text-center py-4">No members yet.</p>)}
        </div>
      </div>

      {/* 4. TEHLİKE BÖLGESİ */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6 mt-10">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center mb-2"><FiShield className="mr-2" /> Danger Zone</h3>
        <p className="text-red-600/70 dark:text-gray-400 text-sm mb-6">Deleting this project will permanently remove all issues, comments, files, and member associations.</p>
        <div className="flex justify-end">
          <button onClick={handleDeleteProject} disabled={isDeletingProject} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 flex items-center">
             {isDeletingProject ? <FiLoader className="animate-spin mr-2"/> : <FiTrash2 className="mr-2"/>} Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}