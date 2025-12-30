// src/pages/DashboardOverviewPage.js

import React, { useEffect, useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FiFolder, FiCheckSquare, FiClock, FiArrowRight, 
  FiActivity, FiUsers, FiUserPlus, FiPlusCircle, 
  FiGlobe, FiLock, FiShield, FiBook, FiPieChart 
} from 'react-icons/fi';

function DashboardOverviewPage() {
  const { user } = useAuth();
  const { 
    myProjects, sharedProjects, 
    dashboardTasks, fetchDashboardTasks, 
    fetchMyProjects, fetchSharedProjects
  } = useProjectContext();
  const [adminStats, setAdminStats] = useState({ users: [], allProjects: [], loading: false });
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchMyProjects();
    fetchSharedProjects();
    if (!isAdmin) fetchDashboardTasks();
    if (isAdmin) fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setAdminStats(prev => ({ ...prev, loading: true }));
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/api/auth/users'),
        api.get('/api/projects/admin/all-projects')
      ]);
      setAdminStats({
        users: usersRes.data,
        allProjects: projectsRes.data,
        loading: false
      });
    } catch (err) {
      console.error("Admin data error:", err);
      setAdminStats(prev => ({ ...prev, loading: false }));
    }
  };

  // --- Veriler ---
  const allProjects = [...myProjects, ...sharedProjects];
  const recentProjects = allProjects
    .sort((a, b) => new Date(b.last_updated_at || b.created_at) - new Date(a.last_updated_at || a.created_at))
    .slice(0, 4);
  const activeTasks = dashboardTasks ? dashboardTasks.filter(task => task.status !== 'done' && (task.assignee_id === user?.id || task.assignee_id === null)): [];  
  const latestUsers = [...adminStats.users].slice(0, 5);
  const latestAllProjects = [...adminStats.allProjects].slice(0, 5);

  // --- İSTATİSTİK HESAPLAMALARI (Admin için) ---
  const publicProjectsCount = adminStats.allProjects.filter(p => p.is_public).length;
  const privateProjectsCount = adminStats.allProjects.length - publicProjectsCount;
  const adminCount = adminStats.users.filter(u => u.role === 'admin').length;
  const studentCount = adminStats.users.length - adminCount;

  // --- ADMIN DASHBOARD ---
  const renderAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. SATIR: GENEL TOPLAM KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={<FiUsers size={24}/>} 
            title="Total Users" 
            count={adminStats.users.length} 
            color="bg-blue-600" 
        />
        <StatCard 
            icon={<FiFolder size={24}/>} 
            title="Total Projects" 
            count={adminStats.allProjects.length} 
            color="bg-purple-600" 
        />
        <StatCard 
            icon={<FiGlobe size={24}/>} 
            title="Public Projects" 
            count={publicProjectsCount} 
            color="bg-emerald-500" 
        />
        <StatCard 
            icon={<FiLock size={24}/>} 
            title="Private Projects" 
            count={privateProjectsCount} 
            color="bg-amber-500" 
        />
      </div>

      {/* 2. SATIR: DETAYLI DAĞILIM (Yeni İstatistikler) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* USER DISTRIBUTION */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
             <h3 className="text-lg font-bold text-text-main flex items-center mb-6">
                 <FiPieChart className="mr-2 text-primary" /> User Distribution
             </h3>
             <div className="space-y-6">
                 {/* Admin Bar */}
                 <div>
                     <div className="flex justify-between text-xs font-bold mb-2">
                         <span className="flex items-center text-red-500"><FiShield className="mr-1"/> Admins</span>
                         <span className="text-text-main">{adminCount} users</span>
                     </div>
                     <div className="w-full bg-app rounded-full h-3 overflow-hidden">
                         <div className="bg-red-500 h-full rounded-full" style={{ width: `${(adminCount / (adminStats.users.length || 1)) * 100}%` }}></div>
                     </div>
                 </div>
                 {/* Student Bar */}
                 <div>
                     <div className="flex justify-between text-xs font-bold mb-2">
                         <span className="flex items-center text-blue-500"><FiBook className="mr-1"/> Students</span>
                         <span className="text-text-main">{studentCount} users</span>
                     </div>
                     <div className="w-full bg-app rounded-full h-3 overflow-hidden">
                         <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(studentCount / (adminStats.users.length || 1)) * 100}%` }}></div>
                     </div>
                 </div>
             </div>
          </div>

          {/* PROJECT DISTRIBUTION */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
             <h3 className="text-lg font-bold text-text-main flex items-center mb-6">
                 <FiActivity className="mr-2 text-primary" /> Project Visibility Ratio
             </h3>
             <div className="flex items-center justify-center h-32 gap-4">
                 <div className="text-center p-4 bg-app rounded-xl w-1/2 border border-border">
                     <FiGlobe size={24} className="text-emerald-500 mx-auto mb-2"/>
                     <span className="block text-2xl font-black text-text-main">{publicProjectsCount}</span>
                     <span className="text-xs text-text-secondary font-bold uppercase">Public</span>
                 </div>
                 <div className="text-center p-4 bg-app rounded-xl w-1/2 border border-border">
                     <FiLock size={24} className="text-amber-500 mx-auto mb-2"/>
                     <span className="block text-2xl font-black text-text-main">{privateProjectsCount}</span>
                     <span className="text-xs text-text-secondary font-bold uppercase">Private</span>
                 </div>
             </div>
          </div>
      </div>

      {/* 3. SATIR: SON AKTİVİTELER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Son Katılan Üyeler */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex justify-between items-center bg-app/50">
            <h3 className="font-bold text-text-main flex items-center gap-2">
              <FiUserPlus className="text-blue-500" /> Recently Joined Members
            </h3>
            <Link to="/admin-users" className="text-xs text-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="p-2">
            {adminStats.loading ? <div className="p-4"><div className="h-6 bg-app rounded animate-pulse"/></div> : latestUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 hover:bg-app rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{u.username}</p>
                    <p className="text-[10px] text-text-secondary">{u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-text-secondary font-mono bg-app px-2 py-1 rounded">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Son Açılan Projeler */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex justify-between items-center bg-app/50">
            <h3 className="font-bold text-text-main flex items-center gap-2">
              <FiPlusCircle className="text-purple-500" /> Recently Created Projects
            </h3>
            <Link to="/admin-projects" className="text-xs text-primary font-bold hover:underline">Manage All</Link>
          </div>
          <div className="p-2">
            {adminStats.loading ? <div className="p-4"><div className="h-6 bg-app rounded animate-pulse"/></div> : latestAllProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-app rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg"><FiFolder size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{p.name}</p>
                    <p className="text-[10px] text-text-secondary">Owner: {p.owner_name}</p>
                  </div>
                </div>
                <Link to={`/project/${p.id}`} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                   <FiArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- ÖĞRENCİ DASHBOARD ---
  const renderStudentDashboard = () => (
    <div className="space-y-8 animate-fade-in">
        {/* RECENT PROJECTS */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-main flex items-center">
                    <FiClock className="mr-2 text-primary" /> Recent Projects
                </h2>
                <Link to="/my-projects" className="text-sm text-primary hover:text-primary-hover font-bold flex items-center transition-colors">
                    View All <FiArrowRight className="ml-1"/>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProjects.map(project => (
                    <Link key={project.id} to={`/project/${project.id}`} className="group">
                        <div className="bg-surface h-full p-5 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 bg-app rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                         <FiFolder size={20} />
                                    </div>
                                    {project.is_public 
                                      ? <FiGlobe size={14} className="text-text-secondary opacity-50"/> 
                                      : <FiLock size={14} className="text-text-secondary opacity-50"/>}
                                </div>
                                <h3 className="font-bold text-text-main mb-1 truncate text-lg">{project.name}</h3>
                                <p className="text-xs text-text-secondary line-clamp-2 h-8 leading-relaxed">
                                  {project.description || "No description."}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                <span>{new Date(project.last_updated_at || project.created_at).toLocaleDateString()}</span>
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform text-primary" size={14}/>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* TASKS SUMMARY */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
             <h2 className="text-xl font-bold text-text-main flex items-center">
              <FiCheckSquare className="mr-2 text-primary" /> Your Active Tasks
            </h2>
          </div>
          <div className="overflow-x-auto">
            {activeTasks.length === 0 ? (
                <div className="p-10 text-center text-text-secondary font-medium">No active tasks found.</div>
            ) : (
                <table className="w-full text-left">
                  <thead className="bg-app text-text-secondary text-[10px] uppercase font-bold tracking-widest border-b border-border">
                     <tr>
                      <th className="p-4">Task</th>
                      <th className="p-4">Project</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeTasks.slice(0, 6).map(task => (
                      <tr key={task.id} className="hover:bg-app/50 transition-colors">
                        <td className="p-4 font-bold text-text-main text-sm">{task.title}</td>
                        <td className="p-4 text-xs text-text-secondary font-medium">{task.project_name}</td>
                        <td className="p-4 text-right">
                          <Link to={`/project/${task.project_id}/tasks`} className="text-primary hover:text-primary-hover text-xs font-black uppercase tracking-wide">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>
    </div>
  );

  return (
    <div className="pb-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-black text-text-main tracking-tight">
          {isAdmin ? "System Overview" : `Welcome back, ${user?.username}!`}
        </h1>
        <p className="text-text-secondary text-sm mt-1 font-medium">
          {isAdmin ? "Manage and monitor the entire GazozHub ecosystem." : "Here is what's happening with your projects."}
        </p>
      </div>

      {isAdmin ? renderAdminDashboard() : renderStudentDashboard()}
    </div>
  );
}

const StatCard = ({ icon, title, count, color }) => (
  <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-text-main tracking-tight">{count}</p>
    </div>
  </div>
);

export default DashboardOverviewPage;