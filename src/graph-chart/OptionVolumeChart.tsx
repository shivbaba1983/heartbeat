import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import OwnChart from '../own-chart/OwnChart';
import PredictionHint from './../components/PredictionHint';
import './OptionVolumeChart.scss';
const OptionVolumeChart = ({ rows, volumeOrInterest, selectedTicker }) => {


  const [tempRowData, setTempRowData] = useState(rows);
  const [callChartData, setCallChartData] = useState([]);

  const [putChartData, setPutChartData] = useState([]);

  useEffect(() => {
    setTempRowData(rows);
  }, [rows]);


  useEffect(() => {
    const allStrikes = [...new Set(tempRowData.map(r => parseFloat(r.strike)).filter(Boolean))].sort((a, b) => a - b);
    const tempchartData = allStrikes.map((strike) => {
      const entry = { strike };
      for (const expiry in callGroupedData) {
        const match = callGroupedData[expiry].find((item) => item.strike === strike);
        entry[expiry] = match ? match.volume : 0;
      }
      return entry;
    })
    setCallChartData(tempchartData)
  }, [tempRowData, volumeOrInterest]);

  useEffect(() => {
    const allStrikes = [...new Set(tempRowData.map(r => parseFloat(r.strike)).filter(Boolean))].sort((a, b) => a - b);
    const tempchartData = allStrikes.map((strike) => {
      const entry = { strike };
      for (const expiry in putGroupedData) {
        const match = putGroupedData[expiry].find((item) => item.strike === strike);
        entry[expiry] = match ? match.volume : 0;
      }
      return entry;
    })
    setPutChartData(tempchartData)
  }, [tempRowData, volumeOrInterest]);



  // if (!rows || rows.length === 0) return <p>No data available</p>;

  // Clean and group rows by expiryDate
  const callGroupedData = {};
  const putGroupedData = {};
  let tempc = 0;
  let tempp = 0;
  tempRowData.forEach((row) => {
    if (row.c_Volume !== null) {
      const strike = parseFloat(row.strike);
      let volume = 0;
      if (volumeOrInterest === 'volume') {
        volume = parseInt(row.c_Volume.replace(/,/g, '')) || 0;
      }
      else {
        volume = parseInt(row.c_Openinterest.replace(/,/g, '')) || 0;
      }
      const expiry = row.expiryDate || 'Unknown';
      //const bid= parseInt(row.c_Bid.replace(/,/g, '')) || 0;
      if (!callGroupedData[expiry]) callGroupedData[expiry] = [];
      callGroupedData[expiry].push({ strike, volume });
      tempc += volume
    }
    if (row.strike && row.p_Volume !== null) {
      const strike = parseFloat(row.strike);
      let volume = 0;
      if (volumeOrInterest === 'volume') {
        volume = parseInt(row.p_Volume.replace(/,/g, '')) || 0;
      }
      else {
        volume = parseInt(row.p_Openinterest.replace(/,/g, '')) || 0;
      }
      //const volume = parseInt(row.p_Openinterest.replace(/,/g, '')) || 0;
      const expiry = row.expiryDate || 'Unknown';
      //const bid= parseInt(row.c_Bid.replace(/,/g, '')) || 0;
      if (!putGroupedData[expiry]) putGroupedData[expiry] = [];
      putGroupedData[expiry].push({ strike, volume });
      tempp += volume;
    }
  });
  const formattedCall = new Intl.NumberFormat('en-IN').format(tempc);
  const formattedPut = new Intl.NumberFormat('en-IN').format(tempp);
  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb'];

  const now = new Date();
  const formatted = now.toLocaleString(); // includes date and time
  const predectionInput = [
    {
      "id": 1,
      "timestamp": formatted,
      "callVolume": tempc,
      "putVolume": tempp,
      "selectedTicker": selectedTicker
    },
  ]

  //const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb', '#FF0099','#cc0099','#ffff00'];
  // const colors = ['#000000','#000033','#000066','#000099','#0000cc','#0000ff','#003300','#003333','#003366','#003399','#0033cc','#0033ff','#006600','#006633','#006666','#006699','#0066cc','#0066ff','#009900','#009933','#009966','#009999','#0099cc','#0099ff','#00cc00','#00cc33','#00cc66','#00cc99','#00cccc','#00ccff'];
  return (
    <div>
      <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />
      <h2>{selectedTicker} {`Total call ${volumeOrInterest} is ${formattedCall}`}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={callChartData}>
          <CartesianGrid strokeDasharray="2 2" />
          <XAxis dataKey="strike" type="number" domain={['auto', 'auto']} />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(callGroupedData).map((expiry, index) => (
            <Line
              key={expiry}
              type="monotone"
              dataKey={expiry}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <h2> {selectedTicker} {`Total put ${volumeOrInterest} is ${formattedPut}`}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={putChartData}>
          <CartesianGrid strokeDasharray="2 2" />
          <XAxis dataKey="strike" type="number" domain={['auto', 'auto']} />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(putGroupedData).map((expiry, index) => (
            <Line
              key={expiry}
              type="monotone"
              dataKey={expiry}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div>
        {(volumeOrInterest === 'volume') && <OwnChart totalCallVolumeCount={tempc} totalPutVolumeCount={tempp} selectedTicker={selectedTicker} />}
      </div>
    </div>
  );
};

export default OptionVolumeChart;
