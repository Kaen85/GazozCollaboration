// src/components/projects/CommentForm.js

import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiSend, FiLoader } from 'react-icons/fi';

// 'onCommentAdded' prop'u, yorum eklendikten sonra listeyi yenilemek için
function CommentForm({ projectId, onCommentAdded }) {
  const [text, setText] = useState('');
  const { addComment, loading } = useProjectContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addComment(projectId, text);
      setText(''); // Formu temizle
      onCommentAdded(); // Listeyi yenilemesi için parent'a haber ver
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add a comment..."
      />
      <button 
        type="submit" 
        disabled={loading}
        className="flex items-center justify-center w-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-r-lg transition-colors disabled:opacity-50"
      >
        {loading ? <FiLoader className="animate-spin" /> : <FiSend size={18} />}
      </button>
    </form>
  );
}

export default CommentForm;