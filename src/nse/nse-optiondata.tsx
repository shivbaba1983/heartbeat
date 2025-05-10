import axios from 'axios';
import { NASDAQ_TOKEN, IS_AWS_API, tickerListData, volumeOrOpenInterest, dayOrMonthData } from './../constant/HeartbeatConstants';
import React, { useState, useEffect } from 'react';
import { getNSEOptionData } from './../services/NSEDataService'

const NSEData = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchOptionsData = async () => {
            try {
                //if (isWithinMarketHours()) {
                await getmydata();
                // } else {
                //   console.log('⏸ Market is closed. Skipping API call.');
                // }

            } catch (err) {
                console.error('Failed to fetch option data:', err);
            }
        };
        //if (isWithinMarketHours()) {
        fetchOptionsData();
        //}
        //else {
        //   console.log('⏸ Market is closed. Skipping API call.');
        // }
    }, []);



    async function getmydata() {
        setData([]);
        try {
            const symbol = 'SBIN.NS';
            //***********to call local api end point*************
            //const res = await axios.get(`${NASDAQ_TOKEN}/api/nse-option-chain?symbol=SBIN`);
            const response = await axios.get(`${NASDAQ_TOKEN}/api/yahoonse/${symbol}`);
            const rows = response?.data?.options || [];

            // const rows = res.data?.data?.table?.rows || [];
            setData(rows);
        } catch (err) {
            console.error('Failed to get options data:', err);
        }
    }
    return (
        <div>
            <h1>Option Chain: RELIANCE</h1>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default NSEData;