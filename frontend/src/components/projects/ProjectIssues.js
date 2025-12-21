// src/components/projects/ProjectIssues.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { FiLoader, FiPlus, FiSearch } from 'react-icons/fi'; // Search ikonu eklendi
import IssueItem from './IssueItem'; 

function ProjectIssues() {
  const [issues, setIssues] = useState([]);
  const [newIssueText, setNewIssueText] = useState('');
  
  // === YENİ STATE: Arama Kelimesi ===
  const [searchTerm, setSearchTerm] = useState('');
  
  const { currentProject, fetchIssues, createIssue, loading } = useProjectContext();
  const { user } = useAuth(); 

  const projectId = currentProject?.id; 
  const userRole = currentProject?.currentUserRole;

  // Issue'ları çek
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const fetchedIssues = await fetchIssues(projectId);
        setIssues(fetchedIssues || []);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      }
    };
    if (projectId) loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); 

  // Issue Ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIssueText.trim()) return; 
    try {
      const newIssue = await createIssue(projectId, newIssueText);
      // Yeni ekleneni listeye (başa) ekle
      setIssues([newIssue, ...issues]); 
      setNewIssueText(''); 
    } catch (error) {
      console.error("Failed to create issue:", error);
    }
  };

  const handleIssueUpdate = (updatedIssue) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };

  // === FİLTRELEME MANTIĞI ===
  // Arama kutusuna yazılan kelimeye göre issue'ları filtrele
  const filteredIssues = issues.filter(issue => 
    issue.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Project Issues</h3>
        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
          {issues.length} Total
        </span>
      </div>
      
      {/* === YENİ: ARAMA KUTUSU === */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-500" />
        </div>
        <input 
          type="text"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 text-gray-200 border border-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 placeholder-gray-500 transition-colors"
        />
      </div>

      {/* Issue Ekleme Formu */}
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

      {/* Issue Listesi (Filtrelenmiş listeyi kullanıyoruz) */}
      <div className="space-y-3">
        {loading && issues.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No issues found for this project.</p>
        ) : filteredIssues.length === 0 ? (
          // Arama sonucu boşsa
          <p className="text-gray-400 text-center py-4">No issues match your search.</p>
        ) : (
          filteredIssues.map(issue => (
            <IssueItem 
              key={issue.id} 
              issue={issue} 
              projectId={projectId} 
              onIssueUpdated={handleIssueUpdate} 
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectIssues;