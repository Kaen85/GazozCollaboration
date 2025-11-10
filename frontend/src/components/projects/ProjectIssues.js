// src/components/projects/ProjectIssues.js

import {React} from 'react';
import { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { FiLoader, FiPlus } from 'react-icons/fi';
import IssueItem from './IssueItem'; // Bu component'i çağırıyoruz

function ProjectIssues() {
  const [issues, setIssues] = useState([]);
  const [newIssueText, setNewIssueText] = useState('');
  
  // 1. Context'ten 'currentProject'i almamız gerekiyor (Rol bilgisi için)
  const { currentProject, fetchIssues, createIssue, loading } = useProjectContext();
  const { user } = useAuth(); // Yazar adını bilmek için

  const projectId = currentProject?.id; // Proje ID'sini al
  // 2. Kullanıcının projedeki rolünü al ('owner', 'editor', 'viewer', veya 'public_viewer')
  const userRole = currentProject?.currentUserRole;

  // Sayfa yüklendiğinde issue'ları çek
  useEffect(() => {
    const loadIssues = async () => {
      // 'loading' state'ini burada 'true' yapabiliriz (opsiyonel)
      try {
        const fetchedIssues = await fetchIssues(projectId);
        setIssues(fetchedIssues || []);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      }
    };
    
    if (projectId) {
      loadIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); 

  // Yeni issue oluşturma formu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIssueText.trim()) return; 

    try {
      const newIssue = await createIssue(projectId, newIssueText);
      // 'created_by_name' backend'den zaten geliyor olmalı
      setIssues([newIssue, ...issues]); // Başa ekle
      setNewIssueText(''); 
    } catch (error) {
      console.error("Failed to create issue:", error);
    }
  };

  // === DÜZELTME: Bu fonksiyon 'return'ün ÜSTÜNE TAŞINDI ===
  // IssueItem (çocuk) bir issue'yu güncellediğinde bu ebeveyn fonksiyonu çalışır
  const handleIssueUpdate = (updatedIssue) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        // ID'si eşleşen issue'yu bul ve yenisiyle değiştir
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Project Issues</h3>
      
      {/* Issue Ekleme Formu (Rol kontrolü ile) */}
      {(userRole === 'owner' || userRole === 'editor') && (
        <form onSubmit={handleSubmit} className="flex mb-4">
          <input 
            type="text"
            value={newIssueText}
            onChange={(e) => setNewIssueText(e.target.value)}
            className="flex-grow py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New issue title..."
          />
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-r-lg transition-colors disabled:opacity-50"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
          </button>
        </form>
      )}

      {/* Issue Listesi */}
      <div className="space-y-3">
        {/* 'loading' (genel) yerine 'issues' listesinin boş olup olmadığını kontrol edebiliriz */}
        {issues.length === 0 && !loading ? (
          <p className="text-gray-400">No issues found for this project.</p>
        ) : (
          issues.map(issue => (
            <IssueItem 
              key={issue.id} 
              issue={issue} // Güncellenmiş 'issue' verisi buradan çocuğa gider
              projectId={projectId} 
              onIssueUpdated={handleIssueUpdate} // Artık 'handleIssueUpdate' tanımlı
            />
          ))
        )}
        {loading && issues.length === 0 && (
          <p className="text-gray-400">Loading issues...</p>
        )}
      </div>
    </div>
  );
}

export default ProjectIssues;