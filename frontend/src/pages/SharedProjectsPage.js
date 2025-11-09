// src/pages/SharedProjectsPage.js

import React, { useEffect } from 'react'; // 'useState' kaldırıldı
// Context hook'unu ve yükleme ikonunu import et
import { useProjectContext } from '../context/ProjectContext';
import { FiLoader } from 'react-icons/fi';
// 'mockData' import satırı zaten silinmişti
import SharedProjectCard from '../components/projects/SharedProjectCard';
// 'Link' import'u kaldırıldı (kullanılmıyor)

function SharedProjectsPage() {
  // Context'ten projeleri, yüklenme durumunu ve fonksiyonu al
  const { sharedProjects, loading, fetchSharedProjects } = useProjectContext();

  // 'useEffect' içindeki sahte 'setTimeout' yerine
  // gerçek 'fetchProjects' fonksiyonunu çağır.
  useEffect(() => {
    fetchSharedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] -> Sadece sayfa ilk yüklendiğinde çalışır

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Shared Projects</h1>
        <p className="text-gray-400 mt-2">
          Projects shared with you by other members of the hub.
        </p>
      </div>

      {/* Context'ten gelen 'loading' ve 'sharedProjects' state'lerini kullan */}
      {loading ? (
        <div className="flex justify-center items-center p-20">
          <FiLoader className="animate-spin text-blue-500" size={40} />
          <span className="ml-4 text-xl text-gray-300">Loading Shared Projects...</span>
        </div>
      ) : sharedProjects.length === 0 ? (
        <p className="text-gray-400">No projects have been shared with you yet.</p>
      ) : (
        // A responsive grid to display the project cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedProjects.map(project => (
            <SharedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SharedProjectsPage;