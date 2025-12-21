// src/components/projects/SharedProjectCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiCalendar, FiShare2, FiGlobe } from 'react-icons/fi'; 

// Tarih formatlama helper fonksiyonu
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
  const sharedDate = project.joined_at; // Public projeler için null'dır

  // === LISTE GÖRÜNÜMÜ (Tarihler Eklendi) ===
  if (viewMode === 'list') {
    return (
      <Link to={`/project/${project.id}`} className="block">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all flex flex-col md:flex-row md:items-center justify-between group gap-4">
          
          {/* Sol Kısım: Başlık ve Bilgiler */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
               <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors truncate mr-3">
                {project.name}
              </h3>
            </div>
            
            {/* Bilgi Satırı (Owner, Created, Shared) */}
            <div className="flex flex-wrap items-center text-xs text-gray-400 gap-x-6 gap-y-2">
               
               {/* 1. Sahip */}
               <span className="flex items-center" title="Project Owner">
                 <FiUser className="mr-1.5 w-3 h-3 text-gray-500" />
                 <span className="font-semibold text-gray-300">{ownerName}</span>
               </span>

               {/* 2. Oluşturulma Tarihi (BURASI EKLENDİ) */}
               <span className="flex items-center" title="Created Date">
                 <FiCalendar className="mr-1.5 w-3 h-3 text-gray-500" />
                 Created: {formatDate(createdDate)}
               </span>

               {/* 3. Paylaşılma Durumu */}
               {sharedDate ? (
                 <span className="flex items-center" title="Shared Date">
                   <FiShare2 className="mr-1.5 w-3 h-3 text-gray-500" />
                   Shared: {formatDate(sharedDate)}
                 </span>
               ) : (
                 <span className="flex items-center text-green-400 font-medium">
                   <FiGlobe className="mr-1.5 w-3 h-3" />
                   Public Project
                 </span>
               )}
            </div>
          </div>
          
          {/* Sağ Kısım: Açıklama (Masaüstünde görünür) */}
          <div className="flex-shrink-0 text-gray-500 text-sm max-w-md truncate hidden md:block">
            {project.description}
          </div>

        </div>
      </Link>
    );
  }

  // === GRID GÖRÜNÜMÜ (Varsayılan) ===
  return (
    <Link to={`/project/${project.id}`} className="block h-full">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full flex flex-col justify-between">
        
        {/* Üst Kısım */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2 truncate" title={project.name}>
            {project.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        
        {/* Alt Kısım */}
        <div>
          <div className="border-t border-gray-700 my-4"></div>
          
          <div className="space-y-2">
            {/* 1. Sahip */}
            <div className="flex items-center">
              <FiUser className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="text-xs text-gray-400 truncate">
                Owner: <span className="font-semibold text-gray-300">{ownerName}</span>
              </span>
            </div>

            {/* 2. Oluşturulma Tarihi */}
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="text-xs text-gray-400">
                Created: {formatDate(createdDate)}
              </span>
            </div>

             {/* 3. Paylaşılma Durumu */}
             <div className="flex items-center">
              {sharedDate ? (
                <>
                  <FiShare2 className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <span className="text-xs text-gray-400">
                    Shared: {formatDate(sharedDate)}
                  </span>
                </>
              ) : (
                <>
                  <FiGlobe className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-xs font-semibold text-green-400">
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