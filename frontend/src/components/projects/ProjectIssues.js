// src/components/projects/ProjectIssues.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { FiLoader, FiPlus } from 'react-icons/fi';

function ProjectIssues({ projectId }) {
  const [issues, setIssues] = useState([]);
  const [newIssueText, setNewIssueText] = useState('');
  
  // Context'ten issue'ları çeken ve oluşturan fonksiyonları al
  const { fetchIssues, createIssue, loading } = useProjectContext();
  const { user } = useAuth(); // Yorumu kimin attığını bilmek için

  // 1. Sayfa yüklendiğinde issue'ları çek
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const fetchedIssues = await fetchIssues(projectId);
        setIssues(fetchedIssues);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      }
    };
    
    if (projectId) {
      loadIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // projectId değişirse tekrar çek

  // 2. Yeni issue oluşturma formu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIssueText.trim()) return; // Boş issue gönderme

    try {
      const newIssue = await createIssue(projectId, newIssueText);
      // Backend'den dönen yeni issue'yu, yazar adıyla birlikte listeye ekle
      setIssues([{ ...newIssue, created_by_name: user.username }, ...issues]);
      setNewIssueText(''); // Formu temizle
    } catch (error) {
      console.error("Failed to create issue:", error);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Project Issues</h3>
      
      {/* Yeni Issue Ekleme Formu */}
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

      {/* Issue Listesi */}
      <div className="space-y-3">
        {loading && issues.length === 0 ? (
          <p className="text-gray-400">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="text-gray-400">No issues found for this project.</p>
        ) : (
          issues.map(issue => (
            <div key={issue.id} className="bg-gray-700 p-3 rounded-md">
              <p className="text-white">{issue.text}</p>
              <span className="text-xs text-gray-400">
                Opened by {issue.created_by_name || '...'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectIssues;