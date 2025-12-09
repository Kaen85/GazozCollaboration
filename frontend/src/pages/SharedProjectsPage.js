// src/pages/SharedProjectsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiGrid, FiList, FiUser } from 'react-icons/fi'; 
import SharedProjectCard from '../components/projects/SharedProjectCard';
import { Link } from 'react-router-dom';

function SharedProjectsPage() {
  const { sharedProjects, loading, fetchSharedProjects } = useProjectContext();
  
  // === GÖRÜNÜM MODU (LocalStorage ile kalıcı) ===
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

  // === DÜZELTME: PROJELERİ TEKİLLEŞTİRME (DEDUPLICATION) ===
  // Backend'den aynı proje iki kez (hem üye hem public olarak) gelebilir.
  // Burada onları ID'ye göre birleştiriyoruz.
  const uniqueProjects = useMemo(() => {
    const projectMap = new Map();
    
    sharedProjects.forEach(project => {
      const existing = projectMap.get(project.id);
      
      if (!existing) {
        // Proje listede yoksa ekle
        projectMap.set(project.id, project);
      } else {
        // Proje listede zaten varsa, HANGİSİNİ TUTACAĞIMIZA karar verelim:
        // Eğer yeni gelen kayıtta 'joined_at' (üyelik tarihi) varsa, onu tercih et.
        // (Çünkü üye olduğumuz versiyon, sadece public olandan daha değerlidir)
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
      ) : uniqueProjects.length === 0 ? ( // DÜZELTME: 'uniqueProjects' kullanıldı
        <p className="text-gray-400">No projects have been shared with you yet.</p>
      ) : (
        <>
          {/* GRID MODU */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueProjects.map(project => ( // DÜZELTME: 'uniqueProjects' kullanıldı
                <SharedProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* LIST MODU */}
          {viewMode === 'list' && (
            <div className="flex flex-col space-y-3">
              {uniqueProjects.map(project => ( // DÜZELTME: 'uniqueProjects' kullanıldı
                <Link to={`/project/${project.id}`} key={project.id}>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all flex items-center justify-between group">
                    <div className="flex-1 min-w-0 mr-6">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center mt-1">
                         <FiUser className="w-3 h-3 text-gray-500 mr-1" />
                         <span className="text-xs text-gray-400 mr-3">
                           {project.owner_name}
                         </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-gray-400 text-sm max-w-xs truncate hidden md:block">
                      {project.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SharedProjectsPage;