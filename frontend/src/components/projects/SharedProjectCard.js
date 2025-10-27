// src/components/projects/SharedProjectCard.js
import { Link } from 'react-router-dom'; // <-- BU SATIRI EKLE
import React from 'react';
import { FiUser } from 'react-icons/fi'; // We'll use an icon for the owner

// This component receives a single 'project' object and displays its details.
function SharedProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border-2 border-transparent hover:border-purple-500 transition-all duration-300 h-full">
        <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
        <p className="text-gray-400 text-sm mb-4 h-16">{project.description}</p>
        <div className="border-t border-gray-700 my-4"></div>
      {/* Owner Information */}
      <div className="flex items-center">
        <FiUser className="w-5 h-5 text-gray-500" />
        <span className="text-xs text-gray-400 ml-2">
          Shared by <span className="font-semibold text-gray-300">{project.owner.name}</span>
        </span>
      </div>
    </div>
    </Link>
  );
}

export default SharedProjectCard;