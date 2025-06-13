import React, { useState, useMemo } from "react";
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
  const rawData = S3JsonFileData || [];

  const [tickerSet, setTickerSet] = useState("all");
  const [bucketMinutes, setBucketMinutes] = useState(10);

  const selectedTickers = useMemo(() => {
    switch (tickerSet) {
      case "indices":
        return INDEXES;
      case "stocks":
        return MAG7;
      default:
        return LogTickerList;
    }
  }, [tickerSet]);

  const classifySentiment = (call, put) => {
    const ratio = call / (put || 1);
    if (ratio >= 2) return "ExtremelyBullish";
    if (ratio >= 1.25) return "Bullish";
    if (ratio >= 0.8) return "Neutral";
    if (ratio >= 0.5) return "Bearish";
    return "ExtremelyBearish";
  };

  const getBucketTime = (timestamp) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    date.setMinutes(minutes - (minutes % bucketMinutes), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const data = useMemo(() => {
    const map = new Map();

    rawData
      .filter((d) => selectedTickers.includes(d.selectedTicker))
      .forEach(({ timestamp, callVolume, putVolume }) => {
        const bucket = getBucketTime(timestamp);
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

        const current = map.get(bucket);
        if (current) current[sentiment]++;
      });

    return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData, selectedTickers, bucketMinutes]);

  return (
    <div className="sentiment-chart-container">
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

      <div className="sentiment-radio-options time-buckets">
        <label>
          <input
            type="radio"
            name="bucket"
            value="10"
            checked={bucketMinutes === 10}
            onChange={() => setBucketMinutes(10)}
          />
          10 min
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="30"
            checked={bucketMinutes === 30}
            onChange={() => setBucketMinutes(30)}
          />
          30 min
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="60"
            checked={bucketMinutes === 60}
            onChange={() => setBucketMinutes(60)}
          />
          60 min
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="120"
            checked={bucketMinutes === 120}
            onChange={() => setBucketMinutes(120)}
          />
          120 min
        </label>
      </div>

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
