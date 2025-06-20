import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  const [mergedChartData, setMergedChartData] = useState([]);
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'

  useEffect(() => {
    setTempRowData(rows);
  }, [rows]);

  useEffect(() => {
    const callGroupedData = {};
    const putGroupedData = {};

    tempRowData.forEach((row) => {
      const strike = parseFloat(row.strike);
      if (isNaN(strike)) return;

      if (row.c_Volume != null) {
        const vol = volumeOrInterest === 'volume'
          ? parseInt(row.c_Volume.replace(/,/g, '')) || 0
          : parseInt(row.c_Openinterest.replace(/,/g, '')) || 0;
        const exp = row.expiryDate || 'Unknown';
        callGroupedData[exp] = callGroupedData[exp] || {};
        callGroupedData[exp][strike] = vol;
      }
      if (row.p_Volume != null) {
        const vol = volumeOrInterest === 'volume'
          ? parseInt(row.p_Volume.replace(/,/g, '')) || 0
          : parseInt(row.p_Openinterest.replace(/,/g, '')) || 0;
        const exp = row.expiryDate || 'Unknown';
        putGroupedData[exp] = putGroupedData[exp] || {};
        putGroupedData[exp][strike] = vol;
      }
    });

    const strikes = Array.from(
      new Set(tempRowData.map(r => parseFloat(r.strike)).filter(Boolean))
    ).sort((a, b) => a - b);

    const data = strikes.map(strike => {
      const entry = { strike };
      Object.keys(callGroupedData).forEach(exp => {
        entry[`call_${exp}`] = callGroupedData[exp][strike] || 0;
      });
      Object.keys(putGroupedData).forEach(exp => {
        entry[`put_${exp}`] = putGroupedData[exp][strike] || 0;
      });
      return entry;
    });

    setMergedChartData(data);
  }, [tempRowData, volumeOrInterest]);

  const formattedCall = new Intl.NumberFormat('en-IN').format(
    mergedChartData.reduce(
      (sum, item) => sum + Object.keys(item)
        .filter(k => k.startsWith('call_'))
        .reduce((s, key) => s + (item[key] || 0), 0),
      0
    )
  );
  const formattedPut = new Intl.NumberFormat('en-IN').format(
    mergedChartData.reduce(
      (sum, item) => sum + Object.keys(item)
        .filter(k => k.startsWith('put_'))
        .reduce((s, key) => s + (item[key] || 0), 0),
      0
    )
  );

  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb', '#ff0000'];

  return (
    <div className="option-volume-chart">
      <PredictionHint
        selectedTicker={selectedTicker}
        predectionInput={[{ id: 1, callVolume: formattedCall, putVolume: formattedPut, timestamp: new Date().toLocaleString() }]}
      />

      <h2>{`${selectedTicker} Total Call ${volumeOrInterest}: ${formattedCall}`}</h2>
      <h2>{`${selectedTicker} Total Put ${volumeOrInterest}: ${formattedPut}`}</h2>

      {/* Chart Type Toggle */}
      <div className="chart-type-toggle">
        <label className={chartType === 'line' ? 'active' : ''}>
          <input
            type="radio"
            name="chartType"
            value="line"
            checked={chartType === 'line'}
            onChange={() => setChartType('line')}
          />
          Line Chart
        </label>
        <label className={chartType === 'bar' ? 'active' : ''}>
          <input
            type="radio"
            name="chartType"
            value="bar"
            checked={chartType === 'bar'}
            onChange={() => setChartType('bar')}
          />
          Bar Chart
        </label>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        {chartType === 'line' ? (
          <LineChart data={mergedChartData}>
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis dataKey="strike" type="number" domain={["auto", "auto"]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(mergedChartData[0] || {})
              .filter(key => key.startsWith('call_'))
              .map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={`${key.replace('call_', '')} Call`}
                />
              ))}
            {Object.keys(mergedChartData[0] || {})
              .filter(key => key.startsWith('put_'))
              .map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[(idx + 3) % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={`${key.replace('put_', '')} Put`}
                />
              ))}
          </LineChart>
        ) : (
          <BarChart data={mergedChartData}>
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis dataKey="strike" type="number" domain={["auto", "auto"]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(mergedChartData[0] || {})
              .filter(key => key.startsWith('call_'))
              .map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[idx % colors.length]}
                  name={`${key.replace('call_', '')} Call`}
                />
              ))}
            {Object.keys(mergedChartData[0] || {})
              .filter(key => key.startsWith('put_'))
              .map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[(idx + 3) % colors.length]}
                  name={`${key.replace('put_', '')} Put`}
                />
              ))}
          </BarChart>
        )}
      </ResponsiveContainer>

      {volumeOrInterest === 'volume' && (
        <OwnChart
          totalCallVolumeCount={formattedCall}
          totalPutVolumeCount={formattedPut}
          selectedTicker={selectedTicker}
        />
      )}
    </div>
  );
};

export default OptionVolumeChart;