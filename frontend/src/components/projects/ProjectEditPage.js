// src/components/projects/ProjectEditPage.js

import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiInfo } from 'react-icons/fi';

// Bu component, 'Edit' sekmesinin içeriğidir
export default function ProjectEditPage() {
  const { currentProject } = useProjectContext();

  // Proje verisi henüz yüklenmediyse bekle
  if (!currentProject) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Edit Project Settings
      </h2>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="text-gray-400">
          Proje adını, açıklamasını değiştirebileceğiniz veya projeyi silebileceğiniz
          ayarlar formu buraya gelecek.
        </p>
        
        {/* Örnek:
        <form>
          <label className="text-white">Project Name:</label>
          <input type="text" value={currentProject.name} ... />
        </form>
        */}

        <div className="mt-6 p-4 bg-gray-700 border border-yellow-500 rounded-lg flex items-center">
          <FiInfo className="text-yellow-400 mr-3 flex-shrink-0" size={20} />
          <p className="text-sm text-yellow-300">
            <strong>Dikkat:</strong> Projeyi silmek geri alınamaz bir işlemdir.
          </p>
        </div>
      </div>
    </div>
  );
}