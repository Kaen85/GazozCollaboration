// src/pages/ProjectDetailPage.js

import React, { useEffect } from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiAlertTriangle, FiCheckSquare, FiMessageSquare, FiFile, FiEdit } from 'react-icons/fi';

function ProjectDetailPage() {
  const { id } = useParams();
  
  // 1. Context'ten 'currentProject' verisini (artık 'currentUserRole' içeriyor) al
  const { currentProject, loading, error, fetchProjectById } = useProjectContext();

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- Güvenlik Blokları (Beyaz Ekran Önleyici) ---
  if (loading || (!currentProject && !error)) {
    return <div className="p-20 flex justify-center"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;
  }
  if (error && !currentProject) {
    return <div className="p-20 flex justify-center text-red-400"><FiAlertTriangle size={40} /><span className="ml-4">Error: {error}</span></div>;
  }

  // 2. Kullanıcının rolünü al (Backend'den 'owner' veya 'viewer' vb. olarak gelir)
  const userRole = currentProject?.currentUserRole;

  // 3. Role göre sekme menüsü 3'lü mü 4'lü mü olacağına karar ver
  const navGridCols = userRole === 'owner' ? 'grid-cols-4' : 'grid-cols-3';

  // NavLink (Sekme) stili
  const navLinkStyle = ({ isActive }) =>
    `flex items-center justify-center px-4 py-3 font-semibold border-b-2 transition-colors ` +
    (isActive 
      ? 'text-white border-blue-500' 
      : 'text-gray-400 border-transparent hover:text-gray-200');

  // --- BAŞARILI RENDER ---
  return (
    <div className="p-4 text-white">
      {/* Üst Kısım (Açıklama) */}
      <h1 className="text-4xl font-bold mb-2">{currentProject.name}</h1>
      <p className="text-lg text-gray-400 mb-6">{currentProject.description}</p>
      
      {/* === 4. GÜNCELLENMİŞ SEKME MENÜSÜ === */}
      <nav className={`grid ${navGridCols} border-b border-gray-700 mb-6`}>
        
        {/* YENİ SIRA 1: Files (Artık varsayılan 'index' rotası) */}
        <NavLink to="" end className={navLinkStyle}> 
          <FiFile className="mr-2" />
          Files
        </NavLink>
        
        {/* YENİ SIRA 2: Issues */}
        <NavLink to="issues" className={navLinkStyle}>
          <FiCheckSquare className="mr-2" />
          Issues
        </NavLink>
        
        {/* YENİ SIRA 3: Discussions */}
        <NavLink to="discussions" className={navLinkStyle}>
          <FiMessageSquare className="mr-2" />
          Discussions
        </NavLink>
        
        {/* === 5. KOŞULLU 'EDIT' SEKMESİ === */}
        {/* Bu sekme, sadece 'userRole' "owner" ise görünür */}
        {userRole === 'owner' && (
          <NavLink to="edit" className={navLinkStyle}>
            <FiEdit className="mr-2" />
            Edit
          </NavLink>
        )}
      </nav>

      {/* İçerik Alanı (App.js'deki tanıma göre dolar) */}
      <Outlet />
    </div>
  );
}

export default ProjectDetailPage;