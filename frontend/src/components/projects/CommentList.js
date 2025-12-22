// src/components/projects/CommentList.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiLoader } from 'react-icons/fi';
import Comment from './Comment';

function CommentList({ projectId, refreshKey }) {
  const [comments, setComments] = useState([]);
  const { fetchComments, loading } = useProjectContext();

  const loadComments = async () => {
    try {
      const fetchedComments = await fetchComments(projectId);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refreshKey]);

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
        <div className="flex justify-center py-4">
            <FiLoader className="animate-spin text-primary" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-text-secondary text-sm text-center py-2">Be the first to comment.</p>
      ) : (
        comments.map(comment => (
          <Comment 
            key={comment.id} 
            comment={comment}
            projectId={projectId} 
            onCommentUpdated={handleCommentUpdated} 
            onCommentDeleted={handleCommentDeleted} 
          />
        ))
      )}
    </div>
  );
}

export default CommentList;