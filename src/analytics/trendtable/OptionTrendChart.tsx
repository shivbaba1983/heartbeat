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
import { getComingFriday } from './../../common/nasdaq.common';
import { getNasdaqOptionData } from '@/services/NasdaqDataService';

const ALL_TICKERS = DAY_CHECKER_STOCKS_LIST;// ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];

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
  const [availableTickers, setAvailableTickers] = useState<string[]>(ALL_TICKERS);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  const [rawRowsMap, setRawRowsMap] = useState<Record<string, any[]>>({});
  const [allChartData, setAllChartData] = useState<Record<string, any[]>>({});
  const [volumes, setVolumes] = useState<Record<string, { call: string; put: string; lastPrice: number }>>({});
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const [showGraphs, setShowGraphs] = useState(false);
  const [showOptionPrediction, setShowOptionPrediction] = useState(false);
  const [volumeOrInterest, setVolumeOrInterest] = useState<'volume' | 'openInterest'>('volume');
  const [selectedDayOrMonth, setSelectedDayOrMonth] = useState<'Day' | 'Month'>('Day');

  const selectedDate = getComingFriday();
  const assetclass = STOCKS_ASSETCLASS;

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'ratio',
    direction: 'asc',
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const rawData: Record<string, any[]> = {};
      const volumeMap: Record<string, { call: string; put: string; lastPrice: number }> = {};

      for (const ticker of selectedTickers) {
        try {
          let rows: any[] = [];
          let lastPrice = 0;

          if (IS_AWS_API) {
            const response = await getNasdaqOptionData(ticker, assetclass, selectedDayOrMonth, selectedDate);
            const latestData = await response.json();
            rows = latestData?.data?.table?.rows || [];

            let highestVolume = 0;
            let optionLastPrice = 0;
            rows.forEach(row => {
              const cVolume = parseInt(row.c_Volume?.replace(/,/g, '') || '0');
              const pVolume = parseInt(row.p_Volume?.replace(/,/g, '') || '0');
              const cLast = parseFloat(row.c_Last || '0');
              const pLast = parseFloat(row.p_Last || '0');
              if (cVolume > highestVolume && !isNaN(cLast)) {
                highestVolume = cVolume;
                optionLastPrice = cLast;
              }
              if (pVolume > highestVolume && !isNaN(pLast)) {
                highestVolume = pVolume;
                optionLastPrice = pLast;
              }
            });
            lastPrice = optionLastPrice;
          } else {
            const res = await axios.get(`${NASDAQ_TOKEN}/api/options/${ticker}/${assetclass}/${selectedDayOrMonth}`);
            rows = res.data?.data?.table?.rows || [];
            const match = res.data?.data?.lastTrade?.match(/\$([\d.]+)/);
            lastPrice = match ? parseFloat(match[1]) : 0;
          }

          rawData[ticker] = rows;
          volumeMap[ticker] = { call: '0', put: '0', lastPrice };
        } catch (err) {
          console.error(`Error fetching data for ${ticker}`, err);
        }
      }

      setRawRowsMap(rawData);
      setVolumes(volumeMap);
    };

    if (showOptionPrediction && selectedTickers.length > 0) {
      fetchData();
    }
  }, [showOptionPrediction, selectedDayOrMonth, selectedTickers]);

  // Process chart data
  useEffect(() => {
    const result: Record<string, any[]> = {};
    const volumeMap: Record<string, { call: string; put: string; lastPrice: number }> = { ...volumes };

    for (const ticker of selectedTickers) {
      const rows = rawRowsMap[ticker] || [];
      const callGrouped: any = {};
      const putGrouped: any = {};
      const strikeSet = new Set<number>();

      const cKey = volumeOrInterest === 'volume' ? 'c_Volume' : 'c_Openinterest';
      const pKey = volumeOrInterest === 'volume' ? 'p_Volume' : 'p_Openinterest';

      rows.forEach((row) => {
        const strike = parseFloat(row.strike);
        if (isNaN(strike)) return;
        const exp = row.expiryDate || 'Unknown';
        const cVal = parseInt(row[cKey]?.replace(/,/g, '') || '0');
        const pVal = parseInt(row[pKey]?.replace(/,/g, '') || '0');
        strikeSet.add(strike);

        if (!isNaN(cVal)) {
          callGrouped[exp] = callGrouped[exp] || {};
          callGrouped[exp][strike] = cVal;
        }
        if (!isNaN(pVal)) {
          putGrouped[exp] = putGrouped[exp] || {};
          putGrouped[exp][strike] = pVal;
        }
      });

      const strikes = Array.from(strikeSet).sort((a, b) => a - b);
      const chartData = strikes.map(strike => {
        const entry: any = { strike };
        Object.keys(callGrouped).forEach(exp => {
          entry[`call_${exp}`] = callGrouped[exp][strike] || 0;
          const row = rows.find(r => parseFloat(r.strike) === strike && r.expiryDate === exp);
          entry[`cLast_${exp}`] = row ? parseFloat(row.c_Last || '0') : null;
        });
        Object.keys(putGrouped).forEach(exp => {
          entry[`put_${exp}`] = putGrouped[exp][strike] || 0;
          const row = rows.find(r => parseFloat(r.strike) === strike && r.expiryDate === exp);
          entry[`pLast_${exp}`] = row ? parseFloat(row.p_Last || '0') : null;
        });
        return entry;
      });

      result[ticker] = chartData;

      const totalCall = chartData.reduce((sum, item) =>
        sum + Object.keys(item).filter(k => k.startsWith('call_')).reduce((s, k) => s + (item[k] || 0), 0), 0);
      const totalPut = chartData.reduce((sum, item) =>
        sum + Object.keys(item).filter(k => k.startsWith('put_')).reduce((s, k) => s + (item[k] || 0), 0), 0);

      volumeMap[ticker] = {
        ...volumeMap[ticker],
        call: new Intl.NumberFormat('en-IN').format(totalCall),
        put: new Intl.NumberFormat('en-IN').format(totalPut),
      };
    }

    setAllChartData(result);
    setVolumes(volumeMap);
  }, [volumeOrInterest, rawRowsMap]);

  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ff6384', '#36a2eb', '#ff0000'];

  const predictionRows = useMemo(() => {
    return selectedTickers.map(ticker => {
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
  }, [volumes, selectedTickers]);

  const sortedRows = useMemo(() => {
    const sortableItems = [...predictionRows];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (typeof aValue === 'string' && !isNaN(parseFloat(aValue.replace(/,/g, '')))) {
          aValue = parseFloat(aValue.replace(/,/g, ''));
          bValue = parseFloat(bValue.replace(/,/g, ''));
        }
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [predictionRows, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name: string) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? (sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc') : undefined;
  };
  const [selectAll, setSelectAll] = useState<boolean>(false);
  // Handle select all toggle
  const handleSelectAll = () => {
    if (!selectAll) {
      // Select all
      setSelectedTickers([...availableTickers]);
    } else {
      // Clear all
      setSelectedTickers([]);
    }
    setSelectAll(!selectAll);
  };

  // Toggle single ticker
  // const toggleTicker = (ticker: string) => {
  //   if (selectedTickers.includes(ticker)) {
  //     setSelectedTickers(selectedTickers.filter(t => t !== ticker));
  //   } else {
  //     setSelectedTickers([...selectedTickers, ticker]);
  //   }
  // };
  return (
    <div className="option-volume-chart">
      {/* Dual list selector */}
      <div className="ticker-selector">

        <div className="list-box">
          <div className="select-all">
            <label>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              Select All
            </label>
          </div>

          {availableTickers.map(t => (
            <div key={t} className="list-item">
              {t}
              <button onClick={() => {
                setAvailableTickers(prev => prev.filter(x => x !== t));
                setSelectedTickers(prev => [...prev, t]);
              }}> + </button>
            </div>
          ))}
        </div>
        <div className="list-box">
          <h4>Selected</h4>
          {selectedTickers.map(t => (
            <div key={t} className="list-item">
              <button onClick={() => {
                setSelectedTickers(prev => prev.filter(x => x !== t));
                setAvailableTickers(prev => [...prev, t]);
              }}> - </button>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* <div className="ticker-selection">
        <div className="available-tickers">
          <div className="select-all">
            <label>
              <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              Select All
            </label>
          </div>
          {availableTickers.map(ticker => (
            <div key={ticker} className="ticker-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedTickers.includes(ticker)}
                  onChange={() => toggleTicker(ticker)}
                />
                {ticker}
              </label>
            </div>
          ))}
        </div>
        <div className="selected-tickers">
          <h4>Selected Tickers</h4>
          {selectedTickers.length === 0 && <p>No tickers selected</p>}
          {selectedTickers.map(ticker => (
            <span key={ticker} className="ticker-tag">{ticker}</span>
          ))}
        </div>
      </div> */}

      {/* Controls */}
      <div className="controls">
        <label>
          <input type="checkbox" checked={showOptionPrediction} onChange={(e) => setShowOptionPrediction(e.target.checked)} /> Show Prediction
        </label>
        <label>
          <input type="checkbox" checked={showGraphs} onChange={(e) => setShowGraphs(e.target.checked)} /> Show Graphs
        </label>
        <label>
          <input type="radio" name="volumeOrInterest" value="volume" checked={volumeOrInterest === 'volume'} onChange={() => setVolumeOrInterest('volume')} /> Volume
        </label>
        <label>
          <input type="radio" name="volumeOrInterest" value="openInterest" checked={volumeOrInterest === 'openInterest'} onChange={() => setVolumeOrInterest('openInterest')} /> Open Interest
        </label>
        <label>
          <input type="radio" name="dayOrMonth" value="Day" checked={selectedDayOrMonth === 'Day'} onChange={() => setSelectedDayOrMonth('Day')} /> Day
        </label>
        <label>
          <input type="radio" name="dayOrMonth" value="Month" checked={selectedDayOrMonth === 'Month'} onChange={() => setSelectedDayOrMonth('Month')} /> Month
        </label>
        <label>
          <input type="radio" name="chartType" value="line" checked={chartType === 'line'} onChange={() => setChartType('line')} /> Line
        </label>
        <label>
          <input type="radio" name="chartType" value="bar" checked={chartType === 'bar'} onChange={() => setChartType('bar')} /> Bar
        </label>
      </div>

      {/* Prediction table */}
      {showOptionPrediction && (
        <div className="prediction-table">
          <h3>Prediction Summary</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => requestSort('ticker')} className={getClassNamesFor('ticker')}>Ticker</th>
                  <th onClick={() => requestSort('callNum')} className={getClassNamesFor('callNum')}>Call {volumeOrInterest}</th>
                  <th onClick={() => requestSort('putNum')} className={getClassNamesFor('putNum')}>Put {volumeOrInterest}</th>
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
        </div>
      )}

      {/* Graphs */}
      {showGraphs && selectedTickers.map((ticker) => (
        <div key={ticker} className="ticker-chart">
          <h2>{ticker} Total Call {volumeOrInterest}: {volumes[ticker]?.call || '-'} | Total Put {volumeOrInterest}: {volumes[ticker]?.put || '-'} | Last Price: {volumes[ticker]?.lastPrice || '-'}</h2>
          <ResponsiveContainer width="100%" height={500}>
            {chartType === 'line' ? (
              <LineChart data={allChartData[ticker] || []}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="strike" type="number" domain={["auto", "auto"]} />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('call_')).map((k, idx) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} />
                ))}
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('cLast_')).map((k, idx) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} />
                ))}
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('put_')).map((k, idx) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={colors[(idx + 3) % colors.length]} dot={false} strokeWidth={2} />
                ))}
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('pLast')).map((k, idx) => (
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
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('call_')).map((k, idx) => (
                  <Bar key={k} dataKey={k} fill={colors[idx % colors.length]} />
                ))}
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('cLast')).map((k, idx) => (
                  <Bar key={k} dataKey={k} fill={colors[idx % colors.length]} />
                ))}
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('put_')).map((k, idx) => (
                  <Bar key={k} dataKey={k} fill={colors[(idx + 3) % colors.length]} />
                ))}
                {Object.keys(allChartData[ticker]?.[0] || {}).filter(k => k.startsWith('pLast')).map((k, idx) => (
                  <Bar key={k} dataKey={k} fill={colors[(idx + 3) % colors.length]} />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default OptionTrendChart;
