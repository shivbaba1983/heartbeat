import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './CallPutBarChart.scss';

const CallPutBarChart = ({ rows,volumeOrInterest }) => {
  // Sum volumes
  const totalCallVolume = rows.reduce((sum, row) => {
    if(volumeOrInterest=== "volume")
    {
        const vol = parseInt(row.c_Volume?.replace(/,/g, '')) || 0;
        return sum + vol;
    }else{
        const vol = parseInt(row.c_Openinterest?.replace(/,/g, '')) || 0;
        return sum + vol;
    }
  }, 0);

  const totalPutVolume = rows.reduce((sum, row) => {
    //const vol = parseInt(row.p_Volume?.replace(/,/g, '')) || 0;
    if(volumeOrInterest=== "volume")
        {
            const vol = parseInt(row.p_Volume?.replace(/,/g, '')) || 0;
            return sum + vol;
        }else{
            const vol = parseInt(row.p_Openinterest?.replace(/,/g, '')) || 0;
            return sum + vol;
        }
   // return sum + vol;
  }, 0);

  const data = [
    { name: `Call ${volumeOrInterest}` , value: totalCallVolume , clssName:'call-style'},
    { name: `Put ${volumeOrInterest}`, value: totalPutVolume, clssName:'put-style' }, 
  ];

  return (
    <div style={{ width: '20%', height: 200 }}>
      <h3>Total Call vs Put {volumeOrInterest}</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CallPutBarChart;
