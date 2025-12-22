// src/components/projects/CommentForm.js

import React, { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';

function CommentForm({ onSubmit, loading }) {
  const [text, setText] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await onSubmit(text);
      setText('');
    } catch (error) {
      console.error("CommentForm Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      {/* Input: bg-surface, border-border, text-text-main */}
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow py-2 px-4 text-text-main bg-surface border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary transition-colors"
        placeholder="Add a comment..."
      />
      {/* Button: bg-primary */}
      <button 
        type="submit" 
        disabled={loading}
        className="flex items-center justify-center w-12 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-3 rounded-r-lg transition-colors disabled:opacity-50"
      >
        {loading ? <FiLoader className="animate-spin" /> : <FiSend size={18} />}
      </button>
    </form>
  );
}

export default CommentForm;