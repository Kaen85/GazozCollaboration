// src/components/layout/RightSidebar.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiUser, FiLoader, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import { useLocation, useParams } from 'react-router-dom'; // useParams eklendi

function RightSidebar() {
  // 1. Proje ID'sini doğrudan URL'den al
  const { id: projectIdFromUrl } = useParams(); 
  
  // 2. Context'ten 'currentProject' (tarihler/isim için) ve 'fetchMembers' (liste için) al
  const { currentProject, fetchMembers } = useProjectContext();
  const location = useLocation();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isProjectDetailPage = location.pathname.startsWith('/project/');

  // 3. useEffect'i 'currentProject'e DEĞİL, URL'deki 'projectIdFromUrl'e bağla
  useEffect(() => {
    // Sadece proje detay sayfasındaysak ve URL'de ID varsa
    if (isProjectDetailPage && projectIdFromUrl) {
      setLoadingMembers(true);
      
      fetchMembers(projectIdFromUrl)
        .then(data => {
          setMembers(data || []);
        })
        .catch(err => {
          console.error("RightSidebar: Failed to fetch members:", err);
          setMembers([]);
        })
        .finally(() => {
          setLoadingMembers(false);
        });
    } else {
      // Proje detay sayfasında değilsek, listeyi temizle
      setMembers([]);
    }
  // 'currentProject' bağımlılığını kaldırmak 'race condition'ı önler
  }, [isProjectDetailPage, projectIdFromUrl, fetchMembers]); 

  // Helper: Tarihleri formatlamak için
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <aside className="w-72 bg-gray-800 p-4 border-l border-gray-700 flex-shrink-0 hidden md:block">
      
      {/* 4. 'currentProject' verisini SADECE render için kullan (data fetching için değil) */}
      {isProjectDetailPage && currentProject ? (
        
        // --- PROJE SAYFASI İÇERİĞİ ---
        <div className="text-white">
          
          <h2 className="text-xl font-bold mb-4 pb-4 border-b border-gray-700">
            {currentProject.name}
          </h2>
          
          <div className="mb-2 pb-2 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <FiUsers className="inline mr-1" />
              Grup Üyeleri
            </h3>
            {loadingMembers ? (
              <div className="flex justify-center p-4">
                <FiLoader className="animate-spin text-blue-500" />
              </div>
            ) : members.length > 0 ? (
              <ul className="space-y-3">
                {members.map(member => (
                  <li key={member.id} className="flex items-center">
                    <FiUser className="w-5 h-5 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{member.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No members found.</p>
            )}
          </div>

          <div className="space-y-3 mt-4"> {/* Üstteki bölümle boşluk için 'mt-4' eklendi */}
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Project Info
            </h3>
            <div className="flex items-center text-sm text-gray-300">
              <FiClock className="mr-2 flex-shrink-0" />
              <span>Last Updated: {formatDate(currentProject.last_updated_at)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <FiCalendar className="mr-2 flex-shrink-0" />
              <span>Project Created: {formatDate(currentProject.created_at)}</span>
            </div>
          </div>

        </div>

      ) : (

        // --- DASHBOARD (DİĞER SAYFA) İÇERİĞİ ---
        <div className="text-white">
          <h3 className="font-bold text-lg mb-4">Quick Info</h3>
          <p className="text-sm text-gray-400">
            This panel will show notifications or other relevant info in the future.
          {/* === DÜZELTME BURADA: '</D>' yerine '</p>' === */}
          </p>
        </div>

      )}
    </aside>
  );
}

export default RightSidebar;