import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './CallPutBarChart.scss';

const CallPutBarChart = ({ rows, volumeOrInterest }) => {
  // Sum volumes
  const totalCallVolume = rows.reduce((sum, row) => {
    if (volumeOrInterest === "volume") {
      const vol = parseInt(row.c_Volume?.replace(/,/g, '')) || 0;
      return sum + vol;
    } else {
      const vol = parseInt(row.c_Openinterest?.replace(/,/g, '')) || 0;
      return sum + vol;
    }
  }, 0);

  const totalPutVolume = rows.reduce((sum, row) => {
    //const vol = parseInt(row.p_Volume?.replace(/,/g, '')) || 0;
    if (volumeOrInterest === "volume") {
      const vol = parseInt(row.p_Volume?.replace(/,/g, '')) || 0;
      return sum + vol;
    } else {
      const vol = parseInt(row.p_Openinterest?.replace(/,/g, '')) || 0;
      return sum + vol;
    }
    // return sum + vol;
  }, 0);

  const data = [
    { name: `Call ${volumeOrInterest}`, value: totalCallVolume, clssName: '#00C853' },
    { name: `Put ${volumeOrInterest}`, value: totalPutVolume, clssName: '#D50000' },
  ];

  return (
    <div style={{ width: '20%', height: 200 }}>
      <h3>Total Call vs Put {volumeOrInterest}</h3>
      <ResponsiveContainer>
        <BarChart data={data} >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.clssName} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CallPutBarChart;
