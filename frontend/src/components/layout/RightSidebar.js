// src/components/layout/RightSidebar.js

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectContext } from '../../context/ProjectContext';
import { 
  FiCalendar, FiClock, FiUser, FiUsers, 
  FiChevronsRight, FiShield, FiEdit2, FiEye
} from 'react-icons/fi';

// Tarih Formatlayıcı
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Profil Resmi URL Oluşturucu
const getProfileSrc = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
};

// Rol Etiketi Yardımcı Bileşeni
const RoleBadge = ({ role }) => {
    let colorClass = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    let icon = <FiEye size={10} className="mr-1"/>;
    let label = "Viewer";

    if (role === 'editor') {
        colorClass = "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
        icon = <FiEdit2 size={10} className="mr-1"/>;
        label = "Editor";
    } else if (role === 'owner') {
        colorClass = "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
        icon = <FiShield size={10} className="mr-1"/>;
        label = "Owner";
    }

    return (
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center ${colorClass}`}>
            {icon} {label}
        </span>
    );
};

function RightSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { currentProject, currentMembers, fetchMembers } = useProjectContext();
  
  // Sadece proje sayfasındaysak ve proje verisi varsa render et
  const isProjectPage = location.pathname.startsWith('/project/');
  const shouldRenderSidebar = isProjectPage && currentProject;

  // Üyeleri Çek
  useEffect(() => { 
    if (shouldRenderSidebar && currentProject?.id) {
        fetchMembers(currentProject.id); 
    }
  }, [currentProject?.id, shouldRenderSidebar, fetchMembers]);

  if (!shouldRenderSidebar) return null;

  const membersList = currentMembers || [];
  
  // Proje sahibi ve Diğer üyeleri ayır
  const projectOwner = membersList.find(m => m.role === 'owner' || m.id === currentProject?.owner_id);
  const otherMembers = membersList.filter(m => m.role !== 'owner' && m.id !== currentProject?.owner_id);

  return (
    <div 
      className={`${
        isOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'
      } bg-surface border-l border-border flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 h-full z-30 shadow-2xl`}
    >
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="animate-fade-in flex flex-col h-full p-6">
            
            {/* HEADER & KAPAT BUTONU */}
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-text-main leading-tight tracking-tight break-words flex-1 pr-2">
                    {currentProject.name}
                </h2>
                <button 
                    onClick={toggleSidebar}
                    className="text-text-secondary hover:text-text-main hover:bg-app p-2 rounded-full transition-colors flex-shrink-0"
                >
                    <FiChevronsRight size={24} />
                </button>
            </div>

            <div className="mb-6">
                <div className="text-sm text-text-secondary leading-relaxed font-medium">
                    {currentProject.description || <span className="italic opacity-70">No description provided.</span>}
                </div>
            </div>

            {/* PROJE SAHİBİ KARTI */}
            <div className="mb-8">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center">
                    Project Lead
                </h4>
                <div className="flex items-center justify-between p-3 bg-app border border-border rounded-xl shadow-sm group hover:border-primary/30 transition-colors">
                    <div className="flex items-center overflow-hidden">
                        {/* AVATAR - OWNER */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md mr-3 overflow-hidden border border-white/10 flex-shrink-0">
                            {projectOwner?.profile_picture ? (
                                <img 
                                    src={getProfileSrc(projectOwner.profile_picture)} 
                                    alt={projectOwner.username} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                projectOwner?.username?.charAt(0).toUpperCase() || <FiUser />
                            )}
                        </div>
                        <p className="text-text-main font-bold text-sm truncate max-w-[120px]">
                            {projectOwner ? projectOwner.username : 'Unknown'}
                        </p>
                    </div>
                    <RoleBadge role="owner" />
                </div>
            </div>

            {/* ÜYE LİSTESİ */}
            <div className="mb-8 flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-end mb-3">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Team Members</h4>
                    <span className="text-[10px] font-bold text-text-secondary bg-app px-2 py-0.5 rounded border border-border">
                        {otherMembers.length}
                    </span>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar pr-1 -mr-1 flex-1">
                    {otherMembers.length > 0 ? (
                        <div className="space-y-2">
                            {otherMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-app rounded-lg transition-colors border border-transparent hover:border-border group">
                                    <div className="flex items-center overflow-hidden">
                                        {/* AVATAR - MEMBERS */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-500 to-gray-700 flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm group-hover:from-primary group-hover:to-purple-600 transition-all overflow-hidden flex-shrink-0">
                                            {member.profile_picture ? (
                                                <img 
                                                    src={getProfileSrc(member.profile_picture)} 
                                                    alt={member.username} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                member.username.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-text-main text-sm font-medium truncate max-w-[100px]">{member.username}</span>
                                    </div>
                                    
                                    {/* ROL ETİKETİ */}
                                    <RoleBadge role={member.role} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 border border-dashed border-border rounded-xl text-center bg-app/30 flex flex-col items-center justify-center h-32">
                            <FiUsers className="text-text-secondary mb-2 opacity-50" size={24} />
                            <p className="text-xs text-text-secondary font-medium">No other members yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER STATS */}
            <div className="mt-auto pt-6 border-t border-border grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center text-text-secondary mb-1">
                        <FiCalendar className="mr-1.5 text-xs"/> <span className="text-[10px] uppercase font-bold tracking-wide">Created</span>
                    </div>
                    <span className="text-text-main text-xs font-mono font-bold block">
                        {formatDate(currentProject.created_at)}
                    </span>
                </div>
                <div>
                    <div className="flex items-center text-text-secondary mb-1">
                        <FiClock className="mr-1.5 text-xs"/> <span className="text-[10px] uppercase font-bold tracking-wide">Updated</span>
                    </div>
                    <span className="text-text-main text-xs font-mono font-bold block">
                        {formatDate(currentProject.last_updated_at || currentProject.created_at)}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;