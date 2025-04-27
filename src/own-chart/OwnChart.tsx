import React, { useState, useEffect } from 'react';
import VolumeChart from './VolumeChart';
import { NASDAQ_TOKEN, IS_AUTOMATED_LOG } from '../constant/HeartbeatConstants';
import { getTodayInEST } from './../common/nasdaq.common';
import ReadSThreeBucket from './../awsamplify/ReadSThreeBucket';
const OwnChart = ({ totalCallVolumeCount, totalPutVolumeCount, selectedTicker }) => {
  const [callVolume, setCallVolume] = useState(totalCallVolumeCount);
  const [putVolume, setPutVolume] = useState(totalPutVolumeCount);

  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(getTodayInEST());

  // useEffect(() => {
  //   fetch(`${NASDAQ_TOKEN}/api/files`)
  //     .then(res => res.json())
  //     .then(data => setFiles(data.files || []))
  //     .catch(err => console.error("Error fetching files:", err));

  // }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`${NASDAQ_TOKEN}/api/files`);
        const temp = await res.json();
        const fileNamesList = temp.files || [];
        // const fileNamesList = (temp.files || []).map(file => {
        //   const parts = file.split(".");
        //   parts.pop(); // remove the extension
        //   return parts.join("."); // in case filename had dots in name
        // });
        setFiles(fileNamesList);
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    };
    fetchFiles();
  }, []);



  useEffect(() => {
    setCallVolume(totalCallVolumeCount)
    setPutVolume(totalPutVolumeCount)
  }, [totalCallVolumeCount, totalPutVolumeCount]);

  if (IS_AUTOMATED_LOG) {
    useEffect(() => {
      let fileName = selectedFileName;
      if (selectedFileName === "") {
        fileName = new Date().toISOString().slice(0, 10);
      }
      try {
        fetch(`${NASDAQ_TOKEN}/api/writes3bucket/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callVolume: Number(totalCallVolumeCount),
            putVolume: Number(totalPutVolumeCount),
            selectedTicker: selectedTicker,
          }),
        });
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    }, []);
  }
  const handleFileNameChange = (e) => {
    e.preventDefault();
    const tempFileName = e.target.value;
    setSelectedFileName(tempFileName);
    //setFileName(tempFileName)
    console.log("Selected file:", tempFileName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${NASDAQ_TOKEN}/api/writes3bucket`, {
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
      <div>
        <h2>Select a File:</h2>
        <select value={selectedFileName} onChange={(e) => handleFileNameChange(e)}>
          {files.map((file, idx) => (
            <option key={idx} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>

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

      <VolumeChart selectedTicker={selectedTicker} fileName={selectedFileName} />
      <ReadSThreeBucket selectedTicker={selectedTicker} fileName={selectedFileName} />
    </div>
  );
};

export default OwnChart;
