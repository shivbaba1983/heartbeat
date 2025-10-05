import React, { useState, useMemo } from 'react';
import './DynamicTickerOptionTable.scss';
import {NASDAQ_TOKEN} from './../../constant/HeartbeatConstants';
interface OptionData {
  expiry: string;
  expiryMonth: string;
  strike: number;
  openInterest: number;
  lastPrice: number;
  type: string;
}

interface HistoryData {
  [date: string]: OptionData[];
}

interface ApiResponse {
  status: string;
  date: string;
  data: Record<string, HistoryData>;
}

export const DynamicTickerOptionTable: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [data, setData] = useState<Record<string, HistoryData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setData({});

    try {
      const cleanTicker = ticker.trim().toUpperCase();
      if (!cleanTicker) {
        setError('Please enter a valid ticker symbol.');
        setLoading(false);
        return;
      }
      const url= "https://main.d1rin969pdam05.amplifyapp.com/api/fetchQuaterOptionData";
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: cleanTicker }),
      });

      if (!resp.ok) throw new Error('Failed to fetch option data');

      const json: ApiResponse = await resp.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate soft color per expiry group
  const getColorForExpiry = (expiry: string): string => {
    let hash = 0;
    for (let i = 0; i < expiry.length; i++) hash = expiry.charCodeAt(i) + ((hash << 5) - hash);
    const hue = hash % 360;
    return `hsla(${hue}, 70%, 92%, 0.6)`;
  };

  // Flatten data
  const rows = useMemo(() => {
    const allRows: any[] = [];
    Object.entries(data).forEach(([ticker, history]) => {
      Object.entries(history).forEach(([date, options]) => {
        options.forEach((opt) => {
          allRows.push({
            ticker,
            date,
            expiry: opt.expiry,
            expiryMonth: opt.expiryMonth,
            strike: opt.strike,
            openInterest: opt.openInterest,
            lastPrice: opt.lastPrice,
            type: opt.type,
          });
        });
      });
    });
    return allRows;
  }, [data]);

  // Sorting logic
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    const sorted = [...rows].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Group rows by expiry
  const groupedByExpiry = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedRows.forEach((row) => {
      if (!groups[row.expiry]) groups[row.expiry] = [];
      groups[row.expiry].push(row);
    });
    return groups;
  }, [sortedRows]);

  return (
    <div className="quarterly-viewer-container">
      <h2>Fetch Quarterly Option Data</h2>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter Ticker (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleFetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      {Object.keys(data).length > 0 && (
        <div className="table-wrapper">
          <table className="option-table">
            <thead>
              <tr>
                {['Date', 'Expiry', 'Month', 'Strike', 'Open Interest', 'Last Price'].map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header.replace(' ', '').toLowerCase())}
                    className={sortConfig?.key === header.replace(' ', '').toLowerCase() ? 'active' : ''}
                  >
                    {header}
                    {sortConfig?.key === header.replace(' ', '').toLowerCase() && (
                      <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByExpiry).map(([expiry, groupRows]) => (
                <React.Fragment key={expiry}>
                  {groupRows.map((row, idx) => (
                    <tr key={`${expiry}-${idx}`} style={{ backgroundColor: getColorForExpiry(expiry) }}>
                      <td>{row.date}</td>
                      <td><b>{row.expiry}</b></td>
                      <td>{row.expiryMonth}</td>
                      <td>{row.strike}</td>
                      <td>{row.openInterest.toLocaleString()}</td>
                      <td>{row.lastPrice}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

