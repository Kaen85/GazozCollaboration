// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all pages and the main layout component
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import SharedProjectsPage from './pages/SharedProjectsPage';
import MyProjectsPage from './pages/MyProjectsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route 1: The Login Page. It stands alone without the main layout. */}
        <Route path="/" element={<LoginPage />} />

        {/* Route 2: This is the "Layout Route". */}
        {/* It has no path. Its only job is to render the DashboardLayout component.
            All child routes nested inside it will be rendered within the layout's <Outlet />.
        */}
        <Route element={<DashboardLayout />}>
          {/* These are now top-level routes that share the same layout */}
          <Route path="/dashboard" element={<DashboardOverviewPage />} />
          <Route path="/shared-projects" element={<SharedProjectsPage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
        </Route>

        {/* You can add other routes outside the layout here later, like a 404 page */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;