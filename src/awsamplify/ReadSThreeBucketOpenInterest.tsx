import React, { useEffect, useState } from "react";
import { HttpRequest } from "@aws-sdk/protocol-http";
import PredictionHint from './../components/PredictionHint';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import './ReadSThreeBucketOpenInterest.scss';
const ReadSThreeBucketOpenInterest = ({ selectedTicker, selectedFileNameOpenInterest}) => {
  const [data, setData] = useState([]);
  const [completeFileData, setCompleteFileData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(selectedFileNameOpenInterest);
  const [isExpanded, setIsExpanded] = useState(true);//set default to false later
  const [totalCallOpenInterest, setTotalCallOpenInterest] = useState(1);
  const [totalPutOpenInterest, setTotalPutOpenInterest] = useState(1);
//   useEffect(() => {
//     setSelectedFile(fileName);
//   }, [fileName])
  const now = new Date();
  const formatted = now.toLocaleString(); // includes date and time
  const predectionInput = [
    {
      "id": 1,
      "timestamp": formatted,
      "callOpenInterest": totalCallOpenInterest,
      "putOpenInterest": totalPutOpenInterest,
      "selectedTicker": selectedTicker
    },
  ]


  //to get the file data on file name change (date change)
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const bucketName = 'anil-w-bucket';
        const objectKey = selectedFile;//'2025-04-26.json'; // path inside the bucket
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
        setCompleteFileData(tempData);

        const filteredData = tempData
          ?.filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
          ?.map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }));
        setTotalCallOpenInterest(filteredData.reduce((sum, item) => sum + item.callOpenInterest, 0));
        setTotalPutOpenInterest(filteredData.reduce((sum, item) => sum + item.putOpenInterest, 0));
        setData(filteredData);
        setRefreshData(false);
      } catch (err) {
        console.log('OpenInterest Fetched err:', err);
      }
    };
    fetchOptionsData();
  }, [selectedTicker, selectedFile, selectedFileNameOpenInterest, refreshData]);


  const handleRefreshClick = async () => {
    setRefreshData(true);
  };
  const handleChange = (e) => {
    e.preventDefault();
    const tempFileName = e.target.value;
    setSelectedFile(tempFileName);
    console.log("Selected file:", tempFileName);
  };
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  return (
    <div className="S3readSectionOpenInterest">
      <div>
        <h2 className="s3-volumechart-title"> {selectedTicker} S3 Options Volume OpenInterest</h2>
        {/* <select value={selectedFile} onChange={handleChange}>
          {files.map((file, idx) => (
            <option key={idx} value={file}>
              {file}
            </option>
          ))}
        </select> */}
      </div>
      <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />

      {data && <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={(t) => t.slice(11, 16)} />

          {/* Left Y-Axis: Volume */}
          <YAxis yAxisId="left" />
          {/* Right Y-Axis: Last Price */}
          <YAxis yAxisId="right" orientation="right" />

          <Tooltip />
          <Legend />

          {/* Volume Lines */}
          <Line yAxisId="left" type="monotone" dataKey="callOpenInterest" stroke="#008000" name="Call OpenInterest" />
          <Line yAxisId="left" type="monotone" dataKey="putOpenInterest" stroke="#FF2C2C" name="Put OpenInterest" />

          {/* Last Price Line */}
          <Line yAxisId="right" type="monotone" dataKey="lstPrice" stroke="#00008B" name="Last Price" dot={false} />
        </LineChart>
      </ResponsiveContainer>}

      <button onClick={() => handleRefreshClick()} className="refresh-button-sthree">Refresh OpenInterest</button>


    </div>
  );

};
export default ReadSThreeBucketOpenInterest;