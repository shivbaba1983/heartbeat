import { useEffect, useState } from "react";
import axios from "axios";
import { NASDAQ_TOKEN, ETF_List, LogTickerList, JSON_UPDATE_TIME, IS_AWS_API, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { isWithinMarketHours, getFridayOfCurrentWeek, getTodayInEST, getEffectiveDate, getComingFriday } from './../common/nasdaq.common';
import { writeS3JsonFile, writeToS3Bucket } from '../services/WriteS3Service';
import { getNasdaqOptionData } from './../services/NasdaqDataService';

const JsonUpdater = () => {

    useEffect(() => {
        const fetchMyData = async () => {
            const interval = setInterval(() => {
                LogTickerList.forEach(ticker => {
                    if (isWithinMarketHours()) {
                        postDataToS3Bucket(ticker); // write data to json file in s3 bucket    
                    } else {
                        console.log('⏸ Market is closed. Skipping API call.');
                    }
                });
            }, JSON_UPDATE_TIME * 60 * 1000); // 10 mins in milliseconds

            return () => clearInterval(interval); // Cleanup on unmount
        };
        if (isWithinMarketHours()) {
            fetchMyData();
        }
        else {
            console.log('⏸ Market is closed. Skipping API call.');
        }
    }, []);

    const postDataToS3Bucket = async (ticker) => {
        let assetclass = 'stocks';
        const selectedDayOrMonth = 'day';

        try {
            let lstPrice;
            let rows = [];
            let selectedDate = ''
            if (ETF_List.includes(ticker))
                assetclass = 'ETF'
            if (selectedDayOrMonth === 'day' && (assetclass === 'ETF')) {
                if (["TQQQ", "SOXL", "TSLL", "SQQQ",'AAPU'].includes(ticker))
                    selectedDate = getComingFriday();
                else
                    selectedDate = getEffectiveDate();
            }
            else if (selectedDayOrMonth === 'day' && assetclass === 'stocks') {
                selectedDate = getComingFriday();
            }

            if (IS_AWS_API) {
                const response = await getNasdaqOptionData(ticker, assetclass, selectedDayOrMonth, selectedDate);
                const latestData = await response.json();
                lstPrice = latestData?.data?.lastTrade;
                const match = lstPrice ? lstPrice.match(/\$([\d.]+)/) : 0;
                lstPrice = match ? parseFloat(match[1]) : 0;
                rows = latestData?.data?.table?.rows || [];
            } else {
                //***********to call local api end point*************
                const tempToken = import.meta.env.VITE_STOCK_API_URL;
                const res = await axios.get(`${tempToken}/api/options/${ticker}/${assetclass}/${selectedDayOrMonth}`);
                rows = res.data?.data?.table?.rows || [];
                lstPrice = res.data?.data?.lastTrade;
                const match = lstPrice.match(/\$\d+(\.\d+)?/);
                lstPrice = match ? match[0] : null;
            }
            const total = await caculateSum(rows);
            if (total.c_Volume > 0) {
                if (IS_AWS_API) {
                    await writeToS3Bucket(total, ticker, lstPrice) //calling aws amplify deployed api
                } else {
                    await writeS3JsonFile(total, ticker, lstPrice);// calling the local express service
                }
            } else {
                console.error(`observer 0 call or put volume for ${ticker} hence not write to s3 bucket`);
            }


        } catch (err) {
            console.error(`Failed to get options data log writer-JsonUpdater: ${ticker}`, err);
        }
    };


    const caculateSum = async (rows) => {
        return await rows.reduce(
            (totals, row) => {
                const cVol = parseInt(row.c_Volume);
                const pVol = parseInt(row.p_Volume);

                // Add only if the value is a valid number
                if (!isNaN(cVol)) totals.c_Volume += cVol;
                if (!isNaN(pVol)) totals.p_Volume += pVol;

                return totals;
            },
            { c_Volume: 0, p_Volume: 0 }
        );
    }
    return (
        <div>

        </div>
    );
}

export default JsonUpdater;
