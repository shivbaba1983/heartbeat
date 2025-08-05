import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const BarGraphChart = ({ rows, selectedTicker, volumeOrInterest }) => {
  const [chartData, setChartData] = useState([]);
  const [totalCall, setTotalCall] = useState(0);
  const [totalPut, setTotalPut] = useState(0);

  useEffect(() => {
    let callSum = 0;
    let putSum = 0;

    const mergedData = rows?.map(row => {
      const callVolume = Number(volumeOrInterest === 'volume' ? row.c_Volume : row.c_Openinterest) || 0;
      const putVolume = Number(volumeOrInterest === 'volume' ? row.p_Volume : row.p_Openinterest) || 0;

      callSum += callVolume;
      putSum += putVolume;

      return {
        strike: row.strike,
        callVolume,
        putVolume,
        expiryDate: row.expiryDate,
        c_Last: row.c_Last,
        p_Last: row.p_Last
      };
    }) || [];

    setChartData(mergedData);
    setTotalCall(callSum);
    setTotalPut(putSum);
  }, [rows, volumeOrInterest]);

  const formattedCall = new Intl.NumberFormat('en-IN').format(totalCall);
  const formattedPut = new Intl.NumberFormat('en-IN').format(totalPut);

  return (
    <div className="chart-from-nasdaq-option-data">
      <h2>{`${selectedTicker} Total ${volumeOrInterest}: Call ${formattedCall}, Put ${formattedPut}`}</h2>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="strike" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="callVolume" fill="#8884d8" name="Call Volume" />
          <Bar dataKey="putVolume" fill="#ff0000" name="Put Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphChart;
