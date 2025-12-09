// src/components/layout/RightSidebar.js

import React, { useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { 
  FiUser, FiLoader, FiCalendar, FiClock, FiUsers, FiShare2
} from 'react-icons/fi';
import { useLocation, useParams } from 'react-router-dom'; 

function RightSidebar() {
  const { id: projectIdFromUrl } = useParams(); 
  const location = useLocation();

  const { 
    currentProject, 
    currentMembers, 
    fetchMembers, 
    loading,
    // İstatistikler için gereken veriler ve fonksiyonlar kaldırıldı
  } = useProjectContext();

  const isProjectDetailPage = location.pathname.startsWith('/project/');

  useEffect(() => {
    if (isProjectDetailPage && projectIdFromUrl) {
      fetchMembers(projectIdFromUrl);
    } 
    // Dashboard için istatistik çekme işlemleri kaldırıldı
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectDetailPage, projectIdFromUrl, fetchMembers]); 

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <aside className="w-72 bg-black bg-opacity-30 backdrop-blur-md p-4 border-l border-white/10 flex-shrink-0 hidden md:block">
      
      {isProjectDetailPage && currentProject ? (
        
        // --- A: PROJE DETAY SAYFASI ---
        <div className="text-white">
          <h2 className="text-xl font-bold mb-4 pb-4 border-b border-white/10">
            {currentProject.name}
          </h2>
          
          <div className="mb-2 pb-2 border-b border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              <FiUsers className="inline mr-1" />
              Group Members
            </h3>
            {loading && currentMembers.length === 0 ? (
              <div className="flex justify-center p-4">
                <FiLoader className="animate-spin text-blue-400" />
              </div>
            ) : currentMembers.length > 0 ? (
              <ul className="space-y-3">
                {currentMembers.map(member => (
                  <li key={member.id} className="flex items-center">
                    <FiUser className="w-5 h-5 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{member.username}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No members found.</p>
            )}
          </div>

          <div className="space-y-3 mt-4"> 
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Project Info
            </h3>
            
            {/* Son Güncelleme */}
            <div className="flex items-center text-sm text-gray-300">
              <FiClock className="mr-2 flex-shrink-0" />
              <span>Last Updated: {formatDate(currentProject.last_updated_at)}</span>
            </div>
            
            {/* Oluşturulma Tarihi (Her zaman görünür) */}
            <div className="flex items-center text-sm text-gray-300">
              <FiCalendar className="mr-2 flex-shrink-0" />
              <span>Project Created: {formatDate(currentProject.created_at)}</span>
            </div>

            {/* Paylaşılma Tarihi (Sadece Public ise ayrıca görünür) */}
            {currentProject.is_public && (
              <div className="flex items-center text-sm text-gray-300">
                <FiShare2 className="mr-2 flex-shrink-0" />
                <span>Shared Date: {formatDate(currentProject.created_at)}</span>
              </div>
            )}

          </div>
        </div>

      ) : (

        // --- B: DASHBOARD (İSTATİSTİKLER KALDIRILDI) ---
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