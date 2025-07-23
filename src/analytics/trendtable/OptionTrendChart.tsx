import React, { useEffect, useState, useMemo } from 'react';
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
import axios from 'axios';
import './OptionTrendChart.scss';
import {
  NASDAQ_TOKEN,
  DAY_CHECKER_STOCKS_LIST,
  IS_AWS_API,
  STOCKS_ASSETCLASS,
} from '@/constant/HeartbeatConstants';
import { getNasdaqOptionData } from '@/services/NasdaqDataService';

const getPrediction = (callVolume = 0, putVolume = 0) => {
  const ratio = callVolume === 0 ? Infinity : putVolume / callVolume;
  let prediction = '';

  if (ratio < 0.5) prediction = 'ExtremelyBullish';
  else if (ratio < 0.7) prediction = 'Bullish';
  else if (ratio <= 1.0) prediction = 'Neutral';
  else if (ratio <= 1.3) prediction = 'Bearish';
  else prediction = 'ExtremelyBearish';

  return { ratio: +ratio.toFixed(2), prediction };
};

const OptionTrendChart = () => {
  const [allChartData, setAllChartData] = useState<Record<string, any[]>>({});
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [volumes, setVolumes] = useState<Record<string, { call: string; put: string }>>({});
  const [showGraphs, setShowGraphs] = useState(false);

  const assetclass = STOCKS_ASSETCLASS;
  const selectedDayOrMonth = 'Month';
  const selectedDate = '2025-07-25';
  const volumeOrInterest = 'volume';

  // Sorting state: default by 'ratio' ascending
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'ratio',
    direction: 'asc',
  });

  useEffect(() => {
    const fetchAllData = async () => {
      const result: Record<string, any[]> = {};
      const volumeMap: Record<string, { call: string; put: string }> = {};

      for (const ticker of DAY_CHECKER_STOCKS_LIST) {
        try {
          let rows: any[] = [];
          let lstPrice = null;

          if (IS_AWS_API) {
            const response = await getNasdaqOptionData(ticker, assetclass, selectedDayOrMonth, selectedDate);
            const latestData = await response.json();
            rows = latestData?.data?.table?.rows || [];
            const match = latestData?.data?.lastTrade?.match(/\$([\d.]+)/);
            lstPrice = match ? parseFloat(match[1]) : 0;
          } else {
            const tempToken = import.meta.env.VITE_STOCK_API_URL;
            const res = await axios.get(`${tempToken}/api/options/${ticker}/${assetclass}/${selectedDayOrMonth}`);
            rows = res.data?.data?.table?.rows || [];
            const match = res.data?.data?.lastTrade?.match(/\$([\d.]+)/);
            lstPrice = match ? parseFloat(match[1]) : 0;
          }

          const callGroupedData: any = {};
          const putGroupedData: any = {};

          rows.forEach((row) => {
            const strike = parseFloat(row.strike);
            if (isNaN(strike)) return;

            const exp = row.expiryDate || 'Unknown';

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
          });

          const strikes = Array.from(
            new Set(rows.map(r => parseFloat(r.strike)).filter(Boolean))
          ).sort((a, b) => a - b);

          const data = strikes.map(strike => {
            const entry: any = { strike };
            Object.keys(callGroupedData).forEach(exp => {
              entry[`call_${exp}`] = callGroupedData[exp][strike] || 0;
            });
            Object.keys(putGroupedData).forEach(exp => {
              entry[`put_${exp}`] = putGroupedData[exp][strike] || 0;
            });
            return entry;
          });

          result[ticker] = data;

          const totalCall = data.reduce(
            (sum, item) => sum + Object.keys(item).filter(k => k.startsWith('call_')).reduce((s, key) => s + (item[key] || 0), 0),
            0
          );
          const totalPut = data.reduce(
            (sum, item) => sum + Object.keys(item).filter(k => k.startsWith('put_')).reduce((s, key) => s + (item[key] || 0), 0),
            0
          );

          volumeMap[ticker] = {
            call: new Intl.NumberFormat('en-IN').format(totalCall),
            put: new Intl.NumberFormat('en-IN').format(totalPut),
          };

        } catch (err) {
          console.error(`Error fetching data for ${ticker}`, err);
        }
      }

      setAllChartData(result);
      setVolumes(volumeMap);
    };

    fetchAllData();
  }, []);

  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb', '#ff0000'];

  // Prepare predictionRows with numeric values for sorting
  const predictionRows = useMemo(() => {
    return DAY_CHECKER_STOCKS_LIST.map(ticker => {
      const callNum = parseInt(volumes[ticker]?.call.replace(/,/g, '') || '0');
      const putNum = parseInt(volumes[ticker]?.put.replace(/,/g, '') || '0');
      const { ratio, prediction } = getPrediction(callNum, putNum);
      return {
        ticker,
        callVolume: volumes[ticker]?.call || '-',
        putVolume: volumes[ticker]?.put || '-',
        ratio,
        prediction,
        callNum,
        putNum,
      };
    });
  }, [volumes]);

  // Sorting logic
  const sortedRows = useMemo(() => {
    const sortableItems = [...predictionRows];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Convert strings with commas to numbers for sorting
        if (typeof aValue === 'string' && !isNaN(parseFloat(aValue.replace(/,/g, '')))) {
          aValue = parseFloat(aValue.replace(/,/g, ''));
          bValue = parseFloat(bValue.replace(/,/g, ''));
        }

        // For ticker and prediction which are strings, do case-insensitive compare
        if (typeof aValue === 'string' && sortConfig.key !== 'prediction' && sortConfig.key !== 'ticker') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [predictionRows, sortConfig]);

  // Change sort on header click
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Add arrow indicator CSS class for sorted column
  const getClassNamesFor = (name: string) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? (sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc') : undefined;
  };

  return (
    <div className="option-volume-chart">
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={showGraphs}
            onChange={(e) => setShowGraphs(e.target.checked)}
          />
          {' '}Show Graphs
        </label>
      </div>

      <div className="prediction-table">
        <h3>Prediction Summary</h3>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('ticker')} className={getClassNamesFor('ticker')}>Ticker</th>
              <th onClick={() => requestSort('callNum')} className={getClassNamesFor('callNum')}>Call Volume</th>
              <th onClick={() => requestSort('putNum')} className={getClassNamesFor('putNum')}>Put Volume</th>
              <th onClick={() => requestSort('ratio')} className={getClassNamesFor('ratio')}>Ratio</th>
              <th onClick={() => requestSort('prediction')} className={getClassNamesFor('prediction')}>Prediction</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.ticker}>
                <td>{row.ticker}</td>
                <td>{row.callVolume}</td>
                <td>{row.putVolume}</td>
                <td>{row.ratio}</td>
                <td>{row.prediction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGraphs && (
        <>
          <div className="chart-type-toggle">
            <label className={chartType === 'line' ? 'active' : ''}>
              <input type="radio" value="line" checked={chartType === 'line'} onChange={() => setChartType('line')} />
              Line Chart
            </label>
            <label className={chartType === 'bar' ? 'active' : ''}>
              <input type="radio" value="bar" checked={chartType === 'bar'} onChange={() => setChartType('bar')} />
              Bar Chart
            </label>
          </div>

          {DAY_CHECKER_STOCKS_LIST.map((ticker) => (
            <div key={ticker} className="ticker-chart">
              <h2>{ticker} Total Call {volumeOrInterest}: {volumes[ticker]?.call || '-'}</h2>
              <h2>{ticker} Total Put {volumeOrInterest}: {volumes[ticker]?.put || '-'}</h2>

              <ResponsiveContainer width="100%" height={500}>
                {chartType === 'line' ? (
                  <LineChart data={allChartData[ticker] || []}>
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="strike" type="number" domain={["auto", "auto"]} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(allChartData[ticker]?.[0] || {})
                      .filter(k => k.startsWith('call_'))
                      .map((k, idx) => (
                        <Line key={k} type="monotone" dataKey={k} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} />
                      ))}
                    {Object.keys(allChartData[ticker]?.[0] || {})
                      .filter(k => k.startsWith('put_'))
                      .map((k, idx) => (
                        <Line key={k} type="monotone" dataKey={k} stroke={colors[(idx + 3) % colors.length]} dot={false} strokeWidth={2} />
                      ))}
                  </LineChart>
                ) : (
                  <BarChart data={allChartData[ticker] || []}>
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="strike" type="number" domain={["auto", "auto"]} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(allChartData[ticker]?.[0] || {})
                      .filter(k => k.startsWith('call_'))
                      .map((k, idx) => (
                        <Bar key={k} dataKey={k} fill={colors[idx % colors.length]} />
                      ))}
                    {Object.keys(allChartData[ticker]?.[0] || {})
                      .filter(k => k.startsWith('put_'))
                      .map((k, idx) => (
                        <Bar key={k} dataKey={k} fill={colors[(idx + 3) % colors.length]} />
                      ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default OptionTrendChart;
