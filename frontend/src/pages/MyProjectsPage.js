// src/pages/MyProjectsPage.js

import React, { useState, useEffect } from 'react';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiPlus, FiGrid, FiList, FiClock } from 'react-icons/fi'; // Yeni ikonlar

function MyProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // === YENİ STATE: GÖRÜNÜM MODU ===
  const [viewMode, setViewMode] = useState('grid'); // 'grid' veya 'list'

  const { myProjects, loading, fetchMyProjects } = useProjectContext();

  useEffect(() => {
    fetchMyProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
        
        <div className="flex items-center gap-4">
          {/* === YENİ: GÖRÜNÜM DEĞİŞTİRME BUTONLARI === */}
          <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <FiList size={18} />
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            Create New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-20">
          <FiLoader className="animate-spin text-blue-500" size={40} />
          <span className="ml-4 text-xl text-gray-300">Loading projects...</span>
        </div>
      ) : myProjects.length === 0 ? (
        <p className="text-gray-400">You haven't created any projects yet.</p>
      ) : (
        <>
          {/* === GÖRÜNÜM 1: GRID (IZGARA) MODU === */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map(project => (
                <Link to={`/project/${project.id}`} key={project.id}>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 truncate" title={project.name}>{project.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex items-center text-xs text-gray-500">
                      <FiClock className="mr-2" />
                      Updated: {new Date(project.last_updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* === GÖRÜNÜM 2: LIST (LİSTE) MODU === */}
          {viewMode === 'list' && (
            <div className="flex flex-col space-y-3">
              {myProjects.map(project => (
                <Link to={`/project/${project.id}`} key={project.id}>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all flex items-center justify-between group">
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs text-gray-500 flex items-center bg-gray-900 px-3 py-1 rounded-full">
                        <FiClock className="mr-2" />
                        {new Date(project.last_updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default MyProjectsPage;