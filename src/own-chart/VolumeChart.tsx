import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';
import { getTodayInEST } from './../common/nasdaq.common';

const VolumeChart = ({ selectedTicker, fileName }) => {
  const [data, setData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    if (fileName === "") {
      fileName = getTodayInEST();
    }

    const fetchOptionsData = async () => {
      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/volume/${fileName}`);
        const responseJson = await res.json();

        const formatted = responseJson
          ?.filter(item => item.selectedTicker === selectedTicker)
          ?.map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            lstPrice: parseFloat(item?.lstPrice?.replace(/[^0-9.-]+/g, "")) || 0 // ✅ convert "$120.21" → 120.21
          }));

        setData(formatted);
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

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />

            <Tooltip />
            <Legend />

            {/* Volume Lines */}
            <Line yAxisId="left" type="monotone" dataKey="callVolume" stroke="#008000" name="Call Volume" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="putVolume" stroke="#FF2C2C" name="Put Volume" dot={false} />

            {/* ✅ Last Price Line (Right Axis) */}
            <Line yAxisId="right" type="monotone" dataKey="lstPrice" stroke="#00008B" name="Last Price" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <button onClick={handleRefreshClick}>Refresh Data</button>
    </div>
  );
};

export default VolumeChart;
