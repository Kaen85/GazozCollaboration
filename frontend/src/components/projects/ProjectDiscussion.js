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
    if (userRole === 'public_viewer' || !currentProject?.id) {
      setIsLoading(false);
      return;
    }
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await fetchComments(currentProject.id);
        setMessages(fetchedMessages || []);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, userRole]);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    const text = newMessage;
    setNewMessage('');
    setIsSending(true);
    try {
      const newComment = await addComment(currentProject.id, text);
      setMessages(prev => [...prev, newComment]);
    } catch (error) {
      console.error("Error sending:", error);
      setNewMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  if (userRole === 'public_viewer') {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-lg h-64 border border-gray-700">
        <FiLock size={40} className="text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-white">Members Only Chat</h3>
        <p className="text-gray-400 mt-2">This chat room is only visible to project members.</p>
      </div>
    );
  }

  return (
    // === GÜNCELLEME: h-[65vh] ile yüksekliği ekranın %65'ine sabitledik ===
    // Bu sayede kesinlikle daha kısa olacak ve taşma yapmayacak.
    <div className="flex flex-col h-[55vh] bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      
      {/* Mesaj Listesi */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <FiLoader className="animate-spin text-blue-500" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full flex-col opacity-50">
             <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <FiSend size={20} className="text-gray-400" />
             </div>
            <p className="text-gray-400 text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.author_id === user.id;
            return (
              <div key={msg.id} className={`flex items-start ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isMine && (
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        {msg.author_name?.charAt(0).toUpperCase() || <FiUser />}
                    </div>
                  </div>
                )}
                
                {/* Mesaj Balonu (Daha kompakt padding: p-2) */}
                <div className={`max-w-[80%] lg:max-w-[70%] p-2 rounded-2xl shadow-sm ${
                    isMine 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-700 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {!isMine && (
                    <p className="text-[10px] font-bold text-blue-300 mb-0.5 opacity-90">
                      {msg.author_name}
                    </p>
                  )}
                  <p className="text-sm break-words leading-snug">{msg.text}</p>
                  <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Mesaj Yazma Kutusu */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow py-2 px-3 text-sm text-gray-200 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
            placeholder="Type your message..."
            disabled={isSending || contextLoading}
          />
          <button
            type="submit"
            disabled={isSending || contextLoading}
            className="flex items-center justify-center w-10 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {isSending ? <FiLoader className="animate-spin text-xs" /> : <FiSend size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}