// src/components/projects/SharedProjectCard.js

import React from 'react';
import { Link } from 'react-router-dom';
// 1. Sadece 'FiUser' (sahip) ikonunu alıyoruz
import { FiUser } from 'react-icons/fi'; 

// 2. 'formatDate' (Tarih formatlama) fonksiyonu kaldırıldı

function SharedProjectCard({ project }) {
  
  if (!project) {
    return null;
  }

  // 3. Yeni veriyi (backend'den gelen) al
  const ownerName = project.owner_name || 'Bilinmiyor';

  return (
    <Link to={`/project/${project.id}`} key={project.id}>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all duration-300 h-full flex flex-col justify-between">
        
        {/* Üst Kısım (Proje Adı/Açıklaması) */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
          <p className="text-gray-400 text-sm truncate">{project.description}</p>
        </div>
        
        {/* Alt Kısım (SADECE PAYLAŞAN KİŞİ) */}
        <div>
          <div className="border-t border-gray-700 my-4"></div>
          
          {/* === 4. GÜNCELLEME BURADA === */}
          
          {/* Sahip Bilgisi (Kim tarafından paylaşıldı/sahibi kim) */}
          <div className="flex items-center">
            <FiUser className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-xs text-gray-400">
              Owner: <span className="font-semibold text-gray-300">{ownerName}</span>
            </span>
          </div>

          {/* Tarih Bilgisi (Paylaşılma tarihi veya Public) - İSTEK ÜZERİNE KALDIRILDI */}

        </div>
      </div>
    </Link>
  );
}

export default SharedProjectCard;