// src/pages/SharedProjectsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; 
import SharedProjectCard from '../components/projects/SharedProjectCard';

function SharedProjectsPage() {
  const { sharedProjects, loading, fetchSharedProjects } = useProjectContext();

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('sharedProjectsViewMode') || 'grid';
  });

  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = viewMode === 'grid' ? 6 : 4;

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('sharedProjectsViewMode', mode);
  };

  useEffect(() => {
    fetchSharedProjects();
  }, []);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [uniqueProjects, viewMode]);

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
          {/* text-white -> text-text-main */}
          <h1 className="text-3xl font-bold text-text-main">Shared by Others</h1>
          {/* text-gray-400 -> text-text-secondary */}
          <p className="text-text-secondary mt-2 text-sm">
            Projects shared with you or available publicly.
          </p>
        </div>

        {/* bg-gray-800 -> bg-surface, border-gray-700 -> border-border */}
        <div className="bg-surface p-1 rounded-lg border border-border flex">
          <button
            onClick={() => changeViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover'
            }`}
            title="Grid View"
          >
            <FiGrid size={18} />
          </button>
          <button
            onClick={() => changeViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover'
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
          <FiLoader className="animate-spin text-primary" size={40} />
          <span className="ml-4 text-xl text-text-secondary">Loading Shared Projects...</span>
        </div>
      ) : uniqueProjects.length === 0 ? (
        <p className="text-text-secondary">No projects have been shared with you yet.</p>
      ) : (
        <div className="flex flex-col min-h-[500px]">
          
          <div className="flex-grow">
            {/* GRID MODU */}
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

            {/* LIST MODU */}
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
            <div className="flex justify-center items-center mt-2 pt-4 border-t border-border">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border border-border ${
                  currentPage === 1 
                    ? 'text-text-secondary cursor-not-allowed bg-surface/50' 
                    : 'text-text-main bg-surface hover:bg-surface-hover hover:border-primary'
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
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-main'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border border-border ${
                  currentPage === totalPages 
                    ? 'text-text-secondary cursor-not-allowed bg-surface/50' 
                    : 'text-text-main bg-surface hover:bg-surface-hover hover:border-primary'
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