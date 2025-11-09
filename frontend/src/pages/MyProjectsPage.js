// src/pages/MyProjectsPage.js

import React, { useState, useEffect } from 'react';
// 1. mockData import'unu SİL:
// import { mockProjects } from '../data/mockData';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';

// 2. Context hook'unu ve ikonları import et
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader, FiPlus } from 'react-icons/fi';

function MyProjectsPage() {
  // 3. 'projects' ve 'loading' için olan useState'leri SİL.
  //    Veriler artık context'ten gelecek.

  // Bu state modal'ı kontrol ettiği için DOĞRU ve kalmalı
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // 4. Context'ten GEREKLİ verileri al
  const { projects, loading, fetchProjects } = useProjectContext();

  // 5. 'useEffect' içindeki sahte 'setTimeout' yerine
  //    gerçek 'fetchProjects' fonksiyonunu çağır
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] -> Sadece sayfa ilk yüklendiğinde çalışır

  // 6. 'handleProjectCreated' fonksiyonunu SİL.
  //    Context'i kullandığımız için, modal projeyi oluşturduğunda
  //    bu sayfanın listesi OTOMATİK olarak güncellenir.
  //    Bu fonksiyona artık gerek yok.

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          // İkonu ekleyerek diğer butonla tutarlı hale getirelim
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
        >
          <FiPlus className="mr-2" />
          Create New Project
        </button>
      </div>

      {/* 7. 'loading' ve 'projects' state'lerini context'ten gelenleri kullan */}
      {loading ? (
        <div className="flex justify-center items-center p-20">
          <FiLoader className="animate-spin text-blue-500" size={40} />
          <span className="ml-4 text-xl text-gray-300">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <p className="text-gray-400">You haven't created any projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            // Düzeltme: Link'in 'to' adresini '/project/' olarak değiştirdim
            // (ProjectDetailPage ile tutarlı olması için)
            <Link to={`/project/${project.id}`} key={project.id}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full">
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm truncate">{project.description}</p>
                <span className="text-xs text-gray-500 mt-2 block">
                  Last updated: {new Date(project.last_updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 8. Modal'dan 'onProjectCreated' prop'unu SİL.
             Artık 'ProjectContext' bu işi otomatik yapıyor. */}
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default MyProjectsPage;