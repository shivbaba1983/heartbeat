// MagnificientSevenTable.jsx
import React, { useState } from "react";
import "./MagnificientSevenTable.scss";
import { MAG7, INDEXES } from "../constant/HeartbeatConstants";

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  cursor: "pointer",
};

const MagnificientSevenTable = ({ data, setSelectedTicker }) => {
  const [blinkingThreshold, setBlinkingThreshold] = useState(2);
  // 👉 default: ratio asc
  const [sortConfig, setSortConfig] = useState({ key: "ratio", direction: "asc" });

  /* ---------- handlers ---------- */
  const handleThresholdChange = (e) => {
    const v = e.target.value;
    setBlinkingThreshold(v === "all" ? "all" : Number(v));
  };

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const renderSortIcon = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  /* ---------- row process ---------- */
  const processRow = (r) => {
    const ratio = r.callVolume === 0 ? 0 : r.putVolume / r.callVolume;
    const prediction =
      ratio < 0.5
        ? "ExtremelyBullish"
        : ratio < 0.7
        ? "Bullish"
        : ratio <= 1
        ? "Neutral"
        : ratio <= 1.3
        ? "Bearish"
        : "ExtremelyBearish";

    const blinking =
      blinkingThreshold !== "all" &&
      r.callVolume > 0 &&
      r.putVolume > 0 &&
      r.callVolume >= blinkingThreshold * r.putVolume;

    return { ...r, ratio: +ratio.toFixed(2), prediction, blinking };
  };

  const processed = data.map(processRow);

  const sorted = [...processed].sort((a, b) => {
    const { key, direction } = sortConfig;
    const vA = a[key];
    const vB = b[key];
    let comp = 0;
    if (typeof vA === "string") comp = vA.localeCompare(vB);
    else if (typeof vA === "number") comp = vA - vB;
    return direction === "asc" ? comp : -comp;
  });

  /* ---------- renderer ---------- */
  const renderRow = (row, idx) => (
    <tr
      key={row.id || idx}
      className={`${row.prediction} ${row.blinking ? "blinking-alert" : ""}`}
      onClick={() => setSelectedTicker && setSelectedTicker(row.selectedTicker)}
    >
      <td style={cellStyle}>{row.selectedTicker}</td>
      <td style={cellStyle}>
        {row.lstPrice !== undefined && !isNaN(row.lstPrice)
          ? Number(row.lstPrice).toFixed(2)
          : "-"}
      </td>
      <td style={cellStyle}>{row.ratio}</td>
      <td style={cellStyle}>{row.prediction}</td>
      <td style={cellStyle}>{row.callVolume.toLocaleString()}</td>
      <td style={cellStyle}>{row.putVolume.toLocaleString()}</td>
      <td style={cellStyle}>{row.timestamp}</td>
    </tr>
  );

  /* ---------- grouping ---------- */
  const indexes = sorted.filter((r) => INDEXES.includes(r.selectedTicker));
  const mag7 = sorted.filter((r) => MAG7.includes(r.selectedTicker));
  const others = sorted.filter(
    (r) => !INDEXES.includes(r.selectedTicker) && !MAG7.includes(r.selectedTicker)
  );

  return (
    <div className="magnificient-seven-section">
      <div className="sentimate-seven-history-data">
        {/* threshold radios */}
        <div style={{ marginBottom: 10 }}>
          {[
            { v: 2, label: "2X" },
            { v: 1.5, label: "1.5X" },
            { v: "all", label: "All" },
          ].map(({ v, label }) => (
            <label key={v} style={{ marginRight: 14 }}>
              <input
                type="radio"
                name="th"
                value={v}
                checked={blinkingThreshold === v}
                onChange={handleThresholdChange}
              />
              {label}
            </label>
          ))}
        </div>

        {/* table */}
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={cellStyle} onClick={() => handleSort("selectedTicker")}>
                Ticker{renderSortIcon("selectedTicker")}
              </th>
              <th style={cellStyle} onClick={() => handleSort("lstPrice")}>
                Price{renderSortIcon("lstPrice")}
              </th>
              <th style={cellStyle} onClick={() => handleSort("ratio")}>
                Ratio{renderSortIcon("ratio")}
              </th>
              <th style={cellStyle} onClick={() => handleSort("prediction")}>
                Trend{renderSortIcon("prediction")}
              </th>
              <th style={cellStyle} onClick={() => handleSort("callVolume")}>
                Call{renderSortIcon("callVolume")}
              </th>
              <th style={cellStyle} onClick={() => handleSort("putVolume")}>
                Put{renderSortIcon("putVolume")}
              </th>
              <th style={cellStyle} onClick={() => handleSort("timestamp")}>
                Time{renderSortIcon("timestamp")}
              </th>
            </tr>
          </thead>

          {indexes.length > 0 && (
            <tbody>
              <tr>
                <td colSpan={7} style={{ fontWeight: "bold", background: "#e3f2fd" }}>
                  Indexes
                </td>
              </tr>
              {indexes.map(renderRow)}
            </tbody>
          )}

          {mag7.length > 0 && (
            <tbody>
              <tr>
                <td colSpan={7} style={{ fontWeight: "bold", background: "#e8f5e9" }}>
                  Magnificent Seven
                </td>
              </tr>
              {mag7.map(renderRow)}
            </tbody>
          )}

          {others.length > 0 && (
            <tbody>
              <tr>
                <td colSpan={7} style={{ fontWeight: "bold", background: "#fff3e0" }}>
                  Other Stocks
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
