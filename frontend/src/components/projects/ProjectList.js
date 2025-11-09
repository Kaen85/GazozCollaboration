// src/components/projects/ProjectList.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FiLoader, FiArrowRight } from 'react-icons/fi'; // İkonlar

// 1. Component artık 'projects', 'loading', 'title' gibi verileri
//    prop (parametre) olarak dışarıdan alır.
function ProjectList({ title, projects, loading, viewAllLink }) {

  // 2. Yükleniyorsa (Loading)
  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg flex justify-center items-center">
        <FiLoader className="animate-spin text-blue-500" size={30} />
      </div>
    );
  }

  // 3. Yükleme bitti ve proje yoksa (Empty State)
  if (projects.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-gray-400">Henüz bu kategoriye ait bir projeniz yok.</p>
        <p className="text-gray-500 text-sm mt-4">
          Başlamak için "Create New Project" butonunu kullanın.
        </p>
      </div>
    );
  }

  // 4. Yükleme bitti ve projeler varsa (Project List)
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      {/* Başlık ve 'View All' Linki */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
            View All
            <FiArrowRight className="ml-1" size={14} />
          </Link>
        )}
      </div>

      {/* Proje Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <Link 
            to={`/project/${project.id}`} // Proje detay sayfasına yönlendir
            key={project.id} 
            className="block bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600 transition-colors"
          >
            <h3 className="font-bold text-lg text-white mb-1">{project.name}</h3>
            <p className="text-gray-400 text-sm truncate">{project.description}</p>
            <span className="text-xs text-gray-500 mt-2 block">
              Last updated: {new Date(project.last_updated_at).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectList;