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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'diff',
    direction: 'desc',
  });

  // 🆕 State to choose how many days before to compare
  const [daysBefore, setDaysBefore] = useState<number>(1);

  const dates = Object.keys(history).sort();
  if (dates.length < daysBefore + 1) return null;

  const lastDate = dates[dates.length - 1];
  const prevDate = dates[dates.length - 1 - daysBefore];
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

  // ✅ Include both positive and negative large changes (≥ +1000 or ≤ -1000)
  lastData.forEach((item) => {
    if (item.type === 'CALL') {
      const prev = prevData.find(
        (p) =>
          p.strike === item.strike &&
          p.type === 'CALL' &&
          p.expiry === item.expiry
      );

      const prevOI = prev?.openInterest ?? 0;
      const diff = item.openInterest - prevOI;

      if (Math.abs(diff) >= 1000) {
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

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
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
      <div className="header-row">
        <h4>
          {ticker} — OI Change ≥ ±1000 ({prevDate} → {lastDate})
        </h4>

        {/* 🆕 Days selector */}
        <div className="days-selector">
          <label>Compare with: </label>
          <select
            value={daysBefore}
            onChange={(e) => setDaysBefore(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7,10,15,20,30].map((d) => (
              <option key={d} value={d}>
                {d} day{d > 1 ? 's' : ''} before
              </option>
            ))}
          </select>
        </div>
      </div>

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
              <td className={row.diff >= 1000 ? 'diff-positive' : 'diff-negative'}>
                {row.diff >= 0 ? '+' : ''}{row.diff.toLocaleString()}
              </td>
              <td>{row.lastPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOpenInterestChange;
