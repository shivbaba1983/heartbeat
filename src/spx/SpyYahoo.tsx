import React from "react";
import { useEffect, useState } from "react";
import './SpyYahooChart.scss';
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { NASDAQ_TOKEN, YAHOO_VOLUME_LIMIT, ETF_List, IS_AWS_API, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { getYahooFinanceData } from "./../services/YahooFinanceService";
import PredictionHint from './../components/PredictionHint';
import { getDateForatted } from './../common/nasdaq.common';
const SpyYahooChart = ({ selectedTicker, volumeOrInterest , setAverageDailyVolume3Month}) => {
    // Define a type for merged data

    const [options, setOptions] = useState([]);
    const [data, setData] = useState([]);
    const [stockDetails, setStockdetails] = useState({});
    const [totalCallVolume, setTotalCallVolume] = useState(1);
    const [totalPutVolume, setTotalPutVolume] = useState(1);
    const [expiryDate, setExpiryDate] = useState();
    const [isLoading, setIsLoading] = useState(true);
    // Merge calls and puts into one object

    //let data;
    useEffect(() => {
        const fetchMyData = async () => {
            try {
                setIsLoading(true);
                await getSpyHistoryAPIData(selectedTicker);
            } catch (err) {
                console.error('Failed to fetch stock history data from yahoo:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyData();
    }, [selectedTicker, volumeOrInterest]);


    const getSpyHistoryAPIData = async (selectedTicker) => {
        setOptions([]);
        //const todayDate = getTodayInEST()
        try {
            let rows = [];
            let stockquote = { earningsTimestamp: '' };
            if (IS_AWS_API) {
                //call from aws api
                const response = await getYahooFinanceData(selectedTicker);
                const responseJson = await response.json();
                rows = responseJson?.options || [];
                stockquote = responseJson?.quote || { earningsTimestamp: '' };
            } else {
                //call from local api express server
                const response = await axios.get(`${NASDAQ_TOKEN}/api/yahooFinance/${selectedTicker}`);
                rows = response?.data?.options || [];
                stockquote = response?.data?.quote || { earningsTimestamp: '' };
            }
            const merged = {};
            // Compute totals
            let tempCallVolume = 0;
            let tempPutVolume = 0;
            // Process calls
            let tempData;
            if (volumeOrInterest === 'volume') {
                rows[0]?.calls.forEach(({ strike, volume, lastPrice }) => {
                    if (!merged[strike]) {
                        merged[strike] = { strike, callVolume: 0, putVolume: 0, lastPrice: 0 };
                    }
                    merged[strike].callVolume = volume || 0;
                    merged[strike].calllastPrice = lastPrice || 0;

                });

                // Process puts
                rows[0]?.puts.forEach(({ strike, volume, lastPrice }) => {
                    if (!merged[strike]) {
                        merged[strike] = { strike, callVolume: 0, putVolume: 0, lastPrice: 0 };
                    }
                    merged[strike].putVolume = volume || 0;
                    merged[strike].putlastPrice = lastPrice || 0;
                });
                setExpiryDate(rows[0]?.expirationDate);
                // Convert to array
                //const tempData = Object.values(merged);
                tempData = Object.values(merged).filter(
                    item => item.callVolume > YAHOO_VOLUME_LIMIT || item.putVolume > YAHOO_VOLUME_LIMIT
                ).sort((a, b) => a.strike - b.strike);;



                Object.values(tempData).forEach(({ callVolume = 0, putVolume = 0 }) => {
                    tempCallVolume += callVolume;
                    tempPutVolume += putVolume;
                });
            }
            else {
                rows[0]?.calls.forEach(({ strike, openInterest, lastPrice }) => {
                    if (!merged[strike]) {
                        merged[strike] = { strike, callOI: 0, putOI: 0, calllastPrice: 0, putlastPrice: 0 };
                    }
                    merged[strike].callOI = openInterest || 0;
                    merged[strike].calllastPrice = lastPrice || 0;
                });

                // Process puts
                rows[0]?.puts.forEach(({ strike, openInterest, lastPrice }) => {
                    if (!merged[strike]) {
                        merged[strike] = { strike, callOI: 0, putOI: 0, calllastPrice: 0, putlastPrice: 0 };
                    }
                    merged[strike].putOI = openInterest || 0;
                    merged[strike].putlastPrice = lastPrice || 0;
                });

                setExpiryDate(rows[0]?.expirationDate);

                // Filter and sort
                tempData = Object.values(merged).filter(
                    item => item.callOI > YAHOO_VOLUME_LIMIT || item.putOI > YAHOO_VOLUME_LIMIT
                ).sort((a, b) => a.strike - b.strike);

                // Sum OI
                Object.values(tempData).forEach(({ callOI = 0, putOI = 0 }) => {
                    tempCallVolume += callOI;
                    tempPutVolume += putOI;
                });
            }
            setTotalCallVolume(tempCallVolume);
            setTotalPutVolume(tempPutVolume);
            setData(tempData);
            setStockdetails(stockquote);
            setAverageDailyVolume3Month(stockquote.averageDailyVolume3Month)
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
            "selectedTicker": selectedTicker,
            'customClassName': totalCallVolume > totalPutVolume ? 'greenmarket' : 'redmareket'
        },
    ]

    return (

        <div>
            {isLoading && <div>
                <h2> Loading....... Please wait</h2>
            </div>}

            {!isLoading && <div className="yahoo-chart-section">
                <h3>Yahoo-{volumeOrInterest}-Call-<span className={predectionInput[0].customClassName}>{totalCallVolume} </span>, Put-{totalPutVolume} Exp.-{getDateForatted(expiryDate)} Earning-{getDateForatted(stockDetails?.earningsTimestamp)} Rating-{stockDetails?.averageAnalystRating}</h3>
                {totalCallVolume > 0 && <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />}
                {volumeOrInterest === 'volume' && <div>
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
                </div>}

                {volumeOrInterest === 'openinterest' && <div>
                    {data && <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="strike" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="callOI" fill="#8884d8" name="Call OI" />
                            <Bar dataKey="calllastPrice" fill="#006400" name="Call Last Price" />
                            <Bar dataKey="putOI" fill="#FF2C2C" name="Put OI" />
                            <Bar dataKey="putlastPrice" fill="#FF2C2C" name="Put Last Price" />
                        </BarChart>
                    </ResponsiveContainer>}
                </div>}


            </div>}
        </div>

    );
};

export default SpyYahooChart;
