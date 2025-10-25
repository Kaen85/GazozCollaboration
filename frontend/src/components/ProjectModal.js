import React from "react";

/**
 * Modal to show project details
 * Props:
 * - project: { id, name, description }
 * - onClose: function to close the modal
 */
const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
        {project.description ? (
          <p className="text-gray-700">{project.description}</p>
        ) : (
          <p className="text-gray-400 italic">No description provided.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
