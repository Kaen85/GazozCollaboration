// src/components/layout/RightSidebar.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectContext } from '../../context/ProjectContext';
import api from '../../services/api';
import { 
  FiX, FiCalendar, FiClock, FiUser, FiUsers, 
  FiChevronsRight, FiTarget, FiActivity, 
  FiShield, FiInfo
} from 'react-icons/fi';

function RightSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { currentProject, currentMembers, fetchMembers } = useProjectContext();
  const isProjectPage = location.pathname.startsWith('/project/');
  const isUsersPage = location.pathname === '/users';
  const showProjectDetails = isProjectPage && currentProject;
  const shouldRenderSidebar = isProjectPage || isUsersPage;

  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0, loading: false });

  useEffect(() => { if (showProjectDetails && currentProject?.id) fetchMembers(currentProject.id); }, [currentProject?.id]);
  useEffect(() => {
    if (isUsersPage && isOpen) {
        const fetchStats = async () => {
            setStats(prev => ({ ...prev, loading: true }));
            try {
                const res = await api.get('/api/auth/users');
                const usersList = res.data;
                const total = usersList.length;
                const admins = usersList.filter(u => u.role === 'admin').length;
                setStats({ total, admins, users: total - admins, loading: false });
            } catch (err) { setStats(prev => ({ ...prev, loading: false })); }
        };
        fetchStats();
    }
  }, [isUsersPage, isOpen]);

  const projectOwner = currentMembers ? currentMembers.find(m => m.role === 'owner') : null;
  const otherMembers = currentMembers ? currentMembers.filter(m => m.role !== 'owner') : [];
  const formatDate = (dateString) => { if (!dateString) return 'N/A'; return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); };

  if (!shouldRenderSidebar) return null;

  const renderProjectContent = () => (
    <div className="animate-fade-in flex flex-col h-full">
        <div className="mt-1 mb-8">
            <h2 className="text-3xl font-black text-text-main leading-tight tracking-tight">
                {currentProject.name}
            </h2>
        </div>

        <div className="mb-8">
            {currentProject.description ? (
               <p className="text-sm text-text-secondary leading-relaxed font-medium">
                {currentProject.description}
                </p>
            ) : (
                <p className="text-sm text-text-secondary italic">No description added.</p>
            )}
         </div>

        <div className="mb-8">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center">
                Led By
            </h4>
            <div className="flex items-center p-3 bg-app border border-border rounded-xl hover:border-primary/50 transition-colors group shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md mr-3 group-hover:scale-105 transition-transform">
                    {projectOwner?.username?.charAt(0).toUpperCase() || <FiUser />}
                </div>
                <div>
                    <p className="text-text-main font-bold text-sm">
                        {projectOwner?.username || 'Loading...'}
                    </p>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">Project Owner</p>
                </div>
            </div>
        </div>

        <div className="mb-8 flex-1">
            <div className="flex justify-between items-end mb-3">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Team</h4>
                <span className="text-xs font-bold text-text-secondary bg-app px-2 py-0.5 rounded-md border border-border">
                    {otherMembers.length} members
                </span>
            </div>
            {otherMembers.length > 0 ? (
                <div className="space-y-2">
                    {otherMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-app rounded-lg transition-colors cursor-default border border-transparent hover:border-border">
                             <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-main text-xs font-bold mr-3 shadow-sm">
                                    {member.username.charAt(0).toUpperCase()}
                                 </div>
                                <span className="text-text-main text-sm font-medium">{member.username}</span>
                            </div>
                            <span className="text-[10px] text-text-secondary uppercase font-bold border border-border px-1.5 py-0.5 rounded bg-surface">
                                {member.role}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 border border-dashed border-border rounded-xl text-center bg-app/50">
                    <FiUsers className="mx-auto text-text-secondary mb-2" />
                    <p className="text-xs text-text-secondary font-medium">Solo project for now.</p>
                </div>
            )}
        </div>

        <div className="mt-auto pt-6 border-t border-border grid grid-cols-2 gap-4">
            <div>
                 <div className="flex items-center text-text-secondary mb-1">
                    <FiCalendar className="mr-1.5 text-xs"/> <span className="text-[10px] uppercase font-bold tracking-wide">Created</span>
                </div>
                <span className="text-text-main text-xs font-mono font-bold">
                {formatDate(currentProject.created_at)}
                </span>
            </div>
            <div>
                <div className="flex items-center text-text-secondary mb-1">
                    <FiClock className="mr-1.5 text-xs"/> <span className="text-[10px] uppercase font-bold tracking-wide">Updated</span>
                </div>
                 <span className="text-text-main text-xs font-mono font-bold">
                {formatDate(currentProject.last_updated_at || currentProject.created_at)}
                </span>
            </div>
        </div>
    </div>
  );

  const renderUsersContent = () => (
    <div className="animate-fade-in flex flex-col h-full">
        <div className="mt-2 mb-8">
            <h2 className="text-2xl font-black text-text-main flex items-center tracking-tight">
                <FiActivity className="mr-3 text-primary" />
                System Overview
            </h2>
        </div>

         {stats.loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
            <>
                <div className="bg-surface p-5 rounded-2xl border border-border mb-8 relative overflow-hidden group shadow-sm">
                    <div className="absolute -right-4 -top-4 text-text-secondary opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <FiUsers size={100} />
                    </div>
                    <h3 className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Total Users</h3>
                    <p className="text-5xl font-black text-text-main tracking-tight">{stats.total}</p>
                </div>

                <div className="mb-10 space-y-5">
                    <h4 className="text-sm font-bold text-text-main flex items-center uppercase tracking-wide border-b border-border pb-2">
                        <FiShield className="mr-2 text-primary" /> Role Distribution
                    </h4>
                    
                    <div className="group">
                        <div className="flex justify-between text-xs font-bold text-text-secondary mb-1.5">
                             <span className="group-hover:text-red-500 transition-colors">Admins</span>
                            <span className="font-mono text-text-main">{stats.admins}</span>
                        </div>
                        <div className="w-full bg-app rounded-full h-2.5 overflow-hidden border border-border">
                            <div 
                                className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: stats.total > 0 ? `${(stats.admins / stats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                     <div className="group">
                        <div className="flex justify-between text-xs font-bold text-text-secondary mb-1.5">
                            <span className="group-hover:text-blue-500 transition-colors">Students</span>
                            <span className="font-mono text-text-main">{stats.users}</span>
                        </div>
                        <div className="w-full bg-app rounded-full h-2.5 overflow-hidden border border-border">
                            <div 
                               className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: stats.total > 0 ? `${(stats.users / stats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>
             </>
        )}
    </div>
  );

  return (
    <div 
      className={`${
        isOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'
      } bg-surface border-l border-border flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 h-full z-30 shadow-2xl`}
    >
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar pt-6">
        {isUsersPage ? renderUsersContent() : showProjectDetails ? renderProjectContent() : null}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-12 border-t border-border bg-surface/90 backdrop-blur-sm z-20 flex items-center justify-center">
        <button
          onClick={toggleSidebar}
          className="text-text-secondary hover:text-text-main transition-colors p-2 rounded-full hover:bg-app group"
        >
          <FiChevronsRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default RightSidebar;