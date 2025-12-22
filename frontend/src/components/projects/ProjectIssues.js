// src/components/projects/ProjectIssues.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { FiLoader, FiPlus, FiSearch } from 'react-icons/fi';
import IssueItem from './IssueItem'; 

function ProjectIssues() {
  const [issues, setIssues] = useState([]);
  const [newIssueText, setNewIssueText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentProject, fetchIssues, createIssue, loading } = useProjectContext();
  const { user } = useAuth(); 

  const projectId = currentProject?.id;
  const userRole = currentProject?.currentUserRole;

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const fetchedIssues = await fetchIssues(projectId);
        setIssues(fetchedIssues || []);
      } catch (error) { console.error("Failed to fetch issues:", error); }
    };
    if (projectId) loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIssueText.trim()) return;
    try {
      const newIssue = await createIssue(projectId, newIssueText);
      setIssues([newIssue, ...issues]); 
      setNewIssueText('');
    } catch (error) { console.error("Failed to create issue:", error); }
  };

  const handleIssueUpdate = (updatedIssue) => {
    setIssues(prevIssues => prevIssues.map(issue => issue.id === updatedIssue.id ? updatedIssue : issue));
  };

  const filteredIssues = issues.filter(issue => issue.text.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    // bg-surface
    <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text-main">Project Issues</h3>
        <span className="text-xs bg-app text-text-secondary px-2 py-1 rounded-full border border-border">
          {issues.length} Total
        </span>
      </div>
      
      {/* SEARCH */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-text-secondary" />
        </div>
        <input 
          type="text" placeholder="Search issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-app text-text-main border border-border text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 p-2.5 placeholder-text-secondary transition-colors"
        />
      </div>

      {/* CREATE FORM */}
      {(userRole === 'owner' || userRole === 'editor') && (
        <form onSubmit={handleSubmit} className="flex mb-6">
          <input 
            type="text" value={newIssueText} onChange={(e) => setNewIssueText(e.target.value)}
            className="flex-grow py-2 px-3 text-text-main bg-app border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary"
            placeholder="New issue title..."
          />
          <button type="submit" disabled={loading} className="flex items-center bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-r-lg transition-colors disabled:opacity-50">
            {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
          </button>
        </form>
      )}

      {/* ISSUE LIST */}
      <div className="space-y-3">
        {loading && issues.length === 0 ? (
          <p className="text-text-secondary text-center py-4">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="text-text-secondary text-center py-4">No issues found for this project.</p>
        ) : filteredIssues.length === 0 ? (
          <p className="text-text-secondary text-center py-4">No issues match your search.</p>
        ) : (
          filteredIssues.map(issue => (
            <IssueItem key={issue.id} issue={issue} projectId={projectId} onIssueUpdated={handleIssueUpdate} />
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectIssues;