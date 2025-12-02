// src/components/layout/RightSidebar.js

import React, { useEffect } from 'react';
// 'useState' kaldırıldı
import { useProjectContext } from '../../context/ProjectContext';
import { FiUser, FiLoader, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import { useLocation, useParams } from 'react-router-dom'; 

function RightSidebar() {
  const { id: projectIdFromUrl } = useParams(); 
  
  // 1. Context'ten 'currentProject' (isim/tarih için)
  //    ve 'currentMembers' (global üye listesi) al
  const { currentProject, currentMembers, fetchMembers, loading } = useProjectContext();
  const location = useLocation();

  // 2. 'members' ve 'loadingMembers' state'leri kaldırıldı

  const isProjectDetailPage = location.pathname.startsWith('/project/');

  // 3. useEffect artık SADECE 'fetchMembers'ı çağırıyor.
  //    (Liste 'currentMembers' state'inde tutuluyor)
  useEffect(() => {
    if (isProjectDetailPage && projectIdFromUrl) {
      // Global listeyi doldurmak için fetchMembers'ı tetikle
      fetchMembers(projectIdFromUrl);
    }
  // 'fetchMembers'ı bağımlılıklara ekleyelim (best practice)
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
    <aside className="w-72 bg-black bg-opacity-30 p-4 backdrop-blur-md border-l border-gray-700 flex-shrink-0 hidden md:block">
      
      {/* 4. 'currentProject' verisini SADECE render için kullan */}
      {isProjectDetailPage && currentProject ? (
        
        // --- PROJE SAYFASI İÇERİĞİ ---
        <div className="text-white">
          
          <h2 className="text-xl font-bold mb-4 pb-4 border-b border-gray-700">
            {currentProject.name}
          </h2>
          
          <div className="mb-2 pb-2 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <FiUsers className="inline mr-1" />
              Group Members
            </h3>
            {/* 5. 'loading' (global) ve 'currentMembers' (global) state'ini kullan */}
            {loading && currentMembers.length === 0 ? (
              <div className="flex justify-center p-4">
                <FiLoader className="animate-spin text-blue-500" />
              </div>
            ) : currentMembers.length > 0 ? (
              <ul className="space-y-3">
                {currentMembers.map(member => (
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

          <div className="space-y-3 mt-4"> 
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
          </p>
        </div>

      )}
    </aside>
  );
}

export default RightSidebar;