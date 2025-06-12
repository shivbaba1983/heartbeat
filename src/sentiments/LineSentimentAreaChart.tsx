import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "./LineSentimentAreaChart.scss";
import { INDEXES, MAG7, LogTickerList } from "../constant/HeartbeatConstants";

const LineSentimentAreaChart = ({ S3JsonFileData }) => {
  const rawData = S3JsonFileData;

  // --- Radio button state
  const [tickerSet, setTickerSet] = useState("all"); // 'all', 'indices', 'stocks'

  const getSelectedTickers = () => {
    switch (tickerSet) {
      case "indices":
        return INDEXES;
      case "stocks":
        return MAG7;
      default:
        return LogTickerList;//[...INDEXES, ...MAG7];
    }
  };

  const TICKERS = getSelectedTickers();

  const classifySentiment = (call, put) => {
    const ratio = call / (put || 1);
    if (ratio >= 2) return "ExtremelyBullish";
    if (ratio >= 1.25) return "Bullish";
    if (ratio >= 0.8) return "Neutral";
    if (ratio >= 0.5) return "Bearish";
    return "ExtremelyBearish";
  };

  const get10MinBucket = (timestamp) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    date.setMinutes(minutes - (minutes % 10), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const processSentimentData = () => {
    const map = new Map();

    rawData
      .filter((d) => TICKERS.includes(d.selectedTicker))
      .forEach(({ timestamp, callVolume, putVolume }) => {
        const bucket = get10MinBucket(timestamp);
        const sentiment = classifySentiment(callVolume, putVolume);

        if (!map.has(bucket)) {
          map.set(bucket, {
            time: bucket,
            ExtremelyBullish: 0,
            Bullish: 0,
            Neutral: 0,
            Bearish: 0,
            ExtremelyBearish: 0
          });
        }

        map.get(bucket)[sentiment]++;
      });

    return Array.from(map.values()).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  };

  const data = processSentimentData();

  return (
    <div className="sentiment-chart-container">
      {/* 🚀 Radio Button Controls */}
      <div className="sentiment-radio-options">
        <label>
          <input
            type="radio"
            name="tickerSet"
            value="all"
            checked={tickerSet === "all"}
            onChange={() => setTickerSet("all")}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="tickerSet"
            value="indices"
            checked={tickerSet === "indices"}
            onChange={() => setTickerSet("indices")}
          />
          Only Indices
        </label>
        <label>
          <input
            type="radio"
            name="tickerSet"
            value="stocks"
            checked={tickerSet === "stocks"}
            onChange={() => setTickerSet("stocks")}
          />
          Only Stocks-MAG7
        </label>
      </div>

      {/* 📊 Stacked Area Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} className="sentiment-area-chart" stackOffset="expand">
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="ExtremelyBullish" stackId="1" stroke="#00b300" fill="#00b300" />
          <Area type="monotone" dataKey="Bullish" stackId="1" stroke="#66cc66" fill="#66cc66" />
          <Area type="monotone" dataKey="Neutral" stackId="1" stroke="#999999" fill="#999999" />
          <Area type="monotone" dataKey="Bearish" stackId="1" stroke="#ff6666" fill="#ff6666" />
          <Area type="monotone" dataKey="ExtremelyBearish" stackId="1" stroke="#cc0000" fill="#cc0000" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineSentimentAreaChart;
