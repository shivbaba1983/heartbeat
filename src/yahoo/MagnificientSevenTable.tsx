import React, { useState } from 'react';
import './MagnificientSevenTable.scss';
import { MAG7, INDEXES } from './../constant/HeartbeatConstants';

const cellStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  cursor: 'pointer',
};

const MagnificientSevenTable = ({ data }) => {
  // ⬇️  threshold can now be a number OR the string 'all'
  const [blinkingThreshold, setBlinkingThreshold] = useState(2);
  const [sortConfig, setSortConfig] = useState({
    key: 'ratio',
    direction: 'asc',
  });

  /* ---------- handlers ---------- */
  const handleThresholdChange = (event) => {
    const { value } = event.target;
    setBlinkingThreshold(value === 'all' ? 'all' : Number(value));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  /* ---------- row preparation ---------- */
  const getProcessedRow = (row) => {
    const ratio = row.callVolume === 0 ? 0 : row.putVolume / row.callVolume;
    const prediction =
      ratio < 0.5
        ? 'ExtremelyBullish'
        : ratio < 0.7
        ? 'Bullish'
        : ratio <= 1
        ? 'Neutral'
        : ratio <= 1.3
        ? 'Bearish'
        : 'ExtremelyBearish';

    const customClassName =
      row.callVolume > row.putVolume ? 'redmarket' : 'greenmarket';

    /* 👇 Skip blinking rule when threshold === 'all' */
    const blinking =
      blinkingThreshold !== 'all' &&
      row.callVolume > 0 &&
      row.putVolume > 0 &&
      row.callVolume >= blinkingThreshold * row.putVolume;

    return {
      ...row,
      ratio: Number(ratio.toFixed(2)),
      prediction,
      customClassName,
      blinking,
    };
  };

  /* ---------- prepare & sort data ---------- */
  const processedData = data.map(getProcessedRow);
  const sortedData = [...processedData].sort((a, b) => {
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }
    const strA = String(valA ?? '');
    const strB = String(valB ?? '');
    return direction === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });

  const renderSortIcon = (key) =>
    sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : '';

  const renderRow = (row, index) => (
    <tr
      key={row.id || index}
      className={`${row.prediction} ${row.blinking ? 'blinking-alert' : ''}`}
    >
      <td style={cellStyle}>{row.selectedTicker}</td>
      <td style={cellStyle}>
        {row.lstPrice !== undefined && !isNaN(row.lstPrice)
          ? Number(row.lstPrice).toFixed(2)
          : '-'}
      </td>
      <td style={cellStyle}>{row.ratio}</td>
      <td style={cellStyle}>{row.prediction}</td>
      <td style={cellStyle}>{row.callVolume.toLocaleString()}</td>
      <td style={cellStyle}>{row.putVolume.toLocaleString()}</td>
      <td style={cellStyle}>{row.timestamp}</td>
    </tr>
  );

  /* ---------- group data ---------- */
  const indexes = sortedData.filter((r) => INDEXES.includes(r.selectedTicker));
  const mag7 = sortedData.filter((r) => MAG7.includes(r.selectedTicker));
  const others = sortedData.filter(
    (r) => !INDEXES.includes(r.selectedTicker) && !MAG7.includes(r.selectedTicker)
  );

  return (
    <div className="magnificient-seven-section">
      <div className="sentimate-seven-history-data">
        {/* ---- radio buttons ---- */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="threshold"
              value={2}
              checked={blinkingThreshold === 2}
              onChange={handleThresholdChange}
            />
            2X
          </label>

          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="threshold"
              value={1.5}
              checked={blinkingThreshold === 1.5}
              onChange={handleThresholdChange}
            />
            1.5X
          </label>

          {/* ✅ NEW OPTION */}
          <label>
            <input
              type="radio"
              name="threshold"
              value="all"
              checked={blinkingThreshold === 'all'}
              onChange={handleThresholdChange}
            />
            All
          </label>
        </div>

        {/* ---- data table ---- */}
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={cellStyle} onClick={() => handleSort('selectedTicker')}>
                Ticker{renderSortIcon('selectedTicker')}
              </th>
              <th style={cellStyle} onClick={() => handleSort('lstPrice')}>
                Price{renderSortIcon('lstPrice')}
              </th>
              <th style={cellStyle} onClick={() => handleSort('ratio')}>
                Ratio{renderSortIcon('ratio')}
              </th>
              <th style={cellStyle} onClick={() => handleSort('prediction')}>
                Trend{renderSortIcon('prediction')}
              </th>
              <th style={cellStyle} onClick={() => handleSort('callVolume')}>
                Call{renderSortIcon('callVolume')}
              </th>
              <th style={cellStyle} onClick={() => handleSort('putVolume')}>
                Put{renderSortIcon('putVolume')}
              </th>
              <th style={cellStyle} onClick={() => handleSort('timestamp')}>
                Time{renderSortIcon('timestamp')}
              </th>
            </tr>
          </thead>

          {/* Indexes */}
          {indexes.length > 0 && (
            <tbody>
              <tr>
                <td colSpan={7} style={{ fontWeight: 'bold', background: '#e3f2fd' }}>
                  Indexes
                </td>
              </tr>
              {indexes.map(renderRow)}
            </tbody>
          )}

          {/* Magnificent Seven */}
          {mag7.length > 0 && (
            <tbody>
              <tr>
                <td colSpan={7} style={{ fontWeight: 'bold', background: '#e8f5e9' }}>
                  Magnificent Seven
                </td>
              </tr>
              {mag7.map(renderRow)}
            </tbody>
          )}

          {/* Others */}
          {others.length > 0 && (
            <tbody>
              <tr>
                <td colSpan={7} style={{ fontWeight: 'bold', background: '#fff3e0' }}>
                  Other Stocks
                </td>
              </tr>
              {others.map(renderRow)}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default MagnificientSevenTable;
