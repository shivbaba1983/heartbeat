import { useEffect, useState } from "react";
import axios from "axios";
import OptionTable from './OptionTable';
import OptionVolumeChart from './../graph-chart/OptionVolumeChart';
import LiveStrikeVolumeChart from './../graph-chart/LiveStrikeVolumeChart';
import CallPutBarChart from './../graph-chart/CallPutBarChart';
import './NasdaqOptions.scss';
import BarGraphChart from './../graph-bar/BarChart';
import OptionsChart from './../marketData/OptionsChart';
import { NASDAQ_TOKEN, IS_AWS_API, tickerListData, volumeOrOpenInterest, dayOrMonthData, ETF_List } from './../constant/HeartbeatConstants';
import { isWithinMarketHours, getFridayOfCurrentWeek, getTodayInEST, getEffectiveDate, getComingFriday } from './../common/nasdaq.common';
import DatePicker from './../components/DatePicker';
import { getNasdaqOptionData } from './../services/NasdaqDataService';
import PriceMarquee from './../components/PriceMarquee';
import StockHistoryData from './../nasdaq/StockHistoryData';
import SPXData from './../spx/SPXData';
import StockNewsData from './../stocknews/StockNewsData';
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
  const [showStockNews, setShowStockNews] = useState(false);
  const [averageDailyVolume3Month, setAverageDailyVolume3Month] = useState(1);
  const [isRequestedDateChanage, setIsRequestedDateChanage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    if (isWithinMarketHours()) {
      fetchOptionsData();
    }
    else {
      setIsLoading(false);
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

    // if (isWithinMarketHours()) {
    fetchData();
    // } else {
    //   console.log('⏸ Market is closed. Skipping API call.');
    // }

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
            selectedDate = getComingFriday();
          else
            selectedDate = getEffectiveDate();// getTodayInEST();
        }
        else if (selectedDayOrMonth === 'day' && assetclass === 'stocks') {
          selectedDate = getComingFriday();//getFridayOfCurrentWeek();
        }
        setRequestedDate(selectedDate)
      }

      //*********** to call aws amplify deployed api & mywelcomefunction Lambda  ***********
      //const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/mywelcomeresource?selectedTicker=${selectedTicker}&assetclass=${assetclass}&selectedDayOrMonth=${selectedDayOrMonth}&inputDate=${selectedDate}`;
      let lstPrice;
      let rows = [];
      if (IS_AWS_API) {
        const response = await getNasdaqOptionData(selectedTicker, assetclass, selectedDayOrMonth, selectedDate);
        //const response = await fetch(url);// await fetchOptionsData('NVDA', 'stocks');//await axios.get(url);
        const latestData = await response.json();
        //const temprows = JSON.parse(latestData.data?.body)  || [];
        lstPrice = latestData?.data?.lastTrade;
        const match = lstPrice ? lstPrice.match(/\$([\d.]+)/) : 0;
        lstPrice = match ? parseFloat(match[1]) : 0;
        rows = latestData?.data?.table?.rows || [];
      } else {
        //***********to call local api end point*************
        const tempToken = import.meta.env.VITE_STOCK_API_URL;
        const res = await axios.get(`${tempToken}/api/options/${selectedTicker}/${assetclass}/${selectedDayOrMonth}`);
        rows = res.data?.data?.table?.rows || [];
        lstPrice = res.data?.data?.lastTrade;
        const match = lstPrice.match(/\$\d+(\.\d+)?/);
        lstPrice = match ? match[0] : null;
      }



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
    const ticker = e.target.value.toUpperCase();
    let selectedAsset = "ETF"
    setData([]);
    setSelectedTicker(ticker);

    if (ETF_List.includes(ticker)) {
      selectedAsset = 'ETF';
    }
    else {
      selectedAsset = 'stocks';
    }
    setAssetclass(selectedAsset);
  };


  return (
    <div>

      <div className="panel-sticky-marquee">
        <div className="vol-or-openinterets">
          <div style={{ display: 'flex', gap: '1rem' }}>
            {volumeOrOpenInterest.map((range) => (
              <label key={range.idx}>
                <input
                  type="radio"
                  name="volOpenInterest"
                  value={range.value}
                  checked={volumeOrInterest === range.value}
                  onChange={(e) => handleChandleVolumeOrOPrnInterestChangehange(e)}
                />
                {range.value}
              </label>
            ))}
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
        </div>

        <div className="vol-or-openinterets">
          <div className="common-left-margin">
            <select id="expiry-select" value={selectedTicker} onChange={(e) => handleTickerChange(e)}>
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
              placeholder="Ticker..."
            />
          </div>
          <div className="common-left-margin">
            <button onClick={(e) => handleTickerChange(e)}>Om shanti</button>
          </div>
        </div>


        <div className="vol-or-openinterets">
          <div>
            <DatePicker setRequestedDate={setRequestedDate} setIsRequestedDateChanage={setIsRequestedDateChanage} requestedDate={requestedDate} />
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

      </div>
      <div className="common-left-margin last-trade-price">
        <PriceMarquee lastPrice={lastTrade} selectedTicker={selectedTicker} />
        {/* Last Price: {lastTrade} */}
      </div>
      <div className="yahoo-data-section">
        <SPXData selectedTicker={selectedTicker} assetclass={assetclass} volumeOrInterest={volumeOrInterest} setAverageDailyVolume3Month={setAverageDailyVolume3Month} />
      </div>

      {isLoading && <div>
        <h2> Loading....... Please wait</h2>
      </div>}

      <div>
        {!isLoading && <OptionVolumeChart rows={data} volumeOrInterest={volumeOrInterest} selectedTicker={selectedTicker} />}
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

      <div>
        {averageDailyVolume3Month > 1 && <StockHistoryData selectedTicker={selectedTicker} assetclass={assetclass} />}
        <h3> Three Month Avg. Volume {(averageDailyVolume3Month / 1000000)} M (Yahoo)</h3>
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


      <div className="market-data-checkbox">
        <label className="">
          <input
            type="checkbox"
            checked={showStockNews}
            onChange={() => setShowStockNews(!showStockNews)}
          />
          <span>Stock News</span>
        </label>
      </div>

      {showStockNews && <StockNewsData selectedTicker={selectedTicker} />}

    </div>
  );
}

export default NasdaqOptions;
