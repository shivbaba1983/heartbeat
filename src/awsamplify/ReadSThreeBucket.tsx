import React, { useEffect, useState } from "react";
import { HttpRequest } from "@aws-sdk/protocol-http";
import PredictionHint from './../components/PredictionHint';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import MagnificientSevenTable from './../yahoo/MagnificientSevenTable';
import SentimentToggleChart from '../sentiments/SentimentToggleChart';
import './ReadSThreeBucket.scss';
import S3AlertTable from './../components/S3AlertTable';
const ReadSThreeBucket = ({ selectedTicker, fileName }) => {
  const [data, setData] = useState([]);
  const [completeFileData, setCompleteFileData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(fileName);
  const [isExpanded, setIsExpanded] = useState(true);//set default to false later
  const [totalCallVolume, setTotalCallVolume] = useState(1);
  const [totalPutVolume, setTotalPutVolume] = useState(1);
  const [magnificientSevenTableData, setMagnificientSevenTableData] = useState([]);
  const [alertTickers, setAlertTickers] = useState([]);
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
        setCompleteFileData(tempData);

        const latestVolumesByTicker = Object.values(
          tempData.reduce((acc, item) => {
            const ticker = item.selectedTicker;
            const current = acc[ticker];

            if (!current || new Date(item.timestamp) > new Date(current.timestamp)) {
              acc[ticker] = item;
            }

            return acc;
          }, {})
        );

        setMagnificientSevenTableData(latestVolumesByTicker)

        const temp = latestVolumesByTicker.filter(
          (item) =>
            item.callVolume > 0 &&
            item.putVolume > 0 &&
            item.callVolume >= 2 * item.putVolume
        );

        setAlertTickers(temp);
        const filteredData = tempData
          ?.filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
          ?.map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }));
        setTotalCallVolume(filteredData.reduce((sum, item) => sum + item.callVolume, 0));
        setTotalPutVolume(filteredData.reduce((sum, item) => sum + item.putVolume, 0));
        setData(filteredData);
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
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  return (
    <div className="S3readSection">
      <div>
        <h2 className="s3-volumechart-title"> {selectedTicker} S3 Options Volume Chart</h2>
        <select value={selectedFile} onChange={handleChange}>
          {files.map((file, idx) => (
            <option key={idx} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>
      <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />

      {/* {data && <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="callVolume" stroke="#008000" />
          <Line type="monotone" dataKey="putVolume" stroke="#FF0000" />
        </LineChart>
      </ResponsiveContainer>} */}

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
          <Line yAxisId="left" type="monotone" dataKey="callVolume" stroke="#008000" name="Call Volume" />
          <Line yAxisId="left" type="monotone" dataKey="putVolume" stroke="#FF2C2C" name="Put Volume" />

          {/* Last Price Line */}
          <Line yAxisId="right" type="monotone" dataKey="lstPrice" stroke="#00008B" name="Last Price" dot={false} />
        </LineChart>
      </ResponsiveContainer>}

      <button onClick={() => handleRefreshClick()} className="refresh-button-sthree">Refresh Data</button>

      {/* <div>
        {alertTickers.length > 0 && <S3AlertTable alertTickers={alertTickers} />}
      </div> */}
      <h2 onClick={toggleExpanded} className="link-like-header">
        {isExpanded
          ? "▼ Magnificent Seven Sentiments (Click to Collapse)"
          : "► Magnificent Seven Sentiments (Click to Expand)"}
      </h2>

      {(magnificientSevenTableData.length > 1 && isExpanded) && <MagnificientSevenTable data={magnificientSevenTableData} />}

      {(magnificientSevenTableData.length > 1 && isExpanded) && <SentimentToggleChart completeFileData={completeFileData} selectedTicker={selectedTicker} />}

      {/* <PredictionChart data={data}/> */}
    </div>
  );

};
export default ReadSThreeBucket;