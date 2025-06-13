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
import "./SentimentAreaChartByTicker.scss";
import { LogTickerList } from "./../constant/HeartbeatConstants";

const SentimentAreaChartByTicker = ({ S3JsonFileData, selectedTicker }) => {
  const rawData = S3JsonFileData || [];
  const TICKERS = LogTickerList;
  const [bucketSize, setBucketSize] = useState("5"); // Default to 5 mins (string to match radio input)

  const classifySentiment = (call, put) => {
    const ratio = call / (put || 1);
    if (ratio >= 2) return "ExtremelyBullish";
    if (ratio >= 1.25) return "Bullish";
    if (ratio >= 0.8) return "Neutral";
    if (ratio >= 0.5) return "Bearish";
    return "ExtremelyBearish";
  };

  const getTimeBucket = (timestamp, bucketMins) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    date.setMinutes(minutes - (minutes % bucketMins), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const dataByTicker = useMemo(() => {
    const tickerMap = {};

    rawData
      .filter(d => d.selectedTicker === selectedTicker)
      .forEach(({ timestamp, selectedTicker, callVolume, putVolume }) => {
        const buckets = bucketSize === "all" ? [5, 30, 60, 120] : [parseInt(bucketSize)];
        
        buckets.forEach(size => {
          const bucket = getTimeBucket(timestamp, size);
          const sentiment = classifySentiment(callVolume, putVolume);

          if (!tickerMap[size]) tickerMap[size] = {};
          if (!tickerMap[size][selectedTicker]) tickerMap[size][selectedTicker] = {};
          if (!tickerMap[size][selectedTicker][bucket]) {
            tickerMap[size][selectedTicker][bucket] = {
              time: bucket,
              ExtremelyBullish: 0,
              Bullish: 0,
              Neutral: 0,
              Bearish: 0,
              ExtremelyBearish: 0
            };
          }

          tickerMap[size][selectedTicker][bucket][sentiment]++;
        });
      });

    const result = {};
    const sizes = bucketSize === "all" ? [5, 30, 60, 120] : [parseInt(bucketSize)];
    sizes.forEach(size => {
      const map = tickerMap[size]?.[selectedTicker] || {};
      result[size] = Object.values(map).sort((a, b) => a.time.localeCompare(b.time));
    });

    return result;
  }, [rawData, selectedTicker, bucketSize]);

  return (
    <div className="sentiment-chart-by-ticker">
      <div className="time-bucket-controls">
        {["all", "5", "30", "60", "120"].map(size => (
          <label key={size}>
            <input
              type="radio"
              name="bucket"
              value={size}
              checked={bucketSize === size}
              onChange={() => setBucketSize(size)}
            />
            {size === "all" ? "All" : `${size} min`}
          </label>
        ))}
      </div>

      {TICKERS.map(ticker =>
        ticker === selectedTicker ? (
          <div key={ticker} className="ticker-chart">
            <h3>{ticker} ({bucketSize === "all" ? "All Intervals" : `${bucketSize} min`} Sentiment)</h3>

            {(bucketSize === "all" ? ["5", "30", "60", "120"] : [bucketSize]).map(size => (
              <div key={size} className="chart-wrapper">
                {bucketSize === "all" && <h4>{size} min</h4>}
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dataByTicker[size]} stackOffset="expand">
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
            ))}
          </div>
        ) : null
      )}
    </div>
  );
};

export default SentimentAreaChartByTicker;
