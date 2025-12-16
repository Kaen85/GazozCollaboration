// src/components/layout/RightSidebar.js

import React, { useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
// FiX (Kapatma ikonu) ve FiInfo eklendi
import { 
  FiUser, FiLoader, FiCalendar, FiClock, FiUsers, FiShare2, FiX, FiInfo
} from 'react-icons/fi';
import { useLocation, useParams } from 'react-router-dom'; 

// isOpen ve onClose props olarak alındı
function RightSidebar({ isOpen, onClose }) {
  const { id: projectIdFromUrl } = useParams(); 
  const location = useLocation();

  const { 
    currentProject, 
    currentMembers, 
    fetchMembers, 
    loading,
  } = useProjectContext();

  const isProjectDetailPage = location.pathname.startsWith('/project/');

  useEffect(() => {
    if (isProjectDetailPage && projectIdFromUrl) {
      fetchMembers(projectIdFromUrl);
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectDetailPage, projectIdFromUrl]); 

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* 1. OVERLAY (Arka plan karartma) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 2. SIDEBAR PANELİ */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header (Kapatma Butonu Kısmı) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2 text-blue-400">
            <FiInfo size={20} />
            <h3 className="font-bold text-white text-lg">Details</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Sidebar İçeriği (Mevcut Mantık Korundu) */}
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">
          
          {isProjectDetailPage && currentProject ? (
            
            // --- A: PROJE DETAY SAYFASI ---
            <div className="text-white space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {currentProject.name}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {currentProject.description || "No description provided."}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center">
                  <FiUsers className="mr-2" />
                  Group Members
                </h3>
                {loading && currentMembers.length === 0 ? (
                  <div className="flex justify-center p-4">
                    <FiLoader className="animate-spin text-blue-400" />
                  </div>
                ) : currentMembers.length > 0 ? (
                  <ul className="space-y-3">
                    {currentMembers.map(member => (
                      <li key={member.id} className="flex items-center bg-gray-800/50 p-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mr-3">
                          <FiUser />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.username}</p>
                          <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No members found.</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-3"> 
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Project Info
                </h3>
                
                <div className="flex items-center text-sm text-gray-400">
                  <FiClock className="mr-2 text-blue-400" />
                  <span>Updated: {formatDate(currentProject.last_updated_at)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <FiCalendar className="mr-2 text-purple-400" />
                  <span>Created: {formatDate(currentProject.created_at)}</span>
                </div>

                {currentProject.is_public && (
                  <div className="flex items-center text-sm text-gray-400">
                    <FiShare2 className="mr-2 text-green-400" />
                    <span>Public since: {formatDate(currentProject.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

          ) : (

            // --- B: DASHBOARD ---
            <div className="text-white">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
                <h3 className="font-bold text-lg mb-2">Quick Info</h3>
                <p className="text-sm text-gray-400">
                  Select a project to see detailed information, members, and statistics here.
                </p>
              </div>
            </div>

          )}
        </div>
      </div>
    </>
  );
}

export default RightSidebar;