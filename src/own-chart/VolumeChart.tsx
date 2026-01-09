import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';
import { getTodayInEST } from './../common/nasdaq.common';

const SKIP_TICKERS = ["QQQ", "SPY", "IWM"];

const VolumeChart = ({ selectedTicker, fileName, setSelectedTicker }) => {
  const [data, setData] = useState([]);
  const [normalVolumes, setNormalVolumes] = useState([]);
  const [skipVolumes, setSkipVolumes] = useState([]);
  const [showSkipTickers, setShowSkipTickers] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    const resolvedFileName = fileName || getTodayInEST();

    const fetchOptionsData = async () => {
      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/volume/${resolvedFileName}`);
        const responseJson = await res.json();

        /* ---------- Line chart (selected ticker) ---------- */
        const formatted = responseJson
          ?.filter(item => item.selectedTicker === selectedTicker)
          ?.map(item => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            lstPrice: parseFloat(item?.lstPrice?.replace(/[^0-9.-]+/g, "")) || 0
          }));

        setData(formatted);

        /* ---------- Latest per ticker ---------- */
        const latestMap = responseJson.reduce((acc, cur) => {
          const ticker = cur.selectedTicker;

          if (
            !acc[ticker] ||
            new Date(cur.timestamp) > new Date(acc[ticker].timestamp)
          ) {
            acc[ticker] = cur;
          }
          return acc;
        }, {});

        const allLatest = Object.values(latestMap).map(item => ({
          selectedTicker: item.selectedTicker,
          callVolume: item.callVolume,
          putVolume: item.putVolume
        }));

        setNormalVolumes(
          allLatest.filter(item => !SKIP_TICKERS.includes(item.selectedTicker))
        );

        setSkipVolumes(
          allLatest.filter(item => SKIP_TICKERS.includes(item.selectedTicker))
        );

        setRefreshData(false);
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    };

    fetchOptionsData();
  }, [fileName, selectedTicker, refreshData]);

  const handleRefreshClick = () => {
    setRefreshData(true);
  };

  const handleBarDoubleClick = (data) => {
    if (data?.selectedTicker) {
      setSelectedTicker(data.selectedTicker);
    }
  };

  const numberFormatter = (value) =>
    new Intl.NumberFormat('en-IN').format(value);

  /* 🔁 Toggle dataset here */
  const barChartData = showSkipTickers ? skipVolumes : normalVolumes;

  return (
    <div>
      <h2>{selectedTicker} Options Volume Chart</h2>

      {/* ---------- Line Chart ---------- */}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" tickFormatter={numberFormatter} />
            <YAxis yAxisId="right" orientation="right" domain={['dataMin', 'dataMax']} />
            <Tooltip formatter={numberFormatter} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="callVolume" stroke="#008000" name="Call Volume" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="putVolume" stroke="#FF2C2C" name="Put Volume" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="lstPrice" stroke="#00008B" name="Last Price" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* ---------- Toggle ---------- */}
      <div style={{ marginTop: 30 }}>
        <label style={{ fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={showSkipTickers}
            onChange={() => setShowSkipTickers(prev => !prev)}
            style={{ marginRight: 8 }}
          />
          Show Index Tickers (SPY / QQQ / IWM)
        </label>
      </div>

      {/* ---------- SINGLE Bar Chart (toggled data) ---------- */}
      {barChartData.length > 0 && (
        <div style={{ marginTop: 5 }}>
          <h3>
            Latest Call / Put Volumes
            {showSkipTickers ? ' — Index Tickers' : ' — Other Tickers'}
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="selectedTicker" />
              <YAxis tickFormatter={numberFormatter} />
              <Tooltip formatter={numberFormatter} />
              <Legend />

              <Bar
                dataKey="callVolume"
                fill="#008000"
                name="Call Volume"
                onDoubleClick={(d) => handleBarDoubleClick(d.payload)}
              />
              <Bar
                dataKey="putVolume"
                fill="#FF2C2C"
                name="Put Volume"
                onDoubleClick={(d) => handleBarDoubleClick(d.payload)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <button onClick={handleRefreshClick} style={{ marginTop: 30 }}>
        Refresh Data Daily
      </button>
    </div>
  );
};

export default VolumeChart;
