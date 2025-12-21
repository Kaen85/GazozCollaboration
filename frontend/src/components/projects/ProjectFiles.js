// src/components/projects/ProjectFiles.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiFile, FiDownload, FiTrash2, FiUpload, FiLoader, FiFileText } from 'react-icons/fi';

export default function ProjectFiles() {
  const { currentProject, fetchFiles, uploadFile, deleteFile } = useProjectContext();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const userRole = currentProject?.currentUserRole;
  const canEdit = userRole === 'owner' || userRole === 'editor';

  // Dosyaları Yükle
  useEffect(() => {
    if (currentProject) {
      setLoading(true);
      fetchFiles(currentProject.id)
        .then(data => setFiles(data || []))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const newFile = await uploadFile(currentProject.id, file);
      setFiles([newFile, ...files]); 
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm("Delete this file?")) {
      await deleteFile(currentProject.id, fileId);
      setFiles(files.filter(f => f.id !== fileId));
    }
  };

  const getFileUrl = (filePath) => {
    const cleanPath = filePath.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="space-y-8">
      {/* 1. BÖLÜM: DOSYALAR LİSTESİ */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Project Files</h2>
          
          {canEdit && (
            <div className="relative">
              <input 
                type="file" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                {uploading ? <FiLoader className="animate-spin mr-2" /> : <FiUpload className="mr-2" />}
                Upload File
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-700">
          {loading ? (
            <div className="p-8 flex justify-center"><FiLoader className="animate-spin text-blue-500" size={30} /></div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No files uploaded yet.</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {files.map(file => (
                <li key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-750 transition-colors">
                  <div className="flex items-center overflow-hidden">
                    <div className="p-3 bg-gray-700 rounded-lg mr-4">
                      <FiFile className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <a 
                        href={getFileUrl(file.file_path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:underline truncate block"
                      >
                        {file.filename}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded by {file.uploader_name} on {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a 
                      href={getFileUrl(file.file_path)} 
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                      title="Download"
                    >
                      <FiDownload size={18} />
                    </a>
                    {canEdit && (
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 2. BÖLÜM: UZUN AÇIKLAMA (README) */}
      {/* Sadece doluysa göster */}
      {currentProject?.long_description && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-2">
            <FiFileText className="mr-2 text-gray-400" />
            Project Readme / Details
          </h3>
          <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {/* 'whitespace-pre-wrap': Satır sonlarını ve boşlukları korur */}
            {currentProject.long_description}
          </div>
        </div>
      )}
    </div>
  );
}