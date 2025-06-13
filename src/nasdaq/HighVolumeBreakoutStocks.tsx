import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogTickerList, NASDAQ_TOKEN,ETF_List, ETF_ASSETCLASS, STOCKS_ASSETCLASS, IS_AWS_API } from "./../constant/HeartbeatConstants";
import { getTodayInEST } from "../common/nasdaq.common";
import { getNasdaqStockHistoryData } from "./../services/NasdaqStockDataService";

function isHighVolume(stockHistory) {
  if (stockHistory.length < 253) return false;

  const parsed = stockHistory
    .map(r => ({
      date: r.date,
      volume: Number((r.volume || "0").replace(/,/g, "")),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last3 = parsed.slice(0, 3).map(d => d.volume);
  const avg3 = last3.reduce((a, b) => a + b, 0) / 3;

  const last252 = parsed.slice(0, 252).map(d => d.volume);
  const avg252 = last252.reduce((a, b) => a + b, 0) / 252;

  return avg3 >= 1.5 * avg252;
}

const HighVolumeBreakoutStocks = () => {
  const [resultList, setResultList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayDate = getTodayInEST();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 375); // cover 52 weeks + buffer
    const requestedFromDate = fromDate.toISOString().slice(0, 10);

    const fetchAll = async () => {
      const result = [];

      for (let selectedTicker of LogTickerList) {
        try {
          let assetclass = ETF_List.includes(selectedTicker) ? ETF_ASSETCLASS : STOCKS_ASSETCLASS;
          let rows = [];

          if (IS_AWS_API) {
            const response = await getNasdaqStockHistoryData(selectedTicker, assetclass, requestedFromDate, todayDate);
            const json = await response.json();
            rows = json.data?.tradesTable?.rows || [];
          } else {
            const response = await axios.get(`${NASDAQ_TOKEN}/api/stockhistory/${selectedTicker}/${assetclass}/${requestedFromDate}/${todayDate}`);
            rows = response.data?.data?.tradesTable?.rows || [];
          }
          if (rows.length >= 252 && isHighVolume(rows)) {
            result.push({ selectedTicker, rows });
          }
        } catch (err) {
          console.error(`Error fetching ${selectedTicker}:`, err);
        }
      }

      setResultList(result);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📈 High Volume Stocks (3-day avg ≥ 1.5× 52-week avg)</h2>
      {loading ? (
        <p>Loading data for all tickers...</p>
      ) : (
        <ul>
          {resultList.map(item => (
            <li key={item.selectedTicker}>
              {item.selectedTicker} — 3-day volume spike detected!
            </li>
          ))}
        </ul>
      )}
      <p>{resultList.length ===0 && <span>Not any ticker avg. greater than 1.5</span>}</p>
    </div>
  );
};

export default HighVolumeBreakoutStocks;
