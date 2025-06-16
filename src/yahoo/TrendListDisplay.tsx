import React, { useEffect, useState } from "react";
import { RSI, MACD, SMA } from "technicalindicators";
import { NASDAQ_TOKEN, LogTickerList, trendTableList } from "../constant/HeartbeatConstants";
import "./TrendListDisplay.scss";

//const LogTickerList = ['AAPL', 'NVDA', 'SPY', 'QQQ', 'IWM', 'AMZN', 'GOOG', 'TSLA', 'META', 'MSFT', 'SOXL', 'COIN'];

// interface TickerTrend {
//   ticker: string;
//   trend: string;
//   price: number;
//   rsi: number;
//   sma: number;
//   macd: number;
//   signal: number;
// }

const TrendListDisplay = () => {
  const [results, setResults] = useState([]);
  const [sortKey, setSortKey] = useState("trend");

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

      const currentPrice = prices[prices.length - 1];
      const currentRSI = rsiValues[rsiValues.length - 1];
      const currentSMA = sma50[sma50.length - 1];
      const currentMACD = macdValues[macdValues.length - 1];

      let trend = "Neutral";
      if (currentPrice > currentSMA && currentRSI > 60 && currentMACD?.MACD > currentMACD?.signal) {
        trend = "Bullish";
      } else if (currentPrice < currentSMA && currentRSI < 40 && currentMACD?.MACD < currentMACD?.signal) {
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

  useEffect(() => {
    const fetchAll = async () => {
      const trends= [];
      for (const ticker of trendTableList) {
        const result = await fetchTrendForTicker(ticker);
        if (result) trends.push(result);
      }
      setResults(trends);
    };
    fetchAll();
  }, []);

  const sortedResults = [...results].sort((a, b) => {
    switch (sortKey) {
      case "rsi": return b.rsi - a.rsi;
      case "price": return b.price - a.price;
      case "macd": return (b.macd - b.signal) - (a.macd - a.signal);
      case "trend":
      default:
        const trendOrder = { Bullish: 1, Neutral: 2, Bearish: 3 };
        return trendOrder[a.trend] - trendOrder[b.trend];
    }
  });

  return (
    <div className="trend-list-container">
      <div className="header-controls">
        <h2>Stock Trend Summary</h2>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="trend">Sort by Trend</option>
          <option value="rsi">Sort by RSI</option>
          <option value="price">Sort by Price</option>
          <option value="macd">Sort by MACD Diff</option>
        </select>
      </div>

      <table className="trend-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Trend</th>
            <th>Price</th>
            <th>RSI</th>
            <th>SMA(50)</th>
            <th>MACD</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((item, index) => {
            const highlightClass =
              sortKey === "rsi" && index === 0
                ? "highlight-bull"
                : sortKey === "rsi" && index === sortedResults.length - 1
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
    </div>
  );
};

export default TrendListDisplay;
