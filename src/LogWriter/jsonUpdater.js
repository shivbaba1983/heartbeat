import axios from "axios";
import { setInterval } from "timers";
const LogTickerList = ['AAPL', 'NVDA', 'SPY', 'QQQ', 'IWM', 'AMZN', 'TSLA', 'SOXL', 'INTC', 'AMD', 'TTD', 'NIO','AAL']; // your list
const ETF_List = ['SPY', 'QQQ', 'IWM', 'TQQQ', 'SOXL', 'TSLL', 'SQQQQ', 'AAPU', 'NVDL', 'AMDL', 'BITX', 'AMZU', 'GGLL'];
const JSON_UPDATE_TIME = 10; // minutes
let assetclass = 'stocks';
const selectedDayOrMonth = 'day';
let lstPrice;
let rows = [];

const isMarketOpenNow = () => {
  const now = new Date();

  // Convert to New York time
  const estNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = estNow.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;

  const hours = estNow.getHours();
  const minutes = estNow.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const marketOpen = 9 * 60 + 45; // 9:30 AM
  const marketClose = 16 * 60;    // 4:00 PM

  return totalMinutes >= marketOpen && totalMinutes < marketClose;
};

const processTicker = async (ticker) => {
    if (ETF_List.includes(ticker))
        assetclass = 'ETF'
    else
    assetclass = 'stocks'

    try {
        const res = await axios.get(`http://localhost:3000/api/options/${ticker}/${assetclass}/${selectedDayOrMonth}`);
        rows = res.data?.data?.table?.rows || [];
        lstPrice = res.data?.data?.lastTrade;
        const match = lstPrice?.match(/\$\d+(\.\d+)?/);
        lstPrice = match ? match[0] : null;

        const total = await caculateSum(rows);
        const dtnow = new Date();
        console.log(`Processed ${ticker}: volume=${res.data?.data?.table?.rows?.length}, ${dtnow}`);

        try {
            await fetch(`http://localhost:3000/api/volume`, {
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
            console.error('jsonupdate js while writing data error:', err);
        }
    } catch (error) {
        console.error(`Failed for ${ticker}`, error?.message);
    }
};

  // ✅ Function to trigger daily data fetch
  const handlePullNewData = async () => {
    try {
      console.log('Fetching new data from Yahoo Finance...');
      const resp = await axios.get(`http://localhost:3000/api/fetchDailyOptions`);     
      if (!resp?.ok) throw new Error('Failed to fetch daily options');
       console.log('✅ New data pulled successfully.');
    } catch (err) {
      console.log(err.message);
    } finally {
      
    }
  };

const caculateSum = async (rows) => {
    return await rows.reduce(
        (totals, row) => {
            const cVol = parseInt(row.c_Volume);
            const pVol = parseInt(row.p_Volume);
            const cOpenInterest = parseInt(row.c_Openinterest);
            const pOpenInterest = parseInt(row.p_Openinterest);
            // Add only if the value is a valid number
            if (!isNaN(cVol)) totals.c_Volume += cVol;
            if (!isNaN(pVol)) totals.p_Volume += pVol;

            if (!isNaN(cOpenInterest)) totals.c_OpenInterest += cOpenInterest;
            if (!isNaN(pOpenInterest)) totals.p_OpenInterest += pOpenInterest;

            return totals;
        },
        { c_Volume: 0, p_Volume: 0, c_OpenInterest: 0, p_OpenInterest: 0 }
    );
};

const startJob = () => {
    console.log(`Starting ${JSON_UPDATE_TIME} -min ticker job...`);

    setInterval(() => {
        if (!isMarketOpenNow()) {
            console.log("jsonUpdater-Market closed — skipping...");
            return;
        }
        LogTickerList.forEach((ticker) => processTicker(ticker));
    }, JSON_UPDATE_TIME * 60 * 1000);
};

startJob();