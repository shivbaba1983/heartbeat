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
import "./SentimentAreaChartByTicker.scss";
import { INDEXES, MAG7 } from './../constant/HeartbeatConstants';
// Component
const SentimentAreaChartByTicker = ({ S3JsonFileData, selectedTicker }) => {

  const rawData = S3JsonFileData;//[/* your full JSON data here */];

  const TICKERS = [...INDEXES, ...MAG7];

  // Classify sentiment based on ratio
  const classifySentiment = (call, put) => {
    const ratio = call / (put || 1);
    if (ratio >= 2) return "ExtremelyBullish";
    if (ratio >= 1.25) return "Bullish";
    if (ratio >= 0.8) return "Neutral";
    if (ratio >= 0.5) return "Bearish";
    return "ExtremelyBearish";
  };

  // Get 5-min bucket
  const get5MinBucket = (timestamp) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    date.setMinutes(minutes - (minutes % 5), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Prepare grouped data per ticker
  const processByTicker = () => {
    const tickerMap = {};

    rawData
      .filter(d => d.selectedTicker === selectedTicker)
      .forEach(({ timestamp, selectedTicker, callVolume, putVolume }) => {
        const bucket = get5MinBucket(timestamp);
        const sentiment = classifySentiment(callVolume, putVolume);

        const key = `${selectedTicker}_${bucket}`;

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

    // Convert to sorted array per ticker
    const result = {};
    for (const ticker of Object.keys(tickerMap)) {
      const timeMap = tickerMap[ticker];
      result[ticker] = Object.values(timeMap).sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    }

    return result;
  };


  const dataByTicker = processByTicker();

  return (
    <div className="sentiment-chart-by-ticker">

      {TICKERS.map(ticker => (
        ticker === selectedTicker && (
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
        )
      ))}
    </div>
  );
}

export default SentimentAreaChartByTicker;
