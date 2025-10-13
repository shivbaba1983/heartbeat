import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { getYahooFinanceQuaterlyDynamicData } from './../../services/YahooFinanceService';
import './DynamicTickerOptionTable.scss';

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
  const [showTable, setShowTable] = useState<boolean>(true);

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
      const resp = await getYahooFinanceQuaterlyDynamicData(ticker);
      if (!resp.ok) throw new Error('Failed to fetch option data');
      const json: ApiResponse = await resp.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate color per expiry
  const getColorForExpiry = (expiry: string): string => {
    let hash = 0;
    for (let i = 0; i < expiry.length; i++) {
      hash = expiry.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsla(${hue}, 70%, 92%, 0.5)`;
  };

  // Flatten data (no grouping by date)
  const rows = useMemo(() => {
    const allRows: any[] = [];
    Object.entries(data).forEach(([ticker, history]) => {
      Object.entries(history).forEach(([date, options]) => {
        options.forEach((opt) => {
          allRows.push({
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

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    return [...rows].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Custom Tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p><b>Expiry:</b> {d.expiry}</p>
          <p><b>Strike:</b> {d.strike}</p>
          <p><b>Last Price:</b> {d.lastPrice}</p>
          <p><b>Open Interest:</b> {d.openInterest.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  // Group rows by expiry for table background styling
  const groupedByExpiry = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedRows.forEach((row) => {
      if (!groups[row.expiry]) groups[row.expiry] = [];
      groups[row.expiry].push(row);
    });
    return groups;
  }, [sortedRows]);
  // Darker color per expiry (used for chart)
  const getDarkColorForExpiry = (expiry: string): string => {
    // Cache to ensure consistent unique colors
    const expiries = Array.from(new Set(sortedRows.map((item) => item.expiry)));
    const index = expiries.indexOf(expiry);

    // Evenly space hues to avoid repetition
    const hue = Math.round((360 / expiries.length) * index);

    return `hsl(${hue}, 70%, 45%)`; // darker, richer hue for bars
  };

  // Generate light color per expiry (for table)
  const getLightColorForExpiry = (expiry: string): string => {
    let hash = 0;
    for (let i = 0; i < expiry.length; i++) {
      hash = expiry.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 90%)`;
  };

  
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
        <>
          {/* Chart */}
          <div className="chart-container">
            <h3>Open Interest by Expiry</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sortedRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strike" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="openInterest">
                  {sortedRows.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getDarkColorForExpiry(entry.expiry)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Color legend */}
            {sortedRows && sortedRows.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {Array.from(new Set(sortedRows.map(item => item.expiry))).map((expiry, index) => (
                  <div
                    key={index}
                    style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: getDarkColorForExpiry(expiry),
                        borderRadius: '3px',
                        marginRight: '6px',
                      }}
                    ></div>
                    <span style={{ fontSize: '13px', color: '#444' }}>{expiry}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkbox */}
          <div className="checkbox-container">
            <label>
              <input
                type="checkbox"
                checked={showTable}
                onChange={() => setShowTable((prev) => !prev)}
              />
              Show Table
            </label>
          </div>

          {/* Table */}
          {showTable && (
            <div className="table-wrapper">
              <table className="option-table">
                <thead>
                  <tr>
                    {['Expiry', 'Strike', 'Open Interest', 'Last Price'].map((header) => (
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
                  {Object.entries(groupedByExpiry).map(([expiry, groupRows], idx) => (
                    <React.Fragment key={expiry}>
                      {groupRows.map((row, i) => (
                        <tr key={`${expiry}-${i}`} style={{ backgroundColor: getDarkColorForExpiry(expiry) }}>
                          <td><b>{row.expiry}</b></td>
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
        </>
      )}
    </div>
  );
};
