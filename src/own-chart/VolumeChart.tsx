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
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
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

  // Filter valid lstPrice values > 0
  const priceValues = data.map(d => d.lstPrice).filter(p => p > 0);
  const hasValidPrice = priceValues.length > 0;
  const lowerBound = hasValidPrice ? Math.floor(Math.min(...priceValues) - 2) : undefined;
  const upperBound = hasValidPrice ? Math.ceil(Math.max(...priceValues) + 2) : undefined;

  return (
    <div>
      <h2>{selectedTicker} Options Volume Chart</h2>

      {data && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            {hasValidPrice && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[lowerBound, upperBound]}
                tickFormatter={(val) => `$${val}`}
              />
            )}
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="callVolume" stroke="#008000" name="Call Volume" />
            <Line yAxisId="left" type="monotone" dataKey="putVolume" stroke="#FF0000" name="Put Volume" />
            {hasValidPrice && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="lstPrice"
                stroke="#00008B"
                name="Last Price"
                dot={false}
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      <button onClick={handleRefreshClick}>Refresh Data</button>
    </div>
  );
};

export default VolumeChart;
