import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from "axios";
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';
import PredictionChart from '../nasdaq/PredictionChart';
import FileDropdown from './FileDropdown';
import { getTodayInEST } from './../common/nasdaq.common';
const VolumeChart = ({ selectedTicker, fileName }) => {
  const [data, setData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  // const[fileName, setFileName]= useState(selectedFileName);

  useEffect(() => {
    if (fileName === "") {
      fileName =getTodayInEST();//new Date().toISOString().slice(0, 10);
    }
    const fetchOptionsData = async () => {

      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/volume/${fileName}`);
        const responseJson = await res.json();
        const formatted = responseJson
          .filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
          .map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }));

        setData(formatted);
        setRefreshData(false);
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    };
    fetchOptionsData();
  }, [fileName]);

  useEffect(() => {
    if (fileName === "") {
      fileName =new Date().toISOString().slice(0, 10);
    }
    const fetchOptionsData = async () => {

      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/volume/${fileName}`);
        const json = await res.json();
        const formatted = json
          .filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
          .map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }));

        setData(formatted);
        setRefreshData(false);
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    };
    fetchOptionsData();
  }, [refreshData]);

  const getTodayInEST = async() => {
    const estDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York"
    });
  
    const date = new Date(estDate);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  };

  const handleRefreshClick = async () => {
    setRefreshData(true);
  };
// Group by selectedTicker and keep the latest record
const latestByTicker = Object.values(
  data.reduce((acc, curr) => {
    if (
      !acc[curr.selectedTicker] ||
      new Date(curr.timestamp) > new Date(acc[curr.selectedTicker].timestamp)
    ) {
      acc[curr.selectedTicker] = curr;
    }
    return acc;
  }, {})
);
  return (
    <div>
      {/* <FileDropdown selectedTicker={selectedTicker} setFileName={setFileName}/> */}
      <h2>{selectedTicker} Options Volume Chart</h2>
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

export default VolumeChart;
