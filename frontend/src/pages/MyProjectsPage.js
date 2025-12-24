// src/pages/MyProjectsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { 
  FiLoader, FiPlus, FiGrid, FiList, FiClock, FiGlobe, 
  FiChevronLeft, FiChevronRight, FiSearch, FiX, FiUser, FiLock 
} from 'react-icons/fi';

function MyProjectsPage() {
  const { user } = useAuth();
  const { myProjects, sharedProjects, loading, fetchMyProjects, fetchSharedProjects } = useProjectContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [viewMode, setViewMode] = useState('grid'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState('all'); 
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const projectsPerPage = viewMode === 'grid' ? 6 : 5;

  useEffect(() => {
    fetchMyProjects();
    fetchSharedProjects();
  }, []);

  // --- STRICT MEMBERSHIP FILTERING ---
  const joinedProjects = useMemo(() => {
    if (!user) return [];

    // 1. Projects I own
    const owned = myProjects
      .filter(p => Number(p.owner_id) === Number(user.id))
      .map(p => ({ ...p, _role: 'owner' }));

    // 2. Projects where I am explicitly a member (sharedProjects)
    // We assume sharedProjects now only returns joined projects due to backend fix
    const shared = sharedProjects
      .filter(p => Number(p.owner_id) !== Number(user.id))
      .map(p => ({ ...p, _role: 'member' }));

    return [...owned, ...shared];
  }, [myProjects, sharedProjects, user]);

  // --- FILTER LOGIC ---
  const filteredProjects = useMemo(() => {
    return joinedProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesOwnership = ownershipFilter === 'all' ? true : project._role === ownershipFilter;
      const matchesVisibility = visibilityFilter === 'all' ? true : 
                               visibilityFilter === 'public' ? project.is_public === true : 
                               project.is_public === false;

      return matchesSearch && matchesOwnership && matchesVisibility;
    });
  }, [joinedProjects, searchTerm, ownershipFilter, visibilityFilter]);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.max(Math.ceil(filteredProjects.length / projectsPerPage), 1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, ownershipFilter, visibilityFilter]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] p-6 bg-app transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
        
        {/* HEADER & FILTERS */}
        <div className="flex-none space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-text-main tracking-tight">My Workspace</h1>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">
              <FiPlus className="mr-2" /> New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
            <div className="relative col-span-1 md:col-span-2">
              <FiSearch className="absolute left-3 top-3.5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search my projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-app border border-border text-text-main text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <select value={ownershipFilter} onChange={(e) => setOwnershipFilter(e.target.value)} className="w-full bg-app border border-border text-text-main text-sm rounded-xl px-4 py-3 outline-none focus:border-primary cursor-pointer appearance-none">
                <option value="all">👥 All My Projects</option>
                <option value="owner">👑 Owner</option>
                <option value="member">🛠️ Member</option>
              </select>
            </div>
            <div>
              <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)} className="w-full bg-app border border-border text-text-main text-sm rounded-xl px-4 py-3 outline-none focus:border-primary cursor-pointer appearance-none">
                <option value="all">🌐 All Visibility</option>
                <option value="public">🌍 Public</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROJECTS AREA */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex justify-center p-20"><FiLoader className="animate-spin text-primary" size={50} /></div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-surface/50 p-20 rounded-2xl border border-dashed border-border text-center shadow-inner">
              <p className="text-text-secondary font-medium italic">No projects found in your workspace.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-3"}>
              {currentProjects.map(project => (
                <Link to={`/project/${project.id}`} key={project.id}>
                  <div className="bg-surface p-6 rounded-2xl border border-border hover:border-primary/50 shadow-sm hover:shadow-lg transition-all h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${project._role === 'owner' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                          {project._role}
                        </span>
                        {project.is_public ? <FiGlobe className="text-green-500" /> : <FiLock className="text-amber-500" />}
                      </div>
                      <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors truncate mb-2">{project.name}</h3>
                      <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">{project.description || "No description."}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase">
                      <span className="flex items-center"><FiClock className="mr-1.5 text-primary" /> {new Date(project.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center text-primary group-hover:translate-x-1 transition-transform">Details <FiChevronRight className="ml-1" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* STICKY FOOTER PAGINATION */}
        <div className="flex-none mt-10 pb-4">
          <div className="flex justify-between items-center bg-surface border border-border p-4 rounded-2xl shadow-md">
            <span className="text-xs text-text-secondary">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl border border-border hover:bg-app disabled:opacity-20 transition-all"><FiChevronLeft size={20} /></button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg' : 'hover:bg-app text-text-secondary'}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-border hover:bg-app disabled:opacity-20 transition-all"><FiChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default MyProjectsPage;