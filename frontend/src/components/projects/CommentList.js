// src/components/projects/CommentList.js (YENİ DOSYA)

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiLoader } from 'react-icons/fi';
import Comment from './Comment'; // (Dosya yapınızda 'Comment.js' olduğunu varsayıyorum)

function CommentList({ projectId, refreshKey }) {
  const [comments, setComments] = useState([]);
  const { fetchComments, loading } = useProjectContext();

  // Yorumları çeken fonksiyon
  const loadComments = async () => {
    try {
      const fetchedComments = await fetchComments(projectId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  // 1. Sayfa yüklendiğinde yorumları çek
  useEffect(() => {
    if (projectId) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // 2. 'refreshKey' (dışarıdan gelen) değiştiğinde yorumları YENİDEN ÇEK
  useEffect(() => {
    if (refreshKey > 0) { // Sadece refreshKey 0'dan büyükse
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);


  return (
    <div className="space-y-4 mt-4">
      {loading && comments.length === 0 ? (
        <FiLoader className="animate-spin text-blue-500 mx-auto" size={24} />
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Be the first to comment.</p>
      ) : (
        comments.map(comment => (
          // 'Comment.js' component'inin bu 'comment' prop'unu alıp
          // 'author_name' ve 'text' göstermesi gerekir.
          <Comment key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
}

export default CommentList;