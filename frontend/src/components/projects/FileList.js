// src/components/projects/FileList.js
import React from 'react';
import { FiFileText, FiFile, FiImage } from 'react-icons/fi'; // Icons for file types

// A simple function to get an icon based on file type
const getFileIcon = (fileName) => {
  if (fileName.endsWith('.pdf')) return <FiFileText className="text-red-400" />;
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <FiFileText className="text-blue-40á00" />;
  if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) return <FiImage className="text-green-400" />;
  return <FiFile className="text-gray-400" />;
};

function FileList({ files, loading }) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2 mb-4">
        Project Files
      </h2>
      {loading ? (
        <p>Loading files...</p>
      ) : (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center bg-gray-800 p-3 rounded-md">
              <span className="mr-3">{getFileIcon(file.name)}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">Uploaded by {file.uploadedBy}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default FileList;