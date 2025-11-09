// src/components/projects/Comment.js

import React from 'react';
import { FiUser } from 'react-icons/fi'; // (veya başka bir avatar ikonu)

// Component, 'comment' prop'unu alır
function Comment({ comment }) {

  // Güvenlik önlemi: 'comment' prop'u yoksa çökme
  if (!comment) {
    return null;
  }

  return (
    <div className="flex space-x-3">
      {/* Avatar/İkon */}
      <div className="flex-shrink-0">
        <FiUser className="w-8 h-8 text-gray-400 bg-gray-700 rounded-full p-1" />
      </div>
      
      {/* Yorum İçeriği */}
      <div className="flex-1 bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          {/* DÜZELTME BURADA:
            Backend'den 'author.name' objesi DEĞİL,
            'author_name' string'i geliyor.
          */}
          <span className="font-semibold text-white text-sm">
            {comment.author_name || 'User'} 
          </span>
          <span className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
        <p className="text-gray-300 text-sm">
          {comment.text}
        </p>
      </div>
    </div>
  );
}

export default Comment;