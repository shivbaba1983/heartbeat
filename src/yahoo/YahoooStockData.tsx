import React, { useEffect, useState } from "react";
//import yahooFinance from "yahoo-finance2";

import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';
const YahoooStockData = ({ selectedTicker,requestedFromDate }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // const history = await yahooFinance.historical(ticker, {
        //   period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        //   interval: '1h',
        // });

        // const formatted = history.map(point => ({
        //   date: new Date(point.date).toLocaleString(),
        //   close: point.close,
        // }));

        //just for stock data this return stock histry data from yahoo end point
        const stockResponse = await axios.get(`${NASDAQ_TOKEN}/api/yahooFinanceStockData/${selectedTicker}/${requestedFromDate}`);
        console.log('--yahooFinanceStockData--', stockResponse)

        const formatted = stockResponse?.data?.map(point => {
          const date = new Date(point.date);
          const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

          return {
            date: formattedDate,
            close: point.close,
          };
        });
        setData(formatted);
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      } finally {

      }
    };

    loadHistory();
  }, [selectedTicker, requestedFromDate]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3>{selectedTicker} Price History(Yahoo)</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" hide={false} />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="close" stroke="#007bff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YahoooStockData;
