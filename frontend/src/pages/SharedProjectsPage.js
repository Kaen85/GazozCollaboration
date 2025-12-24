// src/pages/SharedProjectsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { FiLoader, FiSearch, FiChevronLeft, FiChevronRight, FiGlobe } from 'react-icons/fi'; 
import SharedProjectCard from '../components/projects/SharedProjectCard';
import api from '../services/api'; 

function SharedProjectsPage() {
  const [publicProjects, setPublicProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  useEffect(() => {
    const fetchPublic = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/projects/public-explorer');
        setPublicProjects(response.data);
      } catch (err) {
        console.error("Public projects load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, []);

  const filteredProjects = useMemo(() => {
    return (Array.isArray(publicProjects) ? publicProjects : []).filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [publicProjects, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredProjects.length / projectsPerPage), 1);
  const currentProjects = filteredProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // src/pages/SharedProjectsPage.js

return (
  <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-hidden">
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="flex-none flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-text-main tracking-tight dark:text-white flex items-center">
          <FiGlobe className="mr-3 text-primary" /> Shared Projects
        </h1>
      </div>

      {/* SEARCH BAR - My Projects ile aynı kutu stili */}
      <div className="flex-none bg-surface p-2 rounded-2xl border border-border shadow-sm mb-4 dark:bg-surface-dark/40">
        <div className="relative group">
          <FiSearch className="absolute left-3 top-3 text-text-secondary transition-colors" />
          <input
            type="text"
            placeholder="Search shared projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-app border border-border text-text-main text-base rounded-xl pl-10 py-2 outline-none focus:border-primary transition-all dark:bg-black/20"
          />
        </div>
      </div>

      {/* PROJECT LIST */}
      <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-10"><FiLoader className="animate-spin text-primary" size={40} /></div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-10 text-center bg-surface/20 rounded-2xl border border-dashed border-border/40">
            <p className="text-text-secondary text-base font-medium">No shared projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {currentProjects.map(project => (
              <SharedProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* FIXED PAGINATION BAR - "Showing" kısmı büyütüldü ve kurumsallaştırıldı */}
      {/* FIXED PAGINATION BAR */}
<div className="flex-none pt-2 pb-4">
  <div className="flex justify-between items-center bg-surface p-3 border border-border rounded-xl shadow-sm dark:bg-surface-dark/60 backdrop-blur-md">
    <span className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-60">
      {filteredProjects.length > 0 ? (
        <>
          Showing {((currentPage - 1) * projectsPerPage) + 1} - {Math.min(currentPage * projectsPerPage, filteredProjects.length)} / {filteredProjects.length}
        </>
      ) : (
        "Showing 0 / 0"
      )}
    </span>
    <div className="flex items-center gap-3">
      <button 
        onClick={() => paginate(currentPage - 1)} 
        disabled={currentPage === 1} 
        className="p-2 rounded-lg hover:bg-app disabled:opacity-10 transition-all border border-border text-text-main"
      >
        <FiChevronLeft size={20} />
      </button>
      <div className="flex gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button 
            key={i + 1} 
            onClick={() => paginate(i + 1)} 
            className={`w-10 h-10 rounded-lg text-sm font-black transition-all ${
              currentPage === i + 1 
                ? 'bg-primary text-white shadow-md' 
                : 'hover:bg-app text-text-secondary border border-border'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button 
        onClick={() => paginate(currentPage + 1)} 
        disabled={currentPage === totalPages} 
        className="p-2 rounded-lg hover:bg-app disabled:opacity-10 transition-all text-text-main border border-border"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  </div>
</div>
    </div>
  </div>
);
}

export default SharedProjectsPage;