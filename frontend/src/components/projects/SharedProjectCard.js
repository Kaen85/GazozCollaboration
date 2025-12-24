// src/components/projects/SharedProjectCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiClock, FiChevronRight } from 'react-icons/fi'; 

function SharedProjectCard({ project }) {
  if (!project) return null;

  return (
    <Link to={`/project/${project.id}`} className="relative group h-fit">
      <div className="relative p-4 rounded-2xl bg-surface transition-all duration-300 h-full flex flex-col justify-between hover:shadow-xl shadow-sm border-none dark:bg-surface-dark">
        
        {/* ACCENT STRIP */}
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-80"></div>

        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-primary/10 text-primary">
              Public
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors truncate mb-1 dark:text-white">
            {project.name}
          </h3>
          <p className="text-sm text-text-secondary/70 line-clamp-1 leading-relaxed">
            {project.description || "Public workspace"}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-text-secondary/5 flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-tighter">
          <div className="flex flex-col gap-1">
            <span className="flex items-center text-xs text-text-main/80 font-semibold">
              <FiUser className="mr-1.5 opacity-50" /> 
              {project.owner_name}
            </span>
            <span className="flex items-center opacity-40 font-medium">
              <FiClock className="mr-1.5" /> 
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center text-primary font-black text-xs tracking-widest transition-transform group-hover:translate-x-1">
            VIEW <FiChevronRight size={14} className="ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SharedProjectCard;