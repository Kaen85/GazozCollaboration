// src/components/projects/ProjectList.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

// MODIFIED: Added a 'viewAllLink' prop to make the component more reusable.
function ProjectList({ title, projects, loading, viewAllLink }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {/* Use the dynamic link from the prop */}
        <Link to={viewAllLink} className="flex items-center text-sm text-blue-400 hover:text-blue-300">
          View All <FiArrowRight className="ml-1" />
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading projects...</p>
      ) : projects.length > 0 ? (
        <ul>
          {projects.slice(0, 5).map(project => (
            <li key={project.id} className="border-b border-gray-700 last:border-b-0">
              {/* This link to the project detail page remains the same */}
              <Link to={`/projects/${project.id}`} className="block p-3 rounded-md hover:bg-gray-700 transition-colors">
                <h3 className="font-semibold text-white">{project.name}</h3>
                <p className="text-sm text-gray-400 truncate">{project.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 p-3">No projects found.</p>
      )}
    </div>
  );
}

export default ProjectList;