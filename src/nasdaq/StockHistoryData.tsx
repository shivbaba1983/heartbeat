import { useEffect, useState } from "react";
import axios from "axios";
import { NASDAQ_TOKEN, ETF_List, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { isWithinMarketHours, getTodayInEST } from '../common/nasdaq.common';
import DateRangeSelector from './../components/DateRangeSelector';
import { getNasdaqStockHistoryData } from './../services/NasdaqStockDataService';
import StockChart from './../graph-chart/StockChart';

const StockHistoryData = ({ selectedTicker, assetclass }) => {
    const [stockHistoryData, setStockHistoryData] = useState([]);
    //const [selectedTicker, setSelectedTicker] = useState('SPY');
    const [requestedFromDate, setRequestedFromDate] = useState('');
    const [requestedToDate, setRequestedToDate] = useState('');
    useEffect(() => {
        const fetchMyData = async () => {
            await getStockHistoryAPIData(selectedTicker); // write data to json file in s3 bucket    
        };
        fetchMyData();
    }, [selectedTicker, requestedFromDate]);

    const getStockHistoryAPIData = async (ticker) => {
        setStockHistoryData([]);
        const todayDate = getTodayInEST()
        try {

            if (ETF_List.includes(selectedTicker))
                assetclass = 'ETF'
            //call through deploye API lamda method
            const response = await getNasdaqStockHistoryData(selectedTicker, assetclass, requestedFromDate, todayDate);
            const latestData = await response.json();

            //call from local api express server
            //const response = await axios.get(`${NASDAQ_TOKEN}/api/stockhistory/${selectedTicker}/${assetclass}/${requestedFromDate}/${todayDate}`);
            //const rows = response.data?.data?.tradesTable?.rows || [];

            const rows = latestData.data?.tradesTable?.rows || [];
            setStockHistoryData(rows);
        } catch (err) {
            console.error('Failed to get options data log writer-JsonUpdater:', err);
        }
    };

    return (
        <div>
            <span> Stock History Data</span>
            <DateRangeSelector setRequestedFromDate={setRequestedFromDate} />
            {stockHistoryData?.length > 0 && <StockChart stockHistoryData={stockHistoryData} />}
        </div>
    );
}

export default StockHistoryData;
