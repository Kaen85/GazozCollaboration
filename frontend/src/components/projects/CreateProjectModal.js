import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext'; // 1. Context'i import et
import { FiX, FiLoader } from 'react-icons/fi';

// Component, 'isOpen' (açık mı?) ve 'onClose' (kapatma fonksiyonu) proplarını alır
function CreateProjectModal({ isOpen, onClose }) {
  
  // 2. Context'ten 'createProject' fonksiyonunu ve 'loading' durumunu al
  const { createProject, loading } = useProjectContext();

  // 3. Form alanları için state'ler
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Eski hatayı temizle

    if (!name) {
      setError('Project name is required.');
      return;
    }

    try {
      // 4. Context'teki 'createProject' fonksiyonunu çağır
      // Bu fonksiyon backend'e API isteği atacak
      await createProject(name, description);
      
      // Başarılı olursa, formu temizle ve modal'ı kapat
      setName('');
      setDescription('');
      onClose(); 
    } catch (err) {
      // Başarısız olursa (örn: sunucu hatası), hatayı göster
      setError(err.message);
    }
  };

  // Eğer modal 'isOpen' false ise, hiçbir şey gösterme
  if (!isOpen) {
    return null;
  }

  // Modal açıksa, bu JSX'i göster
  return (
    // Arka planı karartan overlay
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      
      {/* Asıl Modal Penceresi */}
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg p-6">
        
        {/* Başlık ve Kapatma Butonu */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Proje Oluşturma Formu */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Proje Adı */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">
                Project Name
              </label>
              <input 
                type="text"
                id="projectName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My New Awesome Project"
              />
            </div>
            
            {/* Proje Açıklaması */}
            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="projectDescription"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2 px-3 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What is this project about?"
              />
            </div>
          </div>
          
          {/* Hata Mesajı Alanı */}
          {error && (
            <p className="text-sm text-red-400 text-center mt-4">
              {error}
            </p>
          )}

          {/* Butonlar */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <FiLoader className="animate-spin mr-2" />
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;