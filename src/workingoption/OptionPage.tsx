import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OptionTable = ({ data, title }) => (
  <div>
    <h3>{title}</h3>
    <table border="1" cellPadding={4} cellSpacing={0}>
      <thead>
        <tr>
          <th>Strike</th>
          <th>Last Price</th>
          <th>Bid</th>
          <th>Ask</th>
          <th>Volume</th>
          <th>Open Interest</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            <td>{item.strikePrice}</td>
            <td>{item.lastPrice}</td>
            <td>{item.bid}</td>
            <td>{item.ask}</td>
            <td>{item.volume}</td>
            <td>{item.openInterest}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const OptionPage = () => {
  const { symbol } = useParams();
  const [calls, setCalls] = useState([]);
  const [puts, setPuts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/options/${symbol}`);
        const rows = res.data?.data?.optionChain?.rows || [];

        const callData = rows.map((r) => r.call).filter(Boolean);
        const putData = rows.map((r) => r.put).filter(Boolean);

        setCalls(callData);
        setPuts(putData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [symbol]);

  return (
    <div className="p-4">
      <h2>Options for {symbol}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <OptionTable data={calls} title="Call Options" />
          <OptionTable data={puts} title="Put Options" />
        </>
      )}
    </div>
  );
};

export default OptionPage;
