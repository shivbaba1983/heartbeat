import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MAG7, INDEXES, LogTickerList } from '../constant/HeartbeatConstants';
import { isWithinMarketHours } from '../common/nasdaq.common'; // (still unused, left intact)
import './AllSentimentClassification.scss';

// interface RawRow {
//   timestamp: string;
//   selectedTicker: string;
//   callVolume: number;
//   putVolume: number;
// }

// interface Props {
//   S3JsonFileData: RawRow[];
// }

const AllSentimentClassification = ({ S3JsonFileData = [] }) => {
  /* ------------------------------------------------------------------ */
  /* ---------------------------  STATE  ------------------------------ */
  /* ------------------------------------------------------------------ */
  const [tickerSet, setTickerSet] = useState('all');
  const [bucketMinutes, setBucketMinutes] = useState(5);
  const [timeRangeMinutes, setTimeRangeMinutes] = useState(null);
  const [chartType, setChartType] = useState('bar');

  /* ------------------------------------------------------------------ */
  /* ----------------------  INITIAL RANGE LOGIC  --------------------- */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setTimeRangeMinutes(null); // default = all‑time display
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

  /* ---------- bucketed 5‑series data (for both charts) ---------- */
  const bucketedData = useMemo(() => {
    const now = new Date();
    const cutoff =
      timeRangeMinutes != null
        ? new Date(now.getTime() - timeRangeMinutes * 60 * 1000)
        : null;

    const map = new Map();

    S3JsonFileData.forEach((row) => {
      const { timestamp, callVolume, putVolume, selectedTicker } = row;
      if (!selectedTickers.includes(selectedTicker)) return;
      if (cutoff && new Date(timestamp) < cutoff) return;

      const date = new Date(timestamp);
      const totalMinutes = date.getHours() * 60 + date.getMinutes();
      const roundedTotal = Math.floor(totalMinutes / bucketMinutes) * bucketMinutes;

      const bucketDate = new Date(date);
      bucketDate.setHours(Math.floor(roundedTotal / 60), roundedTotal % 60, 0, 0);

      const timeKey = bucketDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

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
      const sentiment = classifySentiment(callVolume, putVolume);
      bucket[sentiment]++;
    });

    return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [S3JsonFileData, selectedTickers, bucketMinutes, timeRangeMinutes]);

  /* ---------- pass‑through data for bar view ---------- */
  const aggregatedBarData = useMemo(() => bucketedData, [bucketedData]);

  /* ================================================================== */
  /* ============================  RENDER  ============================ */
  /* ================================================================== */
  return (
    <div className="all-sentiment-classification">
      {/* -----------  Ticker‑set radio buttons  ----------- */}
      <div className="sentiment-radio-options">
        {[
          { value: 'all', label: 'All' },
          { value: 'indices', label: 'Only Indices' },
          { value: 'stocks', label: 'MAG7' },
        ].map(({ value, label }) => (
          <label key={value}>
            <input
              type="radio"
              name="tickerSet"
              value={value}
              checked={tickerSet === value}
              onChange={() => setTickerSet(value)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* -----------  Bucket size radio buttons  ----------- */}
      <div className="sentiment-radio-options time-buckets">
        {[5, 10, 30].map((n) => (
          <label key={n}>
            <input
              type="radio"
              name="bucket"
              value={n}
              checked={bucketMinutes === n}
              onChange={() => setBucketMinutes(n)}
            />
            {n} Min Bucket
          </label>
        ))}
      </div>

      {/* -----------  Time‑range radio buttons  ----------- */}
      <div className="sentiment-radio-options time-range">
        {[
          { value: null, label: 'All Time' },
          { value: 10, label: 'Last 10 Min' },
          { value: 30, label: 'Last 30 Min' },
          { value: 60, label: 'Last 60 Min' },
        ].map(({ value, label }) => (
          <label key={String(value)}>
            <input
              type="radio"
              name="timeRange"
              value={String(value)}
              checked={timeRangeMinutes === value}
              onChange={() => setTimeRangeMinutes(value)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* -----------  Chart‑type toggle  ----------- */}
      <div className="chart-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={chartType === 'bar'}
            onChange={() => setChartType((p) => (p === 'line' ? 'bar' : 'line'))}
          />
          <span className="slider round" />
        </label>
        <span style={{ marginLeft: 8 }}>{chartType === 'line' ? 'Line' : 'Bar'}</span>
      </div>

      {/* -------------------  CHART  --------------------- */}
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'line' ? (
          /* ----------------- LINE VIEW ----------------- */
          <LineChart data={bucketedData}>
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ExtremelyBullish"
              stroke="#00b300"
              dot={false}
              className="extremely-bullish-blink"
            />
            <Line type="monotone" dataKey="Bullish" stroke="#66cc66" dot={false} />
            <Line type="monotone" dataKey="Neutral" stroke="#999999" dot={false} />
            <Line type="monotone" dataKey="Bearish" stroke="#ff6666" dot={false} />
            <Line type="monotone" dataKey="ExtremelyBearish" stroke="#cc0000" dot={false} />
          </LineChart>
        ) : (
          /* -------------- BAR + LINE VIEW -------------- */
          <ComposedChart data={aggregatedBarData}>
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />

            {/* stacked bars */}
            <Bar dataKey="ExtremelyBullish" stackId="a" fill="#00b300" />
            <Bar dataKey="Bullish"          stackId="a" fill="#66cc66" />
            <Bar dataKey="Neutral"          stackId="a" fill="#999999" />
            <Bar dataKey="Bearish"          stackId="a" fill="#ff6666" />
            <Bar dataKey="ExtremelyBearish" stackId="a" fill="#cc0000" />

            {/* overlay line connecting ExtremelyBullish bars */}
            <Line
              type="monotone"
              dataKey="ExtremelyBullish"
              stroke="#007bff"
              dot={false}
              strokeWidth={2}
              className="extremely-bullish-blink"
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AllSentimentClassification;
