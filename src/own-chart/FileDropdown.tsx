import React, { useEffect, useState } from "react";
import {NASDAQ_TOKEN }from './../constant/HeartbeatConstants';

const FileDropdown = ({selectedTicker, setFileName}) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    fetch(`${NASDAQ_TOKEN}/api/files`)
      .then(res => res.json())
      .then(data => setFiles(data.files || []))
      .catch(err => console.error("Error fetching files:", err));
  }, []);

  
  const handleChange = (e) => {
    e.preventDefault();
    const tempFileName= e.target.value;
    setSelectedFile(tempFileName);
    setFileName(tempFileName)
    console.log("Selected file:", tempFileName);
  };

  return (
    <div>
      <h2>Select a File:</h2>
      <select value={selectedFile} onChange={handleChange}>
        <option value="">-- Select File --</option>
        {files.map((file, idx) => (
          <option key={idx} value={file}>
            {file}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FileDropdown;
