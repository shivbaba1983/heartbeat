import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "./SentimentAreaChart.scss";
import {INDEXES, MAG7} from './../constant/HeartbeatConstants';

const SentimentAreaChart=({S3JsonFileData})=> {
// ✅ Your raw data
const rawData =S3JsonFileData;// [/* your full-day JSON here */];

// ✅ Tickers of interest

const TICKERS = [...INDEXES, ...MAG7];

// ✅ Classify sentiment by call/put ratio
const classifySentiment = (call, put) => {
  const ratio = call / (put || 1);
  if (ratio >= 2) return "ExtremelyBullish";
  if (ratio >= 1.25) return "Bullish";
  if (ratio >= 0.8) return "Neutral";
  if (ratio >= 0.5) return "Bearish";
  return "ExtremelyBearish";
};

// ✅ Helper: round time to nearest 10-min
const get10MinBucket = (timestamp) => {
  const date = new Date(timestamp);
  const minutes = date.getMinutes();
  date.setMinutes(minutes - (minutes % 10), 0, 0); // round down to nearest 10
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });
};

// ✅ Prepare chart data
const processSentimentData = () => {
  const map = new Map();

  rawData
    .filter(d => TICKERS.includes(d.selectedTicker))
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

  return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
};

// ✅ Main component

  const data = processSentimentData();

  return (
    <div className="sentiment-chart-container">
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
}
export default SentimentAreaChart;