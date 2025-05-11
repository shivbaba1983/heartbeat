import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from "react";
const StockChart = ({ stockHistoryData }) => {

  const rawData = [
    { date: "03/31/2025", close: "$222.13", volume: "65,299,320", open: "$217.005", high: "$225.62", low: "$216.23" },
    { date: "03/28/2025", close: "$217.90", volume: "39,818,620", open: "$221.67", high: "$223.81", low: "$217.68" },
    { date: "03/27/2025", close: "$223.85", volume: "37,094,770", open: "$221.39", high: "$224.99", low: "$220.5601" },
    { date: "03/26/2025", close: "$221.53", volume: "34,532,660", open: "$223.51", high: "$225.02", low: "$220.47" },
    { date: "03/25/2025", close: "$223.75", volume: "34,493,580", open: "$220.77", high: "$224.10", low: "$220.08" },
  ];
  const processedData = stockHistoryData
  .map(d => ({
    date: d.date,
    close: parseFloat(d.close.replace('$', '')),
    volume: parseInt(d.volume.replace(/,/g, '')),
  }))
  .reverse();

  return (
    <div style={{ width: '100%', height: 400 , marginTop:10}}>
    {stockHistoryData &&<ResponsiveContainer>
      <ComposedChart data={processedData}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="date" />
        <YAxis
          yAxisId="left"
          domain={['auto', 'auto']}
          tickFormatter={v => `$${v}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 'auto']}
          tickFormatter={v => `${(v / 1e6).toFixed(1)}M`}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'close') return [`$${value}`, 'Close'];
            if (name === 'volume') return [`${(value / 1e6).toFixed(2)}M`, 'Volume'];
            return [value, name];
          }}
        />
        <Legend />
        <Bar yAxisId="right" dataKey="volume" barSize={20} fill="#82ca9d" />
        <Line yAxisId="left" type="monotone" dataKey="close" stroke="#8884d8" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>}
  </div>
  );
};
export default StockChart;


