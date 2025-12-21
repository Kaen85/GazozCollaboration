// src/components/projects/Comment.js

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjectContext } from '../../context/ProjectContext';
import { 
  FiUser, FiHeart, FiCopy, FiMoreVertical, FiEdit, FiTrash, 
  FiSave, FiX, FiLoader, FiCheck, FiAlertTriangle 
} from 'react-icons/fi';

// Yeni proplar alıyoruz: projectId, onCommentUpdated, onCommentDeleted
function Comment({ comment, projectId, onCommentUpdated, onCommentDeleted }) {
  
  const { user } = useAuth(); // Mevcut giriş yapmış kullanıcı (artık {id, username} içeriyor)
  const { 
    likeComment, 
    editComment, 
    deleteComment, 
    currentProject // Proje sahibini kontrol etmek için
  } = useProjectContext();

  // 'comment' prop'unu yerel state'e alıyoruz, böylece "Beğen" sayısı anında güncellenir
  const [localComment, setLocalComment] = useState(comment);

  // Yorumu düzenleme (edit) modu için state'ler
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSaving, setIsSaving] = useState(false);

  // 3-nokta menü state'i
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Kopyalama state'i
  const [copied, setCopied] = useState(false);
  // Beğenme (like) state'i
  const [isLiking, setIsLiking] = useState(false);

  // === GÜVENLİK KONTROLLERİ ===
  const authorId = localComment?.author_id;
  const currentUserId = user?.id;
  const projectOwnerId = currentProject?.owner_id;

  // Kullanıcı bu yorumun sahibi mi?
  const isOwner = currentUserId === authorId;
  // Kullanıcı proje sahibi mi?
  const isProjectOwner = currentUserId === projectOwnerId;
  // Kullanıcı bu yorumu beğenmiş mi?
  const hasLiked = localComment?.likes_user_ids?.includes(currentUserId);
  // Beğeni sayısı
  const likeCount = localComment?.likes_user_ids?.length || 0;

  // Ebeveynden 'comment' prop'u değişirse, yerel state'i güncelle
  useEffect(() => {
    setLocalComment(comment);
  }, [comment]);

  // --- KOPYALA FONKSİYONU ---
  const handleCopy = () => {
    const el = document.createElement('textarea');
    el.value = localComment.text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  // --- BEĞEN (LIKE) FONKSİYONU ---
  const handleLike = async () => {
    if (isLiking) return; 
    setIsLiking(true);
    try {
      const updatedLikes = await likeComment(projectId, localComment.id);
      // === "BEĞEN" DÜZELTMESİ: Yerel state'i güncelle ===
      setLocalComment(prev => ({ ...prev, likes_user_ids: updatedLikes.likes_user_ids }));
    } catch (error) {
      console.error("Failed to like comment:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // --- DÜZENLE (EDIT) FONKSİYONLARI ---
  const handleEdit = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(localComment.text); // Değişiklikleri iptal et
  };
  const handleSaveEdit = async () => {
    if (editText.trim() === '' || editText === localComment.text) {
      return handleCancelEdit();
    }
    setIsSaving(true);
    try {
      const updatedComment = await editComment(projectId, localComment.id, editText);
      // === "EDIT" DÜZELTMESİ: Yerel state'i ve ebeveyni güncelle ===
      setLocalComment(updatedComment); // Yerel state'i güncelle
      setIsEditing(false);
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment); // Ebeveyni (CommentList/IssueItem) uyar
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
      alert("Hata: " + error.message); // Backend'den gelen hatayı göster
    } finally {
      setIsSaving(false);
    }
  };

  // --- SİL (DELETE) FONKSİYONU ---
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(projectId, localComment.id);
        // === "DELETE" DÜZELTMESİ: Ebeveyni uyar ===
        if (onCommentDeleted) {
          onCommentDeleted(localComment.id);
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
        alert("Hata: " + error.message); // Backend'den gelen hatayı göster
      }
    }
    setMenuOpen(false);
  };
  
  // 3-nokta menüsü dışına tıklamayı dinle
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);


  return (
    // Yorumları ayırmak için üst çizgi
    <div className="flex space-x-3 pt-4 border-t border-gray-600">
      {/* Avatar/İkon */}
      <div className="flex-shrink-0">
        <FiUser className="w-8 h-8 text-gray-400 bg-gray-700 rounded-full p-1" />
      </div>
      
      {/* Yorum İçeriği */}
      <div className="flex-1">
        
        {isEditing ? (
          // --- DÜZENLEME MODU ---
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full py-2 px-3 text-gray-200 bg-gray-600 border border-blue-500 rounded-lg focus:outline-none"
              rows="3"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white text-sm">Cancel</button>
              <button 
                onClick={handleSaveEdit} 
                disabled={isSaving}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg text-sm"
              >
                {isSaving ? <FiLoader className="animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          // --- NORMAL GÖRÜNÜM MODU ---
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">
                {localComment.author_name || 'User'} 
              </span>
              <span className="text-xs text-gray-500">
                {new Date(localComment.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-300 text-sm break-words">
              {localComment.text}
            </p>
            
            {/* YORUM ALTINDAKİ BUTONLAR (BEĞEN, KOPYALA, 3-NOKTA) */}
            <div className="flex items-center space-x-3 mt-3">
              
              {/* BEĞEN BUTONU */}
              <button 
                onClick={handleLike} 
                disabled={isLiking}
                className={`flex items-center text-xs ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
              >
                <FiHeart fill={hasLiked ? 'currentColor' : 'none'} size={14} className="mr-1" />
                {likeCount}
              </button>
              
              {/* KOPYALA BUTONU */}
              <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white">
                {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
              </button>
              
              {/* 3-NOKTA MENÜ (SADECE YORUMUN SAHİBİ VEYA PROJE SAHİBİ GÖRÜR) */}
              {(isOwner || isProjectOwner) && (
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(p => !p)} className="text-xs text-gray-400 hover:text-white">
                    <FiMoreVertical size={14} />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 top-6 w-36 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                      <ul className="py-1">
                        {/* Sadece YORUM SAHİBİ düzenleyebilir */}
                        {isOwner && (
                          <li>
                            <button
                              onClick={handleEdit}
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              <FiEdit size={14} className="mr-2" />
                              Edit
                            </button>
                          </li>
                        )}
                        {/* Yorum sahibi VEYA Proje sahibi silebilir */}
                        <li>
                          <button
                            onClick={handleDelete}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                          >
                            <FiTrash size={14} className="mr-2" />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;