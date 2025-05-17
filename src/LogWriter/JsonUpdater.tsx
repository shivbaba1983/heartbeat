import { useEffect, useState } from "react";
import axios from "axios";
import { NASDAQ_TOKEN, ETF_List, LogTickerList, JSON_UPDATE_TIME, IS_AWS_API, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { isWithinMarketHours } from '../common/nasdaq.common';
import { writeS3JsonFile, writeToS3Bucket } from '../services/WriteS3Service';

const JsonUpdater = () => {
    const [data, setData] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState('SPY');

    useEffect(() => {
        const fetchMyData = async () => {
            const interval = setInterval(() => {
                LogTickerList.forEach(ticker => {
                   // if (isWithinMarketHours()) {
                        postDataToS3Bucket(ticker); // write data to json file in s3 bucket    
                    // } else {
                    //     console.log('⏸ Market is closed. Skipping API call.');
                    // }
                });
            }, JSON_UPDATE_TIME * 60 * 1000); // 10 mins in milliseconds

            return () => clearInterval(interval); // Cleanup on unmount
        };
       // if (isWithinMarketHours()) {
            fetchMyData();
        // }
        // else {
        //     console.log('⏸ Market is closed. Skipping API call.');
        // }
    }, []);

    const postDataToS3Bucket = async (ticker) => {
        setData([]);
        let assetclass = 'stocks';
        const selectedDayOrMonth = 'day';
        try {

            if (ETF_List.includes(ticker))
                assetclass = 'ETF'
            const res = await axios.get(`${NASDAQ_TOKEN}/api/options/${ticker}/${assetclass}/${selectedDayOrMonth}`);
            // const res = await axios.get(`http://localhost:5000/api/options/${selectedTicker}/${assetclass}/${selectedDayOrMonth}`);
            const rows = res.data?.data?.table?.rows || [];
            let lstPrice = res.data?.data?.lastTrade;
            const match = lstPrice ? lstPrice.match(/\$([\d.]+)/) : 0;
            lstPrice = match ? parseFloat(match[1]) : 0;
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
            console.error('Failed to get options data log writer-JsonUpdater:', err);
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

    //moved this part to services
    // const writeJsonFile = async (total, ticker,lstPrice) => {
    //     try {
    //         fetch(`${NASDAQ_TOKEN}/api/writes3bucket`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 callVolume: Number(total?.c_Volume),
    //                 putVolume: Number(total?.p_Volume),
    //                 selectedTicker: ticker,
    //                 lstPrice:lstPrice
    //             }),
    //         });
    //     } catch (err) {
    //         console.error('Failed to fetch option data:', err);
    //     }
    // }
    return (
        <div>

        </div>
    );
}

export default JsonUpdater;
