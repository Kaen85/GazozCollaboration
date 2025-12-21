// src/pages/DashboardOverviewPage.js

import React, { useEffect } from 'react'; // useState kaldırıldı
import ProjectList from '../components/projects/ProjectList';
import { useProjectContext } from '../context/ProjectContext'; // Context'i kullan
// import CreateProjectModal from '../components/projects/CreateProjectModal'; // Modal kaldırıldı
// import { FiPlus } from 'react-icons/fi'; // Buton ikonu kaldırıldı

function DashboardOverviewPage() {
  // Modal state'i kaldırıldı
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Context'ten GEREKLİ VERİLERİ çek
  const { projects, loading, fetchProjects } = useProjectContext();

  // 2. Sayfa ilk yüklendiğinde projeleri backend'den çek
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] -> bu sayede sadece 1 kez çalışır

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        
        {/* Proje Oluşturma Butonu KALDIRILDI */}
      </div>
      
      <div className="space-y-8">
        {/* 3. Proje Listesini SADECE BİR KEZ çağır */}
        {/* Context'ten aldığımız gerçek 'projects' ve 'loading' verilerini prop olarak geç */}
        <div>
          <ProjectList 
            title="My Projects" // Artık 'My Projects' ve 'Shared Projects'in bir karmasını gösteriyor
            projects={projects} // Gerçek projeler (sahte değil)
            loading={loading} // Gerçek yüklenme durumu
            viewAllLink="/my-projects" // Bu link hala 'My Projects'e gidebilir
          />
        </div>
      </div>

      {/* Proje Oluşturma Penceresi (Modal) KALDIRILDI */}
    </div>
  );
}

export default DashboardOverviewPage;