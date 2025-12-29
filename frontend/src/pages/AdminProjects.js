// src/pages/AdminProjects.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FiBox, FiSearch, FiMoreVertical, FiTrash2, FiExternalLink, FiChevronLeft, FiChevronRight, FiLoader, FiLayers 
} from 'react-icons/fi';

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => { fetchAllProjects(); }, []);

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/projects/admin/all-projects');
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) { console.error("Projects Fetch Error:", err); } 
    finally { setLoading(false); }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete project "${project.name}"?`)) return;
    try {
      await api.delete(`/api/projects/${project.id}`);
      setOpenMenuId(null);
      fetchAllProjects();
    } catch (err) { alert("Delete failed."); }
  };

  // --- Helper: Dosya Boyutu Formatlama ---
  const formatTotalSize = (bytes) => {
    // Gelen değeri sayıya çevir (Backend bazen string gönderir)
    const value = Number(bytes);

    // Eğer değer yoksa, hatalıysa (NaN) veya 0 ise direkt '0 B' döndür
    if (!value || isNaN(value) || value === 0) {
        return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(value) / Math.log(k));
    
    return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredData = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const visibilityText = p.is_public ? 'public' : 'private'; 

    return (
      p.name?.toLowerCase().includes(searchLower) || 
      p.owner_name?.toLowerCase().includes(searchLower) ||
      visibilityText.includes(searchLower) 
    );
  });
  
  const totalPages = Math.max(Math.ceil(filteredData.length / itemsPerPage), 1);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* HEADER SECTION */}
        <div className="flex-none flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center">
            <FiLayers className="mr-3 text-primary" /> Project Management
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-none bg-surface p-2 rounded-2xl border border-border shadow-sm mb-4 dark:bg-surface-dark/40">
          <div className="relative group max-w-md">
            <FiSearch className="absolute left-3 top-3 text-text-secondary transition-colors" />
            <input 
              type="text" placeholder="Search projects..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-app border border-border text-text-main text-base rounded-xl pl-10 py-2 outline-none focus:border-primary transition-all dark:bg-black/20"
            />
          </div>
        </div>

        {/* TABLE AREA */}
        <div className="flex-grow bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col mb-4">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            {loading ? <div className="flex justify-center p-20"><FiLoader className="animate-spin text-primary" size={40} /></div> : (
              <table className="w-full text-left text-text-secondary">
                <thead className="bg-app/80 text-[11px] uppercase text-text-secondary font-black border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 tracking-widest">Project Name</th>
                    <th className="px-6 py-4 tracking-widest">Owner</th>
                    <th className="px-6 py-4 tracking-widest">Visibility</th>
                    {/* YENİ SÜTUN BAŞLIĞI */}
                    <th className="px-6 py-4 text-right tracking-widest">Total Size</th>
                    <th className="px-6 py-4 text-right tracking-widest">Updated</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-3 font-bold text-text-main">{item.name}</td>
                      <td className="px-6 py-3 text-xs font-bold">{item.owner_name}</td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${item.is_public ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {item.is_public ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                      </td>
                      {/* YENİ SÜTUN VERİSİ */}
                      <td className="px-6 py-3 text-right text-xs font-mono font-bold text-text-main opacity-80">
                        {formatTotalSize(item.total_size)}
                      </td>
                      <td className="px-6 py-3 text-right text-xs font-bold opacity-40">
                        {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 relative">
                        <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors"><FiMoreVertical size={16} /></button>
                        {openMenuId === item.id && (
                          <div className="absolute right-8 top-2 w-40 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                            <button onClick={() => window.open(`/project/${item.id}`, '_blank')} className="w-full text-left px-4 py-2 text-xs font-bold text-text-main hover:bg-surface-hover flex items-center border-none transition-colors"><FiExternalLink className="mr-2"/> VIEW PROJECT</button>
                            <button onClick={() => handleDeleteProject(item)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center border-none transition-colors"><FiTrash2 className="mr-2"/> DELETE</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* PAGINATION BAR */}
        <div className="flex-none pb-4">
          <div className="flex justify-between items-center bg-surface p-3 border border-border rounded-xl shadow-sm dark:bg-surface-dark/60 backdrop-blur-md">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-60">
              {filteredData.length > 0 ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, filteredData.length)} / ${filteredData.length}` : "Showing 0 / 0"}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-app border border-border hover:bg-surface-hover text-text-secondary disabled:opacity-20 transition-all"><FiChevronLeft size={18}/></button>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg bg-app border border-border hover:bg-surface-hover text-text-secondary disabled:opacity-20 transition-all"><FiChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProjects;