import { useEffect, useState } from "react";
import axios from "axios";
import { NASDAQ_TOKEN, LogTickerList,tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { isWithinMarketHours } from '../common/nasdaq.common';

const JsonUpdater = () => {
    const [data, setData] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState('SPY');
    const [assetclass, setAssetclass] = useState('ETF');
    const [volumeOrInterest, setVolumeOrInterest] = useState('volume');
    const [lastTrade, setLastTrade] = useState('');
    const [selectedDayOrMonth, setSelectedDayOrMonth] = useState('day'); // 'day' | 'month' | null
    const [showBarChart, setShowBarChart] = useState(false);
    const [showMarketdata, setShowMarketdata] = useState(false);
    const [totalCallVolumeCount, setTotalCallVolumeCount] = useState(0);
    const [totalPutVolumeCount, setTotalPutVolumeCount] = useState(0);

    useEffect(() => {
        const fetchMyData = async () => {
            const interval = setInterval(() => {
                LogTickerList.forEach(ticker => {
                    if (true) {
                        fetchData(ticker); // Initial call on mount    
                    } else {
                        console.log('⏸ Market is closed. Skipping API call.');
                    }
                });
            }, 5 * 60 * 1000); // 10 mins in milliseconds

            return () => clearInterval(interval); // Cleanup on unmount
        };
        if (true) {
            fetchMyData();
        }
    }, []);


    const fetchData = async (ticker) => {
        setData([]);
        let assetclass = 'stocks';
        const selectedDayOrMonth = 'day';
        try {

            if (ticker === "SPY" || ticker === "QQQ" || ticker === "IWM" || ticker === "TQQQ" || ticker === "SOXL" || ticker === "TSLL" || ticker === "SQQQ")
                assetclass = 'ETF'
            const res = await axios.get(`${NASDAQ_TOKEN}/api/options/${ticker}/${assetclass}/${selectedDayOrMonth}`);
            // const res = await axios.get(`http://localhost:5000/api/options/${selectedTicker}/${assetclass}/${selectedDayOrMonth}`);
            const rows = res.data?.data?.table?.rows || [];
            const lstPrice = res.data?.data?.lastTrade;
            const total = await caculateSum(rows);
            await writeJsonFile(total, ticker);

        } catch (err) {
            console.error('Failed to get options data:', err);
        }
    };


    const caculateSum = async (rows) => {
        return rows.reduce(
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

    const writeJsonFile = async (total, ticker) => {
        try {
            fetch(`${NASDAQ_TOKEN}/api/volume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callVolume: Number(total?.c_Volume),
                    putVolume: Number(total?.p_Volume),
                    selectedTicker: ticker,
                }),
            });
        } catch (err) {
            console.error('Failed to fetch option data:', err);
        }
    }
    return (
        <div>

        </div>
    );
}

export default JsonUpdater;
