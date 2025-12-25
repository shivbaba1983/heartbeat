import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "./DailyCallVolumeChart.scss";
import { LogTickerList } from "./../../constant/HeartbeatConstants";

interface DayData {
  date: string;
  callVolume: number;
}

const DailyCallVolumeChart = () => {
  const [ticker, setTicker] = useState<string>("SPY");
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (symbol: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/daily-call-volume/${symbol}`
      );
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(ticker);
  }, [ticker]);

  return (
    <div className="daily-chart-container">
      <div className="header">
        <h2>Daily Call Volume — {ticker}</h2>

        {/* Auto-populated dropdown from LogTickerList */}
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="ticker-dropdown"
        >
          {LogTickerList.map((tkr) => (
            <option key={tkr} value={tkr}>
              {tkr}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-axis: Format date → MM-DD */}
  <XAxis
  dataKey="date"
  tickFormatter={(value) => {
    const d = new Date(value);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getUTCDate();  // <-- use UTC day
    return `${month} ${String(day).padStart(2, "0")}`;
  }}
/>

            {/* Y-axis: Format into K / M */}
            <YAxis
              tickFormatter={(value) => {
                // if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
                // if (value >= 1_000) return Math.round(value / 1000) + "K";
                return value;
              }}
            />

            <Tooltip
              formatter={(value: number) => value.toLocaleString()}
              labelFormatter={(value: string) => value}
            />

            <Bar dataKey="callVolume" fill="#4a90e2" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailyCallVolumeChart;
