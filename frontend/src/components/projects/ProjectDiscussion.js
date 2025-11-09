// src/components/projects/ProjectDiscussion.js

import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

// Bu component'i 'export default' olarak dışa aktar
export default function ProjectDiscussion() {
  const { currentProject } = useProjectContext();
  const [refreshKey, setRefreshKey] = useState(0);

  // Yorum eklendiğinde CommentList'i yenilemek için
  const handleCommentAdded = () => setRefreshKey(prevKey => prevKey + 1);

  // currentProject yüklenmediyse (örn: sayfa yenilendi) bir şey gösterme
  if (!currentProject) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Discussions (Genel Forum)</h2>
      
      {/* Bu bölüm, Issue'ya değil, doğrudan Projeye bağlı yorumları kullanır.
        (Mevcut backend'iniz zaten projeye yorum yapmayı destekliyor)
      */}
      <CommentForm 
        projectId={currentProject.id} 
        onCommentAdded={handleCommentAdded} 
      />
      <CommentList 
        projectId={currentProject.id} 
        refreshKey={refreshKey} 
      />
    </div>
  );
}