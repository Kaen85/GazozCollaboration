import React from "react";

/**
 * SidebarMenu Component
 * Props:
 * - username: logged-in user's name
 * - items: main menu items (Dashboard, Projects, Chats)
 * - bottomItems: bottom menu items (Profile, Settings)
 * - myProjects: array of user's own projects
 * - onProjectClick: handler when clicking a My Project
 * - onNewProject: handler when clicking New Project
 * - logout: handler for logout button
 */
const SidebarMenu = ({
  username,
  items,
  bottomItems,
  myProjects,
  onProjectClick,
  onNewProject,
  logout,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-300 flex flex-col">
      {/* User name at top */}
      <div className="p-4 font-bold text-lg border-b border-gray-200">{username}</div>

      {/* Main menu and My Projects */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Main menu items */}
          {items.map((item) => (
            <div
              key={item.text}
              className="cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
              onClick={item.onClick}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}

          {/* My Projects section */}
          <div className="mt-4 mb-1 border-t border-gray-200 pt-2 font-semibold text-gray-700">
            My Projects
          </div>

          {/* New Project button */}
          <div
            className="cursor-pointer text-blue-600 p-1 hover:bg-gray-100 rounded"
            onClick={onNewProject}
          >
            + New Project
          </div>

          {/* List of user's projects - scrollable */}
          <div className="overflow-y-auto max-h-80 mt-1">
            {myProjects.map((p) => (
              <div
                key={p.id}
                className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                onClick={() => onProjectClick(p)}
              >
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom menu */}
        <div className="p-2 border-t border-gray-200 space-y-1">
          {bottomItems.map((item) => (
            <div
              key={item.text}
              className="cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
              onClick={item.onClick}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}

          {/* Single Logout button */}
          <button
            onClick={logout}
            className="w-full text-left px-3 py-1 rounded bg-red-500 text-white text-sm mt-2 hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarMenu;
