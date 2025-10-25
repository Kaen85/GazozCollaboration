import React from "react";
import Button from "./Button";

/**
 * Project Detail Card
 * Props:
 * - project: proje objesi {name, description}
 * - onBack: back button callback
 */
const ProjectDetail = ({ project, onBack }) => {
  return (
    <div className="border rounded-xl shadow-lg overflow-hidden bg-white">
      {/* Başlık şeridi */}
      <div className="bg-indigo-600 p-4">
        <h2 className="text-white text-xl font-bold">{project.name}</h2>
      </div>

      {/* İçerik */}
      <div className="p-6 space-y-4">
        <p className="text-gray-700">{project.description || "No description provided."}</p>
        <Button text="⬅ Back to Dashboard" onClick={onBack} color="gray" />
      </div>
    </div>
  );
};

export default ProjectDetail;
