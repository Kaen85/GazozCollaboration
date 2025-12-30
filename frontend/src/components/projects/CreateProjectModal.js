// src/components/projects/CreateProjectModal.js

import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiX, FiLoader } from 'react-icons/fi';

function CreateProjectModal({ isOpen, onClose }) {
  const { createProject, loading } = useProjectContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name) { setError('Project name is required.'); return; }
    try {
      await createProject(name, description);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      
      {/* Modal Kutusu: bg-surface kullanarak temaya duyarlı hale getirdik */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        
        {/* Başlık ve Kapatma Butonu */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-main">Create New Project</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-main transition-colors bg-app p-1 rounded-full">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="projectName" className="block text-sm font-bold text-text-secondary mb-1.5 uppercase tracking-wide">
              Project Name
            </label>
            {/* Input renkleri düzenlendi */}
            <input 
              type="text" id="projectName"
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-4 text-text-main bg-app border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="e.g. Website Redesign"
            />
          </div>
          
          <div>
             <label htmlFor="projectDescription" className="block text-sm font-bold text-text-secondary mb-1.5 uppercase tracking-wide">
                Description (Optional)
              </label>
              <textarea
                id="projectDescription" rows="3"
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2.5 px-4 text-text-main bg-app border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Briefly describe your project..."
              />
          </div>
          
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 text-center font-medium">{error}</p>}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button" onClick={onClose} disabled={loading}
              className="py-2.5 px-5 bg-app hover:bg-surface-hover border border-border text-text-main font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex items-center justify-center py-2.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-70"
            >
              {loading ? <FiLoader className="animate-spin mr-2" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;