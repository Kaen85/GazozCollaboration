// src/components/projects/CommentList.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiLoader } from 'react-icons/fi';
import Comment from './Comment'; 

// 'refreshKey', yeni yorum eklendiğinde (ProjectDiscussion'dan) tetiklenir
function CommentList({ projectId, refreshKey }) {
  const [comments, setComments] = useState([]);
  const { fetchComments, loading } = useProjectContext();

  // Yorumları çeken fonksiyon
  const loadComments = async () => {
    try {
      const fetchedComments = await fetchComments(projectId);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  // 1. Sayfa yüklendiğinde VEYA 'refreshKey' değiştiğinde yorumları çek
  useEffect(() => {
    if (projectId) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refreshKey]); // refreshKey'e bağımlı

  // === YENİ: Yorum Düzenlendiğinde veya Silindiğinde Listeyi Güncelle ===
  const handleCommentUpdated = (updatedComment) => {
    setComments(prev => 
      prev.map(c => c.id === updatedComment.id ? updatedComment : c)
    );
  };
  const handleCommentDeleted = (deletedCommentId) => {
    setComments(prev => 
      prev.filter(c => c.id !== deletedCommentId)
    );
  };

  return (
    <div className="space-y-4 mt-4">
      {loading && comments.length === 0 ? (
        <FiLoader className="animate-spin text-blue-500 mx-auto" size={24} />
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Be the first to comment.</p>
      ) : (
        comments.map(comment => (
          <Comment 
            key={comment.id} 
            comment={comment}
            projectId={projectId} // 'like/edit/delete' için gerekli
            onCommentUpdated={handleCommentUpdated} // Yeni prop
            onCommentDeleted={handleCommentDeleted} // Yeni prop
          />
        ))
      )}
    </div>
  );
}

export default CommentList;