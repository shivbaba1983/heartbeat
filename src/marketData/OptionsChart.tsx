import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { BarChart, Bar, } from 'recharts';
import axiosInstance from './axiosInstance';
let totalCallVolume=0;
let totalPutVolume=0;
let exDate;
const validityData = [
    { idx: 1, value: "weekly" },
    { idx: 2, value: "monthly" },
    { idx: 4, value: "quarterly" },
]

const transformOptionData = (data) => {
    const resultMap = {};

    data.strike.forEach((strike, i) => {
        if (!resultMap[strike]) {
            resultMap[strike] = {
                strike,
                callOpenInterest: 0,
                putOpenInterest: 0,
                callVolume: 0,
                putVolume: 0,
                callBidPrice: 0,
                putBidPrice: 0,
                expirationDate:''
            };
        }

        const side = data.side[i];
        const openInterest = data.openInterest[i];
        const volume = data.volume[i];
        const bid = data.bid[i];
       // const exDate = convertGMTtoEST(data.expiration[i]);
        if (side === 'call') {
            resultMap[strike].callOpenInterest = openInterest;
            totalCallVolume+= resultMap[strike].callVolume = volume;
            resultMap[strike].callBidPrice = bid;
            //resultMap[strike].expirationDate =exDate;
            
        } else {
            resultMap[strike].putOpenInterest = openInterest;
            totalPutVolume+=resultMap[strike].putVolume = volume;
            resultMap[strike].putBidPrice = bid;
            //resultMap[strike].expirationDate =exDate;
        }
    });

    // Convert to sorted array
    return Object.values(resultMap).sort((a, b) => a.strike - b.strike);
};

const convertGMTtoEST = (gmtTimestamp) => {
    const date = new Date(gmtTimestamp); // Assumes input is ISO 8601 or epoch
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
    });
  };

const OptionsChart = ({ selectedTicker }) => {
    const [graphData, setGraphData] = useState([]);
    const [selectedValidity, setSelectedValidity] = useState('weekly');
    const [lineGraphData, setLineGraphData] = useState([]);

    useEffect(() => {
        const fetchOptionsData = async () => {
            try {
                // Replace with your actual fetch call
                //const response = await fetch('/v1/options/chain/AAPL/'); // your endpoint
                let response;
                if (selectedTicker === "QQQ" || selectedTicker === "SPY" || selectedTicker === "IWM") {
                    response = await axiosInstance.get(`/v1/options/chain/${selectedTicker}?strikeLimit=50`);
                }
                else {
                    response = await axiosInstance.get(`/v1/options/chain/${selectedTicker}?strikeLimit=50&${selectedValidity}=true`);
                }

                const optionsData = response?.data;

                const data = transformOptionData(optionsData);
                setGraphData(data)

                const combinedData = optionsData.strike.map((strike, index) => ({
                    strike,
                    callBid: optionsData.side[index] === 'call' ? optionsData.bid[index] : null,
                    putBid: optionsData.side[index] === 'put' ? optionsData.bid[index] : null,
                }));

                const mergedData = Object.values(
                    combinedData.reduce((acc, item) => {
                        const key = item.strike;
                        if (!acc[key]) {
                            acc[key] = { strike: item.strike, callBid: null, putBid: null };
                        }
                        if (item.callBid != null) acc[key].callBid = item.callBid;
                        if (item.putBid != null) acc[key].putBid = item.putBid;
                        return acc;
                    }, {})
                ).sort((a, b) => a.strike - b.strike);

                setLineGraphData(mergedData);
            } catch (err) {
                console.error('Failed to fetch option data:', err);
            }
        };

        fetchOptionsData();
    }, [selectedValidity]);




    const handleTickerChange = async (e) => {
        const valdity = e.target.value || 'weekly';
        setSelectedValidity(valdity);
        //await getmydata(ticker, selectedAsset);
    };
    const formattedCall = new Intl.NumberFormat('en-IN').format(totalCallVolume);
    const formattedPut = new Intl.NumberFormat('en-IN').format(totalPutVolume);

    return (

        <div>
<div> call:{formattedCall} , put:{formattedPut}</div>
            <div className="common-left-margin">
                <label htmlFor="validity-select">Validty: </label>
                <select id="validity-select" value={selectedValidity} onChange={(e) => handleTickerChange(e)}>
                    <option value="">-- Choose Validty --</option>
                    {validityData.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                            {opt.value}
                        </option>
                    ))}
                </select>
            </div>


            <ResponsiveContainer width="100%" height={500}>
                <BarChart data={graphData}>
                    <XAxis dataKey="strike" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* <Bar dataKey="callOpenInterest" fill="#4caf50" name="Call OI" />
        <Bar dataKey="putOpenInterest" fill="#f44336" name="Put OI" /> */}
                    <Bar dataKey="callVolume" fill="#4caf50" name="Call volume" />
                    <Bar dataKey="putVolume" fill="#f44336" name="Put volume" />
                    <Bar dataKey="callBidPrice" fill="#f47836" name="Call Bid" />
                    <Bar dataKey="putBidPrice" fill="#f41636" name="Put Bid" />
                    {/* <Bar dataKey="expirationDate" fill="#f12636" name="Expiration Date" /> */}
                </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={500}>
                <LineChart data={lineGraphData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="strike" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="callBid" name="Call Bid" stroke="#8884d8" dot={false} />
                    <Line type="monotone" dataKey="putBid" name="Put Bid" stroke="#82ca9d" dot={false} />
                </LineChart>
            </ResponsiveContainer>

        </div>

    );
};

export default OptionsChart;
