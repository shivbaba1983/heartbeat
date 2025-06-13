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
  const [bucketSize, setBucketSize] = useState(30); // 30, 60, 120

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
        const bucket = getTimeBucket(timestamp, bucketSize);
        const sentiment = classifySentiment(callVolume, putVolume);

        if (!tickerMap[selectedTicker]) {
          tickerMap[selectedTicker] = {};
        }

        if (!tickerMap[selectedTicker][bucket]) {
          tickerMap[selectedTicker][bucket] = {
            time: bucket,
            ExtremelyBullish: 0,
            Bullish: 0,
            Neutral: 0,
            Bearish: 0,
            ExtremelyBearish: 0
          };
        }

        tickerMap[selectedTicker][bucket][sentiment]++;
      });

    const result = {};
    for (const ticker of Object.keys(tickerMap)) {
      const timeMap = tickerMap[ticker];
      result[ticker] = Object.values(timeMap).sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    }

    return result;
  }, [rawData, selectedTicker, bucketSize]);

  return (
    <div className="sentiment-chart-by-ticker">
      <div className="time-bucket-controls">
        <label>
          <input
            type="radio"
            name="bucket"
            value="30"
            checked={bucketSize === 30}
            onChange={() => setBucketSize(30)}
          />
          30 min
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="60"
            checked={bucketSize === 60}
            onChange={() => setBucketSize(60)}
          />
          60 min
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="120"
            checked={bucketSize === 120}
            onChange={() => setBucketSize(120)}
          />
          120 min
        </label>
      </div>

      {TICKERS.map(ticker =>
        ticker === selectedTicker ? (
          <div key={ticker} className="ticker-chart">
            <h3>{ticker}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dataByTicker[ticker]} stackOffset="expand">
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
        ) : null
      )}
    </div>
  );
};

export default SentimentAreaChartByTicker;
