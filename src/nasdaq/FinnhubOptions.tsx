import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FinnhubOptions = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [expirations, setExpirations] = useState([]);
  const [selectedExp, setSelectedExp] = useState('');
  const [optionsData, setOptionsData] = useState(null);
  const API_KEY = 'cvpvj21r01qi0ef5rbqgcvpvj21r01qi0ef5rbr0';

  const fetchExpirations = async () => {
    try {
      const res = await axios.get('https://finnhub.io/api/v1/stock/option-chain', {
        params: {
          symbol,
          token: API_KEY,
        },
      });
      setExpirations(res.data.expirationDates);
      setSelectedExp(res.data.expirationDates[0]);
    } catch (err) {
      console.error('Error fetching expiration dates', err);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await axios.get('https://finnhub.io/api/v1/stock/option-chain', {
        params: {
          symbol,
          expiration: selectedExp,
          token: API_KEY,
        },
      });
      setOptionsData(res.data);
    } catch (err) {
      console.error('Error fetching options data', err);
    }
  };

  useEffect(() => {
    fetchExpirations();
  }, [symbol]);

  useEffect(() => {
    if (selectedExp) fetchOptions();
  }, [selectedExp]);

  return (
    <div>
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter Symbol (e.g., AAPL)"
      />
      <div>
        <label>Expiration Date:</label>
        <select value={selectedExp} onChange={(e) => setSelectedExp(e.target.value)}>
          {expirations.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>

      {optionsData && (
        <div>
          <h3>Calls</h3>
          <pre>{JSON.stringify(optionsData.data.CALL, null, 2)}</pre>
          <h3>Puts</h3>
          <pre>{JSON.stringify(optionsData.data.PUT, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FinnhubOptions;
