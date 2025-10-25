import React, { useState, useEffect } from "react";
import SidebarMenu from "../components/SidebarMenu";
import { getAuth, clearAuth } from "./LoginPage"; // your auth utilities

/**
 * Home Page / Dashboard
 * Features:
 * - Sidebar with Dashboard, Projects, Chats
 * - My Projects section scrollable
 * - New Project form
 * - Show selected project details
 * - Logout button at bottom
 */
const Home = () => {
  const user = getAuth();

  // --------------------------
  // State
  // --------------------------
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem("projects")) || []
  );
  const [selectedProject, setSelectedProject] = useState(null);

  // --------------------------
  // Save projects to localStorage whenever updated
  // --------------------------
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  // --------------------------
  // Handlers
  // --------------------------
  const handleMyProjectClick = (project) => {
    setSelectedProject(project);
    setShowCreateForm(false);
    setActiveTab("MyProjectDetail");
  };

  const handleCreateProjectClick = () => {
    setShowCreateForm(true);
    setSelectedProject(null);
    setActiveTab("NewProject");
  };

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return alert("Project name is required.");
    const newProject = { id: Date.now(), name: newProjectName, description: newProjectDesc };
    setProjects([...projects, newProject]);
    setNewProjectName("");
    setNewProjectDesc("");
    setShowCreateForm(false);
    setActiveTab("Dashboard");
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  // Sidebar menu items
  const menuItems = [
    { text: "Dashboard", icon: "🏠", onClick: () => setActiveTab("Dashboard") },
    { text: "Projects", icon: "📁", onClick: () => setActiveTab("Projects") },
    { text: "Chats", icon: "💬", onClick: () => setActiveTab("Chats") },
  ];

  const bottomItems = [
    { text: "Profile", icon: "👤", onClick: () => setActiveTab("Profile") },
    { text: "Settings", icon: "⚙️", onClick: () => setActiveTab("Settings") },
  ];

  // --------------------------
  // Render main panel
  // --------------------------
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <p>Welcome to your dashboard, {user?.username}!</p>;

      case "NewProject":
        return (
          <div className="p-4 border rounded shadow bg-white max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-3">
              <input
                className="w-full p-2 border rounded"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Project Description"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Project
              </button>
            </form>
          </div>
        );

      case "MyProjectDetail":
        return selectedProject ? (
          <div className="p-6 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">{selectedProject.name}</h2>
            <p>{selectedProject.description}</p>
          </div>
        ) : (
          <p className="text-gray-500">Select a project from the left menu</p>
        );

      case "Projects":
        return <p>Other people's shared projects will appear here.</p>;

      case "Chats":
        return <p>Chat feature coming soon!</p>;

      case "Profile":
        return <p>Profile page for {user?.username}</p>;

      case "Settings":
        return <p>Settings page</p>;

      default:
        return <p>Select a tab</p>;
    }
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarMenu
        username={user?.username || "User"}
        items={menuItems}
        bottomItems={bottomItems}
        myProjects={projects}
        onNewProject={handleCreateProjectClick}
        onProjectClick={handleMyProjectClick}
        logout={handleLogout}
      />

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-xl shadow-sm p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Home;
