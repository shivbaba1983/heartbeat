import React, { useState } from 'react';
import './MagnificientSevenTable.scss'; // Create a CSS file for styles

const MagnificientSevenTable = ({ data }) => {
  //const [sortConfig, setSortConfig] = useState({ key: 'selectedTicker', direction: 'asc' });

  const [sortConfig, setSortConfig] = useState({ key: 'selectedTicker', direction: 'asc' });
  const [isExpanded, setIsExpanded] = useState(false);
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getProcessedRow = (row) => {
    const ratio = row.callVolume === 0 ? 0 : row.putVolume / row.callVolume;
    const prediction =
      ratio < 0.5
        ? 'ExtremelyBullish'
        : ratio < 0.7
          ? 'Bullish'
          : ratio <= 1.0
            ? 'Neutral'
            : ratio <= 1.3
              ? 'Bearish'
              : 'ExtremelyBearish';

    const customClassName = row.callVolume > row.putVolume ? 'greenmarket' : 'redmarket';

    return {
      ...row,
      ratio: Number(ratio.toFixed(2)),
      prediction,
      customClassName,
    };
  };

  // Process the data first
  const processedData = data.map(getProcessedRow);

  const sortedData = [...processedData].sort((a, b) => {
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];

    // If both are strings, use localeCompare
    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    // If both are numbers, compare numerically
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }

    // Fallback: convert both to string and compare
    const strA = String(valA ?? '');
    const strB = String(valB ?? '');
    return direction === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  return (
    <div className='sentimate-seven-history-data'>
      <h2 onClick={toggleExpanded} className="link-like-header">
        {isExpanded
          ? "▼ Magnificent Seven Sentiments (Click to Collapse)"
          : "► Magnificent Seven Sentiments (Click to Expand)"}
      </h2>
      {isExpanded && (
        <table className="volume-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('selectedTicker')}>Ticker</th>
              <th onClick={() => handleSort('callVolume')}>Call Volume</th>
              <th onClick={() => handleSort('putVolume')}>Put Volume</th>
              <th onClick={() => handleSort('lstPrice')}>Last Price</th>
              <th onClick={() => handleSort('timestamp')}>Timestamp</th>
              <th onClick={() => handleSort('ratio')}>Put/Call Ratio</th>
              <th onClick={() => handleSort('prediction')}>Prediction</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={row.id || index} className={row.prediction}>
                <td>{row.selectedTicker}</td>
                <td>{row.callVolume.toLocaleString()}</td>
                <td>{row.putVolume.toLocaleString()}</td>
                <td>
                  {row.lstPrice !== undefined && !isNaN(row.lstPrice)
                    ? Number(row.lstPrice).toFixed(2)
                    : '-'}
                </td>
                <td>{row.timestamp}</td>
                <td>{row.ratio}</td>
                <td>{row.prediction}</td>
              </tr>
            ))}

          </tbody>
        </table>
      )}
    </div>
  );
};

export default MagnificientSevenTable;
