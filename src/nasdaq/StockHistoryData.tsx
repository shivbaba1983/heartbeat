import { useEffect, useState } from "react";
import axios from "axios";
import { NASDAQ_TOKEN, ETF_List, IS_AWS_API, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';
import { isWithinMarketHours, getTodayInEST } from '../common/nasdaq.common';
import DateRangeSelector from './../components/DateRangeSelector';
import { getNasdaqStockHistoryData } from './../services/NasdaqStockDataService';
import StockChart from './../graph-chart/StockChart';

const StockHistoryData = ({ selectedTicker, assetclass }) => {
    const [stockHistoryData, setStockHistoryData] = useState([]);
    //const [selectedTicker, setSelectedTicker] = useState('SPY');
    const [requestedFromDate, setRequestedFromDate] = useState('');
    const [requestedToDate, setRequestedToDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchMyData = async () => {
            try {
                await getStockHistoryAPIData(selectedTicker);
            } catch (err) {
                console.error('Failed to fetch option history data from Nasdaq:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyData();
    }, [selectedTicker, requestedFromDate]);

    const getStockHistoryAPIData = async (ticker) => {
        setStockHistoryData([]);
        const todayDate = getTodayInEST()
        try {
            let rows = [];
            if (ETF_List.includes(selectedTicker))
                assetclass = 'ETF'
            //call through deploye API lamda method
            if (IS_AWS_API) {
                const response = await getNasdaqStockHistoryData(selectedTicker, assetclass, requestedFromDate, todayDate);
                const latestData = await response.json();
                rows = latestData.data?.tradesTable?.rows || [];
            } else {
                //call from local api express server
                const response = await axios.get(`${NASDAQ_TOKEN}/api/stockhistory/${selectedTicker}/${assetclass}/${requestedFromDate}/${todayDate}`);
                rows = response.data?.data?.tradesTable?.rows || [];
            }
            setStockHistoryData(rows);
        } catch (err) {
            console.error('Failed stock history data:', err);
        }
    };

    return (
        <div>
            {isLoading && <div>
                <h2> Loading....... Please wait</h2>
            </div>}
            {!isLoading && <div style={{ marginTop: 30 }}>
                <h3> Stock History Data {selectedTicker}</h3>
                <DateRangeSelector setRequestedFromDate={setRequestedFromDate} />
                {stockHistoryData?.length > 0 && <StockChart stockHistoryData={stockHistoryData} />}
            </div>}
        </div>
    );
}

export default StockHistoryData;
