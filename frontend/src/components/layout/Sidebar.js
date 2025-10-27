// src/components/layout/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiFolder } from 'react-icons/fi';

function Sidebar() {
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200";
  const activeLinkClasses = "bg-gray-700 text-white";

  return (
    <aside className="w-64 bg-gray-800 p-4">
      <nav>
        <ul>
          <li>
            <NavLink
              to="/dashboard" // This path is correct
              end
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiGrid className="mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li className="mt-2">
            {/* CHANGE: Update the link to the new top-level path */}
            <NavLink
              to="/shared-projects" // Formerly "/dashboard/shared-projects"
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiUsers className="mr-3" />
              Shared Projects
            </NavLink>
          </li>
          <li className="mt-2">
            {/* CHANGE: Update the link to the new top-level path */}
            <NavLink
              to="/my-projects" // Formerly "/dashboard/my-projects"
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiFolder className="mr-3" />
              My Projects
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;