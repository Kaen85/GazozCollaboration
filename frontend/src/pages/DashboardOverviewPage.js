// src/pages/DashboardOverviewPage.js
import React, { useState, useEffect } from 'react';
import ProjectList from '../components/projects/ProjectList';
// Import BOTH mock data sets
import { mockProjects, mockSharedProjects } from '../data/mockData';

function DashboardOverviewPage() {
  // State for 'My Projects'
  const [myProjects, setMyProjects] = useState([]);
  const [myProjectsLoading, setMyProjectsLoading] = useState(true);

  // State for 'Shared Projects'
  const [sharedProjects, setSharedProjects] = useState([]);
  const [sharedProjectsLoading, setSharedProjectsLoading] = useState(true);

  // Fetch 'My Projects' data
  useEffect(() => {
    setTimeout(() => {
      setMyProjects(mockProjects);
      setMyProjectsLoading(false);
    }, 1000);
  }, []);

  // Fetch 'Shared Projects' data
  useEffect(() => {
    setTimeout(() => {
      setSharedProjects(mockSharedProjects);
      setSharedProjectsLoading(false);
    }, 1500); // A slightly different delay to simulate separate API calls
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="space-y-8">
        {/* Top Box: My Projects List */}
        <div>
          <ProjectList 
            title="My Projects" 
            projects={myProjects} 
            loading={myProjectsLoading}
            viewAllLink="/my-projects" // Provide the correct link
          />
        </div>

        {/* Bottom Box: Shared Projects List */}
        <div>
          <ProjectList 
            title="Shared Projects" 
            projects={sharedProjects} 
            loading={sharedProjectsLoading}
            viewAllLink="/shared-projects" // Provide the correct link
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPage;