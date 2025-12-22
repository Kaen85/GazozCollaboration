// src/pages/DashboardOverviewPage.js

import React, { useEffect } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { 
  FiFolder, FiShare2, FiLayers, FiCheckSquare, 
  FiClock, FiArrowRight, FiActivity, FiBriefcase, FiAlertCircle, FiGlobe, FiLock
} from 'react-icons/fi';

function DashboardOverviewPage() {
  const { 
    myProjects, sharedProjects, 
    dashboardTasks, fetchDashboardTasks, 
    fetchMyProjects, fetchSharedProjects,
    loading 
  } = useProjectContext();

  useEffect(() => {
    fetchMyProjects();
    fetchSharedProjects();
    fetchDashboardTasks(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 1. RECENT PROJECTS MANTIĞI (YENİ EKLENDİ) ---
  // Hem benim hem paylaşılan projeleri birleştir
  const allProjects = [...myProjects, ...sharedProjects];
  
  // Tarihe göre sırala (En yeni tarihli en başa) ve ilk 4 tanesini al
  const recentProjects = allProjects
    .sort((a, b) => new Date(b.last_updated_at || b.created_at) - new Date(a.last_updated_at || a.created_at))
    .slice(0, 4);


  // --- 2. GÖREV FİLTRELEME MANTIĞI (MEVCUT) ---
  const activeTasks = dashboardTasks ? dashboardTasks.filter(task => task.status !== 'done') : [];
  const visibleTasks = activeTasks.slice(0, 10);
  const hiddenCount = activeTasks.length - visibleTasks.length;

  // Helper: Görev Durumu Badge'i
  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-semibold border border-green-900/50">Done</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs font-semibold border border-blue-900/50">In Progress</span>;
      default: // todo
        return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-semibold border border-gray-600">To Do</span>;
    }
  };

  return (
    <div className="transition-colors duration-300 pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Dashboard</h1>
      </div>
      
      <div className="space-y-8">

        {/* === BÖLÜM 1: RECENT PROJECTS (SON PROJELER) === */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FiClock className="mr-2 text-purple-500" /> Recent Projects
                </h2>
                <Link to="/my-projects" className="text-sm text-blue-500 hover:text-blue-400 font-medium flex items-center">
                    View All Projects <FiArrowRight className="ml-1"/>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : recentProjects.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-500">
                    No projects found. Create one to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentProjects.map(project => (
                        <Link key={project.id} to={`/project/${project.id}`} className="group">
                            <div className="bg-white dark:bg-gray-800 h-full p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FiFolder size={20} />
                                        </div>
                                        {project.is_public ? (
                                            <FiGlobe className="text-gray-400" size={14} title="Public"/>
                                        ) : (
                                            <FiLock className="text-gray-400" size={14} title="Private"/>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate" title={project.name}>
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-8">
                                        {project.description || "No description."}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
                                    <span>{new Date(project.last_updated_at || project.created_at).toLocaleDateString()}</span>
                                    <span className="group-hover:translate-x-1 transition-transform text-blue-500">
                                        <FiArrowRight />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>

        {/* === BÖLÜM 2: GÖREV ÖZETİ (TASK SUMMARY) === */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FiActivity className="mr-2 text-blue-500" />
              Active Priority Tasks
            </h2>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading tasks...</div>
            ) : activeTasks.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <FiCheckSquare size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  You have no active tasks. Completed tasks are hidden from this view.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 font-medium">Task Name</th>
                      <th className="p-4 font-medium">Project</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Created</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {visibleTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <FiFolder className="mr-2 text-blue-500" size={14} />
                            <span className="text-gray-600 dark:text-gray-300 text-sm">{task.project_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="p-4 text-right text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center justify-end">
                            <FiClock className="mr-1.5 w-3 h-3" />
                            {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            to={`/project/${task.project_id}/tasks`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            View Board <FiArrowRight className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
             <span>Showing top {visibleTasks.length} active tasks.</span>
             {hiddenCount > 0 && (
               <span className="flex items-center text-amber-600 dark:text-amber-500 font-medium ml-2">
                 <FiAlertCircle className="mr-1" />
                 {hiddenCount} more tasks are waiting in queue.
               </span>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardOverviewPage;