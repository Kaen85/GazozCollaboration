// src/components/projects/ProjectIssues.js
import React from 'react';
import { FiHelpCircle } from 'react-icons/fi'; // A more fitting icon for help requests

// The component now receives an array of 'issues'
function ProjectIssues({ issues }) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2 mb-4">
        Issues
      </h2>
      <div className="bg-gray-800 p-6 rounded-lg">
        {/* We check if the 'issues' array exists and has items */}
        {issues && issues.length > 0 ? (
          // If there are issues, map over them and render a list
          <ul className="space-y-3">
            {issues.map((issue, index) => (
              <li key={index} className="flex items-start">
                <FiHelpCircle className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-300">{issue}</p>
              </li>
            ))}
          </ul>
        ) : (
          // If the array is empty, show a fallback message
          <p className="text-gray-500">No issues specified for this project.</p>
        )}
      </div>
    </div>
  );
}

export default ProjectIssues;