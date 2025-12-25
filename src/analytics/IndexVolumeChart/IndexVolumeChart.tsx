import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "./IndexVolumeChart.scss";

interface RawData {
  id: number;
  timestamp: string;
  callVolume: number;
  putVolume: number;
  selectedTicker: "SPY" | "IWM" | "QQQ";
  lstPrice: string;
}

interface CombinedRow {
  timestamp: string;
  timeOnly: string;
  SPY_call?: number;
  SPY_put?: number;
  IWM_call?: number;
  IWM_put?: number;
  QQQ_call?: number;
  QQQ_put?: number;
}

export const IndexVolumeChart = () => {
  const [rows, setRows] = useState<CombinedRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/IndexTickerVolume");
        const json: RawData[] = await response.json();

        const allowed = ["SPY", "IWM", "QQQ"];
        const filtered = json.filter(item => allowed.includes(item.selectedTicker));

        filtered.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const map: Record<string, CombinedRow> = {};

        for (const item of filtered) {
          if (!map[item.timestamp]) {
            map[item.timestamp] = {
              timestamp: item.timestamp,
              timeOnly: new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            };
          }

          map[item.timestamp][`${item.selectedTicker}_call`] = item.callVolume;
          map[item.timestamp][`${item.selectedTicker}_put`] = item.putVolume;
        }

        setRows(Object.values(map));
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="chart-container">
      <h2>Index CALL + PUT Volume Trend (SPY / IWM / QQQ)</h2>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timeOnly" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* === CALL VOLUMES === */}
          <Line type="monotone" dataKey="SPY_call" stroke="#007bff" name="SPY Call" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="IWM_call" stroke="#2ecc71" name="IWM Call" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="QQQ_call" stroke="#ff9800" name="QQQ Call" strokeWidth={2} dot={false} />

          {/* === PUT VOLUMES === */}
          <Line type="monotone" dataKey="SPY_put" stroke="#66b2ff" name="SPY Put" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="IWM_put" stroke="#7ee2a8" name="IWM Put" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="QQQ_put" stroke="#ffc166" name="QQQ Put" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IndexVolumeChart;


// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer
// } from "recharts";
// import "./IndexVolumeChart.scss";

// interface RawData {
//   id: number;
//   timestamp: string;
//   callVolume: number;
//   putVolume: number;
//   selectedTicker: "SPY" | "IWM" | "QQQ";
//   lstPrice: string;
// }

// interface CombinedRow {
//   timestamp: string;
//   timeOnly: string;
//   SPY_call?: number;
//   SPY_put?: number;
//   IWM_call?: number;
//   IWM_put?: number;
//   QQQ_call?: number;
//   QQQ_put?: number;
// }

// export const IndexVolumeChart = () => {
//   const [rows, setRows] = useState<CombinedRow[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const response = await fetch("http://localhost:3000/api/IndexTickerVolume");
//         const json: RawData[] = await response.json();

//         const allowed = ["SPY", "IWM", "QQQ"];

//         // filter first
//         const filtered = json.filter(item => allowed.includes(item.selectedTicker));

//         // sort
//         filtered.sort(
//           (a, b) =>
//             new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//         );

//         // create a map with timestamp as key
//         const map: Record<string, CombinedRow> = {};

//         for (const item of filtered) {
//           if (!map[item.timestamp]) {
//             map[item.timestamp] = {
//               timestamp: item.timestamp,
//               timeOnly: new Date(item.timestamp).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit"
//               })
//             };
//           }

//           map[item.timestamp][`${item.selectedTicker}_call`] = item.callVolume;
//           map[item.timestamp][`${item.selectedTicker}_put`] = item.putVolume;
//         }

//         setRows(Object.values(map));
//         setLoading(false);
//       } catch (err) {
//         console.error("Error:", err);
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="chart-container">
//       {/* ================= CALL CHART ================= */}
//       <h2>Index CALL Volume Trend (SPY / IWM / QQQ)</h2>
//       <ResponsiveContainer width="100%" height={350}>
//         <LineChart data={rows}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timeOnly" />
//           <YAxis />
//           <Tooltip />
//           <Legend />

//           <Line type="monotone" dataKey="SPY_call" stroke="#007bff" name="SPY Call" strokeWidth={2} dot={false} connectNulls />
//           <Line type="monotone" dataKey="IWM_call" stroke="#2ecc71" name="IWM Call" strokeWidth={2} dot={false} connectNulls />
//           <Line type="monotone" dataKey="QQQ_call" stroke="#ff9800" name="QQQ Call" strokeWidth={2} dot={false} connectNulls />
//         </LineChart>
//       </ResponsiveContainer>

//       {/* ================= PUT CHART ================= */}
//       <h2 style={{ marginTop: "40px" }}>Index PUT Volume Trend (SPY / IWM / QQQ)</h2>
//       <ResponsiveContainer width="100%" height={350}>
//         <LineChart data={rows}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timeOnly" />
//           <YAxis />
//           <Tooltip />
//           <Legend />

//           <Line type="monotone" dataKey="SPY_put" stroke="#66b2ff" name="SPY Put" strokeWidth={2} dot={false} connectNulls />
//           <Line type="monotone" dataKey="IWM_put" stroke="#7ee2a8" name="IWM Put" strokeWidth={2} dot={false} connectNulls />
//           <Line type="monotone" dataKey="QQQ_put" stroke="#ffc166" name="QQQ Put" strokeWidth={2} dot={false} connectNulls />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default IndexVolumeChart;
