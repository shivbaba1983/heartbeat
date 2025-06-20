import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MAG7, INDEXES, LogTickerList } from "../constant/HeartbeatConstants";
import "./AllSentimentClassification.scss";
import { isMarketOpenNow, isWithinMarketHours } from "./../common/nasdaq.common";

const AllSentimentClassification = ({ S3JsonFileData }) => {
  const rawData = S3JsonFileData || [];

  const [tickerSet, setTickerSet] = useState("all");
  const [bucketMinutes, setBucketMinutes] = useState(5);
  const [timeRangeMinutes, setTimeRangeMinutes] = useState(null); // Default: All Time

  // ✅ Set default time range on mount
  useEffect(() => {
    const defaultRange = isWithinMarketHours() ? null : null;
    setTimeRangeMinutes(defaultRange);
  }, []);

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

  const data = useMemo(() => {
    const now = new Date();
    const cutoffTime = timeRangeMinutes
      ? new Date(now.getTime() - timeRangeMinutes * 60 * 1000)
      : null;

    const map = new Map();

    rawData
      .filter((d) => {
        const inTickerList = selectedTickers.includes(d.selectedTicker);
        const isRecent = !cutoffTime || new Date(d.timestamp) >= cutoffTime;
        return inTickerList && isRecent;
      })
      .forEach(({ timestamp, callVolume, putVolume }) => {
        const date = new Date(timestamp);
        const totalMinutes = date.getHours() * 60 + date.getMinutes();
        const roundedTotal = Math.floor(totalMinutes / bucketMinutes) * bucketMinutes;
        const roundedHour = Math.floor(roundedTotal / 60);
        const roundedMinute = roundedTotal % 60;

        const bucketDate = new Date(date);
        bucketDate.setHours(roundedHour);
        bucketDate.setMinutes(roundedMinute, 0, 0);

        const time = bucketDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });

        const sentiment = classifySentiment(callVolume, putVolume);

        if (!map.has(time)) {
          map.set(time, {
            time,
            ExtremelyBullish: 0,
            Bullish: 0,
            Neutral: 0,
            Bearish: 0,
            ExtremelyBearish: 0,
          });
        }

        map.get(time)[sentiment]++;
      });

    return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData, selectedTickers, bucketMinutes, timeRangeMinutes]);

  return (
    <div className="all-sentiment-classification">
      {/* Ticker Set Selection */}
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
          MAG7
        </label>
      </div>

      {/* Bucket Size */}
      <div className="sentiment-radio-options time-buckets">
        <label>
          <input
            type="radio"
            name="bucket"
            value="5"
            checked={bucketMinutes === 5}
            onChange={() => setBucketMinutes(5)}
          />
          5 Min Bucket
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="10"
            checked={bucketMinutes === 10}
            onChange={() => setBucketMinutes(10)}
          />
          10 Min Bucket
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="30"
            checked={bucketMinutes === 30}
            onChange={() => setBucketMinutes(30)}
          />
          30 Min Bucket
        </label>
      </div>

      {/* Time Range Filter */}
      <div className="sentiment-radio-options time-range">
        <label>
          <input
            type="radio"
            name="timeRange"
            value="null"
            checked={String(timeRangeMinutes) === "null"}
            onChange={() => setTimeRangeMinutes(null)}
          />
          All Time
        </label>
        <label>
          <input
            type="radio"
            name="timeRange"
            value="10"
            checked={String(timeRangeMinutes) === "10"}
            onChange={() => setTimeRangeMinutes(10)}
          />
          Last 10 Min
        </label>
        <label>
          <input
            type="radio"
            name="timeRange"
            value="30"
            checked={String(timeRangeMinutes) === "30"}
            onChange={() => setTimeRangeMinutes(30)}
          />
          Last 30 Min
        </label>
        <label>
          <input
            type="radio"
            name="timeRange"
            value="60"
            checked={String(timeRangeMinutes) === "60"}
            onChange={() => setTimeRangeMinutes(60)}
          />
          Last 60 Min
        </label>
      </div>


      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ExtremelyBullish" stroke="#00b300" dot={false} />
          <Line type="monotone" dataKey="Bullish" stroke="#66cc66" dot={false} />
          <Line type="monotone" dataKey="Neutral" stroke="#999999" dot={false} />
          <Line type="monotone" dataKey="Bearish" stroke="#ff6666" dot={false} />
          <Line type="monotone" dataKey="ExtremelyBearish" stroke="#cc0000" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllSentimentClassification;
