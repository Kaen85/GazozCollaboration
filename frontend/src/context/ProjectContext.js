// src/context/ProjectContext.js (TAM VE EKSİKSİZ HALİ)

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:5000/api/projects';

export const ProjectContext = createContext();

export const useProjectContext = () => {
  return useContext(ProjectContext);
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth(); // AuthContext'ten token'ı al

  // === YARDIMCI FONKSİYONLAR ===

  // Token (Yetki) başlığını oluşturan helper
  const getAuthHeaders = () => {
    // Token'ı KONTROL ET
    // Sayfa yenilendiğinde, 'token' state'i localStorage'dan anında yüklenir
    // Eğer 'token' HÂLÂ yoksa, 'return' et
    if (!token) {
      console.error("getAuthHeaders: Token not found!");
      // Bu hatayı fırlatmak, 'catch' bloklarını tetikler
      throw new Error('Token not found. Please log in.');
    }
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  // Hata yönetimi helper'ı
  const handleError = (err) => {
    const message = err.response?.data?.message || 'An error occurred.';
    setError(message);
    if (err.response?.status === 401) logout(); // Token geçersizse (örn: süresi dolmuşsa) çıkış yap
    throw new Error(message);
  };

  // === PROJE LİSTESİ FONKSİYONLARI (SORUNUN ÇÖZÜMÜ) ===

  // Dashboard için (Tüm projeler)
  const fetchProjects = async () => {
    if (!token) return; // Token yoksa (ilk yüklemede) dur
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

  // MyProjectsPage için (Sadece sahibi olduklarım)
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

  // SharedProjectsPage için (Sadece paylaşılanlar)
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

  // === TEK PROJE FONKSİYONLARI ===

  // Proje oluşturma
  const createProject = async (name, description) => {
    setLoading(true); // Yüklemeyi global olarak ayarla
    try {
      const response = await axios.post(API_URL, { name, description }, getAuthHeaders());
      // Yeni proje geldi, state'leri güncelle
      setProjects(prev => [response.data, ...prev]);
      setMyProjects(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Proje detay
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
    } finally {
      setLoading(false);
    }
  };
  
  // ... (Issues, Comments, Members fonksiyonları) ...
  // (Buraya kopyalamadım ama sizin dosyanızda olmalılar)
  const fetchIssues = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/issues`, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); }
  };
  
  const createIssue = async (projectId, text) => {
     try {
       const response = await axios.post(`${API_URL}/${projectId}/issues`, { text }, getAuthHeaders());
       return response.data;
     } catch (err) { handleError(err); }
  };

  const fetchComments = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/comments`, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); }
  };

  const addComment = async (projectId, text) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}/comments`, { text }, getAuthHeaders());
      return response.data;
    } catch (err) { handleError(err); }
  };

  const fetchMembers = async (projectId) => {
    try {
       const response = await axios.get(`${API_URL}/${projectId}/members`, getAuthHeaders());
       return response.data;
    } catch (err) { handleError(err); }
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
    fetchIssues,
    createIssue,
    fetchComments,
    addComment,
    fetchMembers,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};