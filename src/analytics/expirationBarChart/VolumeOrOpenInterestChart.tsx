import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import './VolumeOrOpenInterestChart.scss';

const VolumeOrOpenInterestChart = ({ data, metric }) => {
  const isVolume = metric === 'volume';

  return (
    <ResponsiveContainer width="100%" height={480}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* Use strike price on x-axis */}
        <XAxis dataKey="strike" />
        <YAxis domain={[0, 'auto']} />
        <Tooltip
          formatter={(value: number, key: string) => {
            if (key === 'callVal') return [value, 'Call'];
            if (key === 'putVal') return [value, 'Put'];
            return [value, key];
          }}
          // Show expiration date in tooltip label
          labelFormatter={(label: string, payload: any) => {
            const expiration = payload?.[0]?.payload?.expiration ?? '';
            return `Strike: ${label}\nExpiration: ${expiration}`;
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="callVal" name="Call" fill="#00c49f" />
        <Bar dataKey="putVal" name="Put" fill="#ff4d4f" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeOrOpenInterestChart;
