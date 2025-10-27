// src/data/mockData.js

// This file contains mock data to be used until the backend is connected.
export const mockProjects = [
  {
    id: 1,
    name: "Final Year Thesis",
    description: "Research and development for the final year university project.",
    issues: [
      "I'm stuck on writing the literature review section.",
      "Need help connecting different sources smoothly."
    ]
  },
  {
    id: 2,
    name: "Mobile App UI/UX",
    description: "Designing the user interface and experience for a new mobile application.",
    issue: "We need help with the payment gateway integration. The API documentation is confusing and we are getting authentication errors."
  },
  {
    id: 3,
    name: "Marketing Campaign Q4",
    description: "Planning and execution of the marketing campaign for the last quarter.",
    issues: []
  }
];
// --- ADD THIS NEW DATA ---
// This data simulates projects shared by other users.
// Note the new 'owner' field.
export const mockSharedProjects = [
  {
    id: 101,
    name: "University Canteen App",
    description: "A collaborative project to build an app for the university canteen.",
    owner: {
      name: "Jane Doe",
      // We can add an avatar URL later for a better UI
      // avatarUrl: "https://example.com/avatar1.png" 
    },
    issues: [
      "We need help with the payment gateway integration.",
      "The API documentation is confusing and we are getting authentication errors."
    ]

  },
  {
    id: 102,
    name: "Community Garden Planner",
    description: "Web tool for organizing and planning a local community garden.",
    owner: {
      name: "Alex Smith",
    }
  },
  {
    id: 103,
    name: "Open Source Documentation",
    description: "Contributing to the documentation of a popular open-source library.",
    owner: {
      name: "Emily White",
    }
  }
];
export const mockComments = [
  {
    id: 201,
    projectId: 1, // Corresponds to "Final Year Thesis"
    text: "Have you considered using the new research paper from XYZ University? It could be very helpful.",
    author: { name: "Alex Smith" },
    createdAt: "3 hours ago"
  },
  {
    id: 202,
    projectId: 1,
    text: "Great point, Alex. I've attached a link to the paper in the files section.",
    author: { name: "Kaan" }, // Assuming 'Kaan' is the project owner
    createdAt: "1 hour ago"
  },
  {
    id: 203,
    projectId: 101, // Corresponds to "University Canteen App"
    text: "The proposed color scheme for the UI looks great! Very modern.",
    author: { name: "Emily White" },
    createdAt: "1 day ago"
  }
];
export const mockProjectMembers = [
  { projectId: 1, userId: 1, name: "Kaan", role: "Owner" },
  { projectId: 1, userId: 2, name: "Alex Smith", role: "Editor" },
  { projectId: 101, userId: 3, name: "Jane Doe", role: "Owner" },
  { projectId: 101, userId: 1, name: "Kaan", role: "Viewer" },
  { projectId: 101, userId: 4, name: "Emily White", role: "Editor" },
];

// --- ADD MOCK DATA FOR PROJECT FILES ---
export const mockProjectFiles = [
  { id: 301, projectId: 1, name: "thesis_draft_v1.pdf", type: "pdf", uploadedBy: "Kaan" },
  { id: 302, projectId: 1, name: "research_notes.docx", type: "doc", uploadedBy: "Alex Smith" },
  { id: 303, projectId: 101, name: "ui_mockups.fig", type: "figma", uploadedBy: "Jane Doe" },
  { id: 304, projectId: 101, name: "user_feedback.xlsx", type: "sheet", uploadedBy: "Emily White" },
];