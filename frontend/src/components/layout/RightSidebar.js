// src/components/layout/RightSidebar.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectContext } from '../../context/ProjectContext';
import api from '../../services/api'; 
import { 
  FiX, FiCalendar, FiClock, FiUser, FiUsers, 
  FiChevronsRight, FiTarget, FiActivity, FiTrendingUp, 
  FiShield, FiUserPlus, FiDownload, FiFolder, FiGlobe, FiLock, FiStar
} from 'react-icons/fi';

function RightSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { currentProject, currentMembers, fetchMembers, myProjects, fetchMyProjects } = useProjectContext();

  // --- SAYFA KONTROLLERİ ---
  const isProjectPage = location.pathname.startsWith('/project/');
  const isUsersPage = location.pathname === '/users'; 
  const isDashboardPage = location.pathname === '/dashboard'; // Dashboard kontrolü
  const showProjectDetails = isProjectPage && currentProject;

  // --- STATELER ---
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, users: 0, newThisMonth: 0, loading: false });
  // Dashboard için proje istatistikleri state'i (Context'ten geliyorsa gerek yok ama hesaplamak için)
  
  // --- EFFECT: PROJE VERİLERİ ---
  useEffect(() => {
    if (showProjectDetails && currentProject?.id) {
        fetchMembers(currentProject.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]);

  // --- EFFECT: DASHBOARD VERİLERİ ---
  useEffect(() => {
      // Dashboard'dayken projeler yüklü değilse yükle
      if (isDashboardPage && isOpen && myProjects.length === 0) {
          fetchMyProjects();
      }
  }, [isDashboardPage, isOpen]);

  // --- EFFECT: USERS İSTATİSTİKLERİ ---
  useEffect(() => {
    if (isUsersPage && isOpen) {
        const fetchStats = async () => {
            setUserStats(prev => ({ ...prev, loading: true }));
            try {
                const res = await api.get('/auth/users'); // API yolu auth/users olabilir, kontrol edin
                const usersList = res.data;
                
                const total = usersList.length;
                const admins = usersList.filter(u => u.role === 'admin').length;
                const now = new Date();
                const newUsers = usersList.filter(u => {
                    const d = new Date(u.created_at);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length;

                setUserStats({
                    total,
                    admins,
                    users: total - admins,
                    newThisMonth: newUsers,
                    loading: false
                });
            } catch (err) {
                console.error("İstatistik hatası:", err);
                setUserStats(prev => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
    }
  }, [isUsersPage, isOpen]);


  // --- YARDIMCI FONKSİYONLAR ---
  const projectOwner = currentMembers ? currentMembers.find(m => m.role === 'owner') : null;
  const otherMembers = currentMembers ? currentMembers.filter(m => m.role !== 'owner') : [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // --- RENDER: DASHBOARD CONTENT (YENİ EKLENEN KISIM) ---
  const renderDashboardContent = () => {
      const totalProjects = myProjects.length;
      const publicProjects = myProjects.filter(p => p.is_public).length;
      const privateProjects = totalProjects - publicProjects;
      // En son güncellenen proje
      const latestProject = [...myProjects].sort((a,b) => new Date(b.last_updated_at) - new Date(a.last_updated_at))[0];

      return (
        <div className="animate-fade-in flex flex-col h-full">
            <div className="mt-2 mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <FiActivity className="mr-3 text-purple-500" />
                    Overview
                </h2>
            </div>

            {/* 1. KART: TOPLAM PROJE */}
            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-5 rounded-2xl border border-indigo-500/30 mb-6 relative overflow-hidden group shadow-lg">
                <div className="absolute -right-4 -top-4 text-indigo-500 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                    <FiFolder size={100} />
                </div>
                <h3 className="text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">Total Projects</h3>
                <p className="text-5xl font-extrabold text-white tracking-tight">{totalProjects}</p>
            </div>

            {/* 2. KART: PUBLIC / PRIVATE ORANI */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
                    <FiTarget className="mr-2 text-blue-400"/> Visibility Status
                </h4>
                <div className="space-y-4">
                    {/* Public Bar */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-green-400 flex items-center"><FiGlobe className="mr-1"/> Public</span>
                            <span className="text-white font-mono">{publicProjects}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: totalProjects > 0 ? `${(publicProjects/totalProjects)*100}%` : '0%' }}></div>
                        </div>
                    </div>
                    {/* Private Bar */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-yellow-400 flex items-center"><FiLock className="mr-1"/> Private</span>
                            <span className="text-white font-mono">{privateProjects}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" style={{ width: totalProjects > 0 ? `${(privateProjects/totalProjects)*100}%` : '0%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. KART: SON AKTİVİTE */}
            {latestProject && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                        <FiClock className="mr-2 text-orange-400"/> Last Activity
                    </h4>
                    <div className="text-xs text-gray-400 mb-2">You recently worked on:</div>
                    <div className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded mr-3">
                            <FiActivity />
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm truncate w-32">{latestProject.name}</div>
                            <div className="text-gray-500 text-[10px]">{new Date(latestProject.last_updated_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  // --- RENDER: USERS CONTENT ---
  const renderUsersContent = () => (
    <div className="animate-fade-in flex flex-col h-full">
        <div className="mt-2 mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <FiUsers className="mr-3 text-blue-500" />
                User Stats
            </h2>
        </div>

        {userStats.loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
        ) : (
            <>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl border border-gray-700 mb-8 relative overflow-hidden group shadow-lg">
                    <div className="absolute -right-4 -top-4 text-gray-700 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                        <FiUsers size={100} />
                    </div>
                    <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Users</h3>
                    <p className="text-5xl font-extrabold text-white tracking-tight">{userStats.total}</p>
                </div>

                <div className="mb-10 space-y-5">
                    <h4 className="text-sm font-semibold text-gray-300 flex items-center uppercase tracking-wide">
                        <FiShield className="mr-2 text-blue-500" /> Role Distribution
                    </h4>
                    
                    <div className="group">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span className="group-hover:text-red-400 transition-colors">Admins</span>
                            <span className="font-mono">{userStats.admins}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                                style={{ width: userStats.total > 0 ? `${(userStats.admins / userStats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    <div className="group">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span className="group-hover:text-blue-400 transition-colors">Students</span>
                            <span className="font-mono">{userStats.users}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                style={{ width: userStats.total > 0 ? `${(userStats.users / userStats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
  );

  // --- RENDER: PROJECT CONTENT ---
  const renderProjectContent = () => (
    <div className="animate-fade-in flex flex-col h-full">
        <div className="mt-1 mb-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">
                {currentProject.name}
            </h2>
        </div>

        <div className="mb-8">
            {currentProject.description ? (
                <p className="text-sm text-gray-300 leading-relaxed font-light">
                {currentProject.description}
                </p>
            ) : (
                <p className="text-sm text-gray-500 italic">No description added.</p>
            )}
        </div>

        <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                Led By
            </h4>
            <div className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-blue-500/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md mr-3 group-hover:scale-105 transition-transform">
                    {projectOwner?.username?.charAt(0).toUpperCase() || <FiUser />}
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">
                        {projectOwner?.username || 'Loading...'}
                    </p>
                    <p className="text-xs text-blue-400 font-medium">Project Owner</p>
                </div>
            </div>
        </div>

        <div className="mb-8 flex-1">
            <div className="flex justify-between items-end mb-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Team</h4>
                <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {otherMembers.length} members
                </span>
            </div>
            {otherMembers.length > 0 ? (
                <div className="space-y-2">
                    {otherMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-default">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-bold mr-3 border border-gray-600">
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-gray-300 text-sm">{member.username}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold border border-gray-700 px-1.5 py-0.5 rounded">
                                {member.role}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 border border-dashed border-gray-700 rounded-xl text-center">
                    <FiUsers className="mx-auto text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500">Solo project for now.</p>
                </div>
            )}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
            <div>
                <div className="flex items-center text-gray-500 mb-1">
                    <FiCalendar className="mr-1.5 text-xs"/> <span className="text-[10px] uppercase font-bold tracking-wide">Created</span>
                </div>
                <span className="text-gray-300 text-xs font-mono">
                {formatDate(currentProject.created_at)}
                </span>
            </div>
            <div>
                <div className="flex items-center text-gray-500 mb-1">
                    <FiClock className="mr-1.5 text-xs"/> <span className="text-[10px] uppercase font-bold tracking-wide">Updated</span>
                </div>
                <span className="text-gray-300 text-xs font-mono">
                {formatDate(currentProject.last_updated_at || currentProject.created_at)}
                </span>
            </div>
        </div>
    </div>
  );

  // --- ANA RENDER ---
  return (
    <div 
      className={`${
        isOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'
      } bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 h-full z-30 shadow-2xl`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900 pointer-events-none" />
      
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar pt-6">
        
        {/* Hangi içeriğin gösterileceğini belirle */}
        {isDashboardPage ? (
            renderDashboardContent()
        ) : isUsersPage ? (
            renderUsersContent()
        ) : showProjectDetails ? (
            renderProjectContent()
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
               <FiTarget size={32} className="text-gray-600" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Ready to Focus?</h3>
            <p className="text-gray-500 text-sm max-w-[200px] leading-relaxed">
              Select a project to see details here.
            </p>
          </div>
        )}

      </div>

      <div className="absolute bottom-0 left-0 w-full h-12 border-t border-gray-800 bg-gray-900/90 backdrop-blur-sm z-20 flex items-center justify-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800 group"
        >
          <FiChevronsRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}

export default RightSidebar;