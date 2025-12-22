// src/pages/Users.js

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FiMail, FiUserPlus, FiMoreVertical, FiEdit2, FiTrash2, 
  FiEye, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

function Users() {
  // --- STATE TANIMLARI ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Sayfa başı 10 kullanıcı

  // Dropdown State (Hangi kullanıcının menüsü açık?)
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  
  // Click Outside için Ref
  const menuRef = useRef(null);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- CLICK OUTSIDE (Menü dışına tıklayınca kapatma) ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    
      const sortedUsers = response.data.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setUsers(sortedUsers);

    } catch (err) {
      console.error("Kullanıcılar çekilemedi:", err);
      setError("Kullanıcı listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION MANTIĞI ---
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- DROPDOWN TOGGLE ---
  const toggleMenu = (id, e) => {
    e.stopPropagation(); // Satıra tıklamayı engelle
    if (openMenuUserId === id) {
      setOpenMenuUserId(null);
    } else {
      setOpenMenuUserId(id);
    }
  };

  // --- HTML ÇIKTISI ---
  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Yükleniyor...</div>;
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] container mx-auto max-w-6xl px-4 py-6">
      
      {/* 1. HEADER & ADD USER BUTONU */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
            <p className="text-sm text-gray-400 mt-1">
                Toplam <span className="text-white font-semibold">{users.length}</span> kullanıcı listeleniyor.
            </p>
        </div>
        
        <button 
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95 font-medium"
            onClick={() => alert("Add User Modal Açılacak")}
        >
            <FiUserPlus className="mr-2" size={18} />
            Add User
        </button>
      </div>

      {/* 2. TABLO ALANI (flex-1 ile kalan boşluğu kaplar) */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden flex flex-col relative" ref={menuRef}>
        
        {/* Tablo İçeriği (Kaydırılabilir) */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 font-semibold sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">E-Posta</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-right">Tarih</th>
                <th className="px-6 py-4 w-10"></th> {/* Aksiyon Kolonu */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors group">
                  
                  {/* İsim */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 text-sm shadow-md">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <FiMail className="mr-2 opacity-50" />
                      {user.email}
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-6 py-4">
                     <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        user.role === 'admin' 
                        ? 'border-red-500/30 text-red-400 bg-red-500/10' 
                        : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                     }`}>
                        {user.role?.toUpperCase()}
                     </span>
                  </td>

                  {/* Tarih */}
                  <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('tr-TR')}
                  </td>

                  {/* 3. ÜÇ NOKTA MENU (DROPDOWN) */}
                  <td className="px-6 py-4 relative">
                    <button 
                        onClick={(e) => toggleMenu(user.id, e)}
                        className={`p-2 rounded-full hover:bg-gray-600 transition-colors ${openMenuUserId === user.id ? 'bg-gray-600 text-white' : 'text-gray-500'}`}
                    >
                        <FiMoreVertical size={18} />
                    </button>

                    {/* Dropdown Content */}
                    {openMenuUserId === user.id && (
                        <div className="absolute right-8 top-8 w-40 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 animate-fade-in origin-top-right overflow-hidden">
                            <div className="py-1">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center transition-colors">
                                    <FiEye className="mr-2" size={14}/> Detay
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center transition-colors">
                                    <FiEdit2 className="mr-2" size={14}/> Düzenle
                                </button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center transition-colors">
                                    <FiTrash2 className="mr-2" size={14}/> Sil
                                </button>
                            </div>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Boş Durum */}
          {users.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Kullanıcı bulunamadı.
            </div>
          )}
        </div>

        {/* 4. PAGINATION FOOTER (Sabit Alt Kısım) */}
        <div className="bg-gray-900/50 border-t border-gray-700 p-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">
                Gösterilen: {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)} / {users.length}
            </span>

            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FiChevronLeft size={16} />
                </button>

                {/* Sayfa Numaraları */}
                <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                currentPage === i + 1 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FiChevronRight size={16} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

export default Users;