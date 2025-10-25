import React from "react";

/**
 * Project Card
 * Props:
 * - project: {id, name, description}
 * - onClick: tıklandığında çalışacak fonksiyon
 */
const ProjectCard = ({ project, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-3 border border-gray-300 rounded hover:shadow cursor-pointer bg-gray-50"
    >
      <h3 className="font-semibold">{project.name}</h3>
      <p className="text-sm text-gray-600">{project.description || "No description"}</p>
    </div>
  );
};

export default ProjectCard;
