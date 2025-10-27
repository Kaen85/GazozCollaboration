// src/components/projects/CreateProjectModal.js

import React, { useState } from 'react';

// This component receives functions from its parent to close itself and to "create" a project.
function CreateProjectModal({ onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- MOCK API CALL ---
    // Instead of an axios request, we simulate a network delay with setTimeout.
    setTimeout(() => {
      // Create a new project object with a temporary unique ID
      const newProject = {
        id: Date.now(), // Use timestamp for a unique mock ID
        name: name,
        description: description,
      };

      // Call the function passed from the parent component to add the new project to the list
      onProjectCreated(newProject);
      setLoading(false);
      onClose(); // Close the modal
    }, 1000); // Simulate a 1-second delay
  };

  return (
    // Modal background
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      {/* Modal content */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create a New Project</h2>
        <form onSubmit={handleSubmit}>
          {/* Project Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Project Description Input */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-800">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;