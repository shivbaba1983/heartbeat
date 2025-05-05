import { NASDAQ_TOKEN, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';

export async function getYahooFinanceData(selectedTicker) {
    const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/yahooFinanceResource?selectedTicker=${selectedTicker}`;
    let resp;
    try {
        resp =  await fetch(url)
    } catch (err) {
        console.error('Failed to fetch yahoo finace  data:', err);
    }
    return resp;
}