import React, { useEffect, useState } from "react";
import { HttpRequest } from "@aws-sdk/protocol-http";
import PredictionHint from './../components/PredictionHint';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const ReadSThreeBucket = ({ selectedTicker, fileName }) => {
  const [data, setData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(fileName);

  const [totalCallVolume, setTotalCallVolume]=useState(1);
  const [totalPutVolume, setTotalPutVolume]=useState(1);
  useEffect(() => {
    setSelectedFile(fileName);
  }, [fileName])
  const now = new Date();
  const formatted = now.toLocaleString(); // includes date and time
  // let totalCallVolume =1;
  // let totalPutVolume =1;
  const predectionInput = [
    {
      "id": 1,
      "timestamp": formatted,
      "callVolume": totalCallVolume,
      "putVolume": totalPutVolume,
      "selectedTicker": selectedTicker
    },
  ]

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
        setFiles(filenames);
      } catch (error) {
        console.error("Error fetching S3 files:", error);
      }
    }

    fetchFiles();
  }, []);

  //to get the file data on file name change (date change)
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const bucketName = 'anil-w-bucket';
        const objectKey = fileName;//'2025-04-26.json'; // path inside the bucket
        setData([]);
        const request = new HttpRequest({
          method: 'GET',
          protocol: 'https:',
          hostname: `${bucketName}.s3.amazonaws.com`,
          path: `/${objectKey}`,
          headers: {
            'host': `${bucketName}.s3.amazonaws.com`,
          },
        });
        const response = await fetch(`https://anil-w-bucket.s3.amazonaws.com/${selectedFile}.json`);

        const tempData = await response.json();
        const filteredData = tempData
          .filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
          .map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }));
          setTotalCallVolume(filteredData.reduce((sum, item) => sum + item.callVolume, 0));
           setTotalPutVolume(filteredData.reduce((sum, item) => sum + item.putVolume, 0));
        setData(filteredData);
        console.log('Response:', filteredData);
        setRefreshData(false);
      } catch (err) {
        console.log('Fetched err:', err);
      }
    };
    fetchOptionsData();
  }, [selectedTicker, selectedFile, fileName, refreshData]);


 const handleRefreshClick = async () => {
    setRefreshData(true);
  };
  const handleChange = (e) => {
    e.preventDefault();
    const tempFileName = e.target.value;
    setSelectedFile(tempFileName);
    console.log("Selected file:", tempFileName);
  };
  return (
    <div>
      {/* <FileDropdown selectedTicker={selectedTicker} setFileName={setFileName}/> */}
      {/* <div>
      <h2>Files in Public S3 Bucket:</h2>
      <ul>
        {files.map((file, idx) => (
          <li key={idx}>{file}</li>
        ))}
      </ul>
    </div> */}

      <div>
        <h2 className="s3-volumechart-title"> {selectedTicker} S3 Options Volume Chart</h2>
        <h2>Select a File:</h2>
        <select value={selectedFile} onChange={handleChange}>
          {files.map((file, idx) => (
            <option key={idx} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>
     {totalCallVolume &&  <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />}

      {data && <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="callVolume" stroke="#008000" />
          <Line type="monotone" dataKey="putVolume" stroke="#FF0000" />
        </LineChart>
      </ResponsiveContainer>}

      <button onClick={() => handleRefreshClick()}>Refres Data</button>

      {/* <PredictionChart data={data}/> */}
    </div>
  );

};
export default ReadSThreeBucket;