// src/pages/ProjectDetailPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockProjects, mockSharedProjects, mockComments, mockProjectMembers, mockProjectFiles } from '../data/mockData';
// --- 1. IMPORT THE NEW COMPONENTS ---
import FileList from '../components/projects/FileList';
import ProjectIssues from '../components/projects/ProjectIssues';
import Comment from '../components/projects/Comment';
import CommentForm from '../components/projects/CommentForm';
import { useProjectContext } from '../context/ProjectContext';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const { setCurrentProjectMembers } = useProjectContext();

  useEffect(() => {
    // ... useEffect logic (no changes needed here)
    const numericProjectId = Number(projectId);
    const foundProject = [...mockProjects, ...mockSharedProjects].find(p => p.id === numericProjectId);
    const projectComments = mockComments.filter(c => c.projectId === numericProjectId);
    const projectFiles = mockProjectFiles.filter(f => f.projectId === numericProjectId);
    const projectMembers = mockProjectMembers.filter(m => m.projectId === numericProjectId);
    
    setTimeout(() => {
      setProject(foundProject);
      setComments(projectComments);
      setFiles(projectFiles);
      setCurrentProjectMembers(projectMembers);
    }, 500);

    return () => {
      setCurrentProjectMembers([]);
    };
  }, [projectId, setCurrentProjectMembers]);

  const handleCommentSubmit = (newCommentData) => { /* ... no change here ... */ };
  
  if (!project) return <p className="text-gray-400">Loading project...</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-white">{project.name}</h1>
      <p className="text-gray-300 mt-4">{project.description}</p>

      <FileList files={files} loading={false} />

      {/* --- 2. UPDATE THE COMPONENT CALL --- */}
      {/* We now pass the 'issues' array to the 'issues' prop */}
      <ProjectIssues issues={project.issues} />

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2 mb-4">
          Comments
        </h2>
        <CommentForm onCommentSubmit={handleCommentSubmit} />
        <div className="mt-6">
          {/* ... comments mapping (no change) ... */}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;