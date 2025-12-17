// src/pages/DashboardOverviewPage.js

import React, { useEffect } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { 
  FiFolder, FiShare2, FiLayers, FiCheckSquare, 
  FiClock, FiArrowRight, FiActivity, FiBriefcase, FiAlertCircle 
} from 'react-icons/fi';

function DashboardOverviewPage() {
  const { 
    myProjects, sharedProjects, 
    dashboardTasks, fetchDashboardTasks, 
    fetchMyProjects, fetchSharedProjects,
    loading 
  } = useProjectContext();

  useEffect(() => {
    // Tüm gerekli verileri çek
    fetchMyProjects();
    fetchSharedProjects();
    fetchDashboardTasks(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FİLTRELEME VE LİMİTLEME MANTIĞI ---
  // 1. Adım: Tamamlanmış (done) görevleri filtrele
  const activeTasks = dashboardTasks ? dashboardTasks.filter(task => task.status !== 'done') : [];

  // 2. Adım: Sadece ilk 10 tanesini göster
  const visibleTasks = activeTasks.slice(0, 10);

  // 3. Adım: Gizlenen görev sayısını hesapla
  const hiddenCount = activeTasks.length - visibleTasks.length;

  // İstatistik Kartları
  const stats = [
    {
      title: "My Projects",
      count: myProjects?.length || 0,
      icon: <FiBriefcase size={24} />,
      color: "bg-blue-600",
      desc: "Owned by you"
    },
    {
      title: "Shared With Me",
      count: sharedProjects?.length || 0,
      icon: <FiShare2 size={24} />,
      color: "bg-purple-600",
      desc: "Collaboration"
    },
    {
      title: "Active Tasks",
      count: activeTasks.length, // Toplam aktif görev sayısı (gizliler dahil)
      icon: <FiCheckSquare size={24} />,
      color: "bg-green-600",
      desc: "Pending items"
    }
  ];

  // Görev Durumu için Renk ve İkon Helper'ı
  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        // Filtreleme yapıldığı için bu teorik olarak görünmeyecek ama kod güvenliği için kalsın
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-semibold border border-green-900/50">Done</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs font-semibold border border-blue-900/50">In Progress</span>;
      default: // todo
        return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-semibold border border-gray-600">To Do</span>;
    }
  };

  return (
    <div className="transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Dashboard</h1>
      </div>
      
      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center transition-all duration-300 hover:shadow-lg">
            <div className={`p-4 rounded-lg ${stat.color} text-white mr-4 shadow-md`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        
        {/* === GÖREV ÖZETİ (Task Summary) === */}
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
          
          {/* Footer Info: Toplam gösterilen ve gizlenen sayısı */}
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