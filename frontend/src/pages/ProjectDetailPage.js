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
        <FiLoader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error && !currentProject) {
    return (
      <div className="p-20 flex justify-center text-red-500">
        <FiAlertTriangle size={40} />
        <span className="ml-4">Error: {error}</span>
      </div>
    );
  }

  const userRole = currentProject?.currentUserRole;
  const isTasksPublic = currentProject?.is_tasks_public;
  
  const showTasksTab = userRole !== 'public_viewer' || isTasksPublic;
  const showDiscussionsTab = userRole !== 'public_viewer';
  const showEditTab = userRole === 'owner';

  // --- TAB NAVIGASYON STİLİ ---
  const navLinkStyle = ({ isActive }) =>
    `flex-1 flex items-center justify-center px-4 py-3 font-semibold border-b-2 transition-colors ` +
    (isActive 
      ? 'text-primary border-primary bg-primary/5' // Aktif: Marka rengi ve çok hafif zemin
      : 'text-text-secondary border-transparent hover:text-text-main hover:bg-surface-hover'); // Pasif: Gri ve hover efekti

  return (
    // text-white -> text-text-main
    <div className="p-4 text-text-main h-full flex flex-col">
      
      {/* BAŞLIK ALANI */}
      <h1 className="text-4xl font-bold mb-2 text-text-main">{currentProject.name}</h1>
      
      {/* AÇIKLAMA: text-gray-400 -> text-text-secondary */}
      <p className="text-lg text-text-secondary mb-6 leading-relaxed">
        {currentProject.description || "No description provided."}
      </p>
      
      {/* NAVIGASYON: border-gray-700 -> border-border */}
      <nav className="flex border-b border-border mb-6">
        
        <NavLink to="" end className={navLinkStyle}> 
          <FiFile className="mr-2" />
          Files
        </NavLink>

        {showTasksTab && (
          <NavLink to="tasks" className={navLinkStyle}>
            <FiLayout className="mr-2" />
            Tasks
          </NavLink>
        )}
        
        <NavLink to="issues" className={navLinkStyle}>
          <FiCheckSquare className="mr-2" />
          Issues
        </NavLink>
        
        {showDiscussionsTab && (
          <NavLink to="discussions" className={navLinkStyle}>
            <FiMessageSquare className="mr-2" />
            Discussions
          </NavLink>
        )}
        
        {showEditTab && (
          <NavLink to="edit" className={navLinkStyle}>
            <FiEdit className="mr-2" />
            Edit
          </NavLink>
        )}
      </nav>

      {/* İÇERİK ALANI (Diğer sayfaların yükleneceği yer) */}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}

export default ProjectDetailPage;