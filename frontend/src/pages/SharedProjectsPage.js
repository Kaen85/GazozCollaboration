// src/pages/SharedProjectsPage.js
import React, { useState, useEffect } from 'react';
// Import our new mock data and card component
import { mockSharedProjects } from '../data/mockData';
import SharedProjectCard from '../components/projects/SharedProjectCard';
import { Link } from 'react-router-dom';

function SharedProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from an API
  useEffect(() => {
    setTimeout(() => {
      setProjects(mockSharedProjects);
      setLoading(false);
    }, 1200); // Simulate a 1.2-second network delay
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Shared Projects</h1>
        <p className="text-gray-400 mt-2">
          Projects shared with you by other members of the hub.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading shared projects...</p>
      ) : (
        // A responsive grid to display the project cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <SharedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SharedProjectsPage;