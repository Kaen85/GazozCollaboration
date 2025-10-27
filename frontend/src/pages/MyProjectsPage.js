// src/pages/MyProjectsPage.js
import React, { useState, useEffect } from 'react';
import { mockProjects } from '../data/mockData';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';

function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // This state correctly controls the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false); 

  useEffect(() => {
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1500);
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          + Create New Project
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            // --- WRAP THE DIV WITH A LINK ---
            <Link to={`/projects/${project.id}`} key={project.id}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full">
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* The modal is only rendered if isModalOpen is true */}
      {/* And it correctly receives the necessary functions as props */}
      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

export default MyProjectsPage;