import { NASDAQ_TOKEN, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';

export async function getNSEOptionData(selectedTicker, assetclass, selectedDayOrMonth, selectedDate) {
    //const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/mywelcomeresource?selectedTicker=${selectedTicker}&assetclass=${assetclass}&selectedDayOrMonth=${selectedDayOrMonth}&inputDate=${selectedDate}`;
    const url='http://localhost:3000/nse-option-chain?symbol=SBIN'
    let resp;
    try {
        resp =  await fetch(url)
    } catch (err) {
        console.error('Failed to fetch option data:', err);
    }
    return resp;
}