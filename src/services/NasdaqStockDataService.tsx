import { NASDAQ_TOKEN, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';

export async function getNasdaqStockHistoryData(selectedTicker, assetclass, requestedFromDate, todayDate) {
    const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/stockhistoryresource?selectedTicker=${selectedTicker}&assetclass=${assetclass}&fromdate=${requestedFromDate}&todate=${todayDate}&limit=3000`;
    let resp;
    try {
        resp =  await fetch(url)
    } catch (err) {
        console.error('Failed to fetch option data:', err);
    }
    return resp;
}