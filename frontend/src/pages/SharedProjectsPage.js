// src/pages/SharedProjectsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiGrid, FiList } from 'react-icons/fi'; 
import SharedProjectCard from '../components/projects/SharedProjectCard';

function SharedProjectsPage() {
  const { sharedProjects, loading, fetchSharedProjects } = useProjectContext();
  
  // === GÖRÜNÜM MODU ===
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('sharedProjectsViewMode') || 'grid';
  });

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('sharedProjectsViewMode', mode);
  };

  useEffect(() => {
    fetchSharedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === PROJELERİ TEKİLLEŞTİRME ===
  const uniqueProjects = useMemo(() => {
    const projectMap = new Map();
    sharedProjects.forEach(project => {
      const existing = projectMap.get(project.id);
      if (!existing) {
        projectMap.set(project.id, project);
      } else {
        if (project.joined_at && !existing.joined_at) {
          projectMap.set(project.id, project);
        }
      }
    });
    return Array.from(projectMap.values());
  }, [sharedProjects]);


  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Shared Projects</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Projects shared with you or available publicly.
          </p>
        </div>

        {/* Görünüm Değiştirme Butonları */}
        <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 flex">
          <button
            onClick={() => changeViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <FiGrid size={18} />
          </button>
          <button
            onClick={() => changeViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="List View"
          >
            <FiList size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-20">
          <FiLoader className="animate-spin text-purple-500" size={40} />
          <span className="ml-4 text-xl text-gray-300">Loading Shared Projects...</span>
        </div>
      ) : uniqueProjects.length === 0 ? (
        <p className="text-gray-400">No projects have been shared with you yet.</p>
      ) : (
        <>
          {/* GRID MODU */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueProjects.map(project => (
                <SharedProjectCard 
                  key={project.id} 
                  project={project} 
                  viewMode="grid" // viewMode'u prop olarak geçiyoruz
                />
              ))}
            </div>
          )}

          {/* LIST MODU - DÜZELTİLDİ */}
          {/* Artık elle yazılmış HTML yerine SharedProjectCard kullanılıyor */}
          {viewMode === 'list' && (
            <div className="flex flex-col space-y-3">
              {uniqueProjects.map(project => (
                <SharedProjectCard 
                  key={project.id} 
                  project={project} 
                  viewMode="list" // viewMode'u 'list' olarak geçiyoruz
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SharedProjectsPage;