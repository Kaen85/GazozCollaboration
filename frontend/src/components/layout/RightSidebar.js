// src/components/layout/RightSidebar.js
import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { FiUser } from 'react-icons/fi';
// --- 1. IMPORT useLocation FROM REACT ROUTER ---
import { useLocation } from 'react-router-dom';

function RightSidebar() {
  const { currentProjectMembers } = useProjectContext();
  // --- 2. GET THE CURRENT URL LOCATION ---
  const location = useLocation();

  // --- 3. CHECK IF WE ARE ON A PROJECT DETAIL PAGE ---
  // We check if the current URL path starts with '/projects/'
  const isProjectDetailPage = location.pathname.startsWith('/projects/');

  return (
    <aside className="w-72 bg-gray-800 p-4 border-l border-gray-700 flex-shrink-0">
      {/* --- 4. USE A CONDITIONAL (IF/ELSE) TO RENDER DIFFERENT CONTENT --- */}
      {isProjectDetailPage ? (
        // --- CONTENT FOR PROJECT PAGES ---
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Members</h3>
          {currentProjectMembers.length > 0 ? (
            <ul className="space-y-3">
              {currentProjectMembers.map(member => (
                <li key={member.userId} className="flex items-center">
                  <FiUser className="w-5 h-5 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Loading members...</p>
          )}
        </div>
      ) : (
        // --- DEFAULT CONTENT FOR ALL OTHER PAGES (like Dashboard) ---
        <div className="text-white">
          <h3 className="font-bold text-lg mb-4">Quick Info</h3>
          <p className="text-sm text-gray-400">
            This panel will show notifications or other relevant info in the future.
          </p>
        </div>
      )}
    </aside>
  );
}

export default RightSidebar;