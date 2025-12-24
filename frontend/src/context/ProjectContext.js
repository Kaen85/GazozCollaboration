import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Backend adresi
const API_URL = 'http://localhost:5000/api/projects';

export const ProjectContext = createContext();
export const useProjectContext = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardTasks, setDashboardTasks] = useState([]);
  
  // Token'ı AuthContext'ten alıyoruz
  const { token, logout } = useAuth();

  // --- ESKİ USUL: HEADER'I ELLE EKLEME ---
  const getAuthHeaders = () => {
    const storedToken = localStorage.getItem('token'); // Token'ı direkt depodan alalım, daha garanti.
    if (!storedToken) return {}; 
    return { 
        headers: { 
            'x-auth-token': storedToken // Backend x-auth-token bekliyor
        } 
    };
  };

  const handleError = (err) => {
    const message = err.response?.data?.message || 'Bir hata oluştu.';
    setError(message);
    if (err.response?.status === 401) {
        logout();
    }
  };
  
  // --- PROJE FONKSİYONLARI ---

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setProjects(response.data);
    } catch (err) { handleError(err); } 
    finally { setLoading(false); }
  };

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/my-projects`, getAuthHeaders());
      setMyProjects(response.data); 
    } catch (err) { handleError(err); } 
    finally { setLoading(false); }
  };

  const fetchSharedProjects = async () => {
  setLoading(true);
  try {
    // Bu istek backend'de güncellediğimiz /shared-projects rotasına gitmeli
    const response = await axios.get(`${API_URL}/shared-projects`, getAuthHeaders()); 
    // Gelen veri sadece üye olduğunuz projeleri içerecektir
    setSharedProjects(response.data.projects || response.data); 
  } catch (err) { 
    handleError(err);
  } finally { 
    setLoading(false);
  }
};

  const createProject = async (name, description) => {
    setLoading(true);
    try {
      const response = await axios.post(API_URL, { name, description }, getAuthHeaders());
      setProjects(prev => [response.data, ...prev]);
      setMyProjects(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) { handleError(err); throw err; } 
    finally { setLoading(false); }
  };

  const fetchProjectById = async (projectId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${projectId}`, getAuthHeaders());
      setCurrentProject(response.data);
    } catch (err) { handleError(err); } 
    finally { setLoading(false); }
  };

  const updateProjectVisibility = async (projectId, isPublic) => {
    try {
      const response = await axios.put(`${API_URL}/${projectId}/visibility`, { is_public: isPublic }, getAuthHeaders());
      setCurrentProject(response.data);
      return response.data; 
    } catch (err) { handleError(err); throw err; }
  };



  const fetchDashboardTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user/all-tasks`, getAuthHeaders());
      setDashboardTasks(response.data);
    } catch (err) { handleError(err); } 
    finally { setLoading(false); }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/tasks`, getAuthHeaders());
      return response.data;
    } catch (err) { if(err.response?.status !== 403) handleError(err); }
  };

  const createTask = async (projectId, taskData) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}/tasks`, taskData, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); }
  };

  const updateTaskStatus = async (projectId, taskId, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/${projectId}/tasks/${taskId}`, { status: newStatus }, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); }
  };

  const updateTask = async (projectId, taskId, data) => {
    try {
      const response = await axios.put(`${API_URL}/${projectId}/tasks/${taskId}`, data, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  const deleteTask = async (projectId, taskId) => {
    try {
      await axios.delete(`${API_URL}/${projectId}/tasks/${taskId}`, getAuthHeaders());
      return true;
    } catch (err) { handleError(err); throw err; }
  };


  const fetchMembers = async (projectId) => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}/members`, getAuthHeaders());
        setCurrentMembers(response.data);
        return response.data;
    } catch (err) { handleError(err); }
  };

  const addMember = async (projectId, username, role) => {
    try {
        const response = await axios.post(`${API_URL}/${projectId}/members`, { username, role }, getAuthHeaders());
        setCurrentMembers(prev => [...prev, response.data]);
        return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  const removeMember = async (projectId, userId) => {
    try {
        await axios.delete(`${API_URL}/${projectId}/members/${userId}`, getAuthHeaders());
        setCurrentMembers(prev => prev.filter(m => m.id !== userId));
        return true;
    } catch (err) { handleError(err); throw err; }
  };

  const updateProjectDetails = async (projectId, name, description, longDescription) => {
    try {
        const response = await axios.put(`${API_URL}/${projectId}`, { name, description, long_description: longDescription }, getAuthHeaders());
        setCurrentProject(response.data);
        return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  const updateTasksVisibility = async (projectId, isPublic) => {
    try {
        const response = await axios.put(`${API_URL}/${projectId}/settings/tasks-visibility`, { is_tasks_public: isPublic }, getAuthHeaders());
        setCurrentProject(prev => ({...prev, is_tasks_public: response.data.is_tasks_public}));
    } catch (err) { handleError(err); }
  };

  const fetchIssues = async (projectId) => {
    try { return (await axios.get(`${API_URL}/${projectId}/issues`, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const createIssue = async (projectId, text) => {
    try { return (await axios.post(`${API_URL}/${projectId}/issues`, {text}, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const updateIssue = async (projectId, issueId, data) => {
    try { return (await axios.put(`${API_URL}/${projectId}/issues/${issueId}`, data, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const fetchComments = async (projectId) => {
    try { return (await axios.get(`${API_URL}/${projectId}/comments`, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const addComment = async (projectId, text) => {
    try { return (await axios.post(`${API_URL}/${projectId}/comments`, {text}, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const likeComment = async (projectId, commentId) => {
    try { return (await axios.post(`${API_URL}/${projectId}/comments/${commentId}/like`, {}, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const deleteComment = async (projectId, commentId) => {
    try { await axios.delete(`${API_URL}/${projectId}/comments/${commentId}`, getAuthHeaders()); return true; } catch (e) { handleError(e); }
  };
  const editComment = async (projectId, commentId, text) => {
    try { return (await axios.put(`${API_URL}/${projectId}/comments/${commentId}`, {text}, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const fetchIssueComments = async (projectId, issueId) => {
    try { return (await axios.get(`${API_URL}/${projectId}/issues/${issueId}/comments`, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const addIssueComment = async (projectId, issueId, text) => {
    try { return (await axios.post(`${API_URL}/${projectId}/issues/${issueId}/comments`, {text}, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const fetchFiles = async (projectId) => {
    try { return (await axios.get(`${API_URL}/${projectId}/files`, getAuthHeaders())).data; } catch (e) { handleError(e); }
  };
  const uploadFile = async (projectId, file) => {
    try { 
        const fd = new FormData(); fd.append('file', file);
        return (await axios.post(`${API_URL}/${projectId}/files`, fd, { headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data'} })).data; 
    } catch (e) { handleError(e); }
  };
  const deleteFile = async (projectId, fileId) => {
    try { await axios.delete(`${API_URL}/${projectId}/files/${fileId}`, getAuthHeaders()); return true; } catch (e) { handleError(e); }
  };

  const value = {
    projects, currentProject, myProjects, sharedProjects, loading, error, dashboardTasks, currentMembers,
    fetchProjects, fetchMyProjects, fetchSharedProjects, createProject, fetchProjectById, updateProjectVisibility,
    fetchDashboardTasks, fetchTasks, createTask, updateTaskStatus, updateTask, deleteTask,
    fetchMembers, addMember, removeMember, updateProjectDetails, updateTasksVisibility,
    fetchIssues, createIssue, updateIssue, fetchComments, addComment, likeComment, deleteComment, editComment,
    fetchIssueComments, addIssueComment, fetchFiles, uploadFile, deleteFile
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};