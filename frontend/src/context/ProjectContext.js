// src/context/ProjectContext.js

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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
  const { token, logout } = useAuth();

  // --- YARDIMCI FONKSİYONLAR ---
  const getAuthHeaders = () => {
    if (!token) throw new Error('Token not found. Please log in.');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };
  const handleError = (err) => {
    const message = err.response?.data?.message || 'An error occurred.';
    setError(message);
    if (err.response?.status === 401) logout();
    throw new Error(message);
  };
  
  // --- PROJE LİSTESİ FONKSİYONLARI ---
  
  // (Dashboard için)
  const fetchProjects = async () => {
    if (!token) return; 
    setLoading(true);
    setError(null);
    try {
      console.log("Context: Fetching ALL projects (GET /api/projects)...");
      const response = await axios.get(API_URL, getAuthHeaders());
      setProjects(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // (MyProjectsPage için)
  const fetchMyProjects = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Context: Fetching MY projects (GET /api/projects/my-projects)...");
      const response = await axios.get(`${API_URL}/my-projects`, getAuthHeaders());
      setMyProjects(response.data); 
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // (SharedProjectsPage için)
  const fetchSharedProjects = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Context: Fetching SHARED projects (GET /api/projects/shared-projects)...");
      const response = await axios.get(`${API_URL}/shared-projects`, getAuthHeaders());
      setSharedProjects(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Proje oluşturma
  const createProject = async (name, description) => {
    setLoading(true);
    try {
      const response = await axios.post(API_URL, { name, description }, getAuthHeaders());
      // Yeni proje geldi, state'leri güncelle
      setProjects(prev => [response.data, ...prev]);
      setMyProjects(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      handleError(err);
      throw err; // Hatanın modal'da yakalanması için
    } finally {
      setLoading(false);
    }
  };

  // Proje detayını getir
  const fetchProjectById = async (projectId) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      console.log(`Context: Fetching project by ID: ${projectId}`);
      const response = await axios.get(`${API_URL}/${projectId}`, getAuthHeaders());
      setCurrentProject(response.data);
    } catch (err) {
      handleError(err);
      throw err; // Hatanın ProjectDetailPage'de yakalanması için
    } finally {
      setLoading(false);
    }
  };

  // Proje görünürlüğünü güncelle
  const updateProjectVisibility = async (projectId, isPublic) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/visibility`, 
        { is_public: isPublic }, 
        getAuthHeaders()
      );
      // 'currentProject' state'ini güncelle
      setCurrentProject(response.data);
      return response.data; 
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateTask = async (projectId, taskId, data) => {
    try {
      const response = await axios.put(`${API_URL}/${projectId}/tasks/${taskId}`, data, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  // Görevi Sil
  const deleteTask = async (projectId, taskId) => {
    try {
      await axios.delete(`${API_URL}/${projectId}/tasks/${taskId}`, getAuthHeaders());
      return true;
    } catch (err) { handleError(err); throw err; }
  };
  
  // --- ISSUE FONKSİYONLARI ---
  const fetchIssues = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/issues`, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };
  
  const createIssue = async (projectId, text) => {
     try {
       const response = await axios.post(`${API_URL}/${projectId}/issues`, { text }, getAuthHeaders());
       return response.data;
     } catch (err) { handleError(err); throw err; }
  };
  
  const updateIssue = async (projectId, issueId, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/issues/${issueId}`, 
        data, 
        getAuthHeaders()
      );
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };
  
  // --- YORUM FONKSİYONLARI ---
  const fetchComments = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/comments`, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  const addComment = async (projectId, text) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}/comments`, { text }, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  const fetchIssueComments = async (projectId, issueId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/issues/${issueId}/comments`, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  const addIssueComment = async (projectId, issueId, text) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}/issues/${issueId}/comments`, { text }, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); throw err; }
  };

  // --- ÜYE FONKSİYONLARI ---
  const fetchMembers = async (projectId) => {
  try {
     const response = await axios.get(`${API_URL}/${projectId}/members`, getAuthHeaders());
     setCurrentMembers(response.data); // Global state'i güncelle
     return response.data; // (Yine de döndürebilir, opsiyonel)
  } catch (err) { handleError(err); throw err; }
};
  
  // === GÜNCELLEME BURADA: 'addMember' artık 'role' (rol) alıyor ===
  const addMember = async (projectId, username, role) => {
   try {
     const response = await axios.post(
       `${API_URL}/${projectId}/members`, 
       { username: username, role: role }, 
       getAuthHeaders()
     );
     // Yeni üyeyi global listeye ekle
     setCurrentMembers(prev => [...prev, response.data]);
     return response.data;
   } catch (err) { 
     handleError(err); 
     throw err; 
   }
};
// === YENİ FONKSİYON: ÜYE ÇIKAR ===
const removeMember = async (projectId, userId) => {
  try {
    await axios.delete(
      `${API_URL}/${projectId}/members/${userId}`,
      getAuthHeaders()
    );
    // Üyeyi global listeden çıkar
    setCurrentMembers(prev => prev.filter(member => member.id !== userId));
    return true; // Başarılı
  } catch (err) {
    handleError(err);
    throw err;
  }
};

  // === YORUM YÖNETİMİ FONKSİYONLARI (BEĞEN/DÜZENLE/SİL) ===

  const likeComment = async (projectId, commentId) => {
    try {
      const response = await axios.post(
        `${API_URL}/${projectId}/comments/${commentId}/like`, 
        {}, 
        getAuthHeaders()
      );
      return response.data; 
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const editComment = async (projectId, commentId, text) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/comments/${commentId}`, 
        { text: text }, 
        getAuthHeaders()
      );
      return response.data; 
    } catch (err) {
      handleError(err);
      throw err; 
    }
  };

  const deleteComment = async (projectId, commentId) => {
    try {
      await axios.delete(
        `${API_URL}/${projectId}/comments/${commentId}`, 
        getAuthHeaders()
      );
      return true; // Başarılı
    } catch (err) {
      handleError(err);
      throw err;
    }
  };
  const fetchFiles = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/files`, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); }
  };

  const uploadFile = async (projectId, fileObj) => {
    try {
      // Dosya yüklerken JSON değil 'FormData' kullanılır
      const formData = new FormData();
      formData.append('file', fileObj); // Backend 'file' ismini bekliyor

      const response = await axios.post(
        `${API_URL}/${projectId}/files`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' // Bu header çok önemli
          }
        }
      );
      return response.data;
    } catch (err) { 
      handleError(err); 
      throw err; 
    }
  };

  const deleteFile = async (projectId, fileId) => {
    try {
      await axios.delete(`${API_URL}/${projectId}/files/${fileId}`, getAuthHeaders());
      return true;
    } catch (err) { handleError(err); }
  };
  const updateTasksVisibility = async (projectId, isPublic) => {
    try {
      const response = await axios.put(`${API_URL}/${projectId}/settings/tasks-visibility`, { is_tasks_public: isPublic }, getAuthHeaders());
      // Mevcut projeyi güncelle ki arayüz anlasın
      setCurrentProject(prev => ({ ...prev, is_tasks_public: response.data.is_tasks_public }));
    } catch (err) { handleError(err); }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/tasks`, getAuthHeaders());
      return response.data;
    } catch (err) { 
      // Eğer 403 (Yasak) dönerse, boş dizi döndür ama hatayı fırlatma (UI halledecek)
      if (err.response && err.response.status === 403) return null;
      handleError(err); 
    }
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
  
  const updateProjectDetails = async (projectId, name, description, longDescription) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}`, 
        { name, description, long_description: longDescription }, // Backend 'long_description' bekliyor
        getAuthHeaders()
      );
      setCurrentProject(response.data);
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Context'in sağlayacağı tüm değerler
  const value = {
    projects,
    currentProject,
    myProjects,
    sharedProjects,
    loading,
    error,
    
    fetchProjects,
    fetchMyProjects,
    fetchSharedProjects,
    fetchProjectById,
    createProject,
    updateProjectVisibility,
    fetchIssues,
    createIssue,
    updateIssue,
    fetchComments,
    addComment,
    fetchIssueComments,
    addIssueComment,
    fetchMembers,
    addMember, 
    currentMembers,
    removeMember,
    likeComment,
    editComment,
    deleteComment,
    fetchFiles,
    uploadFile,
    deleteFile,
    updateTasksVisibility,
    fetchTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    updateProjectDetails
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};