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

  //call only oces to get the file name only
  useEffect(() => {
    async function fetchFiles() {
      const bucketUrl = "https://anil-w-bucket.s3.amazonaws.com?list-type=2";

      try {
        const response = await fetch(bucketUrl);
        const text = await response.text();

        // Parse the XML
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const keys = Array.from(xml.getElementsByTagName("Key")).map(key => key.textContent);
        const filenames = keys.map(file => {
          const name = file.split(".").slice(0, -1).join(".");
          return name;
        });
        setFiles(filenames || []);
      } catch (error) {
        console.error("Error fetching S3 files:", error);
      }
    }

    fetchFiles();
  }, []);


  useEffect(() => {
    setCallVolume(totalCallVolumeCount)
    setPutVolume(totalPutVolumeCount)
  }, [totalCallVolumeCount, totalPutVolumeCount]);

  
  useEffect(() => {
    let fileName = selectedFileName;
    if (selectedFileName === "") {
      fileName = new Date().toISOString().slice(0, 10);
    }
    try {
      //if (totalCallVolumeCount > 0 || totalPutVolumeCount > 0) {
        fetch(`${NASDAQ_TOKEN}/api/writes3bucket/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callVolume: Number(totalCallVolumeCount),
            putVolume: Number(totalPutVolumeCount),
            selectedTicker: selectedTicker,
          }),
        });
      //}
    } catch (err) {
      console.error('Failed to fetch option data:', err);
    }
  }, []);

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
      {NASDAQ_TOKEN.includes('localhost') && <div>
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
      </div>}
      <ReadSThreeBucket selectedTicker={selectedTicker} fileName={selectedFileName} />
    </div>
  );
};

export default OwnChart;
