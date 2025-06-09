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
export async function writeS3JsonFileOpenInterest(total, ticker, lstPrice) {
    
    try {
        await fetch(`${NASDAQ_TOKEN}/api/writes3bucketOpenInterest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callOpenInterest: Number(total?.c_OpenInterest),
                putOpenInterest: Number(total?.p_OpenInterest),
                selectedTicker: ticker,
                lstPrice: lstPrice
            }),
        });

    } catch (err) {
        console.error('writeS3JsonFileOpenInterest-Local-Failed to fetch option data:', err);
    }
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

export async function writeToS3BucketOpenInterest(total, ticker, lstPrice) {
    let tempcallOpenInterest = Number(total?.c_OpenInterest);
    let tempputOpenInterest = Number(total?.p_OpenInterest);
    const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/writes3bucketOpenInterest?selectedTicker=${ticker}&callOpenInterest=${tempcallOpenInterest}&putOpenInterest=${tempputOpenInterest}&lstPrice=${lstPrice}&limit=3000`;
    let resp;
    try {
        resp = await fetch(url)
    } catch (err) {
        console.error('writeToS3BucketOpenInterest AWS Server-Failed to write data in S3 bucket:', err);
    }
    return resp;
}