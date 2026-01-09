import React, { useState, useEffect } from 'react';
import VolumeChart from './VolumeChart';
import { NASDAQ_TOKEN, IS_AWS_API } from '../constant/HeartbeatConstants';
import { getTodayInEST } from './../common/nasdaq.common';
import ReadSThreeBucket from './../awsamplify/ReadSThreeBucket';
import ReadSThreeBucketOpenInterest from './../awsamplify/ReadSThreeBucketOpenInterest';
import { getAdjustedDate } from './../common/nasdaq.common';
const OwnChart = ({ totalCallVolumeCount, totalPutVolumeCount, selectedTicker ,setSelectedTicker}) => {
  const [callVolume, setCallVolume] = useState(totalCallVolumeCount);
  const [putVolume, setPutVolume] = useState(totalPutVolumeCount);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(getAdjustedDate());
  const [selectedFileNameOpenInterest, setSelectedFileNameOpenInterest] = useState("OpenInterest");
  useEffect(() => {
    let fileName = selectedFileName;
    if (selectedFileName === "") {
      fileName = getAdjustedDate();//new Date().toISOString().slice(0, 10);
      setSelectedFileName(fileName);
    }
    try {
      if (totalCallVolumeCount > 0) {
        fetch(`${NASDAQ_TOKEN}/api/writes3bucket/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callVolume: Number(totalCallVolumeCount),
            putVolume: Number(totalPutVolumeCount),
            selectedTicker: selectedTicker,
          }),
        });
      }
    } catch (err) {
      console.error('Failed to fetch option data:', err);
    }
  }, []);

  //call only oces to get the file name only
  useEffect(() => {
    async function fetchFiles() {
      try {
        if (IS_AWS_API) {
          const bucketUrl = "https://anil-w-bucket.s3.amazonaws.com?list-type=2";


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
        } else {
          await fetch(`${NASDAQ_TOKEN}/api/files`)
            .then(res => res.json())
            .then(data => setFiles(data.files || []))
            .catch(err => console.error("Error fetching files:", err));
        }
      } catch (error) {
        console.error("Error fetching S3 files:", error);
      }
      finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, []);


  useEffect(() => {
    setCallVolume(totalCallVolumeCount)
    setPutVolume(totalPutVolumeCount)
  }, [totalCallVolumeCount, totalPutVolumeCount]);



  const handleFileNameChange = (e) => {
    e.preventDefault();
    const tempFileName = e.target.value;
    setSelectedFileName(tempFileName);
    //setFileName(tempFileName)
    console.log("Selected file:", tempFileName);
  };

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  return (
    <div>
      <div>
        <div>
          <h2>Select a File (Local server log):</h2>
          <select value={selectedFileName} onChange={(e) => handleFileNameChange(e)}>
            {files.map((file, idx) => (
              <option key={idx} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>


        <VolumeChart selectedTicker={selectedTicker} fileName={selectedFileName} />
      </div>
      {(!isLoading &&IS_AWS_API) && <ReadSThreeBucket selectedTicker={selectedTicker} fileName={selectedFileName} setSelectedTicker={setSelectedTicker}/>}

      <h2 onClick={toggleExpanded} className="link-like-header">
        {isExpanded
          ? "▼ Open Interest (Click to Collapse)"
          : "► Open Interest (Click to Expand)"}
      </h2>

      {(!isLoading && isExpanded && IS_AWS_API) && <ReadSThreeBucketOpenInterest selectedTicker={selectedTicker} selectedFileNameOpenInterest={selectedFileNameOpenInterest}/>}

    </div>
  );
};

export default OwnChart;
