// src/pages/TickerChartDashboard.tsx
import React, { useEffect, useState } from 'react';
import VolumeOrOpenInterestChart from '@/analytics/expirationBarChart/VolumeOrOpenInterestChart';
import {
  LogTickerList,
  expirationDates,
  ETF_List,
} from '@/constant/HeartbeatConstants';
import { getNasdaqOptionData } from '@/services/NasdaqDataService';
import './TickerChartDashboard.scss';

/* ---------- shared types ---------- */
const today = new Date();
const futures = expirationDates.filter((d) => new Date(d) > today);

export interface Point {
  expiration: string;
  callVol: number;
  putVol: number;
  callOI: number;
  putOI: number;
  strike: string;
  callVal: number;
  putVal: number;
}

const TickerChartDashboard: React.FC = () => {
  /** UI state */
  const [selected, setSelected] = useState(LogTickerList[0]);
  const [manual, setManual] = useState('');
  const [metric, setMetric] = useState<'volume' | 'openInterest'>('volume');
  const [loading, setLoading] = useState(false);

  /** cache: ticker → rows */
  const [cache, setCache] = useState<Record<string, Point[]>>({});

  /** pick asset class for current ticker */
  const asset = ETF_List.includes(selected) ? 'ETF' : 'stocks';

  /* -------- fetch once per ticker, then reuse -------- */
  useEffect(() => {
    if (cache[selected]) return; // already fetched

    let cancelled = false;
    (async () => {
      setLoading(true);

      const rows: (Point | null)[] = await Promise.all(
        futures.map(async (iso) => {
          const ymd = iso.slice(0, 10);
          try {
            const res = await getNasdaqOptionData(selected, asset, 'day', ymd);
            const json = await res.json();
            const tbl = json?.data?.table?.rows ?? [];

            let callVol = 0,
              putVol = 0,
              callOI = 0,
              putOI = 0,
              topStrike = '',
              topSum = 0;

            tbl.forEach((r: any) => {
              if (!r.strike) return;
              const cv = +r.c_Volume || 0,
                pv = +r.p_Volume || 0,
                coi = +r.c_Openinterest || 0,
                poi = +r.p_Openinterest || 0;

              callVol += cv;
              putVol += pv;
              callOI += coi;
              putOI += poi;

              const tot = cv + pv;
              if (tot > topSum) {
                topSum = tot;
                topStrike = r.strike.replace(/\.00$/, '');
              }
            });

            return {
              expiration: ymd,
              callVol,
              putVol,
              callOI,
              putOI,
              strike: topStrike || '—',
              callVal: callVol,
              putVal: putVol,
            } as Point;
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        const clean = rows.filter(Boolean) as Point[];
        clean.sort((a, b) => (a.expiration > b.expiration ? 1 : -1));
        setCache((prev) => ({ ...prev, [selected]: clean }));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected]);

  /* -------- transform for metric toggle -------- */
  const chartData =
    cache[selected]?.map((p) => ({
      ...p,
      callVal: metric === 'volume' ? p.callVol : p.callOI,
      putVal: metric === 'volume' ? p.putVol : p.putOI,
    })) ?? [];

  /* -------- handlers -------- */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = manual.trim().toUpperCase();
    if (sym) {
      setSelected(sym);
      setManual('');
    }
  };

  const isOpenInterest = metric === 'openInterest';

  /* -------- render -------- */
  return (
    <div className="ticker-dashboard">
      {/* controls */}
      <div className="controls">
        {/* dropdown */}
        <label>
          Ticker&nbsp;
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {LogTickerList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {!LogTickerList.includes(selected) && (
              <option value={selected}>{selected}</option>
            )}
          </select>
        </label>

        {/* manual input */}
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Enter ticker"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>

        {/* switch */}
        <div className="switch-container">
          <span className={!isOpenInterest ? 'active' : ''}>Volume</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isOpenInterest}
              onChange={() =>
                setMetric((m) => (m === 'volume' ? 'openInterest' : 'volume'))
              }
            />
            <span className="slider" />
          </label>
          <span className={isOpenInterest ? 'active' : ''}>Open&nbsp;Interest</span>
        </div>
      </div>

      {/* chart */}
      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : chartData.length ? (
        <VolumeOrOpenInterestChart data={chartData} metric={metric} />
      ) : (
        <p>No data for {selected}.</p>
      )}
    </div>
  );
};

export default TickerChartDashboard;
