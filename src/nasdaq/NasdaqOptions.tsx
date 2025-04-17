import { useEffect, useState } from "react";
import axios from "axios";
import OptionTable from './OptionTable';
import OptionVolumeChart from './../graph-chart/OptionVolumeChart';
import LiveStrikeVolumeChart from './../graph-chart/LiveStrikeVolumeChart';
import CallPutBarChart from './../graph-chart/CallPutBarChart';
import './NasdaqOptions.scss';
import BarGraphChart from './../graph-bar/BarChart';
import OptionsChart from './../marketData/OptionsChart';
import {NASDAQ_TOKEN }from './../constant/HeartbeatConstants';
const tickerListData = [
  { idx: 1, value: "SPY" },
  { idx: 2, value: "QQQ" },
  { idx: 4, value: "IWM" },
  { idx: 10, value: "AAPL" },
  { idx: 11, value: "NVDA" },
  { idx: 12, value: "AMZN" },
  { idx: 13, value: "GOOG" },
  { idx: 20, value: "TSLA" },
  { idx: 21, value: "DAL" },
  { idx: 22, value: "UNH" },
  { idx: 25, value: "GME" },
  { idx: 23, value: "BABA" },
  { idx: 24, value: "SMCI" },
  { idx: 1101, value: "SOXL" },
  { idx: 1102, value: "TSLL" },
  { idx: 1103, value: "TQQQ" },
  { idx: 1104, value: "SQQQ" },


]
const volumeOrOpenInterest = [
  { idx: 1, value: "volume" },
  { idx: 2, value: "openinterest" },

]
const dayOrMonthData = [
  { idx: 1, value: "day" },
  { idx: 2, value: "month" },

]

const NasdaqOptions = () => {

  //const [data, setData] = useState(null);
  // const [calls, setCalls] = useState([]);
  // const [puts, setPuts] = useState([]);
  const [data, setData] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [assetclass, setAssetclass] = useState('ETF');
  const [volumeOrInterest, setVolumeOrInterest] = useState('volume');
  const [lastTrade, setLastTrade] = useState('');
  const [selectedDayOrMonth, setSelectedDayOrMonth] = useState('day'); // 'day' | 'month' | null
  const [showBarChart, setShowBarChart] = useState(false);
  const [showMarketdata, setShowMarketdata] = useState(false);
  const tickerList = ['QQQ', 'SPY', 'IWM'];
  const [totalCallVolumeCount, setTotalCallVolumeCount] = useState(0);
  const [totalPutVolumeCount, setTotalPutVolumeCount] = useState(0);


    useEffect(() => {
      const fetchOptionsData = async () => {
        try {
          await getmydata();
  
  
        } catch (err) {
          console.error('Failed to fetch option data:', err);
        }
      };
      fetchOptionsData();
    }, [selectedDayOrMonth, selectedTicker, assetclass]);

    useEffect(() => {

     // tickerList.forEach(ticker => {
       // setSelectedTicker(ticker);
       if (isWithinMarketHours()) {
        fetchData(); // Initial call on mount
      } else {
        console.log('⏸ Market is closed. Skipping API call.');
      }


      //});

      
  
      const interval = setInterval(() => {
        fetchData(); // Call every 10 minutes
      }, 10 * 60 * 1000); // 10 mins in milliseconds
  
      return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const fetchData = async () => {
      try {
        const resp= await getmydata();
        // Do something with the data
      } catch (error) {
        console.error('API error:', error);
      }
    };


    // Helper to check if it's between 9:40 AM and 4:15 PM EST, Monday–Friday
const isWithinMarketHours = () => {
  const now = new Date();

  // Convert to EST (New York timezone)
  const estNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );

  const day = estNow.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = estNow.getHours();
  const minutes = estNow.getMinutes();

  // Check for Monday to Friday
  if (day < 1 || day > 5) return false;

  const currentMinutes = hours * 60 + minutes;
  const startMinutes = 9 * 60 + 40;   // 9:40 AM
  const endMinutes = 16 * 60 + 15;    // 4:15 PM

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

  const handleSelect = (value) => {
    setSelectedDayOrMonth((prev) => (prev === value ? null : value)); // toggle off if already selected
  };

  const handleChandleVolumeOrOPrnInterestChangehange = async (e) => {
    const selectedVolumeOrOpenIntereset = e.target.value || 'volume';
    let selectedAsset = "volume"

    if (selectedVolumeOrOpenIntereset === "volume") {
      selectedAsset = 'volume';
    }
    else {
      selectedAsset = 'openinterest';
    }
    setVolumeOrInterest(selectedAsset);

  };


  const handleTickerChange = async (e) => {
    const ticker = e.target.value.toUpperCase() || 'SPY';
    let selectedAsset = "ETF"
    // setCalls([]);
    // setPuts([]);
    setData([]);
    setSelectedTicker(ticker);
    if (ticker === "QQQ" || ticker === "SPY" || ticker === "IWM" || ticker === "TQQQ" || ticker === "SOXL" || ticker === "TSLL" || ticker === "SQQQ") {
      selectedAsset = 'ETF';
    }
    else {
      selectedAsset = 'stocks';
    }
    setAssetclass(selectedAsset);
    //await getmydata(ticker, selectedAsset);
  };

  async function getmydata() {
    //event.preventDefault();
    // setCalls([]);
    // setPuts([]);
    setData([]);
    try {
      //const res = await axios.get(`http://localhost:8080/api/options/${selected}/${assetclass}`);
      //const res = await axios.get(`https://heartbeat-lgee.onrender.com/api/options/${selectedTicker}/${assetclass}/${selected}`);
      const res = await axios.get(`${NASDAQ_TOKEN}/api/options/${selectedTicker}/${assetclass}/${selectedDayOrMonth}`);
      // const res = await axios.get(`http://localhost:5000/api/options/${selectedTicker}/${assetclass}/${selectedDayOrMonth}`);
      //console.log(res.data);
      const rows = res.data?.data?.table?.rows || [];
      const lstPrice = res.data?.data?.lastTrade;
      const match = lstPrice.match(/\$\d+(\.\d+)?/);
      const price = match ? match[0] : null;
      setLastTrade(price);
      //const callData = rows;

      //const callData = rows.map((r) => r.c_Volume).filter(Boolean);
      //const putData = rows.map((r) => r.p_Volume).filter(Boolean);
      // setCalls(callData);
      // setPuts(callData);
      setData(rows);

    } catch (err) {
      console.error('Failed to get options data:', err);
    }
  }


  return (
    <div>
      {/* <h2>NASDAQ Options for GOOG</h2>
      {data ? (
        <ul>
          {data.map((option, index) => (
            <li key={index}>
              Strike: {option.strike}, Price: {option.price}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )} */}

      <div className="vol-or-openinterets">

        <div>
          <label htmlFor="volume-openinterest">Volume or open interest: </label>
          <select id="volume-openinterest" value={volumeOrInterest} onChange={(e) => handleChandleVolumeOrOPrnInterestChangehange(e)}>
            <option value="">-- Choose Expiry --</option>
            {volumeOrOpenInterest.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'inline', gap: '1rem' }} className="common-left-margin">
          <label>
            <input
              type="checkbox"
              checked={selectedDayOrMonth === 'day'}
              onChange={() => handleSelect('day')}
            />
            Day
          </label>

          <label>
            <input
              type="checkbox"
              checked={selectedDayOrMonth === 'month'}
              onChange={() => handleSelect('month')}
            />
            Month
          </label>
        </div>
        <div className="common-left-margin">
          <label htmlFor="expiry-select">Ticker: </label>
          <select id="expiry-select" value={selectedTicker} onChange={(e) => handleTickerChange(e)}>
            <option value="">-- Choose Expiry --</option>
            {tickerListData.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        </div>
        <div className="common-left-margin">
        <input 
        type="text" 
       
        onChange={(e) => handleTickerChange(e)} 
        placeholder="Type something..." 
      />
        </div>
        <div className="common-left-margin">
          <button onClick={(e) => handleTickerChange(e)}>Om shanti</button>
        </div>
        <div className="common-left-margin last-trade-price">
          {lastTrade}
        </div>

        <div>
          <label className="common-left-margin">
            <input
              type="checkbox"
              checked={showBarChart}
              onChange={() => setShowBarChart(!showBarChart)}
            />
            <span>Show Chart</span>
          </label>
        </div>
      </div>

      <div>
        <OptionVolumeChart rows={data} volumeOrInterest={volumeOrInterest} selectedTicker={selectedTicker} />
      </div>

      {/* <div>
        <OptionVolumeChart rows={calls} callOrPut={'call'} volumeOrInterest={volumeOrInterest} selectedTicker={selectedTicker} />
      </div>
      <div>
        <OptionVolumeChart rows={puts} callOrPut={'put'} volumeOrInterest={volumeOrInterest} selectedTicker={selectedTicker} />
      </div> */}
      <div>
        <CallPutBarChart rows={data} volumeOrInterest={volumeOrInterest} />
      </div>


      <div>
        {showBarChart && <BarGraphChart rows={data} selectedTicker={selectedTicker} volumeOrInterest={volumeOrInterest} />}
      </div>

   

      <div className="market-data-checkbox">
        <label className="">
          <input
            type="checkbox"
            checked={showMarketdata}
            onChange={() => setShowMarketdata(!showMarketdata)}
          />
          <span>MarketData</span>
        </label>
      </div>

      <div>
        {showMarketdata && <OptionsChart selectedTicker={selectedTicker} />}
      </div>
      {/* <p>with live data compare</p>*/}
      {/* <LiveStrikeVolumeChart  rowsDataTest={calls}/>  */}
      <div>
        {/* <OptionTable data={calls} title="Call Options" /> 
         <OptionTable data={puts} title="Put Options" /> */}
      </div>


    </div>
  );
}

export default NasdaqOptions;
