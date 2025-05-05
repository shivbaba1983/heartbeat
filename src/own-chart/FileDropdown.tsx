import React, { useEffect, useState } from "react";
import {NASDAQ_TOKEN }from './../constant/HeartbeatConstants';

const FileDropdown = ({selectedTicker, setFileName}) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  // useEffect(() => {
  //   fetch(`${NASDAQ_TOKEN}/api/files`)
  //     .then(res => res.json())
  //     .then(data => setFiles(data.files || []))
  //     .catch(err => console.error("Error fetching files:", err));
  // }, []);

    //call only oces to get the file name only
    useEffect(() => {
      async function fetchFiles() {
        const bucketUrl = "https://anil-w-bucket.s3.amazonaws.com?list-type=2";
  
        try {
          const response = await fetch(bucketUrl);
          const text = await response.text();
  
          // Parse the XML
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "application/xml");
          const keys = Array.from(xml.getElementsByTagName("Key")).map(key => key.textContent);
          const filenames = keys.map(file => {
            const name = file.split(".").slice(0, -1).join(".");
            return name;
          });
          setFiles(filenames || []);
        } catch (error) {
          console.error("Error fetching S3 files:", error);
        }
      }
  
      fetchFiles();
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
