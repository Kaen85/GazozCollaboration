// src/components/projects/CommentForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // To get the current user

function CommentForm({ onCommentSubmit }) {
  const [text, setText] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return; // Don't submit empty comments or if not logged in

    // Call the function passed from the parent with the new comment data
    onCommentSubmit({
      text: text,
      author: { name: user.name }, // Use the currently logged-in user
    });
    setText(''); // Clear the textarea after submission
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment to help the team..."
        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
      ></textarea>
      <div className="text-right mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600"
          disabled={!text.trim()}
        >
          Post Comment
        </button>
      </div>
    </form>
  );
}

export default CommentForm;