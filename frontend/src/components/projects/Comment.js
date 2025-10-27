// src/components/projects/Comment.js
import React from 'react';
import { FiUser } from 'react-icons/fi';

function Comment({ comment }) {
  return (
    <div className="flex space-x-4 py-4 border-b border-gray-700 last:border-b-0">
      <FiUser className="w-8 h-8 text-gray-400 mt-1" />
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <p className="font-bold text-white">{comment.author.name}</p>
          <p className="text-xs text-gray-500">{comment.createdAt}</p>
        </div>
        <p className="text-gray-300 mt-1">{comment.text}</p>
      </div>
    </div>
  );
}

export default Comment;