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
  
  // Context'ten verileri al
  const { currentProject, loading, error, fetchProjectById } = useProjectContext();

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- Güvenlik Blokları (Beyaz Ekran Önleyici) ---
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

  // Kullanıcının rolünü ve proje ayarlarını al
  const userRole = currentProject?.currentUserRole;
  const isTasksPublic = currentProject?.is_tasks_public;

  // === GÖRÜNÜRLÜK KONTROLLERİ ===
  
  // 1. Tasks Sekmesi: 
  // - Üyeler ('owner', 'editor', 'viewer') HER ZAMAN görür.
  // - 'public_viewer' (üye olmayan) ise SADECE 'isTasksPublic' true ise görür.
  const showTasksTab = userRole !== 'public_viewer' || isTasksPublic;
  
  // 2. Discussions Sekmesi: 
  // - Sadece Üyeler görür ('public_viewer' göremez).
  const showDiscussionsTab = userRole !== 'public_viewer';

  // 3. Edit Sekmesi: 
  // - Sadece Sahip (Owner) görür.
  const showEditTab = userRole === 'owner';

  // === GRID HESAPLAMA ===
  // Kaç sekme göstereceğimizi hesaplayıp grid-cols sınıfını ona göre verelim.
  // Files ve Issues her zaman görünür (Total: 2)
  let totalTabs = 2; 
  if (showTasksTab) totalTabs++;
  if (showDiscussionsTab) totalTabs++;
  if (showEditTab) totalTabs++;

  const navCols = `grid-cols-${totalTabs}`;

  // NavLink stili
  const navLinkStyle = ({ isActive }) =>
    `flex items-center justify-center px-4 py-3 font-semibold border-b-2 transition-colors ` +
    (isActive 
      ? 'text-white border-blue-500' 
      : 'text-gray-400 border-transparent hover:text-gray-200');

  return (
    <div className="p-4 text-white">
      {/* Başlık ve Açıklama */}
      <h1 className="text-4xl font-bold mb-2">{currentProject.name}</h1>
      <p className="text-lg text-gray-400 mb-6">{currentProject.description}</p>
      
      {/* Sekme Menüsü */}
      <nav className={`grid ${navCols} border-b border-gray-700 mb-6`}>
        
        {/* Files (Herkes görür) */}
        <NavLink to="" end className={navLinkStyle}> 
          <FiFile className="mr-2" />
          Files
        </NavLink>

        {/* Tasks (Koşullu) */}
        {showTasksTab && (
          <NavLink to="tasks" className={navLinkStyle}>
            <FiLayout className="mr-2" />
            Tasks
          </NavLink>
        )}
        
        {/* Issues (Herkes görür) */}
        <NavLink to="issues" className={navLinkStyle}>
          <FiCheckSquare className="mr-2" />
          Issues
        </NavLink>
        
        {/* Discussions (Koşullu) */}
        {showDiscussionsTab && (
          <NavLink to="discussions" className={navLinkStyle}>
            <FiMessageSquare className="mr-2" />
            Discussions
          </NavLink>
        )}
        
        {/* Edit (Koşullu) */}
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