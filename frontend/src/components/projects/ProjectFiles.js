// src/components/projects/ProjectFiles.js

import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { 
  FiDownload, FiUpload, FiLoader, 
  FiFileText, FiX, FiCheckSquare, FiSquare, FiChevronLeft, FiChevronRight, 
  FiExternalLink, FiImage, FiAlertTriangle, FiTrash2, FiMinusCircle,
  FiInfo, FiChevronDown, FiChevronUp, FiEye
} from 'react-icons/fi';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ProjectFiles() {
  const { currentProject, fetchFiles, uploadFile, deleteFile } = useProjectContext();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingBulk, setDownloadingBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false); 

  const userRole = currentProject?.currentUserRole;
  const canEdit = userRole === 'owner' || userRole === 'editor';

  // --- 1. Load Files ---
  useEffect(() => {
    if (currentProject?.id) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchFiles(currentProject.id);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Sayaç Tetikleyici ---
  useEffect(() => {
    if (previewFile) {
        const category = getFileTypeCategory(previewFile.filename);
        // Eğer önizlemesi olmayan bir dosya türü ise (ZIP vb.), manuel istek atarak sayacı artır.
        if (category === 'other') {
            fetch(getPreviewUrl(previewFile)).catch(err => console.log("Counter ping sent"));
        }
    }
  }, [previewFile]);

  // --- Actions ---
  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadFile(currentProject.id, file);
      }
      await loadFiles(); 
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading files.");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`${selectedIds.length} dosyayı silmek istediğine emin misin?`)) {
      setLoading(true);
      try {
        await Promise.all(selectedIds.map(id => deleteFile(currentProject.id, id)));
        await loadFiles();
        setSelectedIds([]);
        setPreviewFile(null);
      } catch (err) {
        alert("Dosyalar silinemedi.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length === 1) {
        const file = files.find(f => f.id === selectedIds[0]);
        if (file) {
            const link = document.createElement('a');
            link.href = getDownloadUrl(file.file_path);
            link.download = file.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        return;
    }
    setDownloadingBulk(true);
    try {
        const zip = new JSZip();
        const folderName = currentProject?.name ? `${currentProject.name}_Files` : 'Project_Files';
        const imgFolder = zip.folder(folderName);
        const downloadPromises = selectedIds.map(async (id) => {
            const file = files.find(f => f.id === id);
            if (!file) return;
            try {
                const response = await fetch(getDownloadUrl(file.file_path));
                const blob = await response.blob();
                imgFolder.file(file.filename, blob);
            } catch (err) {
                console.error(`Failed to download ${file.filename}`, err);
            }
        });
        await Promise.all(downloadPromises);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${folderName}.zip`);
    } catch (error) {
        console.error("Zip Error:", error);
        alert("Failed to create zip file.");
    } finally {
        setDownloadingBulk(false);
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    selectedIds.includes(id) ? setSelectedIds(selectedIds.filter(itemId => itemId !== id)) : setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    const validIds = files.filter(f => f?.id).map(f => f.id);
    selectedIds.length === validIds.length ? setSelectedIds([]) : setSelectedIds(validIds);
  };

  const handleUnselectAll = () => setSelectedIds([]);

  // --- Helpers ---
  const getDownloadUrl = (filePath) => {
    if (!filePath) return '';
    const cleanPath = filePath.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath}`;
  };

  // Cache busting (t=Date.now()) ile sayaç her zaman çalışır
  const getPreviewUrl = (file) => {
    if (!file) return '';
    const token = localStorage.getItem('token');
    return `http://localhost:5000/api/projects/${file.project_id}/files/${file.id}/preview?token=${token}&t=${Date.now()}`;
  };

  const getFileTypeCategory = (filename) => {
    if (!filename) return 'other';
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf', 'txt', 'md'].includes(ext)) return 'previewable';
    return 'other';
  };

  // BOYUT HESAPLAMA FONKSİYONU
  const formatFileSize = (bytes) => {
    // Veritabanından string gelme ihtimaline karşı parseInt yapıyoruz
    const b = parseInt(bytes, 10);
    if (!b || isNaN(b) || b === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleNextPrev = (direction) => {
    if (!previewFile) return;
    const validFiles = files.filter(f => f && f.id);
    const currentIndex = validFiles.findIndex(f => f.id === previewFile.id);
    if (currentIndex === -1) return;
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1 < validFiles.length ? currentIndex + 1 : 0; 
    } else {
      newIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : validFiles.length - 1; 
    }
    setPreviewFile(validFiles[newIndex]);
  };

  const handleOpenPreview = (file) => {
      setPreviewFile(file);
  };

  // --- RENDER PREVIEW CONTENT ---
  const renderPreviewContent = () => {
    if (!previewFile) return null;
    const category = getFileTypeCategory(previewFile.filename);
    
    if (category === 'image') {
      return (
        <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
            src={getPreviewUrl(previewFile)} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            />
        </div>
      );
    }
    if (category === 'previewable') {
      return (
        <iframe 
          src={getPreviewUrl(previewFile)} 
          title="File Preview" 
          className="absolute inset-0 w-full h-full border-none bg-white block" 
        />
      );
    }
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white bg-zinc-800 p-8 rounded-2xl border border-zinc-700">
            <FiFileText size={48} className="mx-auto mb-4 text-gray-400"/>
            <p className="text-gray-300 mb-6">Preview not available for this format.</p>
            <a href={getDownloadUrl(previewFile.file_path)} download className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-lg font-bold text-white transition-colors no-underline">
            Download File
            </a>
        </div>
      </div>
    );
  };

  // --- RENDER MAIN ---
  return (
    <div className="space-y-6 relative">
      
      {/* Description Box */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm transition-all">
        <button onClick={() => setIsDescriptionOpen(!isDescriptionOpen)} className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-hover transition-colors text-left cursor-pointer border-none">
          <div className="flex items-center gap-2 font-medium text-text-main"><FiInfo className="text-primary" size={18} /><span>Project Description</span></div>
          <div className="text-text-secondary">{isDescriptionOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}</div>
        </button>
        {isDescriptionOpen && (
          <div className="p-4 border-t border-border bg-app/30 text-text-secondary text-sm leading-relaxed whitespace-pre-wrap animate-fade-in max-h-64 overflow-y-auto">
             {currentProject?.long_description || currentProject?.description || "No description provided."}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        {canEdit && (
          <div className="relative">
            <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
            <button className={`px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2 transition-all ${uploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-lg'}`}>
              {uploading ? <FiLoader className="animate-spin"/> : <FiUpload/>} {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        )}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="h-8 w-[1px] bg-border mx-1"></div>
            <button onClick={handleUnselectAll} className="px-3 py-2 bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-main rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-dashed border-border"><FiMinusCircle /> <span className="hidden sm:inline">Unselect All</span></button>
            <button onClick={handleDownloadSelected} disabled={downloadingBulk} className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-text-main font-medium flex items-center gap-2 transition-colors">{downloadingBulk ? <FiLoader className="animate-spin"/> : <FiDownload />} {downloadingBulk ? 'Zipping...' : `Download (${selectedIds.length})`}</button>
            {canEdit && <button onClick={handleDeleteSelected} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-lg font-medium flex items-center gap-2 transition-colors"><FiTrash2 /> Delete ({selectedIds.length})</button>}
          </div>
        )}
      </div>

      {/* File List */}
      <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="flex bg-app p-3 border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider items-center">
          <div className="w-10 text-center flex justify-center">
             <button onClick={toggleSelectAll} className="bg-transparent border-none cursor-pointer hover:text-text-main text-text-secondary">
               {files.length > 0 && selectedIds.length === files.length ? <FiCheckSquare size={16}/> : <FiSquare size={16}/>}
             </button>
          </div>
          <div className="flex-1 px-4">Filename</div>
          <div className="w-36 text-left hidden sm:block">Uploaded By</div>
          <div className="w-32 text-left hidden sm:block">Date</div>
          <div className="w-20 text-right hidden md:block">Size</div>
          <div className="w-20 text-center">Views</div>
          <div className="w-16 text-center">Action</div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><FiLoader className="animate-spin text-primary" size={24}/></div>
        ) : (
          <ul className="divide-y divide-border m-0 p-0">
            {files.map((file, index) => {
              if (!file) return null;
              
              const fileId = file.id || index;
              const category = getFileTypeCategory(file.filename);
              const isSelected = selectedIds.includes(fileId);

              return (
                <li 
                  key={fileId} 
                  onClick={() => handleOpenPreview(file)}
                  className={`flex items-center p-3 hover:bg-surface-hover cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-10 flex justify-center" onClick={(e) => { e.stopPropagation(); if (file.id) toggleSelect(fileId, e); }}>
                    {file.id && (isSelected ? <FiCheckSquare className="text-primary"/> : <FiSquare className="text-text-secondary"/>)}
                    {!file.id && <FiAlertTriangle className="text-yellow-500" title="Data Error"/>}
                  </div>

                  <div className="flex-1 px-4 flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                        category === 'image' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 
                        category === 'previewable' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {category === 'image' ? <FiImage size={18}/> : <FiFileText size={18}/>}
                    </div>
                    <span className="font-medium text-text-main truncate text-sm">{file.filename || "Untitled"}</span>
                  </div>

                  <div className="w-36 text-xs text-text-secondary hidden sm:block truncate text-left">{file.uploader_name || '-'}</div>
                  <div className="w-32 text-xs text-text-secondary hidden sm:block font-mono opacity-70 text-left">
                    {file.created_at ? new Date(file.created_at).toLocaleDateString() : '-'}
                  </div>
                  
                  {/* SIZE DISPLAY */}
                  <div className="w-20 text-right text-xs text-text-secondary hidden md:block font-mono opacity-70">
                    {formatFileSize(file.file_size)}
                  </div>
                  
                  {/* VIEWS DISPLAY */}
                  <div className="w-20 text-center flex justify-center items-center gap-1 text-xs text-text-secondary font-medium">
                     <FiEye size={14} className="opacity-50"/> {file.view_count || 0}
                  </div>
                  
                  <div className="w-16 flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
                     <a href={getDownloadUrl(file.file_path)} download className="p-2 hover:bg-surface-hover rounded-full text-text-secondary hover:text-primary transition-colors flex items-center">
                       <FiDownload size={16}/>
                     </a>
                  </div>
                </li>
              );
            })}
            {files.length === 0 && <div className="p-8 text-center text-text-secondary text-sm">No files uploaded yet.</div>}
          </ul>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed top-0 left-0 w-screen h-[100vh] z-[99999] bg-black/95 flex flex-col animate-fade-in overflow-hidden m-0 p-0">
          <div className="flex-none h-16 flex items-center justify-between px-6 bg-zinc-900 border-b border-white/10 text-white z-50">
             <div className="flex items-center gap-4 overflow-hidden">
               <button onClick={() => { setPreviewFile(null); loadFiles(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent cursor-pointer text-white"><FiX size={24} /></button>
               <span className="font-bold truncate text-sm md:text-base">{previewFile.filename}</span>
             </div>
             <div className="flex items-center gap-3 flex-shrink-0">
               <a href={getPreviewUrl(previewFile)} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors text-white no-underline"><FiExternalLink /> New Tab</a>
               <a href={getDownloadUrl(previewFile.file_path)} download className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-bold transition-colors text-white no-underline"><FiDownload /> Download</a>
             </div>
          </div>
          <div className="flex-1 relative w-full h-full overflow-hidden bg-zinc-900">
            <button onClick={(e) => { e.stopPropagation(); handleNextPrev('prev'); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all border-none bg-transparent cursor-pointer"><FiChevronLeft size={48} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleNextPrev('next'); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all border-none bg-transparent cursor-pointer"><FiChevronRight size={48} /></button>
             
             {renderPreviewContent()}
             
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <span className="bg-black/60 text-white/80 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg">
                    {files.filter(f => f && f.id).findIndex(f => f.id === previewFile.id) + 1} / {files.filter(f => f && f.id).length}
                </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}