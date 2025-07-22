// src/pages/SequentialTickerCharts.tsx
import React, { useEffect, useRef, useState } from 'react';
import VolumeOrOpenInterestChart from './VolumeOrOpenInterestChart';
import { LogTickerList, expirationDates } from './../../constant/HeartbeatConstants';

import { getNasdaqOptionData } from '@/services/NasdaqDataService';

type Point = {
  expiration: string;
  callVol: number;
  putVol: number;
  callOI: number;
  putOI: number;
  strike: string;
};

export default function SequentialTickerCharts() {
  /* ----------------------------- ui state ----------------------------- */
  const [metric, setMetric] = useState<'volume' | 'openInterest'>('volume');
  const [dataByTicker, setDataByTicker] = useState<Record<string, Point[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  /* -------------------- keep track of what we fetched ----------------- */
  const fetched = useRef<Set<string>>(new Set());

  /* --------------------------- sequential fetch ------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      for (const ticker of LogTickerList) {
        if (cancelled) break;
        if (fetched.current.has(ticker)) continue;           // already done

        setLoading(ticker);

        const today = new Date();
        const future = expirationDates.filter(d => new Date(d) > today);

        const points: Point[] = [];

        for (const iso of future) {                         // sequential dates
          const ymd = iso.slice(0, 10);
          try {
            const res  = await getNasdaqOptionData(ticker, 'stocks', 'day', ymd);
            const json = await res.json();
            const rows = json?.data?.table?.rows ?? [];

            let callVol = 0, putVol = 0, callOI = 0, putOI = 0,
                topStrike = '', topSum = 0;

            rows.forEach((r: any) => {
              if (!r.strike) return;
              const cv  = +r.c_Volume || 0;
              const pv  = +r.p_Volume || 0;
              const coi = +r.c_Openinterest || 0;
              const poi = +r.p_Openinterest || 0;

              callVol += cv; putVol += pv; callOI += coi; putOI += poi;

              const tot = cv + pv;
              if (tot > topSum) { topSum = tot; topStrike = r.strike.replace(/\.00$/, ''); }
            });

            points.push({ expiration: ymd, callVol, putVol, callOI, putOI, strike: topStrike || '—' });
          } catch (err) {
            console.error(`❌ ${ticker}@${ymd}`, err);
          }
        }

        points.sort((a, b) => (a.expiration > b.expiration ? 1 : -1));

        if (!cancelled) {
          fetched.current.add(ticker);
          setDataByTicker(prev => ({ ...prev, [ticker]: points }));
        }
      }
      if (!cancelled) setLoading(null);
    }

    fetchAll();
    return () => { cancelled = true; };                     // cleanup on unmount
  }, []);                                                   // run only once

  /* ------------------------------ render ------------------------------- */
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <label style={{ display: 'block', margin: '1rem 0' }}>
        <input
          type="checkbox"
          checked={metric === 'openInterest'}
          onChange={() => setMetric(m => (m === 'volume' ? 'openInterest' : 'volume'))}
        />{' '}
        Show Open Interest
      </label>

      {loading && <p>Loading {loading} …</p>}

      {LogTickerList.map(tkr => (
        <div key={tkr} style={{ marginBottom: '4rem' }}>
          <h3 style={{ textAlign: 'center' }}>{tkr}</h3>

          {dataByTicker[tkr] ? (
            <VolumeOrOpenInterestChart
              ticker={tkr}
              data={dataByTicker[tkr]}
              metric={metric}
            />
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>waiting…</p>
          )}
        </div>
      ))}
    </div>
  );
}
