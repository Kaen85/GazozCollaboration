// src/components/projects/ProjectList.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FiLoader, FiArrowRight, FiClock } from 'react-icons/fi';

function ProjectList({ title, projects, loading, viewAllLink }) {

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg flex justify-center items-center shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <FiLoader className="animate-spin text-blue-600 dark:text-blue-500" size={30} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">Henüz bu kategoriye ait bir projeniz yok.</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-4">
          Başlamak için "Create New Project" butonunu kullanın.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        {title && <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>}
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center transition-colors">
            View All
            <FiArrowRight className="ml-1" size={14} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link 
            to={`/project/${project.id}`} 
            key={project.id} 
            className="block bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 group"
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm truncate mb-4">
              {project.description || "No description provided."}
            </p>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <FiClock className="mr-1.5" />
              <span>Updated: {new Date(project.last_updated_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectList;