import React, { useEffect, useState } from 'react';
import { QuarterlyTickerList } from '../../constant/HeartbeatConstants';
import { getYahooFinanceQuaterlyOptionData, getServerSavedData } from './../../services/YahooFinanceService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './TWOQuarterlyOpenInterest.scss';
import QuarterlyOpenInterestTable from './QuarterlyOpenInterestTable';
interface OptionData {
  expiry: string;
  strike: number;
  openInterest: number;
  lastPrice: string;
  type: string;
}

interface HistoryData {
  [date: string]: OptionData[];
}

export const TWOQuarterlyOpenInterest = ({ showQuarterly }: any) => {
  const [data, setData] = useState<Record<string, HistoryData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [displayTable, setDisplayTable] = useState<Record<string, boolean>>({});

  // ✅ Function to trigger daily data fetch
  const handlePullNewData = async () => {
    try {
      setLoading(true);
      setMessage('Fetching new data from Yahoo Finance...');
      const resp = await getYahooFinanceQuaterlyOptionData(QuarterlyTickerList);
      if (!resp?.ok) throw new Error('Failed to fetch daily options');
      setMessage('✅ New data pulled successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadData();
  }, []);

  // ✅ Function to load ticker data from API
  const handleLoadData = async () => {
    try {
      setLoading(true);
      setMessage('Loading data from API...');
      const allData: Record<string, HistoryData> = {};

      for (const ticker of QuarterlyTickerList) {
        const resp = await getServerSavedData(ticker);
        if (!resp.ok) throw new Error(`Failed to load data for ${ticker}`);
        const history: HistoryData = await resp.json();
        allData[ticker] = history;
      }

      setData(allData);
      setMessage('✅ Data loaded successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Custom tooltip grouped by expiry with lastPrice included
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const groupedByExpiry: Record<string, any[]> = {};

      payload.forEach((p: any) => {
        const expiry = p?.payload?.[`${p.name}_expiry`] || 'Unknown Expiry';
        const oi = p?.value ?? 0;
        const lastPrice = p?.payload?.[`${p.name}_lastPrice`] ?? 'N/A';

        if (oi > 5000) {
          if (!groupedByExpiry[expiry]) groupedByExpiry[expiry] = [];
          groupedByExpiry[expiry].push({ ...p, lastPrice });
        }
      });

      return (
        <div
          className="custom-tooltip"
          style={{
            background: '#fff',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc',
          }}
        >
          <p><b>Date:</b> {label}</p>

          {Object.keys(groupedByExpiry).map((expiry, i) => (
            <div key={i} style={{ marginTop: 6 }}>
              <p style={{ textDecoration: 'underline', fontWeight: 600 }}>
                Expiry: {expiry}
              </p>
              {groupedByExpiry[expiry].map((p, j) => (
                <div key={j} style={{ marginLeft: 10 }}>
                  <b>{p.name}</b>{"=>"}<b>{p.value}</b>{"=>"}<b>{p.lastPrice}</b>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="qo-container">
      <h2>Quarterly Options Open Interest Trend</h2>

      <div className="qo-controls">
        <button onClick={handlePullNewData} disabled={loading}>
          {loading ? 'Fetching...' : 'Pull New Data'}
        </button>
        <button onClick={handleLoadData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Data from API'}
        </button>
      </div>

      {message && <div className="qo-message">{message}</div>}
      {error && <div className="qo-error">Error: {error}</div>}

      {Object.keys(data).length === 0 && !loading && (
        <p className="qo-hint">Click “Load Data from API” to view charts.</p>
      )}

      {QuarterlyTickerList.map((ticker) => {
        const history = data[ticker];
        if (!history) return null;

        const strikes = Array.from(
          new Set(
            Object.values(history)
              .flat()
              .filter((o: any) => o.type === 'CALL' && o.openInterest > 5000)
              .map((o: any) => o.strike)
          )
        ).sort((a, b) => a - b);

        const today = new Date();

        const chartData = Object.keys(history)
          .sort()
          .map((date) => {
            const dayData = history[date];
            const obj: any = { date };

            const validStrikes = strikes.filter(
              (s) => Number.isInteger(s) && (s % 5 === 0 || s % 10 === 0)
            );

            validStrikes.forEach((strike) => {
              const option = dayData.find((o: any) => o.strike === strike && o.type === 'CALL');

              if (
                option &&
                option.openInterest > 5000 &&
                new Date(option.expiry) >= today
              ) {
                obj[strike] = option.openInterest;
                obj[`${strike}_expiry`] = option.expiry;
                obj[`${strike}_lastPrice`] = option.lastPrice; // ✅ added
              } else {
                obj[strike] = 0;
                obj[`${strike}_expiry`] = null;
                obj[`${strike}_lastPrice`] = null; // ✅ added
              }
            });

            return obj;
          })
          .filter((row) => Object.values(row).some((v) => typeof v === 'number' && v > 0));

        return (
          <div key={ticker} className="qo-chart-card">
            <h3>{ticker}</h3>

            <div className="qo-display-table-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={displayTable[ticker] || false}
                  onChange={(e) =>
                    setDisplayTable((prev) => ({ ...prev, [ticker]: e.target.checked }))
                  }
                />
                Display Table
              </label>
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {strikes.map((strike) => (
                    <Line
                      key={strike}
                      type="monotone"
                      dataKey={strike.toString()}
                      name={`${strike}`}
                      stroke={'#' + ((Math.random() * 0xffffff) << 0).toString(16)}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available for {ticker}</p>
            )}

            {displayTable[ticker] && (
              <QuarterlyOpenInterestTable data={{ [ticker]: history }} />
            )}
          </div>
        );
      })}
    </div>
  );
};
