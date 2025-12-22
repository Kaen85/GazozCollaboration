// src/components/projects/IssueItem.js

import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMessageSquare, FiChevronDown, FiChevronRight, FiLoader, 
  FiMoreVertical, FiEdit, FiCheckCircle, FiCircle, FiSave, FiX, FiAlertTriangle
} from 'react-icons/fi';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Comment from './Comment'; 
import CommentForm from './CommentForm';

function IssueItem({ issue, projectId, onIssueUpdated }) {
  
  // === 1. STATE (DURUM) TANIMLAMALARI ===
  const [localIssue, setLocalIssue] = useState(issue);
  const [isOpen, setIsOpen] = useState(false); 
  const [comments, setComments] = useState([]); 
  const [loadingComments, setLoadingComments] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editText, setEditText] = useState(issue.text); 
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const menuRef = useRef(null);
  
  // Context'ten gerekli fonksiyonları al
  const { 
    currentProject, 
    fetchIssueComments, 
    addIssueComment, 
    updateIssue, 
    loading: contextLoading 
  } = useProjectContext();
  
  const { user } = useAuth(); 
  const userRole = currentProject?.currentUserRole;

  // === 2. EFFECT'LER ===
  
  // 'issue' prop'u değiştiğinde yerel state'i güncelle
  useEffect(() => {
    setLocalIssue(issue);
  }, [issue]);

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

  // === 3. FONKSİYONLAR ===

  // Yorumları aç/kapat
  const toggleComments = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    setLoadingComments(true);
    try {
      const fetchedComments = await fetchIssueComments(projectId, localIssue.id);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Failed to fetch issue comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Yorum ekle
  const handleCommentAdded = async (text) => {
    try {
      const newComment = await addIssueComment(projectId, localIssue.id, text);
      setComments([...comments, newComment]); // Listeyi anında güncelle
    } catch (error) {
      console.error("Failed to add issue comment:", error);
    }
  };

  // Issue durumunu Değiştir (Done/Open)
  const handleToggleStatus = async () => {
    const isDone = localIssue.status === 'Closed';
    const newStatus = isDone ? 'Open' : 'Closed'; 
    try {
      const updatedIssue = await updateIssue(projectId, localIssue.id, { status: newStatus });
      setLocalIssue(updatedIssue); 
      onIssueUpdated(updatedIssue); 
    } catch (error) {
      console.error("Failed to update issue status:", error);
    } finally {
      setMenuOpen(false);
    }
  };

  // "Edit" (Düzenleme) Modu Fonksiyonları
  const handleEditClick = () => {
    setEditText(localIssue.text); 
    setIsEditing(true); 
    setMenuOpen(false); 
    setEditError(null); 
  };

  const handleCancelEdit = () => {
    setIsEditing(false); 
    setEditError(null); 
  };

  const handleSaveEdit = async () => {
    if (editText.trim() === '' || editText === localIssue.text) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true); 
    setEditError(null);
    try {
      const updatedIssue = await updateIssue(projectId, localIssue.id, { text: editText });
      setLocalIssue(updatedIssue); 
      onIssueUpdated(updatedIssue); 
      setIsEditing(false); 
    } catch (error) {
      console.error("Failed to save issue edit:", error);
      setEditError("Failed to save. Please try again."); 
    } finally {
      setIsSaving(false); 
    }
  };

  // Yorum listesi için güncelleme fonksiyonları
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

  // === 4. RENDER (GÖRÜNÜM) ===
  const isDone = localIssue.status === 'Closed';
  
  // Stiller: Light/Dark uyumlu
  // isDone ise biraz daha silik ve üstü çizili
  const containerClass = `rounded-md border transition-colors ${
    isDone 
      ? 'bg-app/50 border-border/50 opacity-75' 
      : 'bg-app border-border hover:border-primary/30'
  }`;
  
  const issueTextStyle = isDone ? "text-text-secondary line-through" : "text-text-main";
  const issueAuthorStyle = "text-text-secondary";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center p-3">
        
        {isEditing ? (
          // --- DÜZENLEME MODU ---
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
                className="flex-grow py-1.5 px-3 text-text-main bg-surface border border-primary rounded-md focus:outline-none text-sm shadow-sm"
              />
              <button 
                onClick={handleSaveEdit} 
                disabled={isSaving} 
                className="p-2 text-green-500 hover:text-green-600 disabled:opacity-50 transition-colors"
              >
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave size={18} />}
              </button>
              <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:text-red-600 transition-colors">
                <FiX size={18} />
              </button>
            </div>
            {editError && (
              <p className="text-xs text-red-500 mt-1 ml-1 flex items-center">
                <FiAlertTriangle size={14} className="mr-1" />
                {editError}
              </p>
            )}
          </div>

        ) : (
          // --- NORMAL MOD ---
          <>
            <button 
              onClick={toggleComments}
              className="flex-1 flex items-center text-left group"
            >
              {isOpen 
                ? <FiChevronDown size={20} className="mr-2 text-text-secondary" /> 
                : <FiChevronRight size={20} className="mr-2 text-text-secondary group-hover:text-text-main" />
              }
              <div className="flex-1">
                <p className={`font-medium ${issueTextStyle}`}>{localIssue.text}</p>
                <span className={`text-xs ${issueAuthorStyle}`}>
                  Opened by <span className="font-semibold">{localIssue.created_by_name || '...'}</span>
                  {isDone && (
                    <span className="italic ml-1">
                      (Closed by {user?.username || '...'})
                    </span>
                  )}
                </span>
              </div>
            </button>
            
            <div className="flex items-center">
              <div className="flex items-center mr-3 text-text-secondary" title="Comments">
                 <FiMessageSquare size={16} className="mr-1" />
                 {/* Eğer comment sayısı varsa buraya eklenebilir */}
              </div>
              
              {/* 3-NOKTA MENÜ (SADECE 'viewer' veya 'public_viewer' DEĞİLSE GÖSTER) */}
              {(userRole === 'owner' || userRole === 'editor') && (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(prev => !prev);
                    }}
                    className="p-1.5 text-text-secondary hover:text-text-main hover:bg-surface-hover rounded-full transition-colors"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 w-44 bg-surface border border-border rounded-lg shadow-xl z-50 animate-fade-in origin-top-right overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick();
                          }}
                          className="w-full text-left flex items-center px-4 py-2.5 text-sm text-text-main hover:bg-surface-hover transition-colors"
                        >
                          <FiEdit size={14} className="mr-3 text-text-secondary" />
                          Edit Issue
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus();
                          }}
                          className="w-full text-left flex items-center px-4 py-2.5 text-sm text-text-main hover:bg-surface-hover transition-colors"
                        >
                          {isDone ? (
                            <><FiCircle size={14} className="mr-3 text-yellow-500" /> Re-open Issue</>
                          ) : (
                            <><FiCheckCircle size={14} className="mr-3 text-green-500" /> Mark as Done</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Yorum Bölümü */}
      {isOpen && !isEditing && (
        // border-t border-border
        <div className="p-4 border-t border-border bg-surface/30">
          
          {/* Yorum Listesi */}
          {loadingComments ? (
            <div className="flex justify-center p-3">
              <FiLoader className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {comments.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-2">No comments yet.</p>
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
          )}
          
          {/* Yorum Formu veya Kapalı Mesajı */}
          {isDone ? (
            <div className="p-3 bg-surface border border-border rounded-md text-center">
              <p className="text-sm text-text-secondary flex items-center justify-center">
                <FiCheckCircle className="mr-2 text-green-500" />
                This issue is closed. No new comments can be added.
              </p>
            </div>
          ) : (
            // Herkes (public_viewer dahil) yorum yapabilir
            <CommentForm 
              onSubmit={handleCommentAdded}
              loading={contextLoading} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default IssueItem;