import React, { useState, useEffect, useMemo } from "react";
import "./ExtremeBullishClassification.scss";
import { MAG7, INDEXES, LogTickerList } from "../constant/HeartbeatConstants";

const BUCKET = "https://anil-w-bucket.s3.amazonaws.com";

// Build newest‑first “YYYY‑MM‑DD” list of *trading* days until we’ve
// either hit `want` days or gone back 30 calendar days (safety stop).
// return newest‑first array of "YYYY‑MM‑DD" in America/New_York zone
const getTradingDates = (want) => {
  const list = [];
  const now = new Date();

  // "now" expressed in Eastern Time
  const estNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  let cursor = estNow;
  let safety = 0;

  while (list.length < want && safety < 40) {      // safety cap
    const dow = cursor.getDay();                   // 0 Sun, 6 Sat
    if (dow !== 0 && dow !== 6) {
      list.push(cursor.toISOString().slice(0, 10));
    }
    cursor = new Date(cursor);                     // clone
    cursor.setDate(cursor.getDate() - 1);          // step back 1 day
    safety++;
  }
  return list;                                     // newest first
};


// Is call ≥ 2× put and both > 0 ?
const isExtreme = (c, p) => c > 0 && p > 0 && c >= 2 * p;

const ExtremeBullishClassification = () => {
  // UI state (radios)
  const [tickerSet, setTickerSet] = useState("all");
  const [lookbackDays, setLookbackDays] = useState(2); // trading days
  // data state
  const [dayMaps, setDayMaps] = useState([]); // array of Map<ticker,rec>
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Which tickers are in scope right now
  const selectedTickers = useMemo(() => {
    if (tickerSet === "indices") return INDEXES;
    if (tickerSet === "stocks") return MAG7;
    return LogTickerList;
  }, [tickerSet]);

  // ───────── fetch logic ─────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const targetDates = getTradingDates(lookbackDays);
        const maps = [];

        for (const d of targetDates) {
          try {
            const res = await fetch(`${BUCKET}/${d}.json`);
            if (!res.ok) continue; // file missing, skip
            const json = await res.json();

            // keep latest record per ticker for that day
            const m = new Map();
            json.forEach((r) => {
              if (!selectedTickers.includes(r.selectedTicker)) return;
              const prev = m.get(r.selectedTicker);
              if (!prev || new Date(r.timestamp) > new Date(prev.date)) {
                m.set(r.selectedTicker, {
                  call: r.callVolume,
                  put: r.putVolume,
                  date: r.timestamp,
                });
              }
            });
            if (m.size) maps.push(m);
          } catch (err) {
            // network error, log and continue
            console.warn("Fetch error for", d, err);
            setFetchError("Some files could not be loaded (see console).");
          }
        }

        setDayMaps(maps); // may be 1, 2, … ≤ lookbackDays
      } finally {
        setLoading(false);
      }
    })();
  }, [lookbackDays, selectedTickers]);

  // ───────── analytics to table rows ─────────
  const tableRows = useMemo(() => {
    if (dayMaps.length === 0) return [];

    // Always use the *latest* available day as “today”
    const todayMap = dayMaps[0];
    const prevMap = dayMaps[1]; // may be undefined

    const rows = [];

    todayMap.forEach((todayRec, ticker) => {
      // With ≥2 days check streak, else report extreme for the single day.
      if (dayMaps.length >= 2) {
        const y = prevMap.get(ticker);
        if (y && isExtreme(todayRec.call, todayRec.put) && isExtreme(y.call, y.put)) {
          rows.push({
            ticker,
            todayRatio: +(todayRec.call / todayRec.put).toFixed(2),
            prevRatio: +(y.call / y.put).toFixed(2),
          });
        }
      } else {
        // Only one day available → show if extreme today
        if (isExtreme(todayRec.call, todayRec.put)) {
          rows.push({
            ticker,
            todayRatio: +(todayRec.call / todayRec.put).toFixed(2),
            prevRatio: "-",
          });
        }
      }
    });

    return rows.sort((a, b) => b.todayRatio - a.todayRatio);
  }, [dayMaps]);

  // ───────── render ─────────
  return (
    <div className="extreme-bullish-classification">
      {/* ticker‑set radios */}
      <div className="sentiment-radio-options">
        {["all", "indices", "stocks"].map((v) => (
          <label key={v}>
            <input
              type="radio"
              name="set"
              value={v}
              checked={tickerSet === v}
              onChange={() => setTickerSet(v)}
            />
            {v === "all" ? "All" : v === "indices" ? "Only Indices" : "MAG7"}
          </label>
        ))}
      </div>

      {/* look‑back radios */}
      <div className="sentiment-radio-options">
        {[2, 3, 7].map((d) => (
          <label key={d}>
            <input
              type="radio"
              name="days"
              value={d}
              checked={lookbackDays === d}
              onChange={() => setLookbackDays(d)}
            />
            Last {d} trading days
          </label>
        ))}
      </div>

      {/* status / error */}
      {loading && <p className="info-line">Loading…</p>}
      {!loading && (
        <p className="info-line">
          Available days: {dayMaps.length} of requested {lookbackDays}
        </p>
      )}
      {fetchError && <p className="error-line">{fetchError}</p>}

      {/* headline + table */}
      <h3 className="bullish-headline">
        Extremely Bullish {dayMaps.length >= 2 ? "Streak" : "Today"} (EST)
      </h3>

      {tableRows.length === 0 ? (
        <p>No tickers meet criteria.</p>
      ) : (
        <table className="bullish-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Today Call/Put</th>
              <th>
                {dayMaps.length >= 2 ? "Prev Day Call/Put" : "—"}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
              <tr key={r.ticker}>
                <td>{r.ticker}</td>
                <td>{r.todayRatio}</td>
                <td>{r.prevRatio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExtremeBullishClassification;
