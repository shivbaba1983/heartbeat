import React, { useState } from 'react';
import './RecentOpenInterestChange.scss';

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

interface Props {
  ticker: string;
  history: HistoryData;
}

const RecentOpenInterestChange: React.FC<Props> = ({ ticker, history }) => {
  // ✅ Default sort by Δ OI in descending order
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'diff',
    direction: 'desc',
  });

  const dates = Object.keys(history).sort();
  if (dates.length < 2) return null;

  const lastDate = dates[dates.length - 1];
  const prevDate = dates[dates.length - 2];
  const lastData = history[lastDate];
  const prevData = history[prevDate];

  const changeList: {
    strike: number;
    expiry: string;
    prevOI: number;
    lastOI: number;
    diff: number;
    lastPrice: string;
  }[] = [];

  lastData.forEach((item) => {
    if (item.type === 'CALL') {
      const prev = prevData.find((p) => p.strike === item.strike && p.type === 'CALL');
      const prevOI = prev?.openInterest ?? 0;
      const diff = item.openInterest - prevOI;
      if (diff >= 1000) {
        changeList.push({
          strike: item.strike,
          expiry: item.expiry,
          prevOI,
          lastOI: item.openInterest,
          diff,
          lastPrice: item.lastPrice,
        });
      }
    }
  });

  if (changeList.length === 0) return null;

  // ✅ Sorting logic
  const sortedData = [...changeList].sort((a, b) => {
    const { key, direction } = sortConfig;
    const order = direction === 'asc' ? 1 : -1;

    if (typeof a[key as keyof typeof a] === 'number') {
      return ((a[key as keyof typeof a] as number) - (b[key as keyof typeof a] as number)) * order;
    }

    return String(a[key as keyof typeof a]).localeCompare(String(b[key as keyof typeof a])) * order;
  });

  // ✅ Improved sorting toggle behavior
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      // Toggle direction if same column, otherwise default to descending
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'desc' };
      }
    });
  };

  const getSortSymbol = (key: string) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="recent-oi-change">
      <h4>
        {ticker} — OI change ≥ +1000 ({prevDate} → {lastDate})
      </h4>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('strike')}>Strike {getSortSymbol('strike')}</th>
            <th onClick={() => handleSort('expiry')}>Expiry {getSortSymbol('expiry')}</th>
            <th onClick={() => handleSort('prevOI')}>Prev OI {getSortSymbol('prevOI')}</th>
            <th onClick={() => handleSort('lastOI')}>Last OI {getSortSymbol('lastOI')}</th>
            <th onClick={() => handleSort('diff')}>Δ OI {getSortSymbol('diff')}</th>
            <th onClick={() => handleSort('lastPrice')}>Last Price {getSortSymbol('lastPrice')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i}>
              <td>{row.strike}</td>
              <td>{row.expiry}</td>
              <td>{row.prevOI.toLocaleString()}</td>
              <td>{row.lastOI.toLocaleString()}</td>
              <td className="diff-positive">+{row.diff.toLocaleString()}</td>
              <td>{row.lastPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOpenInterestChange;