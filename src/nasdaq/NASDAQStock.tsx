import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NASDAQStock = () => {
  const [stockData, setStockData] = useState(null);
  const [symbol, setSymbol] = useState('AAPL'); // Default NASDAQ stock

  const fetchStock = async () => {
    try {
      const res = await axios.get(`https://finnhub.io/api/v1/quote`, {
        params: {
          symbol: symbol,
          token: 'cvpvj21r01qi0ef5rbqgcvpvj21r01qi0ef5rbr0'
        }
      });
      setStockData(res.data);
    } catch (error) {
      console.error('Error fetching stock data', error);
    }    

  };

  useEffect(() => {
    fetchStock();
  }, [symbol]);

  return (
    <div>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter NASDAQ symbol (e.g., AAPL)"
      />
      <button onClick={fetchStock}>Get Stock Data</button>

      {stockData && (
        <div>
          <h3>{symbol}</h3>
          <p>Current Price: ${stockData.c}</p>
          <p>High: ${stockData.h}</p>
          <p>Low: ${stockData.l}</p>
          <p>Previous Close: ${stockData.pc}</p>
        </div>
      )}
    </div>
  );
};

export default NASDAQStock;
