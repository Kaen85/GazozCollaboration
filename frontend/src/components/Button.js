import React from "react";

/**
 * Reusable Button
 * Props:
 * - text: button text
 * - onClick: click callback
 * - color: gray, blue, green, red
 */
const Button = ({ text, onClick, color = "gray" }) => {
  const colorClasses = {
    gray: "bg-gray-400 hover:bg-gray-500 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium ${colorClasses[color]}`}
    >
      {text}
    </button>
  );
};

export default Button;
