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
        console.error('writeS3JsonFile-Local-Failed to fetch option data:', err);
    }
}


export async function updateLocalStore(total, ticker, lstPrice) {
    try {
        let ratio = total?.p_Volume / total?.c_Volume;
        let prediction = '';

        if (ratio < 0.5) prediction = 'ExtremelyBullish';
        else if (ratio < 0.7) prediction = 'Bullish';
        else if (ratio <= 1.0) prediction = 'Neutral';
        else if (ratio <= 1.3) prediction = 'Bearish';
        else prediction = 'ExtremelyBearish';
        let finalRatio = ratio.toFixed(2).toString();
        const stockData = {
            selectedTicker: {
                callVolume: total?.c_Volume,
                putVolume: total?.p_Volume,
                customClassName: total?.c_Volume > total?.p_Volume ? 'greenmarket' : 'redmareket',
                ticker: ticker,
                lstPrice: lstPrice,
                ratio: finalRatio,
                prediction: prediction
            },
        };
        await processLocalStorage(stockData, ticker);
    } catch (err) {
        console.error('writeS3JsonFile-Local-Failed to fetch option data:', err);
    }
}

async function processLocalStorage(stockData, selectedTicker) {
    const savedDate = localStorage.getItem('marketDataDate');
    const today = new Date().toISOString().slice(0, 10);
    if (savedDate !== today) {
        localStorage.removeItem('marketData');
        localStorage.setItem('marketDataDate', today);
    }
    const existing = localStorage.getItem('marketData');
    const existingData = existing ? JSON.parse(existing) : {};
    //if (MagnificentSevenStockList.includes(selectedTicker)) {
    existingData[selectedTicker] = stockData;
    localStorage.setItem('marketData', JSON.stringify(existingData));
    localStorage.setItem('marketDataDate', today);
    //}
}

export async function writeToS3Bucket(total, ticker, lstPrice) {
    let tempcallVolume = Number(total?.c_Volume);
    let tempputVolume = Number(total?.p_Volume);
    const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/writes3bucket?selectedTicker=${ticker}&callVolume=${tempcallVolume}&putVolume=${tempputVolume}&lstPrice=${lstPrice}&limit=3000`;
    let resp;
    try {
        resp = await fetch(url)
    } catch (err) {
        console.error('writeToS3Bucket AWS Server-Failed to write data in S3 bucket:', err);
    }
    return resp;
}