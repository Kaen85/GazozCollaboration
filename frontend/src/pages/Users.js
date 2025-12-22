// src/pages/Users.js

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FiMail, FiUserPlus, FiMoreVertical, FiEdit2, FiTrash2, 
  FiEye, FiChevronLeft, FiChevronRight, FiX, FiUser, FiCheck, FiSearch, FiLock
} from 'react-icons/fi';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const menuRef = useRef(null);

  // --- 1. VERİ ÇEKME ---
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // DÜZELTME: Doğru adres '/api/auth/users'
      // api.js zaten localhost:5000'i ekliyor ve token'ı koyuyor.
      const response = await api.get('/api/auth/users');
      
      if (Array.isArray(response.data)) {
         const sortedUsers = response.data.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
         setUsers(sortedUsers);
      } else {
         setUsers([]);
      }
    } catch (err) {
      console.error("Kullanıcılar çekilemedi:", err);
      // Yetki hatası varsa (401) belki login sayfasına atmak gerekebilir ama şimdilik boş liste gösterelim
      setUsers([]);
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

  // --- 3. KULLANICI EKLEME ---
  const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.username || !formData.email || !formData.password) {
        alert("Please enter all fields.");
        setIsSubmitting(false);
        return;
    }

    try {
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password
        };

        // DÜZELTME: Doğru kayıt adresi '/api/auth/register'
        const response = await api.post('/api/auth/register', payload);
        
        const newUser = response.data.user || response.data; 
        const userWithDate = { ...newUser, created_at: new Date().toISOString() };
        
        setUsers([userWithDate, ...users]);
        setShowModal(false);
        setFormData({ username: '', email: '', password: '' });
        
        alert(`User created successfully: ${newUser.username}`);

    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Error creating user.";
        alert(msg);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Menü ve Dış Tıklama
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuRef]);

  const toggleMenu = (id, e) => { 
      e.stopPropagation(); 
      setOpenMenuUserId(openMenuUserId === id ? null : id); 
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] container mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-gray-400 mt-1">Total <span className="text-white">{filteredUsers.length}</span> records.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-3 text-gray-500" />
                <input type="text" placeholder="Search users..." value={searchTerm} onChange={handleSearch} className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none" />
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg font-medium whitespace-nowrap">
                <FiUserPlus className="mr-2" size={18} /> Add User
            </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden flex flex-col relative" ref={menuRef}>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 font-semibold sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Date</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 text-sm">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 flex items-center">
                        <FiMail className="mr-2 opacity-50" /> {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${user.role === 'admin' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>
                            {user.role ? user.role.toUpperCase() : 'STUDENT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
                        {new Date(user.created_at || Date.now()).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-6 py-4 relative">
                        <button onClick={(e) => toggleMenu(user.id, e)} className="p-2 rounded-full hover:bg-gray-600 text-gray-500">
                            <FiMoreVertical size={18} />
                        </button>
                        {openMenuUserId === user.id && (
                            <div className="absolute right-8 top-8 w-40 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 animate-fade-in z-50">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"><FiEye className="mr-2"/> Details</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"><FiEdit2 className="mr-2"/> Edit</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center"><FiTrash2 className="mr-2"/> Delete</button>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-900/50 border-t border-gray-700 p-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages || 1}</span>
            <div className="flex space-x-2">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><FiChevronLeft/></button>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><FiChevronRight/></button>
            </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX size={24} /></button>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center"><FiUserPlus className="mr-3 text-blue-500" /> New User</h2>
                <p className="text-sm text-gray-400 mb-6">Create a new student account.</p>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="relative"><div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiUser className="w-5 h-5 text-gray-500" /></div><input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-500" placeholder="Username"/></div>
                    <div className="relative"><div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiMail className="w-5 h-5 text-gray-500" /></div><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-500" placeholder="Email"/></div>
                    <div className="relative"><div className="absolute top-0 left-0 flex items-center h-full pl-3 pointer-events-none"><FiLock className="w-5 h-5 text-gray-500" /></div><input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full py-2.5 pl-10 pr-4 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-500" placeholder="Password"/></div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm px-5 py-3 mt-4 flex justify-center items-center transition-colors">{isSubmitting ? 'Creating...' : <><FiCheck className="mr-2"/> Create User</>}</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default Users;