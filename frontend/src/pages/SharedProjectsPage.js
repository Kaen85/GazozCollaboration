// src/pages/SharedProjectsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; 
import SharedProjectCard from '../components/projects/SharedProjectCard';

function SharedProjectsPage() {
  const { sharedProjects, loading, fetchSharedProjects } = useProjectContext();
  
  // === GÖRÜNÜM MODU ===
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('sharedProjectsViewMode') || 'grid';
  });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  
  // !!! DÜZELTME BURADA !!!
  // Liste görünümünde butonların oynamaması için sayıyı 5'ten 4'e indirdik.
  // Grid: 6 adet, List: 4 adet. (Yükseklikleri birbirine daha yakın olur)
  const projectsPerPage = viewMode === 'grid' ? 6 : 4;

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

  // Görünüm veya veri değişirse 1. sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [uniqueProjects, viewMode]);

  // --- PAGINATION HESAPLAMALARI ---
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = uniqueProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(uniqueProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Shared by Others</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Projects shared with you or available publicly.
          </p>
        </div>

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

      {/* --- CONTENT --- */}
      {loading ? (
        <div className="flex justify-center items-center p-20">
          <FiLoader className="animate-spin text-purple-500" size={40} />
          <span className="ml-4 text-xl text-gray-300">Loading Shared Projects...</span>
        </div>
      ) : uniqueProjects.length === 0 ? (
        <p className="text-gray-400">No projects have been shared with you yet.</p>
      ) : (
        // !!! SABİT YÜKSEKLİK GÜNCELLEMESİ !!!
        // min-h-[500px]: 4 liste elemanı için tam ideal yükseklik.
        // Bu sayede butonlar ne yukarı zıplar ne de ekranı taşırır.
        <div className="flex flex-col min-h-[500px]">
          
          <div className="flex-grow">
            {/* GRID MODU (6 tane) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map(project => (
                  <SharedProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode="grid" 
                  />
                ))}
              </div>
            )}

            {/* LIST MODU (4 tane) */}
            {viewMode === 'list' && (
              <div className="flex flex-col space-y-3">
                {currentProjects.map(project => (
                  <SharedProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode="list" 
                  />
                ))}
              </div>
            )}
          </div>

          {/* === PAGINATION BAR === */}
          {uniqueProjects.length > projectsPerPage && (
            <div className="flex justify-center items-center mt-2 pt-4 border-t border-gray-800">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border border-gray-700 ${
                  currentPage === 1 
                    ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' 
                    : 'text-white bg-gray-800 hover:bg-gray-700 hover:border-purple-500'
                }`}
              >
                <FiChevronLeft size={20} />
              </button>

              <div className="flex space-x-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === number
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border border-gray-700 ${
                  currentPage === totalPages 
                    ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' 
                    : 'text-white bg-gray-800 hover:bg-gray-700 hover:border-purple-500'
                }`}
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SharedProjectsPage;