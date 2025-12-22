// src/pages/Users.js

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FiMail, FiUserPlus, FiMoreVertical, FiEdit2, FiTrash2, 
  FiEye, FiChevronLeft, FiChevronRight, FiX, FiUser, FiCheck, FiSearch
} from 'react-icons/fi';

function Users() {
  // --- 1. STATE TANIMLARI ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfalama State'i (İSTEK: Sayfada Max 6 Kişi)
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6); 

  // Arama State'i (İSTEK: Search Bar)
  const [searchTerm, setSearchTerm] = useState(""); 

  // Diğer State'ler
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  const menuRef = useRef(null);

  // --- 2. VERİ ÇEKME ---
  useEffect(() => {
    fetchUsers();
  }, []);

  // Menü dışına tıklayınca kapatma
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuRef]);

  const fetchUsers = async () => {
    try {
      // SENİN İSTEĞİN ÜZERİNE: Backend'e dokunmadan, çalışan eski adresi kullanıyoruz.
      // Eğer backend'inde '/users' rotası varsa bu çalışacaktır.
      const response = await api.get('/users');
      
      if (Array.isArray(response.data)) {
         // Yeniden eskiye sıralama (created_at varsa)
         const sortedUsers = response.data.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
         setUsers(sortedUsers);
      } else {
         setUsers([]);
      }
    } catch (err) {
      console.error("Kullanıcılar çekilemedi:", err);
      // Hata olsa bile boş liste göster, sayfa patlamasın
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ARAMA VE FİLTRELEME ---
  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- 4. SAYFALAMA MANTIĞI ---
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Arama yapınca ilk sayfaya dön
  };

  // --- 5. İŞLEVLER ---
  const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role
        };

        // Backend'deki kayıt rotan. (Genelde /auth/register veya /api/auth/register olur)
        // api.js base URL ayarına göre burası '/auth/register' olarak ayarlandı.
        const response = await api.post('/auth/register', payload);
        
        // Dönen veriyi listeye ekle
        const newUser = response.data.user || response.data; // Backend yapına göre değişebilir
        const userWithDate = { ...newUser, created_at: new Date().toISOString() };
        
        setUsers([userWithDate, ...users]);
        
        setShowModal(false);
        setFormData({ username: '', email: '', password: '', role: 'student' });
        alert(`Kullanıcı başarıyla oluşturuldu: ${newUser.username || formData.username}`);

    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Kullanıcı oluşturulurken hata oluştu.";
        alert(msg);
    } finally {
        setIsSubmitting(false);
    }
  };

  const toggleMenu = (id, e) => { 
      e.stopPropagation(); 
      setOpenMenuUserId(openMenuUserId === id ? null : id); 
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Yükleniyor...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] container mx-auto max-w-6xl px-4 py-6">
      
      {/* BAŞLIK VE ARAMA ÇUBUĞU */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-gray-400 mt-1">
                Toplam <span className="text-white">{filteredUsers.length}</span> kayıt bulundu.
            </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            {/* SEARCH INPUT */}
            <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-3 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Kullanıcı ara..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                />
            </div>

            <button 
                onClick={() => setShowModal(true)} 
                className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-all active:scale-95 font-medium whitespace-nowrap"
            >
                <FiUserPlus className="mr-2" size={18} /> Add User
            </button>
        </div>
      </div>

      {/* TABLO KUTUSU */}
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
                            {user.role ? user.role.toUpperCase() : 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
                        {new Date(user.created_at || Date.now()).toLocaleDateString('tr-TR')}
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
                  <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-500">
                          "{searchTerm}" aramasıyla eşleşen kullanıcı bulunamadı.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* SAYFALAMA ALANI */}
        <div className="bg-gray-900/50 border-t border-gray-700 p-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">Sayfa {currentPage} / {totalPages || 1}</span>
            <div className="flex space-x-2">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><FiChevronLeft/></button>
                
                {/* Sayfa Numaraları */}
                <div className="hidden sm:flex space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                currentPage === i + 1 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><FiChevronRight/></button>
            </div>
        </div>
      </div>

      {/* --- ADD USER MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-1 flex items-center">
                    <FiUserPlus className="mr-3 text-blue-500" /> New User
                </h2>
                <p className="text-sm text-gray-400 mb-6">Sisteme yeni kullanıcı ekle.</p>

                <form onSubmit={handleAddUser} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">USERNAME</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-500" />
                            <input 
                                type="text" name="username" required
                                value={formData.username} onChange={handleInputChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-10 p-2.5 focus:border-blue-500 outline-none"
                                placeholder="kullanici_adi"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">EMAIL</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-3 text-gray-500" />
                            <input 
                                type="email" name="email" required
                                value={formData.email} onChange={handleInputChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-10 p-2.5 focus:border-blue-500 outline-none"
                                placeholder="ornek@email.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">PASSWORD</label>
                        <input 
                            type="password" name="password" required
                            value={formData.password} onChange={handleInputChange}
                            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none"
                            placeholder="******"
                        />
                    </div>

                    {/* Role Selection - EDITOR KALDIRILDI */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">ROLE</label>
                        <select 
                            name="role"
                            value={formData.role} onChange={handleInputChange}
                            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none"
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors mt-4 flex justify-center items-center disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Kaydediliyor...</span>
                        ) : (
                            <> <FiCheck className="mr-2" size={18}/> Kullanıcıyı Oluştur </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

export default Users;