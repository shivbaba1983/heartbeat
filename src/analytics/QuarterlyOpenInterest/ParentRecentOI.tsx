import React, { useState } from 'react';
import RecentOpenInterestChange from './RecentOpenInterestChange';
import './ParentRecentOI.scss';

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
  allHistory: {
    [ticker: string]: HistoryData;
  };
}

const ParentRecentOI = ({ allHistory }) => {
  const [daysBefore, setDaysBefore] = useState<number>(1);

  return (
    <div className="parent-container">
      {/* 🔥 GLOBAL Sticky Dropdown */}
      <div className="global-days-selector">
        <label>Compare with: </label>
        <select
          value={daysBefore}
          onChange={(e) => setDaysBefore(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6, 7, 10, 15, 30].map((d) => (
            <option key={d} value={d}>
              {d} day{d > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 Render all tickers */}
      {Object.entries(allHistory).map(([ticker, history]) => (
        <RecentOpenInterestChange
          key={ticker}
          ticker={ticker}
          history={history}
          daysBefore={daysBefore}
        />
      ))}
    </div>
  );
};

export default ParentRecentOI;
