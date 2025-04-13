import React, { useEffect, useState } from 'react';
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Simulate API response or replace with real rows
const sampleRows = [
  {
    strike: "455.00",
    c_Volume: "8174"
  },
  {
    strike: "456.00",
    c_Volume: "6443"
  }
];

const getVolumeDataFromRows = async () => {

  try {
    //const res = await axios.get(`http://localhost:8080/api/options/${selected}/${assetclass}`);
    const res = await axios.get(`http://localhost:8080/api/options/SPY/ETF`);
    //console.log(res.data);
    const rows = res.data?.data?.table?.rows || [];

    const callData = rows;

    // const callData = rows.map((r) => r.c_Volume).filter(Boolean);
    // const putData = rows.map((r) => r.p_Volume).filter(Boolean);
    // setCalls(callData);
    // setPuts(callData);
    const result = {};
    callData.forEach((row) => {
      if (row.p_Volume !== null) {
        const strike = parseFloat(row.strike);
        const volume = parseInt(row.c_Volume.replace(/,/g, '')) || 0;
        result[strike] = volume;
      }
    });
    return result;
  } catch (err) {
    console.error('Failed to get options data:', err);
  }
};

const LiveStrikeVolumeChart = ({ rowsDataTest }) => {
  const [chartData, setChartData] = useState([]);

  //Good example for automatic api call after specific time interval
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const now = new Date();
  //     const formattedTime = now.toLocaleTimeString();

  //     const volumeByStrike = getVolumeDataFromRows(); // Replace with real API call
  //     const newPoint = { time: formattedTime, ...volumeByStrike };

  //     setChartData((prev) => [...prev.slice(-19), newPoint]); // Keep last 20 points
  //   }, 500000); // Update every 5 seconds

  //   return () => clearInterval(interval);
  // });


  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('https://api.example.com/data');
        // const json = await response.json();
        // // do something with json

        const interval = setInterval( async() => {
          const now = new Date();
          const formattedTime = now.toLocaleTimeString();

          const volumeByStrike = rowsDataTest;//await getVolumeDataFromRows(); // Replace with real API call
          const newPoint = { time: formattedTime, ...volumeByStrike };

          setChartData((prev) => [...prev.slice(-19), newPoint]); // Keep last 20 points
        }, 50000); // Update every 5 seconds

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, []); // [] runs on mount only

  // useEffect(() => {
  //     const now = new Date();
  //     const formattedTime = now.toLocaleTimeString();
  //     const volumeByStrike = getVolumeDataFromRows(rowsData); // Replace with real API call
  //     const newPoint = { time: formattedTime, ...volumeByStrike };
  //     setChartData((prev) => [...prev.slice(-19), newPoint]); // Keep last 20 points
  // }, [rowsData]);



  const strikeKeys = Object.keys(chartData[0] || {}).filter((key) => key !== 'time');
  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb'];

  return (
    <div>
      <h3>Live Option Volume per Strike</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          {strikeKeys.map((strike, index) => (
            <Line
              key={strike}
              type="monotone"
              dataKey={strike}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveStrikeVolumeChart;
