// src/components/projects/ProjectFiles.js

import React from 'react';
// import { useProjectContext } from '../../context/ProjectContext';

export default function ProjectFiles() {
  // const { currentProject } = useProjectContext();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Files</h2>
      <p className="text-gray-500">(Dosya yükleme ve listeleme alanı buraya gelecek)</p>
      
      {/* <FileUploadComponent projectId={currentProject.id} /> 
        <FileList projectId={currentProject.id} /> 
      */}
    </div>
  );
}