import React, { useEffect, useState } from "react";
import { RSI, MACD, SMA } from "technicalindicators";
import { NASDAQ_TOKEN, trendTableList } from "../constant/HeartbeatConstants";
import "./TrendListDisplay.scss";

const TrendListDisplay = () => {
  /** ---------- STATE ---------- */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // { key: 'price' | 'rsi' | 'macd' | 'trend' | 'ticker' | 'sma', direction: 'asc' | 'desc' }
  const [sortConfig, setSortConfig] = useState({ key: "trend", direction: "asc" });

  /** ---------- HELPERS ---------- */
  const getPastDate = (daysAgo) => {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  };

  const fetchTrendForTicker = async (ticker) => {
    try {
      const fromDate = getPastDate(100);
      const res = await fetch(`${NASDAQ_TOKEN}/api/yahooFinanceStockData/${ticker}/${fromDate}/1d`);
      const data = await res.json();
      const recentData = data.slice(-60);
      if (recentData.length < 50) return null;

      const prices = recentData.map((d) => d.close);
      const rsiValues = RSI.calculate({ values: prices, period: 14 });
      const sma50 = SMA.calculate({ values: prices, period: 50 });
      const macdValues = MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });

      const currentPrice = prices.at(-1);
      const currentRSI = rsiValues.at(-1);
      const currentSMA = sma50.at(-1);
      const currentMACD = macdValues.at(-1);

      let trend = "Neutral";
      if (
        currentPrice > currentSMA &&
        currentRSI > 60 &&
        currentMACD?.MACD > currentMACD?.signal
      ) {
        trend = "Bullish";
      } else if (
        currentPrice < currentSMA &&
        currentRSI < 40 &&
        currentMACD?.MACD < currentMACD?.signal
      ) {
        trend = "Bearish";
      }

      return {
        ticker,
        trend,
        price: currentPrice,
        rsi: currentRSI,
        sma: currentSMA,
        macd: currentMACD?.MACD,
        signal: currentMACD?.signal,
      };
    } catch (err) {
      console.error(`Error fetching data for ${ticker}:`, err);
      return null;
    }
  };

  /** ---------- DATA FETCH ---------- */
  useEffect(() => {
    (async () => {
      const trends = [];
      for (const ticker of trendTableList) {
        const result = await fetchTrendForTicker(ticker);
        if (result) trends.push(result);
      }
      setResults(trends);
      setLoading(false);
    })();
  }, []);

  /** ---------- SORTING ---------- */
  const compare = (a, b) => {
    const { key, direction } = sortConfig;
    let diff = 0;

    switch (key) {
      case "ticker":
        diff = a.ticker.localeCompare(b.ticker);
        break;
      case "price":
        diff = a.price - b.price;
        break;
      case "rsi":
        diff = a.rsi - b.rsi;
        break;
      case "sma":
        diff = a.sma - b.sma;
        break;
      case "macd":
        diff = (a.macd - a.signal) - (b.macd - b.signal);
        break;
      case "signal":
        diff = a.signal - b.signal;
        break;
      case "trend":
      default: {
        const order = { Bullish: 1, Neutral: 2, Bearish: 3 };
        diff = order[a.trend] - order[b.trend];
      }
    }
    return direction === "asc" ? diff : -diff;
  };

  const sortedResults = [...results].sort(compare);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const arrow = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  /** ---------- RENDER ---------- */
  return (
    <div className="trend-list-container">
      <h2>Stock Trend Summary</h2>

      {loading ? (
        <div className="loading-spinner">Please wait, loading trend data...</div>
      ) : (
        <table className="trend-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("ticker")}>Ticker{arrow("ticker")}</th>
              <th onClick={() => handleSort("trend")}>Trend{arrow("trend")}</th>
              <th onClick={() => handleSort("price")}>Price{arrow("price")}</th>
              <th onClick={() => handleSort("rsi")}>RSI{arrow("rsi")}</th>
              <th onClick={() => handleSort("sma")}>SMA (50){arrow("sma")}</th>
              <th onClick={() => handleSort("macd")}>MACD Diff{arrow("macd")}</th>
              <th onClick={() => handleSort("signal")}>Signal{arrow("signal")}</th> {/* ← added */}
            </tr>
          </thead>

          <tbody>
            {sortedResults.map((item, index) => {
              const highlightClass =
                sortConfig.key === "rsi" && index === 0
                  ? "highlight-bull"
                  : sortConfig.key === "rsi" && index === sortedResults.length - 1
                    ? "highlight-bear"
                    : "";

              return (
                <tr key={item.ticker} className={`${item.trend.toLowerCase()} ${highlightClass}`}>
                  <td>{item.ticker}</td>
                  <td>{item.trend}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.rsi.toFixed(2)}</td>
                  <td>{item.sma.toFixed(2)}</td>
                  <td>{item.macd.toFixed(2)}</td>
                  <td>{item.signal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TrendListDisplay;
