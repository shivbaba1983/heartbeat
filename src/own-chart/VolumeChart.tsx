import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';
import { getTodayInEST } from './../common/nasdaq.common';

const VolumeChart = ({ selectedTicker, fileName }) => {
  const [data, setData] = useState([]);
  const [latestVolumes, setLatestVolumes] = useState([]);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    if (!fileName) {
      fileName = getTodayInEST();
    }

    const fetchOptionsData = async () => {
      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/volume/${fileName}`);
        const responseJson = await res.json();

        // Filter for selectedTicker
        const formatted = responseJson
          ?.filter(item => item.selectedTicker === selectedTicker)
          ?.map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            lstPrice: parseFloat(item?.lstPrice?.replace(/[^0-9.-]+/g, "")) || 0
          }));

        setData(formatted);

        // --- Compute latest volumes per ticker for bar chart ---
        const latestPerTicker = Object.values(
          responseJson.reduce((acc, cur) => {
            const ticker = cur.selectedTicker;
            if (!acc[ticker] || new Date(cur.timestamp) > new Date(acc[ticker].timestamp)) {
              acc[ticker] = cur;
            }
            return acc;
          }, {})
        ).map(item => ({
          selectedTicker: item.selectedTicker,
          callVolume: item.callVolume,
          putVolume: item.putVolume
        }));

        setLatestVolumes(latestPerTicker);

        setRefreshData(false);
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    };

    fetchOptionsData();
  }, [fileName, selectedTicker, refreshData]);

  const handleRefreshClick = () => {
    setRefreshData(true);
  };

  return (
    <div>
      <h2>{selectedTicker} Options Volume Chart</h2>

      {/* Line chart (existing) */}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={['dataMin', 'dataMax']} allowDecimals={true} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="callVolume" stroke="#008000" name="Call Volume" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="putVolume" stroke="#FF2C2C" name="Put Volume" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="lstPrice" stroke="#00008B" name="Last Price" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* --- NEW: Bar chart for latest volumes per ticker --- */}
      {latestVolumes.length > 0 && (
        <div style={{ marginTop: 50 }}>
          <h3>Latest Call/Put Volumes per Ticker</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={latestVolumes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="selectedTicker" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="callVolume" fill="#008000" name="Call Volume" />
              <Bar dataKey="putVolume" fill="#FF2C2C" name="Put Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <button onClick={handleRefreshClick} style={{ marginTop: 20 }}>Refresh Data Daily</button>
    </div>
  );
};

export default VolumeChart;
