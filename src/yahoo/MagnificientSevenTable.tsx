import React, { useState } from 'react';
import './MagnificientSevenTable.scss'; // Create a CSS file for styles
const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  cursor: "pointer",
};
const MagnificientSevenTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'ratio', direction: 'desc' });
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
  const renderSortIcon = (key) => {
    return sortConfig.key === key
      ? sortConfig.direction === "asc" ? " ▲" : " ▼"
      : "";
  };
  return (
    <div className='magnificient-seven-section'>
      <div className='sentimate-seven-history-data'>
        <h2 onClick={toggleExpanded} className="link-like-header">
          {isExpanded
            ? "▼ Magnificent Seven Sentiments (Click to Collapse)"
            : "► Magnificent Seven Sentiments (Click to Expand)"}
        </h2>

        {isExpanded && (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={cellStyle} onClick={() => handleSort("selectedTicker")}>Ticker{renderSortIcon("selectedTicker")}</th>
                <th style={cellStyle} onClick={() => handleSort("callVolume")}>Call{renderSortIcon("callVolume")}</th>
                <th style={cellStyle} onClick={() => handleSort("putVolume")}>Put{renderSortIcon("putVolume")}</th>
                <th style={cellStyle} onClick={() => handleSort("lstPrice")}>Price{renderSortIcon("lstPrice")}</th>
                <th style={cellStyle} onClick={() => handleSort("prediction")}>Trend{renderSortIcon("prediction")}</th>
                <th style={cellStyle} onClick={() => handleSort("ratio")}>Ratio{renderSortIcon("ratio")}</th>
                <th style={cellStyle} onClick={() => handleSort("timestamp")}>Time{renderSortIcon("timestamp")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={row.id || index} className={row.prediction}>
                  <td style={cellStyle}>{row.selectedTicker}</td>
                  <td style={cellStyle}>{row.callVolume.toLocaleString()}</td>
                  <td style={cellStyle}>{row.putVolume.toLocaleString()}</td>
                  <td style={cellStyle}>
                    {row.lstPrice !== undefined && !isNaN(row.lstPrice)
                      ? Number(row.lstPrice).toFixed(2)
                      : '-'}
                  </td>
                  <td style={cellStyle}>{row.prediction}</td>
                  <td style={cellStyle}>{row.ratio}</td>
                  <td style={cellStyle}>{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MagnificientSevenTable;
