// src/context/ProjectContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const ProjectContext = createContext();

// Create the Provider component
export function ProjectProvider({ children }) {
  // This state will hold the members of the currently viewed project
  const [currentProjectMembers, setCurrentProjectMembers] = useState([]);

  const value = { currentProjectMembers, setCurrentProjectMembers };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

// Create a custom hook for easy access
export function useProjectContext() {
  return useContext(ProjectContext);
}