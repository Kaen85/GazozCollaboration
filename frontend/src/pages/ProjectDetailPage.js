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
  
  const showTasksTab = userRole !== 'public_viewer' || isTasksPublic;
  const showDiscussionsTab = userRole !== 'public_viewer';
  const showEditTab = userRole === 'owner';

  // === DÜZELTME BURADA ===
  // Eski "grid hesaplama" kodlarını sildik.
  // Yerine Flexbox kullanıyoruz.

  const navLinkStyle = ({ isActive }) =>
    // 'flex-1': Tüm sekmeler eşit genişlikte olsun ve yan yana dolsun
    `flex-1 flex items-center justify-center px-4 py-3 font-semibold border-b-2 transition-colors ` +
    (isActive 
      ? 'text-white border-blue-500' 
      : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800');

  return (
    <div className="p-4 text-white">
      <h1 className="text-4xl font-bold mb-2">{currentProject.name}</h1>
      <p className="text-lg text-gray-400 mb-6">{currentProject.description}</p>
      
      {/* <nav> kısmını 'grid' yerine 'flex' yaptık */}
      <nav className="flex border-b border-gray-700 mb-6">
        
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

      <Outlet />
    </div>
  );
}

export default ProjectDetailPage;