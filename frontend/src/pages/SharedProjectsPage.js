// src/pages/SharedProjectsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { FiLoader, FiSearch, FiChevronLeft, FiChevronRight, FiGlobe, FiUser, FiClock } from 'react-icons/fi'; 
import { Link } from 'react-router-dom';
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
      } catch (err) { console.error("Public projects error:", err); } 
      finally { setLoading(false); }
    };
    fetchPublic();
  }, []);

  const filteredProjects = useMemo(() => {
  return (Array.isArray(publicProjects) ? publicProjects : []).filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      (project.description && project.description.toLowerCase().includes(searchLower)) ||
      (project.owner_name && project.owner_name.toLowerCase().includes(searchLower)) 
    );
  });
}, [publicProjects, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredProjects.length / projectsPerPage), 1);
  const currentProjects = filteredProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* HEADER SECTION - Standart Hizalama */}
        <div className="flex-none flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-text-main tracking-tight dark:text-white flex items-center">
            <FiGlobe className="mr-3 text-primary" /> Shared Projects
          </h1>
        </div>

        {/* SEARCH BAR - Standart Kutu */}
        <div className="flex-none bg-surface p-2 rounded-2xl border border-border shadow-sm mb-4 dark:bg-surface-dark/40">
          <div className="relative group max-w-md">
            <FiSearch className="absolute left-3 top-3 text-text-secondary transition-colors" />
            <input
              type="text" placeholder="Search shared projects..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-app border border-border text-text-main text-base rounded-xl pl-10 py-2 outline-none focus:border-primary transition-all dark:bg-black/20"
            />
          </div>
        </div>

        {/* GRID AREA */}
        <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-20"><FiLoader className="animate-spin text-primary" size={40} /></div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-10 text-center bg-surface/20 rounded-2xl border border-dashed border-border/40">
              <p className="text-text-secondary text-base font-medium">No shared projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
              {currentProjects.map(project => (
                <Link to={`/project/${project.id}`} key={project.id} className="relative group h-fit">
                  <div className="relative p-4 rounded-2xl bg-surface transition-all duration-300 flex flex-col justify-between hover:shadow-xl shadow-sm border-none dark:bg-surface-dark">
                    <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-80"></div>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-text-secondary/10 text-text-secondary">Member</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                          <FiGlobe size={12} strokeWidth={3} /> PUBLIC
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors truncate mb-1">{project.name}</h3>
                      <p className="text-sm text-text-secondary/80 line-clamp-1 leading-relaxed">{project.description || "Public workspace"}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-[10px] uppercase tracking-tight">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center text-[11px] font-bold text-text-main">
                          <FiUser className="mr-1.5 text-xs text-primary" /> {project.owner_name || 'Owner'}
                        </span>
                        <span className="flex items-center text-text-secondary font-bold text-[10px]">
                          <FiClock className="mr-1.5 text-xs opacity-70" /> {new Date(project.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center px-3 py-1 bg-primary/5 text-primary font-black text-[10px] rounded-lg group-hover:bg-primary group-hover:text-white transition-all">VIEW</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION BAR - Standart Alt Bar */}
        <div className="flex-none pt-2 pb-4">
          <div className="flex justify-between items-center bg-surface p-3 border border-border rounded-xl shadow-sm dark:bg-surface-dark/60 backdrop-blur-md">
            <span className="text-xs text-text-main font-bold uppercase tracking-widest">
              {filteredProjects.length > 0 ? <>Showing <span className="text-primary">{((currentPage - 1) * projectsPerPage) + 1} - {Math.min(currentPage * projectsPerPage, filteredProjects.length)}</span> / {filteredProjects.length}</> : "Showing 0 / 0"}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-app disabled:opacity-10 transition-all border border-border text-text-main"><FiChevronLeft size={20} /></button>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-app disabled:opacity-10 transition-all text-text-main border border-border"><FiChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SharedProjectsPage;