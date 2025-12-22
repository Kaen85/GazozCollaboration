// src/components/projects/SharedProjectCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiCalendar, FiShare2, FiGlobe } from 'react-icons/fi'; 

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

function SharedProjectCard({ project, viewMode = 'grid' }) {
  
  if (!project) {
    return null;
  }

  const ownerName = project.owner_name || 'Unknown';
  const createdDate = project.created_at; 
  const sharedDate = project.joined_at;

  // === LISTE GÖRÜNÜMÜ ===
  if (viewMode === 'list') {
    return (
      <Link to={`/project/${project.id}`} className="block">
        {/* bg-gray-800 -> bg-surface, border-gray-700 -> border-border, hover:border-purple-500 -> hover:border-primary */}
        <div className="bg-surface p-4 rounded-lg border border-border hover:border-primary transition-all flex flex-col md:flex-row md:items-center justify-between group gap-4">
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              {/* text-white -> text-text-main, group-hover:text-purple-400 -> group-hover:text-primary */}
              <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors truncate mr-3">
                {project.name}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center text-xs text-text-secondary gap-x-6 gap-y-2">
               
               <span className="flex items-center" title="Project Owner">
                 <FiUser className="mr-1.5 w-3 h-3 text-text-secondary" />
                 <span className="font-semibold text-text-main">{ownerName}</span>
               </span>

               <span className="flex items-center" title="Created Date">
                 <FiCalendar className="mr-1.5 w-3 h-3 text-text-secondary" />
                 Created: {formatDate(createdDate)}
               </span>

               {sharedDate ? (
                 <span className="flex items-center" title="Shared Date">
                   <FiShare2 className="mr-1.5 w-3 h-3 text-text-secondary" />
                   Shared: {formatDate(sharedDate)}
                 </span>
               ) : (
                 <span className="flex items-center text-green-500 font-medium">
                   <FiGlobe className="mr-1.5 w-3 h-3" />
                   Public Project
                 </span>
               )}
            </div>
          </div>
          
          <div className="flex-shrink-0 text-text-secondary text-sm max-w-md truncate hidden md:block">
            {project.description}
          </div>

        </div>
      </Link>
    );
  }

  // === GRID GÖRÜNÜMÜ ===
  return (
    <Link to={`/project/${project.id}`} className="block h-full">
      {/* bg-gray-800 -> bg-surface, hover:border-blue-500 -> hover:border-primary */}
      <div className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl hover:border-primary border-2 border-transparent transition-all duration-300 h-full flex flex-col justify-between">
        
        <div>
          {/* text-white -> text-text-main */}
          <h3 className="text-xl font-bold text-text-main mb-2 truncate" title={project.name}>
            {project.name}
          </h3>
          {/* text-gray-400 -> text-text-secondary */}
          <p className="text-text-secondary text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        
        <div>
          {/* border-gray-700 -> border-border */}
          <div className="border-t border-border my-4"></div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <FiUser className="w-4 h-4 text-text-secondary mr-2 flex-shrink-0" />
              <span className="text-xs text-text-secondary truncate">
                Owner: <span className="font-semibold text-text-main">{ownerName}</span>
              </span>
            </div>

            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 text-text-secondary mr-2 flex-shrink-0" />
              <span className="text-xs text-text-secondary">
                Created: {formatDate(createdDate)}
              </span>
            </div>

             <div className="flex items-center">
              {sharedDate ? (
                <>
                  <FiShare2 className="w-4 h-4 text-text-secondary mr-2 flex-shrink-0" />
                  <span className="text-xs text-text-secondary">
                    Shared: {formatDate(sharedDate)}
                  </span>
                </>
              ) : (
                <>
                  <FiGlobe className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-xs font-semibold text-green-500">
                    Public Project
                  </span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}

export default SharedProjectCard;