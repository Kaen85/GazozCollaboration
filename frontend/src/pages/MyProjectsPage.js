// src/pages/MyProjectsPage.js

import React, { useState, useEffect } from 'react';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

// İkonlar
import { 
  FiLoader, FiPlus, FiGrid, FiList, FiClock, FiGlobe, 
  FiChevronLeft, FiChevronRight 
} from 'react-icons/fi'; 

function MyProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [viewMode, setViewMode] = useState('grid'); 
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = viewMode === 'grid' ? 6 : 5;

  // Context'ten verileri al
  const { myProjects, loading, fetchMyProjects } = useProjectContext();
  const { user } = useAuth();

  useEffect(() => {
    // Sayfa yüklenince projeleri çek
    fetchMyProjects();
  }, []);

  // --- DEBUG İÇİN KONSOL LOGLARI ---
  // F12 yapıp Console sekmesine bakın.
  useEffect(() => {
    console.log("--------------------------------------");
    console.log("Giriş Yapan Kullanıcı ID:", user?.id);
    console.log("Backend'den Gelen Projeler:", myProjects);
    console.log("--------------------------------------");
  }, [myProjects, user]);

  // Backend'i düzelttiğimiz için artık filtrelemeye gerek yok.
  // myProjects zaten sadece bize ait olanları içeriyor olmalı.
  const currentList = myProjects; 

  // --- PAGINATION ---
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = currentList.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(currentList.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  useEffect(() => { setCurrentPage(1); }, [viewMode, myProjects]);

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 flex">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><FiGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><FiList size={18} /></button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors">
            <FiPlus className="mr-2" /> Create New Project
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center p-20">
          <FiLoader className="animate-spin text-blue-500" size={40} />
          <span className="ml-4 text-xl text-gray-300">Loading projects...</span>
        </div>
      ) : currentList.length === 0 ? (
        <p className="text-gray-400 text-center py-10">You haven't created any projects yet.</p>
      ) : (
        <div className="flex flex-col min-h-[480px]">
          <div className="flex-grow">
            
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map(project => (
                  <Link to={`/project/${project.id}`} key={project.id}>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-white truncate pr-2" title={project.name}>{project.name}</h3>
                          {project.is_public && <div className="text-green-400 bg-green-400/10 p-1 rounded-full"><FiGlobe size={16} /></div>}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center"><FiClock className="mr-2" />Updated: {new Date(project.last_updated_at || project.created_at).toLocaleDateString()}</div>
                        {project.is_public && <span className="text-green-500 font-semibold">Public</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="flex flex-col space-y-3">
                {currentProjects.map(project => (
                  <Link to={`/project/${project.id}`} key={project.id}>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all flex items-center justify-between group">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate mr-3">{project.name}</h3>
                          {project.is_public && <span className="flex items-center text-xs text-green-500 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30"><FiGlobe className="mr-1 w-3 h-3" /> Public</span>}
                        </div>
                        <p className="text-gray-400 text-sm truncate mt-1">{project.description || "No description provided."}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs text-gray-500 flex items-center bg-gray-900 px-3 py-1 rounded-full">
                          <FiClock className="mr-2" /> {new Date(project.last_updated_at || project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION BAR */}
          {currentList.length > projectsPerPage && (
            <div className="flex justify-center items-center mt-2 pt-4 border-t border-gray-800">
              <button onClick={prevPage} disabled={currentPage === 1} className={`p-2 rounded-md border border-gray-700 ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-white bg-gray-800 hover:bg-gray-700 hover:border-blue-500'}`}><FiChevronLeft size={20} /></button>
              <div className="flex space-x-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button key={number} onClick={() => paginate(number)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === number ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white'}`}>{number}</button>
                ))}
              </div>
              <button onClick={nextPage} disabled={currentPage === totalPages} className={`p-2 rounded-md border border-gray-700 ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-white bg-gray-800 hover:bg-gray-700 hover:border-blue-500'}`}><FiChevronRight size={20} /></button>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default MyProjectsPage;