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

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new record to the table
  const handleSubmit = (event) => {
    event.preventDefault();
    const newData = [...data, form];
    setData(newData);
    setForm({ id: 2, date: "", strikePrice: 33, volume: 66, openInterest: 0 });

    // Save data to a JSON file (requires a backend)
    // fetch("http://localhost:5000/save-data", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(newData),
    // });

    try {
        const response =  fetch("http://localhost:5000/save-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([newData]), // Wrap it in an array
        });
    
       // const result =  response?.json();
        console.log("Server response:", response);
      } catch (error) {
        console.error("Error sending data:", error);
      }
      
  };

  return (
    <div>
      <h2>Options Data Form</h2>
      <form onSubmit={()=>handleSubmit(event)}>
        <input type="number" name="id" placeholder="ID" value={form.id} onChange={handleChange} required />
        {/* <input type="date" name="date" value={form.date} onChange={handleChange} required /> */}
        <input type="number" name="strikePrice" placeholder="Strike Price" value={form.strikePrice} onChange={handleChange} required />
        <input type="number" name="volume" placeholder="Volume" value={form.volume} onChange={handleChange} required />
        {/* <input type="number" name="openInterest" placeholder="Open Interest" value={form.openInterest} onChange={handleChange} required /> */}
        <button type="submit">Add Data</button>
      </form>

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
