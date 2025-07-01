import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MAG7, INDEXES, LogTickerList } from '../constant/HeartbeatConstants';
import './AllSentimentClassification.scss';
import { isWithinMarketHours } from './../common/nasdaq.common';

const AllSentimentClassification = ({ S3JsonFileData = [] }) => {
  /* ------------------------------------------------------------------ */
  /* ---------------------------  STATE  ------------------------------ */
  /* ------------------------------------------------------------------ */
  const [tickerSet, setTickerSet] = useState(
    'all'
  );
  const [bucketMinutes, setBucketMinutes] = useState(5);
  const [timeRangeMinutes, setTimeRangeMinutes] = useState(null);
  const [chartType, setChartType] = useState('line'); // ⬅️ NEW

  /* ------------------------------------------------------------------ */
  /* ----------------------  INITIAL RANGE LOGIC  --------------------- */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const defaultRange = isWithinMarketHours() ? null : null;
    setTimeRangeMinutes(defaultRange);
  }, []);

  /* ------------------------------------------------------------------ */
  /* ----------------------  TICKER SELECTION  ------------------------ */
  /* ------------------------------------------------------------------ */
  const selectedTickers = useMemo(() => {
    switch (tickerSet) {
      case 'indices':
        return INDEXES;
      case 'stocks':
        return MAG7;
      default:
        return LogTickerList;
    }
  }, [tickerSet]);

  /* ------------------------------------------------------------------ */
  /* --------------  CLASSIFY & BUCKET RAW SENTIMENT  ----------------- */
  /* ------------------------------------------------------------------ */
  const classifySentiment = (call, put) => {
    const ratio = call / (put || 1);
    if (ratio >= 2) return 'ExtremelyBullish';
    if (ratio >= 1.25) return 'Bullish';
    if (ratio >= 0.8) return 'Neutral';
    if (ratio >= 0.5) return 'Bearish';
    return 'ExtremelyBearish';
  };

  const bucketedData = useMemo(() => {
    const now = new Date();
    const cutoff =
      timeRangeMinutes != null
        ? new Date(now.getTime() - timeRangeMinutes * 60 * 1000)
        : null;

    const map = new Map();

    S3JsonFileData.forEach(({ timestamp, callVolume, putVolume, selectedTicker }) => {
      const isTickerOk = selectedTickers.includes(selectedTicker);
      const isRecent = !cutoff || new Date(timestamp) >= cutoff;
      if (!isTickerOk || !isRecent) return;

      const date = new Date(timestamp);
      const totalMinutes = date.getHours() * 60 + date.getMinutes();
      const roundedTotal = Math.floor(totalMinutes / bucketMinutes) * bucketMinutes;
      const roundedHour = Math.floor(roundedTotal / 60);
      const roundedMinute = roundedTotal % 60;

      const bucketDate = new Date(date);
      bucketDate.setHours(roundedHour, roundedMinute, 0, 0);

      const timeKey = bucketDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      const sentiment = classifySentiment(callVolume, putVolume);

      if (!map.has(timeKey)) {
        map.set(timeKey, {
          time: timeKey,
          ExtremelyBullish: 0,
          Bullish: 0,
          Neutral: 0,
          Bearish: 0,
          ExtremelyBearish: 0,
        });
      }
      const bucket = map.get(timeKey);
      if (bucket) {
        bucket[sentiment]++;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [S3JsonFileData, selectedTickers, bucketMinutes, timeRangeMinutes]);

  /* ------------------------------------------------------------------ */
  /* --------------  AGGREGATE FOR BAR CHART (3 SERIES)  -------------- */
  /* ------------------------------------------------------------------ */
  const aggregatedBarData = useMemo(
    () =>
      bucketedData.map((d) => ({
        time: d.time,
        Bullish: d.Bullish + d.ExtremelyBullish,
        Neutral: d.Neutral,
        Bearish: d.Bearish + d.ExtremelyBearish,
      })),
    [bucketedData]
  );

  /* ================================================================== */
  /* ============================  RENDER  ============================ */
  /* ================================================================== */
  return (
    <div className="all-sentiment-classification">
      {/* ----------------  Controls (same as before) ------------------ */}
      {/* ... radio groups for tickerSet, bucket, timeRange (omitted for brevity) ... */}

      {/* --------------------  CHART TYPE TOGGLE  --------------------- */}
      <div className="chart-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={chartType === 'bar'}
            onChange={() => setChartType((p) => (p === 'line' ? 'bar' : 'line'))}
          />
          <span className="slider round"></span>
        </label>
        <span style={{ marginLeft: '8px' }}>
          {chartType === 'line' ? 'Line Chart' : 'Bar Chart'}
        </span>
      </div>

      {/* -------------------------  CHART  ---------------------------- */}
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'line' ? (
          <LineChart data={bucketedData}>
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
        ) : (
          <BarChart data={aggregatedBarData}>
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Bullish" stackId="a" fill="#66cc66" />
            <Bar dataKey="Neutral" stackId="a" fill="#999999" />
            <Bar dataKey="Bearish" stackId="a" fill="#cc0000" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AllSentimentClassification;
