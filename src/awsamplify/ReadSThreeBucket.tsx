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
import { NASDAQ_TOKEN, IS_AWS_API } from '../constant/HeartbeatConstants';

const ReadSThreeBucket = ({ selectedTicker, fileName, setSelectedTicker }) => {
  const [data, setData] = useState([]);
  const [completeFileData, setCompleteFileData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(fileName);
  const [isExpanded, setIsExpanded] = useState(true);
  const [totalCallVolume, setTotalCallVolume] = useState(1);
  const [totalPutVolume, setTotalPutVolume] = useState(1);
  const [magnificientSevenTableData, setMagnificientSevenTableData] = useState([]);
  const [alertTickers, setAlertTickers] = useState([]);

  useEffect(() => {
    setSelectedFile(fileName);
  }, [fileName]);

  const now = new Date();
  const formatted = now.toLocaleString();

  // Prediction input for PredictionHint component
  const predectionInput = [
    {
      id: 1,
      timestamp: formatted,
      callVolume: totalCallVolume,
      putVolume: totalPutVolume,
      selectedTicker,
    },
  ];

  // Function to calculate prediction for each data point
  const addPredictionToData = (dataArray) => {
    return dataArray.map(item => {
      const callVolume = item.callVolume || 0;
      const putVolume = item.putVolume || 0;

      // Avoid division by zero
      const ratio = callVolume === 0 ? Infinity : putVolume / callVolume;

      let prediction = '';

      if (ratio < 0.5) prediction = 'ExtremelyBullish';
      else if (ratio < 0.7) prediction = 'Bullish';
      else if (ratio <= 1.0) prediction = 'Neutral';
      else if (ratio <= 1.3) prediction = 'Bearish';
      else prediction = 'ExtremelyBearish';

      // For plotting on chart, assign numeric value to prediction
      // You can customize the numeric scale if you want
      let predictionValue = 0;
      switch(prediction) {
        case 'ExtremelyBullish': predictionValue = 5; break;
        case 'Bullish': predictionValue = 4; break;
        case 'Neutral': predictionValue = 3; break;
        case 'Bearish': predictionValue = 2; break;
        case 'ExtremelyBearish': predictionValue = 1; break;
        default: predictionValue = 3;
      }

      return {
        ...item,
        predictionText: prediction,
        predictionValue,
        ratio: +ratio.toFixed(2),
      };
    });
  };

  useEffect(() => {
    async function fetchFiles() {
      const bucketUrl = "https://anil-w-bucket.s3.amazonaws.com?list-type=2";

      try {
        if (IS_AWS_API) {
          const response = await fetch(bucketUrl);
          const text = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "application/xml");
          const keys = Array.from(xml.getElementsByTagName("Key")).map(key => key.textContent);
          const filenames = keys.map(file => file.split(".").slice(0, -1).join("."));
          setFiles(filenames);
        } else {
          setSelectedFile(fileName)
        }
      } catch (error) {
        console.error("Error fetching S3 files:", error);
      }
    }

    fetchFiles();
  }, []);

  useEffect(() => {
    let response;
    let tempData;
    const fetchOptionsData = async () => {
      try {
        if (IS_AWS_API) {
          response = await fetch(`https://anil-w-bucket.s3.amazonaws.com/${selectedFile}.json`);
          tempData = await response.json();
        } else {
          response = await fetch(`${NASDAQ_TOKEN}/api/volume/${fileName}`);
          tempData = await response.json();
        }
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

        setMagnificientSevenTableData(latestVolumesByTicker);

        const temp = latestVolumesByTicker.filter(
          (item) => item.callVolume > 0 && item.putVolume > 0 && item.callVolume >= 2 * item.putVolume
        );

        setAlertTickers(temp);

        const filteredData = tempData
          ?.filter(item => item.selectedTicker === selectedTicker)
          ?.map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }));

        // Add prediction info to filteredData
        const dataWithPrediction = addPredictionToData(filteredData);

        setTotalCallVolume(dataWithPrediction.reduce((sum, item) => sum + item.callVolume, 0));
        setTotalPutVolume(dataWithPrediction.reduce((sum, item) => sum + item.putVolume, 0));
        setData(dataWithPrediction);
        setRefreshData(false);
      } catch (err) {
        console.log('Fetched err:', err);
      }
    };
    fetchOptionsData();
  }, [selectedTicker, selectedFile, fileName, refreshData]);

  const handleRefreshClick = () => setRefreshData(true);
  const handleChange = (e) => setSelectedFile(e.target.value);
  const toggleExpanded = () => setIsExpanded(prev => !prev);

  const priceValues = data.map(d => d.lstPrice).filter(p => p !== undefined && !isNaN(p));
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const lowerBound = Math.floor(minPrice - 2);
  const upperBound = Math.ceil(maxPrice + 2);

  return (
    <div className="S3readSection">
      <div>
        <h2 className="s3-volumechart-title">{selectedTicker} S3 Options Volume Chart</h2>
      </div>

      <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />

      {/* Always Visible Chart */}
      {data && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(t) => t.slice(11, 16)} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[lowerBound, upperBound]} />
            <Tooltip 
              formatter={(value, name, props) => {
                if(name === 'predictionValue') {
                  // convert numeric prediction back to text in tooltip
                  const predTextMap = {
                    5: 'ExtremelyBullish',
                    4: 'Bullish',
                    3: 'Neutral',
                    2: 'Bearish',
                    1: 'ExtremelyBearish'
                  };
                  return predTextMap[value] || 'Unknown';
                }
                return value;
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="callVolume" stroke="#008000" name="Call Volume" />
            <Line yAxisId="left" type="monotone" dataKey="putVolume" stroke="#FF2C2C" name="Put Volume" />
            <Line yAxisId="right" type="monotone" dataKey="lstPrice" stroke="#00008B" name="Last Price" dot={false} />
            {/* New line for prediction */}
            <Line yAxisId="left" type="monotone" dataKey="predictionValue" stroke="#FFA500" name="Prediction" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="filename-refresh-button-section">
        <select value={selectedFile} onChange={handleChange}>
          {files
            .filter(file => file !== 'OpenInterest' && file !== 'stock-monitor')
            .map((file, idx) => (
              <option key={idx} value={file}>
                {file}
              </option>
            ))}
        </select>
        <button onClick={handleRefreshClick} className="refresh-button-sthree">Refresh Data</button>
      </div>

      <h2 onClick={toggleExpanded} className="link-like-header">
        {isExpanded
          ? "▼ Magnificent Seven Sentiments (Click to Collapse)"
          : "► Magnificent Seven Sentiments (Click to Expand)"}
      </h2>

      {(magnificientSevenTableData.length > 1 && isExpanded) && (
        <MagnificientSevenTable data={magnificientSevenTableData} setSelectedTicker={setSelectedTicker} />
      )}
      {(magnificientSevenTableData.length > 1 && isExpanded) && (
        <SentimentToggleChart completeFileData={completeFileData} selectedTicker={selectedTicker} />
      )}
    </div>
  );
};

export default ReadSThreeBucket;
