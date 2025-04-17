import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axios from "axios";
import { NASDAQ_TOKEN } from './../constant/HeartbeatConstants';
import PredictionChart from './PredictionChart'
const VolumeChart = ({ selectedTicker }) => {
  const [data, setData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  // const fetchData = async () => {
  //   const res = await fetch('https://e616-2600-1700-6cb0-2a20-5899-93a7-9cb4-db7f.ngrok-free.app/api/volume');
  //   const json = await res.json();
  //   // const formatted = json.map(item => item.selectedTicker === selectedTicker({
  //   //   ...item,
  //   //   time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  //   // }));
  //   const formatted = json
  //     .filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
  //     .map(item => ({
  //       ...item,
  //       time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  //     }));

  //   setData(formatted);
  // };

  // useEffect(() => {
  //   fetchData();
  //   setRefreshData(false);
  // }, [refreshData]);

  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/volume`);
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


  const handleRefreshClick = async () => {
    setRefreshData(true);
  };

  return (
    <div>
      <h2>Options Volume Chart</h2>
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
