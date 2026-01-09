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
import { YAHOO_VOLUME_LIMIT } from './../constant/HeartbeatConstants';
import './OptionVolumeChart.scss';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const allData = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ background: '#fff', border: '1px solid #ccc', padding: '10px' }}>
        <p><strong>Strike:</strong> {label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        <p><strong>Call Last:</strong> {allData.c_Last ?? 'N/A'}</p>
        <p><strong>Put Last:</strong> {allData.p_Last ?? 'N/A'}</p>
      </div>
    );
  }
  return null;
};

const OptionVolumeChart = ({ rows, volumeOrInterest, selectedTicker, setSelectedTicker }) => {
  const [tempRowData, setTempRowData] = useState(rows);
  const [mergedChartData, setMergedChartData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [expDate, setExpDate] = useState();

  useEffect(() => {
    setTempRowData(rows);
  }, [rows]);

  useEffect(() => {
    const callGroupedData = {};
    const putGroupedData = {};
    const lastPriceMap = {};

    tempRowData.forEach((row) => {
      const strike = parseFloat(row.strike);
      if (isNaN(strike)) return;

      const exp = row.expiryDate || 'Unknown';
      setExpDate(exp);
      if (row.c_Volume != null) {
        const vol = volumeOrInterest === 'volume'
          ? parseInt(row.c_Volume.replace(/,/g, '')) || 0
          : parseInt(row.c_Openinterest.replace(/,/g, '')) || 0;
        callGroupedData[exp] = callGroupedData[exp] || {};
        callGroupedData[exp][strike] = vol;
      }

      if (row.p_Volume != null) {
        const vol = volumeOrInterest === 'volume'
          ? parseInt(row.p_Volume.replace(/,/g, '')) || 0
          : parseInt(row.p_Openinterest.replace(/,/g, '')) || 0;
        putGroupedData[exp] = putGroupedData[exp] || {};
        putGroupedData[exp][strike] = vol;
      }

      // Store latest c_Last and p_Last per strike (only first encountered or latest)
      if (!lastPriceMap[strike]) {
        lastPriceMap[strike] = {
          c_Last: row.c_Last,
          p_Last: row.p_Last,
        };
      }
    });

    const strikes = Array.from(
      new Set(tempRowData.map(r => parseFloat(r.strike)).filter(Boolean))
    ).sort((a, b) => a - b);

    const data = strikes.map(strike => {
      const entry = { strike, ...lastPriceMap[strike] };
      Object.keys(callGroupedData).forEach(exp => {
        entry[`call_${exp}`] = callGroupedData[exp][strike] || 0;
      });
      Object.keys(putGroupedData).forEach(exp => {
        entry[`put_${exp}`] = putGroupedData[exp][strike] || 0;
      });
      return entry;
    });

    const filteredData = data.filter(item => {
      let callOk = false;
      let putOk = false;

      Object.keys(item).forEach(key => {
        if (key.startsWith('call_') && item[key] > YAHOO_VOLUME_LIMIT) callOk = true;
        if (key.startsWith('put_') && item[key] > YAHOO_VOLUME_LIMIT) putOk = true;
      });

      return callOk || putOk; // change to callOk && putOk if needed
    });

    setMergedChartData(filteredData);
  }, [tempRowData, volumeOrInterest]);

  const formattedCall =
    mergedChartData.reduce(
      (sum, item) => sum + Object.keys(item)
        .filter(k => k.startsWith('call_'))
        .reduce((s, key) => s + (item[key] || 0), 0),
      0
    )

  const formattedPut =
    mergedChartData.reduce(
      (sum, item) => sum + Object.keys(item)
        .filter(k => k.startsWith('put_'))
        .reduce((s, key) => s + (item[key] || 0), 0),
      0
    )
  const callDisplay = new Intl.NumberFormat('en-IN').format(formattedCall)
  const putDisplay = new Intl.NumberFormat('en-IN').format(formattedPut)

  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb', '#ff0000'];
  const numberFormatter = (value) =>
    new Intl.NumberFormat('en-IN').format(value);

  return (
    <div className="option-volume-chart">
      {<PredictionHint
        selectedTicker={selectedTicker}
        predectionInput={[{ id: 1, callVolume: formattedCall, putVolume: formattedPut, timestamp: new Date().toLocaleString() }]}
      />}

      <h2>{`${selectedTicker} Total ${volumeOrInterest}: Call ${callDisplay}, Put ${putDisplay} ExpDate ${expDate}`}</h2>


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
            <YAxis tickFormatter={numberFormatter} />
            <Tooltip formatter={(value) => numberFormatter(value)} content={<CustomTooltip />} />
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
            <YAxis tickFormatter={numberFormatter} />
            <Tooltip formatter={(value) => numberFormatter(value)} content={<CustomTooltip />} />
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
          setSelectedTicker={setSelectedTicker}
        />
      )}
    </div>
  );
};

export default OptionVolumeChart;
