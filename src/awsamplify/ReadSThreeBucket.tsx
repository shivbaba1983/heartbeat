import React, { useEffect, useState } from "react";
//import { getUrl, downloadData } from 'aws-amplify/storage';

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
//import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";


import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axios from "axios";
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';
import PredictionChart from '../nasdaq/PredictionChart';
import { getTodayInEST } from './../common/nasdaq.common';




const ReadSThreeBucket = ({ selectedTicker, fileName }) => {
  const [data, setData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const bucketName = 'anil-w-bucket';
        const objectKey = fileName;//'2025-04-26.json'; // path inside the bucket
        setData([]);
        const request = new HttpRequest({
          method: 'GET',
          protocol: 'https:',
          hostname: `${bucketName}.s3.amazonaws.com`,
          path: `/${objectKey}`,
          headers: {
            'host': `${bucketName}.s3.amazonaws.com`,
          },
        });

        // const signedRequest = await signer.sign(request);
  
        // const url = `https://${signedRequest.hostname}${signedRequest.path}`;
        // const headers = signedRequest.headers;
      
        // const response = await fetch(url, {
        //   method: signedRequest.method,
        //   headers: headers
        // });
        const response = await fetch('https://anil-w-bucket.s3.amazonaws.com/2025-04-25.json');
        
        const tempData = await response.json();
        const filteredData = tempData
        .filter(item => item.selectedTicker === selectedTicker) // ← This filters the data
        .map(item => ({
          ...item,
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }));

        setData(filteredData);
        console.log('Response:', filteredData);

      } catch (err) {
        console.log('Fetched err:', err);
      }
    };
    fetchOptionsData();
  }, [selectedTicker, fileName, refreshData]);



  // const[fileName, setFileName]= useState(selectedFileName);





    

  const getTodayInEST = async() => {
    const estDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York"
    });
  
    const date = new Date(estDate);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  };

  const handleRefreshClick = async () => {
    setRefreshData(true);
  };

  return (
    <div>
      {/* <FileDropdown selectedTicker={selectedTicker} setFileName={setFileName}/> */}
      <h2> {selectedTicker} S3 Options Volume Chart</h2>
      {data && <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="callVolume" stroke="#008000" />
          <Line type="monotone" dataKey="putVolume" stroke="#FF0000" />
        </LineChart>
      </ResponsiveContainer>}

      <button onClick={() => handleRefreshClick()}>Refres Data</button>

      {/* <PredictionChart data={data}/> */}
    </div>
  );

};
export default ReadSThreeBucket;