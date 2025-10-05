import React, { useState, useMemo } from 'react';
import './QuarterlyOpenInterestTable.scss';

interface OptionData {
  expiry: string;
  strike: number;
  openInterest: number;
  lastPrice:string;
  type: string;
}

interface HistoryData {
  [date: string]: OptionData[];
}

interface QuarterlyOpenInterestTableProps {
  data: Record<string, HistoryData>;
}

const QuarterlyOpenInterestTable: React.FC<QuarterlyOpenInterestTableProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  // Generate soft background color per expiry
  const getColorForExpiry = (expiry: string): string => {
    let hash = 0;
    for (let i = 0; i < expiry.length; i++) hash = expiry.charCodeAt(i) + ((hash << 5) - hash);
    const hue = hash % 360;
    return `hsla(${hue}, 70%, 92%, 0.6)`; // soft pastel tone
  };

  // Flatten and prepare table data, only latest date per ticker
  const rows = useMemo(() => {
    const allRows: any[] = [];

    Object.entries(data).forEach(([ticker, history]) => {
      // Get latest date for ticker
      const dates = Object.keys(history).sort((a, b) => (a > b ? -1 : 1));
      if (dates.length === 0) return;
      const latestDate = dates[0];
      const options = history[latestDate];

      options.forEach((opt) => {
        if (opt.openInterest > 0) {
          allRows.push({
            ticker,
            date: latestDate,
            expiry: opt.expiry,
            strike: opt.strike,
            openInterest: opt.openInterest,
            lastPrice:opt?.lastPrice || 0,
            type: opt.type,
          });
        }
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

  // Handle sorting when clicking header
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Group by expiry for background coloring
  const groupedByExpiry = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedRows.forEach((row) => {
      if (!groups[row.expiry]) groups[row.expiry] = [];
      groups[row.expiry].push(row);
    });
    return groups;
  }, [sortedRows]);

  return (
    <div className="qoi-table-container">
      <h3>{Object.keys(data)[0]} - Quarterly Open Interest Table (Latest Date Only)</h3>
      <table className="qoi-table">
        <thead>
          <tr>
            {['Ticker', 'Date', 'Expiry', 'Strike', 'lastPrice', 'Open Interest'].map((header) => (
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
                  <td>{row.ticker}</td>
                  <td>{row.date}</td>
                  <td><b>{row.expiry}</b></td>
                  <td>{row.strike}</td>
                  <td>{row.lastPrice}</td>
                  <td>{row.openInterest.toLocaleString()}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuarterlyOpenInterestTable;
