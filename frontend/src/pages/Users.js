// src/pages/Users.js

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FiMail, FiUserPlus, FiMoreVertical, FiEdit2, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiX, FiUser, FiCheck, FiSearch, FiLock, FiShield,
  FiBox, FiUsers, FiExternalLink, FiCalendar,FiLoader
} from 'react-icons/fi';

function Users() {
  const [activeTab, setActiveTab] = useState('users'); 
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  const menuRef = useRef(null);

  // --- MENU KONTROLÜ ---
  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuRef]);

  // --- VERİ ÇEKME ---
  useEffect(() => { 
    if (activeTab === 'users') fetchUsers();
    else fetchAllProjects();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/auth/users');
      if (Array.isArray(response.data)) {
         setUsers(response.data.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      // Bütün projeleri çekmek için backend'de oluşturduğumuz admin rotasını kullanıyoruz
      const response = await api.get('/api/projects/admin/all-projects'); 
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Projects Fetch Error:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // --- FİLTRELEME & SAYFALAMA ---
  const filteredData = activeTab === 'users' 
    ? users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    : projects.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPages = Math.max(Math.ceil(filteredData.length / itemsPerPage), 1);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- USER İŞLEMLERİ ---
  const openAddModal = () => {
      setSelectedItem(null);
      setFormData({ username: '', email: '', password: '', role: 'student' });
      setShowModal(true);
  };

  const openEditModal = (user) => {
      setSelectedItem(user);
      setFormData({
          username: user.username,
          email: user.email,
          password: '',
          role: user.role || 'student'
      });
      setOpenMenuId(null);
      setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (selectedItem) {
            await api.put(`/api/auth/users/${selectedItem.id}`, formData);
        } else {
            await api.post('/api/auth/register', formData);
        }
        fetchUsers();
        setShowModal(false);
    } catch (err) { alert("Operation failed."); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user.username}?`);
    if (!confirmDelete) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/api/auth/users/${user.id}`);
      setOpenMenuId(null);
      fetchUsers();
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (project) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete project "${project.name}"?`);
    if (!confirmDelete) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/api/projects/${project.id}`);
      setOpenMenuId(null);
      fetchAllProjects();
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] container mx-auto max-w-6xl px-4 py-4 overflow-hidden">
      
      {/* TABS HEADER */}
      <div className="flex items-center space-x-1 bg-surface p-1 rounded-xl border border-border w-fit mb-6 shadow-sm">
        <button 
          onClick={() => { setActiveTab('users'); setCurrentPage(1); setSearchTerm(""); }}
          className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover'}`}
        >
          <FiUsers className="mr-2" /> Users
        </button>
        <button 
          onClick={() => { setActiveTab('projects'); setCurrentPage(1); setSearchTerm(""); }}
          className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover'}`}
        >
          <FiBox className="mr-2" /> Projects
        </button>
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative flex-1 md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-text-secondary" />
          <input 
            type="text" 
            placeholder={activeTab === 'users' ? "Search users..." : "Search projects..."}
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            className="w-full bg-surface border border-border text-text-main text-sm rounded-lg pl-10 pr-4 py-2 focus:border-primary outline-none transition-colors shadow-sm" 
          />
        </div>
        
        {activeTab === 'users' && (
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg font-bold text-sm transition-colors border-none">
            <FiUserPlus className="mr-2" /> Add User
          </button>
        )}
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div className="flex-grow bg-surface rounded-xl border border-border shadow-xl overflow-hidden flex flex-col relative" ref={menuRef}>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-20"><FiLoader className="animate-spin text-primary" size={40} /></div>
          ) : (
            <table className="w-full text-left text-text-secondary">
              <thead className="bg-app/80 text-[11px] uppercase text-text-secondary font-black sticky top-0 z-10 backdrop-blur-sm border-b border-border">
                {activeTab === 'users' ? (
                  <tr>
                    <th className="px-6 py-4 tracking-widest">User Details</th>
                    <th className="px-6 py-4 tracking-widest">Role</th>
                    <th className="px-6 py-4 text-right tracking-widest">Joined</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 tracking-widest">Project Name</th>
                    <th className="px-6 py-4 tracking-widest">Owner</th>
                    <th className="px-6 py-4 tracking-widest">Visibility</th>
                    <th className="px-6 py-4 text-right tracking-widest">Updated</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                    {activeTab === 'users' ? (
                      <>
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black mr-3 text-xs border border-primary/20">
                              {item.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-text-main leading-none mb-1">{item.username}</span>
                              <span className="text-[11px] opacity-60 font-medium">{item.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${item.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                            {item.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-xs font-bold opacity-40">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3 font-bold text-text-main">{item.name}</td>
                        <td className="px-6 py-3 text-xs font-bold">{item.owner_name}</td>
                        <td className="px-6 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${item.is_public ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                            {item.is_public ? 'PUBLIC' : 'PRIVATE'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-xs font-bold opacity-40">
                          {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-3 relative">
                      <button onClick={(e) => toggleMenu(item.id, e)} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors">
                        <FiMoreVertical size={16} />
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-8 top-2 w-40 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                          {activeTab === 'users' ? (
                            <>
                              <button onClick={() => openEditModal(item)} className="w-full text-left px-4 py-2 text-xs font-bold text-text-main hover:bg-surface-hover flex items-center border-none transition-colors"><FiEdit2 className="mr-2"/> EDIT USER</button>
                              <button 
                                onClick={() => handleDeleteUser(item)} 
                                className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center border-none transition-colors"
                              >
                                <FiTrash2 className="mr-2"/> DELETE
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => window.open(`/project/${item.id}`, '_blank')} className="w-full text-left px-4 py-2 text-xs font-bold text-text-main hover:bg-surface-hover flex items-center border-none transition-colors"><FiExternalLink className="mr-2"/> VIEW PROJECT</button>
                              <button 
                                onClick={() => handleDeleteProject(item)} 
                                className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center border-none transition-colors"
                              >
                                <FiTrash2 className="mr-2"/> DELETE
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* PAGINATION BAR */}
        <div className="flex-none bg-surface border-t border-border p-4 flex items-center justify-between">
            <span className="text-xs text-text-secondary font-black uppercase tracking-widest opacity-60">
              {filteredData.length > 0 ? (
                `Showing ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, filteredData.length)} / ${filteredData.length}`
              ) : "Showing 0 / 0"}
            </span>
            <div className="flex items-center gap-2">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-app border border-border hover:bg-surface-hover text-text-secondary disabled:opacity-20 transition-all"><FiChevronLeft size={18}/></button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-text-secondary hover:bg-app border border-border'}`}>{i+1}</button>
                  ))}
                </div>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg bg-app border border-border hover:bg-surface-hover text-text-secondary disabled:opacity-20 transition-all"><FiChevronRight size={18}/></button>
            </div>
        </div>
      </div>

      {/* USER MODAL */}
      {showModal && activeTab === 'users' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-8 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-text-secondary hover:text-text-main transition-colors border-none bg-transparent cursor-pointer"><FiX size={20} /></button>
                <h2 className="text-xl font-black text-text-main mb-6 uppercase tracking-tight">
                    {selectedItem ? 'Update User' : 'New Registration'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input name="username" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full py-3 px-4 text-sm text-text-main bg-app border border-border rounded-xl focus:border-primary outline-none" placeholder="Username"/>
                  <input type="email" name="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full py-3 px-4 text-sm text-text-main bg-app border border-border rounded-xl focus:border-primary outline-none" placeholder="Email Address"/>
                  <input type="password" name="password" required={!selectedItem} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full py-3 px-4 text-sm text-text-main bg-app border border-border rounded-xl focus:border-primary outline-none" placeholder={selectedItem ? "New Password (Optional)" : "Password"}/>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:opacity-90 text-white font-black rounded-xl py-3 mt-4 transition-all uppercase tracking-widest text-xs border-none cursor-pointer">
                      {isSubmitting ? 'Saving...' : 'Save Data'}
                  </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default Users;