import { NASDAQ_TOKEN, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';

export async function writeS3JsonFile(total, ticker, lstPrice) {
    try {
        await fetch(`${NASDAQ_TOKEN}/api/writes3bucket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callVolume: Number(total?.c_Volume),
                putVolume: Number(total?.p_Volume),
                selectedTicker: ticker,
                lstPrice: lstPrice
            }),
        });
    } catch (err) {
        console.error('Failed to fetch option data:', err);
    }
}