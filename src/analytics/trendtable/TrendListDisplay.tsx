import React, { useEffect, useState, useMemo } from 'react';
import { RSI, MACD, SMA } from 'technicalindicators';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  NASDAQ_TOKEN,
  trendTableList,
} from '@/constant/HeartbeatConstants';
import './TrendListDisplay.scss';

interface TrendRow {
  ticker: string;
  trend: 'Bullish' | 'Neutral' | 'Bearish';
  price: number;
  rsi: number;
  sma: number;
  macd: number;
  signal: number;
}

/* ------------------------------------------------------------------------- */
const TrendListDisplay: React.FC = () => {
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sort, setSort] = useState<{ key: keyof TrendRow | 'trend'; dir: 'asc' | 'desc' }>({
    key: 'trend',
    dir: 'asc',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showFutureData, setShowFutureData] = useState(false);
  /* ---------- helpers ---------- */
  const getPastDate = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

  const fetchTrend = async (ticker: string): Promise<TrendRow | null> => {
    try {
      const from = getPastDate(100);
      const res = await fetch(
        `${NASDAQ_TOKEN}/api/yahooFinanceStockData/${ticker}/${from}/1d`,
      );
      const data = await res.json();
      const recent = data.slice(-60);
      if (recent.length < 50) return null;

      const prices = recent.map((d: any) => d.close);
      const rsi = RSI.calculate({ values: prices, period: 14 }).at(-1);
      const sma = SMA.calculate({ values: prices, period: 50 }).at(-1);
      const macd = MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
      }).at(-1);

      const price = prices.at(-1);
      let trend: TrendRow['trend'] = 'Neutral';
      if (price > sma && rsi > 60 && macd?.MACD > macd?.signal) trend = 'Bullish';
      else if (price < sma && rsi < 40 && macd?.MACD < macd?.signal) trend = 'Bearish';

      return { ticker, trend, price, rsi, sma, macd: macd?.MACD, signal: macd?.signal };
    } catch (err) {
      console.error('fetchTrend', ticker, err);
      return null;
    }
  };

  /* ---------- lazy fetch on first expand ---------- */
  useEffect(() => {
    if (!isOpen || dataLoaded) return;

    (async () => {
      setLoading(true);
      const out: TrendRow[] = [];
      for (const t of trendTableList) {
        if (showFutureData) {
          const row = await fetchTrend(t);
          if (row) out.push(row);
        }
      }
      setRows(out);
      setLoading(false);
      setDataLoaded(true);
    })();
  }, [isOpen, dataLoaded]);

  /* ---------- counts for bar‑chart ---------- */
  const trendCounts = useMemo(() => {
    const initial = { Bullish: 0, Neutral: 0, Bearish: 0 };
    return rows.reduce((acc, r) => {
      acc[r.trend] += 1;
      return acc;
    }, initial);
  }, [rows]);

  const chartData = [
    { name: 'Bullish', value: trendCounts.Bullish, color: '#00c49f' },
    { name: 'Neutral', value: trendCounts.Neutral, color: '#8884d8' },
    { name: 'Bearish', value: trendCounts.Bearish, color: '#ff4d4f' },
  ];

  /* ---------- sorting ---------- */
  const compare = (a: TrendRow, b: TrendRow) => {
    const { key, dir } = sort;
    const mult = dir === 'asc' ? 1 : -1;
    if (key === 'trend')
      return (
        { Bullish: 1, Neutral: 2, Bearish: 3 }[a.trend] -
        { Bullish: 1, Neutral: 2, Bearish: 3 }[b.trend]
      ) * mult;
    if (key === 'ticker') return a.ticker.localeCompare(b.ticker) * mult;
    return ((a as any)[key] - (b as any)[key]) * mult;
  };
  const sorted = [...rows].sort(compare);

  const arrow = (k: string) =>
    sort.key === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  const onSort = (k: keyof TrendRow | 'trend') =>
    setSort((p) =>
      p.key === k ? { key: k, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' },
    );

  /* ---------- render ---------- */
  return (
    <div className="trend-list-container">
      <label>
        <input
          type="checkbox"
          checked={showFutureData}
          onChange={(e) => setShowFutureData(e.target.checked)}
        />
        {' '}Show Future Data
      </label>

      {/* heading / toggle */}
      <div className="header" onClick={() => setIsOpen((o) => !o)}>
        <h2>
          Stock Trend Summary <span className="chevron">{isOpen ? '▼' : '►'}</span>
        </h2>
        {dataLoaded && <span className="count-badge">{rows.length}</span>}
      </div>

      {isOpen && (
        loading ? (
          <div className="loading-spinner">Loading trend data…</div>
        ) : (
          <>
            {/* bar‑chart of Bullish / Neutral / Bearish counts */}
            <div style={{ width: '100%', height: 220, margin: '20px 0' }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {chartData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* table */}
            <table className="trend-table">
              <thead>
                <tr>
                  <th onClick={() => onSort('ticker')}>Ticker{arrow('ticker')}</th>
                  <th onClick={() => onSort('trend')}>Trend{arrow('trend')}</th>
                  <th onClick={() => onSort('price')}>Price{arrow('price')}</th>
                  <th onClick={() => onSort('rsi')}>RSI{arrow('rsi')}</th>
                  <th onClick={() => onSort('sma')}>SMA 50{arrow('sma')}</th>
                  <th onClick={() => onSort('macd')}>MACD Diff{arrow('macd')}</th>
                  <th onClick={() => onSort('signal')}>Signal{arrow('signal')}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.ticker} className={r.trend.toLowerCase()}>
                    <td>{r.ticker}</td>
                    <td>{r.trend}</td>
                    <td>${r.price.toFixed(2)}</td>
                    <td>{r.rsi.toFixed(2)}</td>
                    <td>{r.sma.toFixed(2)}</td>
                    <td>{r.macd.toFixed(2)}</td>
                    <td>{r.signal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      )}
    </div>
  );
};

export default TrendListDisplay;
