// src/components/projects/ProjectFiles.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { 
  FiFile, FiDownload, FiTrash2, FiUpload, FiLoader, 
  FiFileText, FiX, FiEye, FiCheckSquare, FiSquare, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

export default function ProjectFiles() {
  const { currentProject, fetchFiles, uploadFile, deleteFile } = useProjectContext();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const userRole = currentProject?.currentUserRole;
  const canEdit = userRole === 'owner' || userRole === 'editor';

  useEffect(() => {
    if (currentProject) {
      setLoading(true);
      fetchFiles(currentProject.id)
        .then(data => setFiles(data || []))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  // Klavye olayları (Preview için)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!previewFile) return;
      if (e.key === 'ArrowRight') handleNextPrev('next');
      if (e.key === 'ArrowLeft') handleNextPrev('prev');
      if (e.key === 'Escape') setPreviewFile(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => uploadFile(currentProject.id, file));
      const newFiles = await Promise.all(uploadPromises);
      setFiles(prevFiles => [...newFiles, ...prevFiles]); 
    } catch (error) {
      console.error("Upload failed", error);
      alert("Hata: Dosyalar yüklenemedi.");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Seçili ${selectedIds.length} dosyayı silmek istediğine emin misin?`)) {
      setLoading(true);
      try {
        await Promise.all(selectedIds.map(id => deleteFile(currentProject.id, id)));
        setFiles(files.filter(f => !selectedIds.includes(f.id)));
        setSelectedIds([]);
      } catch (err) {
        alert("Bazı dosyalar silinemedi.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map(f => f.id));
    }
  };

  const handleNextPrev = (direction) => {
    if (!previewFile) return;
    const currentIndex = files.findIndex(f => f.id === previewFile.id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1 < files.length ? currentIndex + 1 : 0; 
    } else {
      newIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : files.length - 1; 
    }
    setPreviewFile(files[newIndex]);
  };

  const getFileUrl = (filePath) => {
    const cleanPath = filePath.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath}`;
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['txt', 'md', 'json', 'xml', 'js', 'css', 'html', 'csv', 'log'].includes(ext)) return 'text';
    return 'other';
  };

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-text-main">Project Files</h2>
          {selectedIds.length > 0 && canEdit && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors text-sm border border-red-200 dark:border-red-800"
            >
              <FiTrash2 className="mr-2" /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
        
        {canEdit && (
          <div className="relative">
            <input 
              type="file" multiple onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <button className={`relative z-0 flex items-center px-4 py-2 rounded-lg transition-colors ${uploading ? 'bg-text-secondary cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'} text-white shadow-lg`}>
              {uploading ? <FiLoader className="animate-spin mr-2" /> : <FiUpload className="mr-2" />}
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        )}
      </div>

      {/* LİSTE */}
      {/* bg-gray-800 -> bg-surface, border-gray-700 -> border-border */}
      <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
        {/* Header Row */}
        <div className="flex items-center bg-app p-3 border-b border-border text-xs font-bold text-text-secondary uppercase">
          <div className="w-10 text-center">
            {canEdit && (
              <button onClick={toggleSelectAll} className="hover:text-text-main">
                {files.length > 0 && selectedIds.length === files.length ? <FiCheckSquare size={16}/> : <FiSquare size={16}/>}
              </button>
            )}
          </div>
          <div className="flex-1 px-4">Filename</div>
          <div className="w-32 hidden sm:block">Uploaded By</div>
          <div className="w-32 text-right hidden sm:block">Date</div>
          <div className="w-16 text-center">View</div>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><FiLoader className="animate-spin text-primary" size={30} /></div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center text-text-secondary">No files uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {files.map(file => {
              const isSelected = selectedIds.includes(file.id);
              const type = getFileType(file.filename);

              return (
                <li 
                  key={file.id} 
                  onClick={() => setPreviewFile(file)}
                  // hover:bg-surface-hover, text renkleri güncellendi
                  className={`flex items-center p-3 hover:bg-surface-hover transition-colors cursor-pointer group ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  {/* CHECKBOX */}
                  <div className="w-10 flex justify-center" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <button onClick={(e) => toggleSelect(file.id, e)} className={`transition-colors ${isSelected ? 'text-primary' : 'text-text-secondary hover:text-text-main'}`}>
                        {isSelected ? <FiCheckSquare size={18}/> : <FiSquare size={18}/>}
                      </button>
                    )}
                  </div>

                  {/* İKON VE İSİM */}
                  <div className="flex-1 px-4 flex items-center min-w-0">
                    <div className={`p-2 rounded-lg mr-3 ${type === 'image' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : (type === 'pdf' || type === 'text') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-app text-text-secondary'}`}>
                      {type === 'image' ? <FiFileText /> : <FiFile />}
                    </div>
                    <span className="text-text-main font-medium truncate">{file.filename}</span>
                  </div>

                  {/* META */}
                  <div className="w-32 text-sm text-text-secondary hidden sm:block truncate">{file.uploader_name}</div>
                  <div className="w-32 text-right text-sm text-text-secondary hidden sm:block font-mono">{new Date(file.created_at).toLocaleDateString()}</div>

                  {/* İNDİR BUTONU */}
                  <div className="w-16 flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <a 
                      href={getFileUrl(file.file_path)} 
                      download
                      className="p-1.5 text-text-secondary hover:text-text-main hover:bg-surface-hover rounded transition-colors"
                      title="Download"
                    >
                      <FiDownload size={16} />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* PREVIEW MODAL - (Genellikle koyu arka plan daha iyi durur, o yüzden bg-black/95 kalabilir veya bg-app/95 yapılabilir) */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in select-none">
          <button onClick={() => setPreviewFile(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-800/80 p-2 rounded-full z-50 transition-colors">
            <FiX size={28} />
          </button>

          <button onClick={() => handleNextPrev('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all z-50">
            <FiChevronLeft size={40} />
          </button>
          
          <button onClick={() => handleNextPrev('next')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all z-50">
            <FiChevronRight size={40} />
          </button>

          <div className="w-full h-full p-12 flex flex-col items-center justify-center">
            {getFileType(previewFile.filename) === 'image' ? (
              <img src={getFileUrl(previewFile.file_path)} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"/>
            ) : (getFileType(previewFile.filename) === 'pdf' || getFileType(previewFile.filename) === 'text') ? (
              <iframe src={getFileUrl(previewFile.file_path)} title="File Preview" className="w-full max-w-5xl h-[85vh] bg-white rounded-lg shadow-2xl border-none"/>
            ) : (
              <div className="text-center text-white bg-gray-800 p-16 rounded-2xl border border-gray-700 shadow-2xl">
                <FiFileText size={80} className="mx-auto mb-6 text-blue-500 opacity-80"/>
                <h3 className="text-2xl font-bold mb-3 text-white">{previewFile.filename}</h3>
                <p className="text-gray-400 mb-8">This file type cannot be previewed directly.</p>
                <a href={getFileUrl(previewFile.file_path)} download className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-colors shadow-lg">Download File</a>
              </div>
            )}
            <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                    {files.findIndex(f => f.id === previewFile.id) + 1} / {files.length} — {previewFile.filename}
                </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}