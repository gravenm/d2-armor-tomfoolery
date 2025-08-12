'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      }`}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <p className="text-gray-500">Uploading and processing...</p>
      ) : isDragActive ? (
        <p className="text-blue-500">Drop the files here ...</p>
      ) : (
        <p className="text-gray-500">Drag 'n' drop your destiny-armor.csv file here, or click to select file</p>
      )}
    </div>
  );
};

export default UploadArea;
