// src/components/projects/ProjectEditPage.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext'; // Mevcut kullanıcıyı (kendimizi) bilmek için
import { 
  FiUserPlus, FiLoader, FiCheck, FiAlertTriangle, 
  FiUsers, FiTrash2, FiUser 
} from 'react-icons/fi';

// Bu component, 'Edit' sekmesinin içeriğidir
export default function ProjectEditPage() {
  
  // 1. Context'ten mevcut giriş yapmış kullanıcıyı al
  const { user } = useAuth(); 
  
  // 2. Context'ten 'currentProject' (ID'si için) ve GÜNCELLENMİŞ üye fonksiyonlarını al
  const { 
    currentProject, 
    addMember, 
    removeMember,       // Üye çıkarma fonksiyonu
    currentMembers,   // Global üye listesi
    fetchMembers       // Üye listesini doldurma fonksiyonu
  } = useProjectContext();

  // 3. "Invite" (Davet) formu için state'ler
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState('viewer'); // Varsayılan rol 'viewer'
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  // 4. "Remove" (Çıkar) işlemi için state
  const [removingId, setRemovingId] = useState(null); // Hangi üyenin silindiğini takip et

  // 5. Sayfa yüklendiğinde (veya proje değiştiğinde) üye listesini doldur
  // (Sidebar zaten doldurmuş olabilir, ama bu garantiye alır)
  useEffect(() => {
    if (currentProject) {
      fetchMembers(currentProject.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);


  // Proje verisi henüz yüklenmediyse bekle
  if (!currentProject) {
    return null;
  }

  // 6. "Add Member" (Üye Ekle) butonuna basıldığında
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!usernameToAdd) {
      setAddError('Please enter a username.');
      return;
    }

    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      // Context'teki 'addMember' fonksiyonunu 'roleToAdd' (rol) ile çağır
      // Bu, backend'i çağırır VE global 'currentMembers' state'ini günceller
      const addedMember = await addMember(currentProject.id, usernameToAdd, roleToAdd);
      
      setAddSuccess(`Successfully added ${addedMember.username} as ${addedMember.role}.`);
      setUsernameToAdd(''); 
      setRoleToAdd('viewer'); 
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // 7. "Remove" (Çıkar) butonuna basıldığında
  const handleRemoveMember = async (memberId, memberUsername) => {
    if (window.confirm(`Are you sure you want to remove ${memberUsername} from this project?`)) {
      setRemovingId(memberId); // Hangi butonun kilitlendiğini bilmek için
      try {
        // Context'teki 'removeMember' fonksiyonunu çağır
        // Bu, backend'i çağırır VE global 'currentMembers' state'ini günceller
        await removeMember(currentProject.id, memberId);
      } catch (err) {
        alert("Error: " + err.message); // Hata olursa uyar
      } finally {
        setRemovingId(null); // Kilidi aç
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Manage Members
      </h2>
      
      {/* === 1. BÖLÜM: "INVITE MEMBERS" (ÜYE EKLE) FORMU === */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Invite Members
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Add members to this project by their username and assign them a role.
        </p>
        
        <form onSubmit={handleMemberSubmit}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            
            {/* Username Input */}
            <div className="flex-grow">
              <label htmlFor="shareUsername" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                id="shareUsername"
                value={usernameToAdd}
                onChange={(e) => {
                  setUsernameToAdd(e.target.value);
                  setAddError(null); 
                  setAddSuccess(null);
                }}
                className="w-full py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username_to_add"
              />
            </div>
            
            {/* Role Select */}
            <div className="w-full md:w-40">
              <label htmlFor="shareRole" className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                id="shareRole"
                value={roleToAdd}
                onChange={(e) => setRoleToAdd(e.target.value)}
                className="w-full py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:pt-6">
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isAdding ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiUserPlus className="mr-2" />
                )}
                Add Member
              </button>
            </div>
          </div>
          
          {/* Başarı veya Hata Mesajları */}
          {addSuccess && (
            <p className="text-sm text-green-400 mt-2 flex items-center">
              <FiCheck className="mr-1" /> {addSuccess}
            </p>
          )}
          {addError && (
            <p className="text-sm text-red-400 mt-2 flex items-center">
              <FiAlertTriangle size={14} className="mr-1" />
              {addError}
            </p>
          )}
        </form>
      </div>

      {/* === 2. BÖLÜM: "CURRENT MEMBERS" (MEVCUT ÜYELER) LİSTESİ === */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">
          Current Members
        </h3>
        <div className="space-y-3">
          {/* Global 'currentMembers' state'ini map'le */}
          {currentMembers.length > 0 ? (
            currentMembers.map(member => (
              <div key={member.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center">
                  <FiUser className="w-5 h-5 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{member.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                  </div>
                </div>
                
                {/* Sadece 'owner' (sahip) olmayan üyeler için 'Remove' butonu göster
                    (ve 'owner' kendisini silemez - backend bunu zaten engelliyor)
                */}
                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.username)}
                    // Eğer bu üye şu an siliniyorsa, butonu kilitle
                    disabled={removingId === member.id}
                    className="text-red-500 hover:text-red-400 disabled:opacity-50 p-1 rounded-full"
                  >
                    {removingId === member.id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">This project has no other members.</p>
          )}
        </div>
      </div>
      
      {/* === 3. BÖLÜM: TEHLİKE ALANI (PROJE SİLME) === */}
      {/* (Bu bölüm, "projeyi public yap" özelliğini içermez) */}
      <div className="bg-gray-800 p-6 rounded-lg mt-6">
        <h3 className="text-xl font-semibold text-red-500 mb-4">
          Danger Zone
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Deleting this project is a permanent action and cannot be undone.
        </p>
        <button
          onClick={() => alert('Proje silme fonksiyonu eklenecek!')}
          className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Delete This Project
        </button>
      </div>
    </div>
  );
}