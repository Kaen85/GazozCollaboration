// src/components/projects/Comment.js

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjectContext } from '../../context/ProjectContext';
import { 
  FiUser, FiHeart, FiCopy, FiMoreVertical, FiEdit, FiTrash, 
    FiLoader, FiCheck,
} from 'react-icons/fi';

// Yeni proplar alıyoruz: projectId, onCommentUpdated, onCommentDeleted
function Comment({ comment, projectId, onCommentUpdated, onCommentDeleted }) {
  
  const { user } = useAuth();
  // Mevcut giriş yapmış kullanıcı
  const { 
    likeComment, 
    editComment, 
    deleteComment, 
    currentProject // Proje sahibini kontrol etmek için
  } = useProjectContext();

  // 'comment' prop'unu yerel state'e alıyoruz
  const [localComment, setLocalComment] = useState(comment);
  
  // State'ler
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSaving, setIsSaving] = useState(false);

  // 3-nokta menü state'i
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Diğer state'ler
  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // === GÜVENLİK KONTROLLERİ ===
  const authorId = localComment?.author_id;
  const currentUserId = user?.id;
  const projectOwnerId = currentProject?.owner_id;

  const isOwner = currentUserId === authorId;
  const isProjectOwner = currentUserId === projectOwnerId;
  const hasLiked = localComment?.likes_user_ids?.includes(currentUserId);
  const likeCount = localComment?.likes_user_ids?.length || 0;

  // Prop değişirse state güncelle
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
      setLocalComment(updatedComment);
      setIsEditing(false);
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
      alert("Hata: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- SİL (DELETE) FONKSİYONU ---
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(projectId, localComment.id);
        if (onCommentDeleted) {
          onCommentDeleted(localComment.id);
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
        alert("Hata: " + error.message);
      }
    }
    setMenuOpen(false);
  };
  
  // Menü dışına tıklamayı dinle
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
    // Yorumları ayırmak için üst çizgi: border-gray-600 -> border-border
    <div className="flex space-x-3 pt-4 border-t border-border/50 first:pt-0 first:border-0">
      {/* Avatar/İkon */}
      <div className="flex-shrink-0">
        {/* bg-gray-700 -> bg-app, text-gray-400 -> text-text-secondary */}
        <div className="w-8 h-8 rounded-full bg-app flex items-center justify-center border border-border">
            <FiUser className="w-5 h-5 text-text-secondary" />
        </div>
      </div>
      
      {/* Yorum İçeriği */}
      <div className="flex-1">
        
        {isEditing ? (
          // --- DÜZENLEME MODU ---
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full py-2 px-3 text-text-main bg-surface border border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              rows="3"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} className="text-text-secondary hover:text-text-main text-sm transition-colors">Cancel</button>
              <button 
                onClick={handleSaveEdit} 
                disabled={isSaving}
                className="flex items-center bg-primary hover:bg-primary-hover text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? <FiLoader className="animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          // --- NORMAL GÖRÜNÜM MODU ---
          // bg-gray-700 -> bg-surface, border ekledik
          <div className="bg-surface border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-text-main text-sm">
                {localComment.author_name || 'User'} 
              </span>
              <span className="text-xs text-text-secondary">
                {new Date(localComment.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-text-main text-sm break-words leading-relaxed">
              {localComment.text}
            </p>
            
            {/* YORUM ALTINDAKİ BUTONLAR */}
            <div className="flex items-center space-x-3 mt-3">
              
              {/* BEĞEN BUTONU */}
              <button 
                onClick={handleLike} 
                disabled={isLiking}
                className={`flex items-center text-xs transition-colors ${hasLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'}`}
              >
                <FiHeart fill={hasLiked ? 'currentColor' : 'none'} size={14} className="mr-1" />
                {likeCount}
              </button>
              
              {/* KOPYALA BUTONU */}
              <button onClick={handleCopy} className="text-xs text-text-secondary hover:text-text-main transition-colors">
                {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
              </button>
              
              {/* 3-NOKTA MENÜ */}
              {(isOwner || isProjectOwner) && (
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(p => !p)} className="text-xs text-text-secondary hover:text-text-main transition-colors">
                    <FiMoreVertical size={14} />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 top-6 w-36 bg-surface border border-border rounded-md shadow-xl z-20 overflow-hidden">
                      <ul className="py-1">
                        {/* EDIT */}
                        {isOwner && (
                          <li>
                            <button
                              onClick={handleEdit}
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-text-main hover:bg-surface-hover transition-colors"
                            >
                              <FiEdit size={14} className="mr-2 text-text-secondary" />
                              Edit
                            </button>
                          </li>
                        )}
                        {/* DELETE */}
                        <li>
                          <button
                            onClick={handleDelete}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-surface-hover transition-colors"
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