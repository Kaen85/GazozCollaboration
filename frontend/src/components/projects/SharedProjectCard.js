// src/components/projects/SharedProjectCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi'; // 'FiUser' yerine 'FiClock' kullanalım

// This component receives a single 'project' object and displays its details.
function SharedProjectCard({ project }) {
  
  // Güvenlik önlemi: Eğer 'project' prop'u bir şekilde gelmezse,
  // çökmemesi için null döndür.
  if (!project) {
    return null;
  }

  // Bu component artık güvenlidir ve 'project.owner' gibi 
  // backend'den gelmeyen bir veriye erişmeye çalışmaz.
  return (
    // Link'i '/project/' olarak düzelttim (diğer sayfalarla tutarlı olması için)
    <Link to={`/project/${project.id}`} key={project.id}>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full">
        
        {/* Bunlar güvenli, çünkü 'project' objesinde 'name' ve 'description' var */}
        <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
        <p className="text-gray-400 text-sm truncate">{project.description}</p>
        
        <div className="border-t border-gray-700 my-4"></div>
        
        {/* Bu da güvenli, çünkü 'last_updated_at' verisi backend'den geliyor */}
        <div className="flex items-center">
          <FiClock className="w-5 h-5 text-gray-500" />
          <span className="text-xs text-gray-400 ml-2">
            Last updated: {new Date(project.last_updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default SharedProjectCard;