// src/pages/Users.js

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FiMail, FiUserPlus, FiMoreVertical, FiEdit2, FiTrash2, 
  FiEye, FiChevronLeft, FiChevronRight, FiX, FiUser, FiCheck, FiSearch, FiLock, FiShield
} from 'react-icons/fi';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const menuRef = useRef(null);

  // --- 1. VERİ ÇEKME ---
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
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

  // --- 2. FİLTRELEME & SAYFALAMA ---
  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  // --- 3. MODAL & FORM İŞLEMLERİ ---
  const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
      setSelectedUser(null);
      setFormData({ username: '', email: '', password: '', role: 'student' });
      setShowModal(true);
  };

  const openEditModal = (user) => {
      setSelectedUser(user);
      setFormData({
          username: user.username,
          email: user.email,
          password: '',
          role: user.role || 'student'
      });
      setOpenMenuUserId(null);
      setShowModal(true);
  };
const handleDelete = async (user) => {
  // Kullanıcıya onay soralım
  const confirmDelete = window.confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`);
  
  if (!confirmDelete) return;

  try {
    setIsSubmitting(true); // Yükleniyor durumunu kullanabiliriz
    await api.delete(`/api/auth/users/${user.id}`);
    
    alert("User deleted successfully.");
    setOpenMenuUserId(null); // Menüyü kapat
    fetchUsers(); // Listeyi yenile
  } catch (err) {
    console.error("Delete Error:", err);
    const errorMsg = err.response?.data?.message || "Failed to delete user.";
    alert(errorMsg);
  } finally {
    setIsSubmitting(false);
  }
};

  // --- FORM SUBMIT (MEVCUT MANTIK KORUNDU) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form gönderiliyor...");

    setIsSubmitting(true);

    if (!formData.username || !formData.email) {
        alert("Username and Email are required.");
        setIsSubmitting(false);
        return;
    }

    try {
        if (selectedUser) {
            // --- GÜNCELLEME ---
            const payload = { ...formData };
            if (!payload.password) delete payload.password; // Şifre yoksa gönderme

            console.log("Güncelleme isteği atılıyor:", payload);
            await api.put(`/api/auth/users/${selectedUser.id}`, payload);
            
            alert(`User updated successfully!`);
            fetchUsers(); // Listeyi yenile

        } else {
            // --- EKLEME ---
            if (!formData.password) {
                alert("Password is required for new users.");
                setIsSubmitting(false);
                return;
            }
            const payload = { ...formData };
            await api.post('/api/auth/register', payload);
            
            alert(`User created successfully!`);
            fetchUsers(); // Listeyi yenile
        }

        setShowModal(false);
        setFormData({ username: '', email: '', password: '', role: 'student' });
    } catch (err) {
        console.error("Submit Error:", err);
        const errorMsg = err.response?.data?.message || "Operation failed. Check console.";
        alert(errorMsg);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Menü dışına tıklama
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuUserId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuRef]);

  const toggleMenu = (id, e) => { e.stopPropagation(); setOpenMenuUserId(openMenuUserId === id ? null : id); };

  if (loading) return <div className="p-10 text-center text-text-secondary">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] container mx-auto max-w-6xl px-4 py-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
            {/* text-white -> text-text-main */}
            <h1 className="text-2xl font-bold text-text-main">User Management</h1>
            {/* text-gray-400 -> text-text-secondary */}
            <p className="text-xs text-text-secondary mt-1">Total <span className="text-text-main font-semibold">{filteredUsers.length}</span> records.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-2.5 text-text-secondary" />
                {/* Input: bg-surface, text-main, border-border */}
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm} 
                  onChange={handleSearch} 
                  className="w-full bg-surface border border-border text-text-main text-sm rounded-lg pl-10 pr-4 py-2 focus:border-primary outline-none transition-colors" 
                />
            </div>
            {/* Buton: bg-primary */}
            <button 
              onClick={openAddModal} 
              className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg font-medium text-sm whitespace-nowrap transition-colors"
            >
                <FiUserPlus className="mr-2" size={16} /> Add User
            </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      {/* bg-surface, border-border */}
      <div className="flex-1 bg-surface rounded-xl border border-border shadow-xl overflow-hidden flex flex-col relative" ref={menuRef}>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-text-secondary">
            {/* Header: bg-app/80 (hafif transparan) */}
            <thead className="bg-app/80 text-xs uppercase text-text-secondary font-semibold sticky top-0 z-10 backdrop-blur-sm border-b border-border">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Date</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    // Row Hover: bg-surface-hover
                    <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-2.5">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 text-xs">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-text-main">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-text-secondary flex items-center">
                        <FiMail className="mr-2 opacity-50" /> {user.email}
                      </td>
                      <td className="px-6 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          user.role === 'admin' 
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        }`}>
                            {user.role ? user.role.toUpperCase() : 'STUDENT'}
                        </span>
                      </td>
                      <td className="px-6 py-2.5 text-right text-xs text-text-secondary font-mono">
                        {new Date(user.created_at || Date.now()).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-6 py-2.5 relative">
                        <button onClick={(e) => toggleMenu(user.id, e)} className="p-1.5 rounded-full hover:bg-surface-hover text-text-secondary hover:text-text-main transition-colors">
                          <FiMoreVertical size={16} />
                        </button>
                        
                        {/* DROPDOWN MENU */}
                        {openMenuUserId === user.id && (
                            <div className="absolute right-8 top-2 w-32 bg-surface border border-border rounded-lg shadow-2xl z-50 animate-fade-in origin-top-right">
                                <button onClick={() => openEditModal(user)} className="w-full text-left px-4 py-2 text-xs text-text-main hover:bg-surface-hover flex items-center transition-colors">
                                  <FiEdit2 className="mr-2"/> Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(user)} 
                                      className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                                    >
                                <FiTrash2 className="mr-2"/> Delete
                              </button>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (<tr><td colSpan="5" className="p-10 text-center text-text-secondary">No users found.</td></tr>)}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER / PAGINATION */}
        <div className="bg-app/80 border-t border-border p-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-xs text-text-secondary">Page {currentPage} of {totalPages || 1}</span>
            <div className="flex space-x-1">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded bg-surface border border-border hover:bg-surface-hover text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronLeft size={16}/></button>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded bg-surface border border-border hover:bg-surface-hover text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronRight size={16}/></button>
            </div>
        </div>
      </div>

      {/* MODAL (ADD / EDIT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            {/* Modal Box: bg-surface */}
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-main transition-colors"><FiX size={24} /></button>
                
                <h2 className="text-2xl font-bold text-text-main mb-2 flex items-center">
                    {selectedUser ? <><FiEdit2 className="mr-3 text-yellow-500" /> Edit User</> : <><FiUserPlus className="mr-3 text-primary" /> New User</>}
                </h2>
                <p className="text-sm text-text-secondary mb-6">{selectedUser ? `Updating details for ${selectedUser.username}` : "Create a new student account."}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div className="relative">
                      <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiUser className="w-5 h-5 text-text-secondary" /></div>
                      <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-text-main bg-app border border-border rounded-lg placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors" placeholder="Username"/>
                    </div>
                    
                    {/* Email Input */}
                    <div className="relative">
                      <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiMail className="w-5 h-5 text-text-secondary" /></div>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-text-main bg-app border border-border rounded-lg placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors" placeholder="Email"/>
                    </div>
                    
                    {/* Password Input */}
                    <div className="relative">
                      <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiLock className="w-5 h-5 text-text-secondary" /></div>
                      <input type="password" name="password" required={!selectedUser} value={formData.password} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-text-main bg-app border border-border rounded-lg placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors" placeholder={selectedUser ? "New Password (Optional)" : "Password"}/>
                    </div>
                    
                    {/* Role Select (Only for Edit) */}
                    {selectedUser && (
                        <div className="relative">
                          <div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiShield className="w-5 h-5 text-text-secondary" /></div>
                          <select name="role" value={formData.role} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-text-main bg-app border border-border rounded-lg focus:outline-none focus:border-primary appearance-none transition-colors">
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting} className={`w-full text-white font-medium rounded-lg text-sm px-5 py-3 mt-4 flex justify-center items-center transition-colors ${selectedUser ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-primary hover:bg-primary-hover'}`}>
                      {isSubmitting ? 'Saving...' : (<>{selectedUser ? <><FiCheck className="mr-2"/> Update User</> : <><FiCheck className="mr-2"/> Create User</>}</>)}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default Users;