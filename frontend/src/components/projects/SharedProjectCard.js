// src/components/projects/SharedProjectCard.js (veya SharedProjectsPage içindeki ilgili kısım)
import React from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe, FiUser, FiClock } from 'react-icons/fi';

const SharedProjectCard = ({ project }) => {
  return (
    <Link to={`/project/${project.id}`} className="relative group h-fit">
      <div className="relative p-4 rounded-2xl bg-surface transition-all duration-300 flex flex-col justify-between hover:shadow-xl shadow-sm border-none dark:bg-surface-dark">
        
        <div>
          
          
          <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors truncate mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-text-secondary/80 line-clamp-1 leading-relaxed">
            {project.description || "Public project workspace"}
          </p>
        </div>

        {/* --- ALT ALAN: TARİH VE SAHİP (MyProjectsPage ile aynı) --- */}
        <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-[10px] uppercase tracking-tight">
          <div className="flex flex-col gap-1.5">
            {/* Proje Sahibi - Daha belirgin text-text-main */}
            <span className="flex items-center text-[11px] font-bold text-text-main">
              <FiUser className="mr-1.5 text-xs text-primary" /> 
              {project.owner_name || 'Owner'}
            </span>
            
            {/* Tarih - Opaklığı kaldırılmış ve formatlanmış */}
            <span className="flex items-center text-text-secondary font-bold text-[10px]">
              <FiClock className="mr-1.5 text-xs opacity-70" /> 
              {new Date(project.created_at).toLocaleDateString(undefined, { 
                day: 'numeric', 
                month: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>

          <div className="flex items-center px-3 py-1 bg-primary/5 text-primary font-black text-[10px] rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
            VIEW
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SharedProjectCard;