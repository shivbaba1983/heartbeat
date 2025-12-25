import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import "./QuarterlyOpenInterestTable.scss";

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

interface QuarterlyOpenInterestTableProps {
  data: Record<string, HistoryData>;
}

const QuarterlyOpenInterestTable: React.FC<QuarterlyOpenInterestTableProps> = ({
  data,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // === NEW: Color per expiry (for graph + table)
  const getColorForExpiry = (expiry: string): string => {
    let hash = 0;
    for (let i = 0; i < expiry.length; i++)
      hash = expiry.charCodeAt(i) + ((hash << 5) - hash);
    const hue = hash % 360;
    return `hsla(${hue}, 70%, 60%, 0.85)`;
  };

  // Flatten rows
  const rows = useMemo(() => {
    const allRows: any[] = [];

    Object.entries(data).forEach(([ticker, history]) => {
      const dates = Object.keys(history).sort((a, b) => (a > b ? -1 : 1));
      if (dates.length === 0) return;
      const latestDate = dates[0];

      history[latestDate].forEach((opt) => {
        if (opt.openInterest > 0) {
          allRows.push({
            ticker,
            date: latestDate,
            expiry: opt.expiry,
            strike: opt.strike,
            openInterest: opt.openInterest,
            lastPrice: opt?.lastPrice || 0,
            type: opt.type,
          });
        }
      });
    });

    return allRows;
  }, [data]);

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    const sorted = [...rows].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // === GRAPH: show ALL DATA (NO grouping)
  const chartData = sortedRows;

  // === TABLE: group by expiry exactly like before
  const groupedByExpiry = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedRows.forEach((row) => {
      if (!groups[row.expiry]) groups[row.expiry] = [];
      groups[row.expiry].push(row);
    });
    return groups;
  }, [sortedRows]);

  const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const row = payload[0].payload; // full row object

  return (
    <div
      style={{
        background: "#fff",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <div><b>Expiry:</b> {row.expiry}</div>
      <div>----</div>
      <div><b>Strike:</b> {row.strike}</div>
      <div><b>Open Interest:</b> {row.openInterest.toLocaleString()}</div>
      <div><b>Last Price:</b> {row.lastPrice}</div>
    </div>
  );
};

  return (
    <div className="qoi-table-container">
      <h3>{Object.keys(data)[0]} - Open Interest Analysis (All Rows)</h3>

      {/* ===== BAR CHART WITH COLOR-PER-EXPIRY ===== */}
      <div className="qoi-chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="strike"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />

            <YAxis
              tickFormatter={(v) => (v >= 1000 ? Math.round(v / 1000) + "K" : v)}
            />

          <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="openInterest">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForExpiry(entry.expiry)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== TABLE (UNCHANGED GROUPING) ===== */}
      <table className="qoi-table">
        <thead>
          <tr>
            {["Ticker", "Expiry", "Strike", "lastPrice", "Open Interest"].map(
              (header) => (
                <th
                  key={header}
                  onClick={() =>
                    handleSort(header.replace(" ", "").toLowerCase())
                  }
                  className={
                    sortConfig?.key === header.replace(" ", "").toLowerCase()
                      ? "active"
                      : ""
                  }
                >
                  {header}
                  {sortConfig?.key ===
                    header.replace(" ", "").toLowerCase() && (
                    <span>
                      {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {Object.entries(groupedByExpiry).map(([expiry, groupRows]) => (
            <React.Fragment key={expiry}>
              {groupRows.map((row, idx) => (
                <tr key={`${expiry}-${idx}`}>
                  <td>{row.ticker}</td>

                  <td>
                    <b style={{ color: getColorForExpiry(expiry) }}>
                      {row.expiry}
                    </b>
                  </td>

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
