import React, { useState, useEffect } from 'react';
import VolumeChart from './VolumeChart';
import {NASDAQ_TOKEN }from './../constant/HeartbeatConstants';
const OwnChart = ({ totalCallVolumeCount, totalPutVolumeCount, selectedTicker }) => {
  const [callVolume, setCallVolume] = useState(totalCallVolumeCount);
  const [putVolume, setPutVolume] = useState(totalPutVolumeCount);

  useEffect(() => {
    setCallVolume(totalCallVolumeCount)
    setPutVolume(totalPutVolumeCount)
  }, [totalCallVolumeCount, totalPutVolumeCount]);


  useEffect(() => {

    try {
      fetch(`${NASDAQ_TOKEN}/api/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callVolume: Number(totalCallVolumeCount),
          putVolume: Number(totalPutVolumeCount),
          selectedTicker: selectedTicker,
        }),
      });

      // setCallVolume('');
      // setPutVolume('');


    } catch (err) {
      console.error('Failed to fetch option data:', err);
    }


  }, []);




  // useEffect(() => {
  //   const fetchOptionsData = async () => {
  //     try {
  //       await fetch('https://e616-2600-1700-6cb0-2a20-5899-93a7-9cb4-db7f.ngrok-free.app/api/volume', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           callVolume: Number(totalCallVolumeCount),
  //           putVolume: Number(totalPutVolumeCount),
  //           selectedTicker: selectedTicker,
  //         }),
  //       });

  //       // setCallVolume('');
  //       // setPutVolume('');


  //     } catch (err) {
  //       console.error('Failed to fetch option data:', err);
  //     }
  //   };
  //   fetchOptionsData();
  // }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${NASDAQ_TOKEN}/api/volume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callVolume: Number(totalCallVolumeCount),
        putVolume: Number(totalPutVolumeCount),
        selectedTicker: selectedTicker,
      }),
    });

    // setCallVolume('');
    // setPutVolume('');
    //window.location.reload(); // Refresh chart
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          type="number"
          placeholder="Call Volume"
          value={totalCallVolumeCount}
          onChange={(e) => setCallVolume(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Put Volume"
          value={totalPutVolumeCount}
          onChange={(e) => setPutVolume(e.target.value)}
          required
        />
        <button type="submit">Add Data</button>
      </form>

      <VolumeChart selectedTicker={selectedTicker} />


    </div>
  );
};

export default OwnChart;
