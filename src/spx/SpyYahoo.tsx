import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { NASDAQ_TOKEN, YAHOO_VOLUME_LIMIT, ETF_List, IS_AWS_API, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { getYahooFinanceData } from "./../services/YahooFinanceService";
import PredictionHint from './../components/PredictionHint';
const SpyYahooChart = ({ selectedTicker }) => {
    // Define a type for merged data

    const [options, setOptions] = useState([]);
    const [data, setData] = useState([]);
    const [totalCallVolume, setTotalCallVolume] = useState(1);
    const [totalPutVolume, setTotalPutVolume] = useState(1);
    const [expiryDate, setExpiryDate] = useState();

    // Merge calls and puts into one object

    //let data;
    useEffect(() => {
        const fetchMyData = async () => {
            await getSpyHistoryAPIData(selectedTicker); // write data to json file in s3 bucket
        };
        fetchMyData();
    }, [selectedTicker]);


    const getSpyHistoryAPIData = async (selectedTicker) => {
        setOptions([]);
        //const todayDate = getTodayInEST()
        try {
            let rows = [];
            if (IS_AWS_API) {
                //call from aws api
                const response = await getYahooFinanceData(selectedTicker);
                rows = response?.body || [];
                //rows = response?.data?.options || [];
            } else {
                //call from local api express server
                const response = await axios.get(`${NASDAQ_TOKEN}/api/yahooFinance/${selectedTicker}`);
                rows = response?.data?.options || [];
            }
            const merged = {};
            // Compute totals
            let tempCallVolume = 0;
            let tempPutVolume = 0;
            // Process calls
            rows[0]?.calls.forEach(({ strike, volume, lastPrice }) => {
                if (!merged[strike]) {
                    merged[strike] = { strike, callVolume: 0, putVolume: 0, lastPrice:0 };
                }
                merged[strike].callVolume = volume || 0;
                merged[strike].calllastPrice = lastPrice || 0;
                
            });

            // Process puts
            rows[0]?.puts.forEach(({ strike, volume, lastPrice }) => {
                if (!merged[strike]) {
                    merged[strike] = { strike, callVolume: 0, putVolume: 0 , lastPrice:0};
                }
                merged[strike].putVolume = volume || 0;
                merged[strike].putlastPrice = lastPrice || 0;
            });
            setExpiryDate(rows[0]?.expirationDate);
            // Convert to array
            //const tempData = Object.values(merged);
            const tempData = Object.values(merged).filter(
                item => item.callVolume > YAHOO_VOLUME_LIMIT || item.putVolume > YAHOO_VOLUME_LIMIT
            ).sort((a, b) => a.strike - b.strike);;



            Object.values(tempData).forEach(({ callVolume = 0, putVolume = 0 }) => {
                tempCallVolume += callVolume;
                tempPutVolume += putVolume;
            });
            setTotalCallVolume(tempCallVolume);
            setTotalPutVolume(tempPutVolume);
            setData(tempData)
            //setOptions(rows);
        } catch (err) {
            console.error('Failed to get options data yahoo finance SpyYahoo:', err);
        }
    };
    const predectionInput = [
        {
            "id": 1,
            "timestamp": '',
            "callVolume": totalCallVolume,
            "putVolume": totalPutVolume,
            "selectedTicker": selectedTicker
        },
    ]

    return (
        <div>
            <h3>Yahoo Finance Data Total- Call {totalCallVolume}, puts {totalPutVolume} exp - {expiryDate}</h3>
            {totalCallVolume >0 && <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />}
            {data && <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strike" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="callVolume" fill="#8884d8" name="Call Volume" />
                    <Bar dataKey="calllastPrice" fill="#006400" name="Call Last Price" />
                    <Bar dataKey="putVolume" fill="#FF2C2C" name="Put Volume" />
                    <Bar dataKey="putlastPrice" fill="#FF2C2C" name="Put Last Price" />
                </BarChart>
            </ResponsiveContainer>}
        </div>
    );
};

export default SpyYahooChart;
