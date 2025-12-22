// src/components/projects/ProjectDiscussion.js

import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiLoader, FiLock, FiUser } from 'react-icons/fi';

export default function ProjectDiscussion() {
  const { currentProject, fetchComments, addComment, loading: contextLoading } = useProjectContext();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const userRole = currentProject?.currentUserRole;

  useEffect(() => {
    if (userRole === 'public_viewer' || !currentProject?.id) { setIsLoading(false); return; }
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await fetchComments(currentProject.id);
        setMessages(fetchedMessages || []);
      } catch (error) { console.error("Error loading messages:", error); } 
      finally { setIsLoading(false); }
    };
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, userRole]);

  useEffect(() => { if (messages.length > 0) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    const text = newMessage;
    setNewMessage('');
    setIsSending(true);
    try {
      const newComment = await addComment(currentProject.id, text);
      setMessages(prev => [...prev, newComment]);
    } catch (error) { console.error("Error sending:", error); setNewMessage(text); } 
    finally { setIsSending(false); }
  };

  if (userRole === 'public_viewer') {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-surface rounded-lg h-64 border border-border">
        <FiLock size={40} className="text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-text-main">Members Only Chat</h3>
        <p className="text-text-secondary mt-2">This chat room is only visible to project members.</p>
      </div>
    );
  }

  return (
    // Container: bg-surface
    <div className="flex flex-col h-[60vh] bg-surface rounded-lg shadow-sm border border-border">
      
      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-primary" size={24} /></div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full flex-col opacity-50">
             <div className="w-12 h-12 bg-app rounded-full flex items-center justify-center mb-2"><FiSend size={20} className="text-text-secondary" /></div>
            <p className="text-text-secondary text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.author_id === user.id;
            return (
              <div key={msg.id} className={`flex items-start ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isMine && (
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {msg.author_name?.charAt(0).toUpperCase() || <FiUser />}
                    </div>
                  </div>
                )}
                
                {/* Bubble: Mine -> bg-primary, Others -> bg-app */}
                <div className={`max-w-[80%] lg:max-w-[70%] p-3 rounded-2xl shadow-sm ${
                    isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-app text-text-main border border-border rounded-tl-none'
                  }`}
                >
                  {!isMine && <p className="text-[10px] font-bold text-primary mb-0.5 opacity-90">{msg.author_name}</p>}
                  <p className="text-sm break-words leading-relaxed">{msg.text}</p>
                  <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-100' : 'text-text-secondary'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-app/50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow py-2.5 px-4 text-sm text-text-main bg-surface border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder-text-secondary shadow-sm"
            placeholder="Type your message..." disabled={isSending || contextLoading}
          />
          <button type="submit" disabled={isSending || contextLoading} className="flex items-center justify-center w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-full transition-all shadow-md disabled:opacity-50">
            {isSending ? <FiLoader className="animate-spin text-xs" /> : <FiSend size={18} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}