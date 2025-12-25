import React, { useState, useEffect } from "react";

function FormData() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    id: 22,
    date: Date.now().toString(),
    strikePrice: 444,
    volume: 5678,
    openInterest: 500,
  });

  // Load JSON data when component mounts
  useEffect(() => {
    fetch("public/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);



  return (
    <div>
      <h2>Options Data Table</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Strike Price</th>
            <th>Volume</th>
            <th>Open Interest</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.id}</td>
              <td>{row.date}</td>
              <td>{row.strikePrice}</td>
              <td>{row.volume}</td>
              <td>{row.openInterest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FormData;
