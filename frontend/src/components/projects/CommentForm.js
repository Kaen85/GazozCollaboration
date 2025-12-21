// src/components/projects/CommentForm.js

import React, { useState } from 'react';
// 1. Context import'ları kaldırıldı
// import { useProjectContext } from '../../context/ProjectContext';
import { FiSend, FiLoader } from 'react-icons/fi';

// 2. Component artık 'projectId' veya 'onCommentAdded' yerine
//    'onSubmit' (bir fonksiyon) ve 'loading' (bir durum) proplarını alıyor.
function CommentForm({ onSubmit, loading }) {
  const [text, setText] = useState('');
  
  // 3. 'addComment' ve 'loading' state'i context'ten kaldırıldı.

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      // 4. Artık 'addComment'i DEĞİL, dışarıdan gelen 'onSubmit' fonksiyonunu
      //    mevcut 'text' (metin) ile çağırıyoruz.
      await onSubmit(text);
      
      // 5. Başarılı olursa formu temizle
      setText(''); 
    } catch (error) {
      // Hata yönetimi artık bu fonksiyonu çağıran
      // parent component (IssueItem veya ProjectDiscussion) tarafından yapılacak.
      console.error("CommentForm Error:", error);
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
        // 6. 'loading' durumunu dışarıdan (prop) al
        disabled={loading}
        className="flex items-center justify-center w-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-r-lg transition-colors disabled:opacity-50"
      >
        {loading ? <FiLoader className="animate-spin" /> : <FiSend size={18} />}
      </button>
    </form>
  );
}

export default CommentForm;