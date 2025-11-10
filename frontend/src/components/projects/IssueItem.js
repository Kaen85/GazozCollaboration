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

  // === 2. EFFECT'LER (STATE GÜNCELLEME VE MENÜ) ===
  
  // Ebeveyn (ProjectIssues) güncellendiğinde 'issue' prop'u değişir.
  // Bu, 'localIssue' state'imizi günceller.
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
  
  // === 3. FONKSİYONLAR (TANIMLAMALAR) ===
  // (Tüm fonksiyonlar 'return' satırından ÖNCE burada tanımlanır)

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
  
  // Stilleri belirle
  const isDone = localIssue.status === 'Closed';
  const issueTextStyle = isDone ? "text-gray-500 line-through" : "text-white";
  const issueAuthorStyle = isDone ? "text-gray-600" : "text-gray-400";

  return (
    <div className={`bg-gray-700 rounded-md ${isDone ? 'bg-opacity-70' : ''}`}>
      <div className="flex justify-between items-center p-3">
        
        {isEditing ? (
          // --- DÜZENLEME MODU (Değişiklik yok) ---
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
                className="flex-grow py-1 px-2 text-white bg-gray-600 border border-blue-500 rounded-md focus:outline-none"
              />
              <button 
                onClick={handleSaveEdit} 
                disabled={isSaving} 
                className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50"
              >
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave size={18} />}
              </button>
              <button onClick={handleCancelEdit} className="p-2 text-red-400 hover:text-red-300">
                <FiX size={18} />
              </button>
            </div>
            {editError && (
              <p className="text-xs text-red-400 mt-1 ml-1 flex items-center">
                <FiAlertTriangle size={14} className="mr-1" />
                {editError}
              </p>
            )}
          </div>

        ) : (
          // --- NORMAL MOD (METİN GÖSTER) (Değişiklik yok) ---
          <>
            <button 
              onClick={toggleComments}
              className="flex-1 flex items-center text-left"
            >
              {isOpen ? <FiChevronDown size={20} className="mr-2" /> : <FiChevronRight size={20} className="mr-2" />}
              <div className="flex-1">
                <p className={`font-medium ${issueTextStyle}`}>{localIssue.text}</p>
                <span className={`text-xs ${issueAuthorStyle}`}>
                  Opened by {localIssue.created_by_name || '...'}
                  {isDone && (
                    <span className="italic">
                      : Closed by {user?.username || '...'}
                    </span>
                  )}
                </span>
              </div>
            </button>
            
            <div className="flex items-center">
              <FiMessageSquare size={16} className={`mr-3 ${issueAuthorStyle}`} />
              
              {/* 3-NOKTA MENÜ (SADECE 'viewer' veya 'public_viewer' DEĞİLSE GÖSTER) */}
              {(userRole === 'owner' || userRole === 'editor') && (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="p-1 text-gray-400 hover:text-white rounded-full"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                      {/* ... (Menu içeriği: Edit, Mark as Done) ... */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Yorum Bölümü (Sadece 'Normal Mod'da ve 'Açık'ken göster) */}
      {isOpen && !isEditing && (
        <div className="p-4 border-t border-gray-600">
          
          {/* Yorum Listesi */}
          {loadingComments ? (
            <div className="flex justify-center p-3">
              <FiLoader className="animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">No comments yet.</p>
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
          
          {/* === DÜZELTME BURADA: KAPALIYSA FORMU GİZLE === */}
          
          {isDone ? (
            <div className="p-3 bg-gray-800 rounded-md text-center">
              <p className="text-sm text-gray-400">
                This issue is closed. No new comments can be added.
              </p>
            </div>
          ) : (
            // === DÜZELTME BURADA: ROL KONTROLÜ KALDIRILDI ===
            // 'userRole !== 'public_viewer'' kontrolü kaldırıldı.
            // Backend zaten kapalı issue'lara yorumu engelliyor
            // ve 'public_viewer'ın yorum yapmasına İZİN VERİYOR.
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