// src/pages/MyProjectsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { 
  FiLoader, FiPlus, FiGrid, FiList, FiSearch, FiGlobe, FiLock, FiChevronLeft, FiChevronRight, FiUser, FiClock 
} from 'react-icons/fi';

function MyProjectsPage() {
  const { user } = useAuth();
  const { myProjects, sharedProjects, loading, fetchMyProjects, fetchSharedProjects } = useProjectContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [viewMode, setViewMode] = useState('grid'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // İSTEDİĞİNİZ 2 FİLTRE
  const [ownershipFilter, setOwnershipFilter] = useState('all'); // all, owner, member
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // all, public, private

  const projectsPerPage = viewMode === 'grid' ? 6 : 5;

  useEffect(() => {
    fetchMyProjects();
    fetchSharedProjects();
  }, []);

  // --- ÜYELİK KONTROLÜ VE VERİ BİRLEŞTİRME ---
 const joinedProjects = useMemo(() => {
  if (!user || !user.id) return [];

  // 1. Sahibi olduğum projeler (Tip uyuşmazlığını önlemek için Number kullanıyoruz)
  const owned = myProjects.map(p => ({ 
    ...p, 
    _role: 'owner' 
  }));

  // 2. Üyesi olduğum projeler
  const shared = sharedProjects.map(p => ({ 
    ...p, 
    _role: 'member' 
  }));

  // Filtreleme yapmadan önce iki listeyi birleştiriyoruz
  const all = [...owned, ...shared];

  // Mükerrer kayıtları (hem owner hem member gibi görünenleri) ID üzerinden temizle
  const unique = [];
  const map = new Map();
  for (const item of all) {
    if(!map.has(item.id)){
        map.set(item.id, true);
        unique.push(item);
    }
  }
  return unique;
}, [myProjects, sharedProjects, user]);

  // --- FİLTRELEME MANTIĞI ---
  const filteredProjects = useMemo(() => {
    return joinedProjects.filter(project => {
      // Arama Filtresi
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtre 1: Sahiplik Durumu (Benim kurduklarım / Katıldıklarım)
      const matchesOwnership = ownershipFilter === 'all' ? true : project._role === ownershipFilter;
      
      // Filtre 2: Görünürlük Durumu (Public / Private)
      const matchesVisibility = visibilityFilter === 'all' ? true : 
                               visibilityFilter === 'public' ? project.is_public === true : 
                               project.is_public === false;

      return matchesSearch && matchesOwnership && matchesVisibility;
    });
  }, [joinedProjects, searchTerm, ownershipFilter, visibilityFilter]);

  // Sayfalama
  const currentProjects = filteredProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);
  const totalPages = Math.max(Math.ceil(filteredProjects.length / projectsPerPage), 1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, ownershipFilter, visibilityFilter]);

  // src/pages/MyProjectsPage.js

return (
  <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-hidden">
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
      
      {/* HEADER SECTION - Boşluklar daraltıldı, yazı büyütüldü */}
      <div className="flex-none flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-text-main tracking-tight dark:text-white">My Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-primary hover:opacity-90 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center text-sm border-none"
        >
          <FiPlus className="mr-2" /> New Project
        </button>
      </div>

      {/* SEARCH AND FILTERS - P-4'ten P-2'ye indirildi */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface p-2 rounded-2xl border border-border shadow-sm mb-4 dark:bg-surface-dark/40">
        <div className="relative col-span-1 md:col-span-2 group">
          <FiSearch className="absolute left-3 top-3 text-text-secondary transition-colors" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-app border border-border text-text-main text-base rounded-xl pl-10 py-2 outline-none focus:border-primary transition-all dark:bg-black/20"
          />
        </div>
        
        <select 
          value={ownershipFilter} 
          onChange={(e) => setOwnershipFilter(e.target.value)} 
          className="w-full bg-app border border-border text-text-main text-base rounded-xl px-4 py-2 outline-none focus:border-primary cursor-pointer appearance-none dark:bg-black/20"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="member">Member</option>
        </select>

        <select 
          value={visibilityFilter} 
          onChange={(e) => setVisibilityFilter(e.target.value)} 
          className="w-full bg-app border border-border text-text-main text-base rounded-xl px-4 py-2 outline-none focus:border-primary cursor-pointer appearance-none dark:bg-black/20"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* SCROLLABLE PROJECT LIST - Kart içi padding p-8'den p-4'e düşürüldü */}
      <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-10"><FiLoader className="animate-spin text-primary" size={40} /></div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-10 text-center bg-surface/20 rounded-2xl border border-dashed border-border/40">
            <p className="text-text-secondary text-base font-medium">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {currentProjects.map(project => {
              const isOwner = project._role === 'owner';
              return (
                <Link to={`/project/${project.id}`} key={project.id} className="relative group h-fit">
                  <div className={`relative p-4 rounded-2xl bg-surface transition-all duration-300 flex flex-col justify-between hover:shadow-xl shadow-sm border-none dark:bg-surface-dark`}>
                    
                    {/* ACCENT STRIP */}
                    {isOwner && (
                      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-80"></div>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isOwner ? 'bg-primary/10 text-primary' : 'bg-text-secondary/5 text-text-secondary'
                        }`}>
                          {isOwner ? 'Owner' : 'Member'}
                        </span>
                        <div className="flex items-center gap-2 opacity-20">
                          {project.is_public ? <FiGlobe size={14} /> : <FiLock size={14} />}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors truncate mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-text-secondary/70 line-clamp-1 leading-relaxed">
                        {project.description || "Project workspace"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-text-secondary/5 flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-tighter">
                      <div className="flex flex-col gap-1">
                        <span className={`flex items-center text-xs ${isOwner ? 'text-primary' : ''}`}>
                          <FiUser className="mr-1.5" /> 
                          {isOwner ? `You` : (project.owner_name || 'Owner')}
                        </span>
                        <span className="flex items-center opacity-40 font-medium">
                          <FiClock className="mr-1.5" /> 
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-primary font-black text-xs">
                        VIEW
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* FIXED PAGINATION BAR - En alta sıfırlandı */}
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
    <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  </div>
);
}
export default MyProjectsPage;