// src/pages/ProjectDetailPage.js

import React, { useEffect } from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { 
  FiLoader, FiAlertTriangle, FiCheckSquare, 
  FiMessageSquare, FiFile, FiEdit, FiLayout 
} from 'react-icons/fi';

function ProjectDetailPage() {
  const { id } = useParams();
  
  const { currentProject, loading, error, fetchProjectById } = useProjectContext();

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || (!currentProject && !error)) {
    return (
      <div className="p-20 flex justify-center">
        <FiLoader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }
  if (error && !currentProject) {
    return (
      <div className="p-20 flex justify-center text-red-400">
        <FiAlertTriangle size={40} />
        <span className="ml-4">Error: {error}</span>
      </div>
    );
  }

  const userRole = currentProject?.currentUserRole;
  const isTasksPublic = currentProject?.is_tasks_public;

  // === GÖRÜNÜRLÜK KONTROLLERİ ===
  const showTasksTab = userRole !== 'public_viewer' || isTasksPublic;
  const showDiscussionsTab = userRole !== 'public_viewer';
  const showEditTab = userRole === 'owner';

  // === STİL (GÜNCELLENDİ) ===
  // 'grid' yerine 'flex' kullanarak yan yana sıralanmayı garanti altına alıyoruz.
  // 'w-full' ve 'flex-1' her sekmenin eşit genişlikte olmasını sağlar.
  const navLinkStyle = ({ isActive }) =>
    `flex-1 flex items-center justify-center px-2 py-3 font-semibold border-b-2 transition-colors text-sm md:text-base ` +
    (isActive 
      ? 'text-white border-blue-500' 
      : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700');

  return (
    <div className="p-4 text-white max-w-7xl mx-auto">
      {/* Başlık ve Açıklama */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{currentProject.name}</h1>
      <p className="text-gray-400 mb-8">{currentProject.description}</p>
      
      {/* === SEKME MENÜSÜ (DÜZELTİLDİ) === */}
      {/* 'grid' yerine 'flex' yapısı kullanıldı. Böylece 'grid-cols-X' hatası oluşmaz. */}
      <nav className="flex flex-wrap border-b border-gray-700 mb-6">
        
        {/* Files */}
        <NavLink to="" end className={navLinkStyle}> 
          <FiFile className="mr-2" />
          Files
        </NavLink>

        {/* Tasks */}
        {showTasksTab && (
          <NavLink to="tasks" className={navLinkStyle}>
            <FiLayout className="mr-2" />
            Tasks
          </NavLink>
        )}
        
        {/* Issues */}
        <NavLink to="issues" className={navLinkStyle}>
          <FiCheckSquare className="mr-2" />
          Issues
        </NavLink>
        
        {/* Discussions */}
        {showDiscussionsTab && (
          <NavLink to="discussions" className={navLinkStyle}>
            <FiMessageSquare className="mr-2" />
            Discussions
          </NavLink>
        )}
        
        {/* Edit */}
        {showEditTab && (
          <NavLink to="edit" className={navLinkStyle}>
            <FiEdit className="mr-2" />
            Edit
          </NavLink>
        )}
      </nav>

      {/* İçerik Alanı */}
      <Outlet />
    </div>
  );
}

export default ProjectDetailPage;