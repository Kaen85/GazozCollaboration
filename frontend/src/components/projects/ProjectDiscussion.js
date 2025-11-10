// src/components/projects/ProjectDiscussion.js (Kural Hatası Düzeltildi)

import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiLoader, FiLock, FiUser } from 'react-icons/fi';

export default function ProjectDiscussion() {
  
  // === 1. ADIM: TÜM HOOK'LAR EN ÜSTE TAŞINDI ===
  // Tüm hook'lar (useState, useEffect, useContext, useRef)
  // herhangi bir 'if' bloğundan veya 'return'den önce çağrılmalıdır.

  // Context'ten gerekli verileri al
  const { 
    currentProject, 
    fetchComments, // Proje yorumlarını (eski->yeni) çeker
    addComment,    // Projeye yeni yorum ekler
    loading: contextLoading 
  } = useProjectContext();
  
  const { user } = useAuth(); // 'user.id'yi, mesajın "bana mı" ait olduğunu bilmek için kullan

  // State'leri (Durumları) tanımla
  const [messages, setMessages] = useState([]); // Sohbet mesajlarının listesi
  const [newMessage, setNewMessage] = useState(''); // Yazı kutusundaki metin
  const [isLoading, setIsLoading] = useState(true); // Sadece ilk yükleme için
  const [isSending, setIsSending] = useState(false); // Mesaj gönderirken

  const chatEndRef = useRef(null); // Sohbetin en altına otomatik kaydırmak için

  // İzin (Permission) Kontrolü
  const userRole = currentProject?.currentUserRole;

  // --- useEffect Hook'ları (Artık en üst seviyedeler) ---

  // 4. Mesajları Yükleme Fonksiyonu (Sayfa açıldığında)
  useEffect(() => {
    // Eğer 'public_viewer' ise veya proje yoksa, mesajları çekme
    // (Kontrolü Hook'un İÇİNDE yapmak güvenlidir)
    if (userRole === 'public_viewer' || !currentProject?.id) {
      setIsLoading(false); // Yüklemeyi durdur
      return; // Bu effect'ten çık
    }

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        // Backend'den 'ASC' (eskiden yeniye) sıralı yorumları çek
        const fetchedMessages = await fetchComments(currentProject.id);
        setMessages(fetchedMessages || []);
      } catch (error) {
        console.error("Failed to load discussion messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, userRole]); // userRole'ü de bağımlılığa ekle

  // 5. Mesaj gönderildiğinde en alta kaydır
  useEffect(() => {
    // Sadece mesajlar yüklendiyse çalış
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // 'messages' dizisi her değiştiğinde tetiklenir


  // === 2. ADIM: FONKSİYONLAR ===
  
  // 6. Mesaj Gönderme Fonksiyonu
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return; // Boşsa veya zaten gönderiyorsa dur

    const text = newMessage;
    setNewMessage(''); // Formu anında temizle
    setIsSending(true);

    try {
      // Context'teki 'addComment'i (projeye genel yorum) çağır
      const newComment = await addComment(currentProject.id, text);
      
      // Başarılı olursa, backend'den dönen tam mesajı state'e ekle
      setMessages(prevMessages => [...prevMessages, newComment]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(text); // Hata olursa, yazıyı kutuya geri koy
    } finally {
      setIsSending(false);
    }
  };

  // === 3. ADIM: KOŞULLU RENDER ===
  // (Artık tüm hook'lar çağrıldığı için 'return'ü güvenle kullanabiliriz)
  
  // Eğer 'public_viewer' (Herkese açık) ise bu sekmeyi gösterme
  if (userRole === 'public_viewer') {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-lg">
        <FiLock size={40} className="text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-white">Members Only Chat</h3>
        <p className="text-gray-400 mt-2">
          This chat room is only visible to project members.
        </p>
      </div>
    );
  }

  // === 4. ADIM: NORMAL RENDER (SOHBET ARAYÜZÜ) ===
  return (
    <div className="flex flex-col h-[70vh] bg-gray-800 rounded-lg shadow-lg">
      
      {/* Mesajların Listelendiği Alan */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <FiLoader className="animate-spin text-blue-500" size={30} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map(msg => {
            // Mesajın 'benim' olup olmadığını kontrol et (ID ile)
            const isMine = msg.author_id === user.id;
            
            return (
              <div 
                key={msg.id} 
                className={`flex items-start ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar (Benim değilse) */}
                {!isMine && (
                  <div className="flex-shrink-0 mr-2">
                    <FiUser className="w-8 h-8 text-gray-400 bg-gray-700 rounded-full p-1" />
                  </div>
                )}
                
                {/* Mesaj Balonu */}
                <div 
                  className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                    isMine 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {/* Yazar Adı (Benim değilse) */}
                  {!isMine && (
                    <p className="text-xs font-semibold text-blue-300 mb-1">
                      {msg.author_name}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                {/* Avatar (Benimse) */}
                {isMine && (
                  <div className="flex-shrink-0 ml-2">
                    <FiUser className="w-8 h-8 text-gray-400 bg-gray-700 rounded-full p-1" />
                  </div>
                )}
              </div>
            );
          })
        )}
        {/* En alta kaydırmak için görünmez div */}
        <div ref={chatEndRef} />
      </div>

      {/* Mesaj Yazma Kutusu */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isSending || contextLoading}
          />
          <button
            type="submit"
            disabled={isSending || contextLoading}
            className="flex items-center justify-center w-16 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSending ? <FiLoader className="animate-spin" /> : <FiSend size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}