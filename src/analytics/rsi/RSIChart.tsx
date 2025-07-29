import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { IS_AWS_API, NASDAQ_TOKEN } from './../../constant/HeartbeatConstants';
import './RSIChart.scss'
interface RsiData {
  date: string;
  close: number;
  rsi: number;
}

const RSIChart = () => {
  const [data, setData] = useState<RsiData[]>([]);
  const [showFRSIData, setShowRSIData] = useState(false);
  useEffect(() => {
    const fetchRSIData = async () => {
      try {
        const response = await fetch(`${NASDAQ_TOKEN}/api/rsi`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch RSI data:', error);
      }
    };
    fetchRSIData();
  }, [showFRSIData]);

  return (
    <div className="rsi-chart-container">
      <div className="rsi-toggle">
        <input
          type="checkbox"
          checked={showFRSIData}
          onChange={(e) => setShowRSIData(e.target.checked)}
          id="rsi-toggle"
        />
        <label htmlFor="rsi-toggle">Show RSI Data</label>
      </div>

      {showFRSIData && (
        <div style={{ width: '100%', height: 400 }}>
          <h2>SPY RSI (14-period)</h2>
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <CartesianGrid stroke="#ccc" />
              <Line type="monotone" dataKey="rsi" stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
export default RSIChart;