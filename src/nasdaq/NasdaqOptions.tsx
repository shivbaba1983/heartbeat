import { useEffect, useState } from "react";
import axios from "axios";
import OptionTable from './OptionTable';
import OptionVolumeChart from './../graph-chart/OptionVolumeChart';
import LiveStrikeVolumeChart from './../graph-chart/LiveStrikeVolumeChart';
import CallPutBarChart from './../graph-chart/CallPutBarChart';
import './NasdaqOptions.scss';
import BarGraphChart from './../graph-bar/BarChart';
import OptionsChart from './../marketData/OptionsChart';
import { NASDAQ_TOKEN, tickerListData, volumeOrOpenInterest, IS_AUTOMATED_LOG, dayOrMonthData } from './../constant/HeartbeatConstants';
import { isWithinMarketHours, getFridayOfCurrentWeek, getTodayInEST } from './../common/nasdaq.common';
import DatePicker from './../components/DatePicker';
const NasdaqOptions = () => {

  const [selectedDayOrMonth, setSelectedDayOrMonth] = useState('day'); // 'day' | 'month' | null
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [assetclass, setAssetclass] = useState('ETF');
  const [volumeOrInterest, setVolumeOrInterest] = useState('volume');
  const [data, setData] = useState([]);
  const [lastTrade, setLastTrade] = useState('');
  const [requestedDate, setRequestedDate] = useState('');

  const [showBarChart, setShowBarChart] = useState(true);
  const [showMarketdata, setShowMarketdata] = useState(false);
  const tickerList = ['QQQ', 'SPY', 'IWM'];
  const [totalCallVolumeCount, setTotalCallVolumeCount] = useState(0);
  const [totalPutVolumeCount, setTotalPutVolumeCount] = useState(0);
  const [isRequestedDateChanage, setIsRequestedDateChanage] = useState(false);

  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        if (isWithinMarketHours()) {
          await getmydata();
        } else {
          console.log('⏸ Market is closed. Skipping API call.');
        }

      } catch (err) {
        console.error('Failed to fetch option data:', err);
      }
    };
    if (isWithinMarketHours()) {
      fetchOptionsData();
    }
    else {
      console.log('⏸ Market is closed. Skipping API call.');
    }
  }, [selectedDayOrMonth, selectedTicker, assetclass, requestedDate]);

  //Not needed here as JsonUpdater doing this job
  useEffect(() => {
    // const fetchMyData = async () => {
    //   const interval = setInterval(() => {
    //     if (isWithinMarketHours()) {
    //       fetchData();
    //     } else {
    //       console.log('⏸ Market is closed. Skipping API call.');
    //     }
    //   }, 1 * 60 * 1000); // 10 mins in milliseconds
    //   return () => clearInterval(interval); // Cleanup on unmount
    // };
    // if (isWithinMarketHours())
    //   fetchMyData();

    if (isWithinMarketHours()) {
      fetchData();
    } else {
      console.log('⏸ Market is closed. Skipping API call.');
    }

  }, [selectedDayOrMonth, selectedTicker, assetclass, requestedDate]);

  const fetchData = async () => {
    try {
      const resp = await getmydata();
      // Do something with the data
    } catch (error) {
      console.error('API error:', error);
    }
  };

  const fetchOptionsData = async (symbol, assetclass) => {
    try {
      const response = await axios.get('https://gj9yjr3b68.execute-api.us-east-1.amazonaws.com/dev');

      return response; // Assuming the response is JSON
    } catch (error) {
      console.error('Error fetching options data:', error);
      throw error;
    }
  };

  async function getmydata() {
    setData([]);
    try {
      let selectedDate = ''
      if (isRequestedDateChanage) {
        selectedDate = requestedDate;
        setIsRequestedDateChanage(false);
      } else {
        if (selectedDayOrMonth === 'day' && (assetclass === 'ETF')) {
          if (["TQQQ", "SOXL", "TSLL", "SQQQ"].includes(selectedTicker))
            selectedDate = getFridayOfCurrentWeek();
          else
            selectedDate = getTodayInEST();
        }
        else if (selectedDayOrMonth === 'day' && assetclass === 'stocks') {
          selectedDate = getFridayOfCurrentWeek();
        }
      }



      //*********** to call aws amplify deployed api ***********
      const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/mywelcomeresource?selectedTicker=${selectedTicker}&assetclass=${assetclass}&selectedDayOrMonth=${selectedDayOrMonth}&inputDate=${selectedDate}`;

      const response = await fetch(url);// await fetchOptionsData('NVDA', 'stocks');//await axios.get(url);
      const latestData = await response.json();
      //const temprows = JSON.parse(latestData.data?.body)  || [];
      let lstPrice = latestData?.data?.lastTrade;
      const match = lstPrice? lstPrice.match(/\$([\d.]+)/) : 0;
      lstPrice = match ? parseFloat(match[1]) : 0;
      const rows = latestData?.data?.table?.rows || [];

      //***********to call local api end point*************
      // const res = await axios.get(`${NASDAQ_TOKEN}/api/options/${selectedTicker}/${assetclass}/${selectedDayOrMonth}`);
      // const rows = res.data?.data?.table?.rows || [];
      // const lstPrice = res.data?.data?.lastTrade;
      // const match = lstPrice.match(/\$\d+(\.\d+)?/);
      // const price = match ? match[0] : null;
      setLastTrade(lstPrice);
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


  return (
    <div>
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
      <div className="common-left-margin last-trade-price">
       <span>Last Price: {lastTrade}</span> 
      </div>

      <div>

        <DatePicker setRequestedDate={setRequestedDate} setIsRequestedDateChanage={setIsRequestedDateChanage} />
      </div>
      <div>
        {<OptionVolumeChart rows={data} volumeOrInterest={volumeOrInterest} selectedTicker={selectedTicker} />}
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
