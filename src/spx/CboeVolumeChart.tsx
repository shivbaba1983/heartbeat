import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Papa from "papaparse";
import "./CboeVolumeChart.scss";

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F",
  "#FFBB28", "#FF8042", "#A28BE7", "#E86CA8", "#66CCCC", "#FF6666",
  "#AAAAAA", "#33CC33", "#9999FF", "#CC9933"
];

const CboeVolumeChart = () => {
  const [chartData, setChartData] = useState([]);
  const [participants, setParticipants] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;

        const dateMap = {};
        const marketSet = new Set();

        rows.forEach((row) => {
          const date = row["Day"];
          const market = row["Market Participant"];
          const volume = parseInt(row["Total Option Contracts"] || "0", 10);

          marketSet.add(market);

          if (!dateMap[date]) {
            dateMap[date] = { date };
          }
          dateMap[date][market] = volume;
        });

        const mergedData = Object.values(dateMap).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setChartData(mergedData);
        setParticipants(Array.from(marketSet));
      }
    });
  };

  return (
    <div className="cboe-volume-chart">
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {participants.map((participant, index) => (
              <Line
                key={participant}
                type="monotone"
                dataKey={participant}
                stroke={COLORS[index % COLORS.length]}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CboeVolumeChart;
