// src/pages/AdminUsers.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FiUserPlus, FiMoreVertical, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiSearch, FiUsers, FiLoader 
} from 'react-icons/fi';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
  const itemsPerPage = 7;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/auth/users');
      setUsers(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedItem) await api.put(`/api/auth/users/${selectedItem.id}`, formData);
      else await api.post('/api/auth/register', formData);
      fetchUsers();
      setShowModal(false);
    } catch (err) { alert("Operation failed."); } finally { setIsSubmitting(false); }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.username}?`)) return;
    try {
      await api.delete(`/api/auth/users/${user.id}`);
      fetchUsers();
    } catch (err) { alert("Delete failed."); }
  };

  const filteredData = users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(Math.ceil(filteredData.length / itemsPerPage), 1);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4 pb-0 bg-app transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* HEADER SECTION */}
        <div className="flex-none flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center">
            <FiUsers className="mr-3 text-primary" /> User Management
          </h1>
          <button onClick={() => { setSelectedItem(null); setFormData({ username: '', email: '', password: '', role: 'student' }); setShowModal(true); }} className="bg-primary hover:opacity-90 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center text-sm border-none">
            <FiUserPlus className="mr-2" /> Add User
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-none bg-surface p-2 rounded-2xl border border-border shadow-sm mb-4 dark:bg-surface-dark/40">
          <div className="relative group max-w-md">
            <FiSearch className="absolute left-3 top-3 text-text-secondary transition-colors" />
            <input 
              type="text" placeholder="Search users..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-app border border-border text-text-main text-base rounded-xl pl-10 py-2 outline-none focus:border-primary transition-all dark:bg-black/20"
            />
          </div>
        </div>

        {/* TABLE AREA */}
        <div className="flex-grow bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col mb-4">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            {loading ? <div className="flex justify-center p-20"><FiLoader className="animate-spin text-primary" size={40} /></div> : (
              <table className="w-full text-left">
                <thead className="bg-app/80 text-[11px] uppercase text-text-secondary font-black border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                  <tr><th className="px-6 py-4">User Details</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Joined</th><th className="px-6 py-4 w-10"></th></tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {currentItems.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-3 flex items-center">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black mr-3 text-xs">{u.username?.charAt(0).toUpperCase()}</div>
                        <div className="flex flex-col"><span className="font-bold text-text-main leading-none mb-1">{u.username}</span><span className="text-[11px] opacity-60">{u.email}</span></div>
                      </td>
                      <td className="px-6 py-3"><span className={`text-[10px] font-black px-2 py-0.5 rounded border ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{u.role?.toUpperCase()}</span></td>
                      <td className="px-6 py-3 text-right opacity-40 font-bold">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-3 relative">
                        <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors"><FiMoreVertical size={16} /></button>
                        {openMenuId === u.id && (
                          <div className="absolute right-8 top-2 w-32 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                            <button onClick={() => { setSelectedItem(u); setFormData({username:u.username, email:u.email, role:u.role, password:''}); setShowModal(true); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-bold text-text-main hover:bg-surface-hover flex items-center border-none transition-colors"><FiEdit2 className="mr-2"/> EDIT</button>
                            <button onClick={() => handleDeleteUser(u)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center border-none transition-colors"><FiTrash2 className="mr-2"/> DELETE</button>
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

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-text-secondary border-none bg-transparent cursor-pointer"><FiX size={20}/></button>
            <h2 className="text-xl font-black mb-6 text-text-main uppercase tracking-tight">{selectedItem ? 'Update User' : 'New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={formData.username} onChange={(e)=>setFormData({...formData, username:e.target.value})} className="w-full py-3 px-4 bg-app border border-border rounded-xl text-text-main outline-none focus:border-primary" placeholder="Username"/>
              <input value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} className="w-full py-3 px-4 bg-app border border-border rounded-xl text-text-main outline-none focus:border-primary" placeholder="Email"/>
              <input type="password" value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})} className="w-full py-3 px-4 bg-app border border-border rounded-xl text-text-main outline-none focus:border-primary" placeholder="Password"/>
              <select value={formData.role} onChange={(e)=>setFormData({...formData, role:e.target.value})} className="w-full py-3 px-4 bg-app border border-border rounded-xl text-text-main outline-none focus:border-primary">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-black rounded-xl py-3 mt-4 transition-all hover:opacity-90 border-none cursor-pointer uppercase text-xs tracking-widest">{isSubmitting ? 'Saving...' : 'Save'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;