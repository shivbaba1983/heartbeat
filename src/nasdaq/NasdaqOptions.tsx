import { useEffect, useState } from "react";
import axios from "axios";
import OptionTable from './OptionTable';
import OptionVolumeChart from './../graph-chart/OptionVolumeChart';
import LiveStrikeVolumeChart from './../graph-chart/LiveStrikeVolumeChart';
import CallPutBarChart from './../graph-chart/CallPutBarChart';
import './NasdaqOptions.scss';
import BarGraphChart from './../graph-bar/BarChart';
import OptionsChart from './../marketData/OptionsChart';
import { NASDAQ_TOKEN, STOCKS_ASSETCLASS, ETF_ASSETCLASS, IS_AWS_API, tickerListData, volumeOrOpenInterest, dayOrMonthData, ETF_List } from './../constant/HeartbeatConstants';
import { isWithinMarketHours, isMarketOpenNow, getFridayOfCurrentWeek, getTodayInEST, getEffectiveDate, getComingFriday } from './../common/nasdaq.common';
import DatePicker from './../components/DatePicker';
import { getNasdaqOptionData } from './../services/NasdaqDataService';
import PriceMarquee from './../components/PriceMarquee';
import StockHistoryData from './../nasdaq/StockHistoryData';
import SPXData from './../spx/SPXData';
import StockNewsData from './../stocknews/StockNewsData';
import { getYahooFinanceData } from "./../services/YahooFinanceService";
import YahooData from "./../yahoo/YahooData";
import YahooQuoteDashboard from './../yahoo/YahooQuoteDashboard';
import HighVolumeBreakoutStocks from './HighVolumeBreakoutStocks';
import CboeVolumeChart from './../spx/CboeVolumeChart';
import TrendListDisplay from './../yahoo/TrendListDisplay';
import ExtremeBullishClassification from './../sentiments/ExtremeBullishClassification';

const NasdaqOptions = () => {

  const [selectedDayOrMonth, setSelectedDayOrMonth] = useState('day'); // 'day' | 'month' | null
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [assetclass, setAssetclass] = useState('ETF');
  const [volumeOrInterest, setVolumeOrInterest] = useState('volume');
  const [data, setData] = useState([]);
  const [lastTrade, setLastTrade] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [inputTickerText, setInputTickerText] = useState('');

  const [showBarChart, setShowBarChart] = useState(true);
  const [showMarketdata, setShowMarketdata] = useState(false);
  const [showTrendTable, setShowTrendTable] = useState(false);
  const [showStockNews, setShowStockNews] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showHighVolume, setShowHighVolume] = useState(false);

  const [averageDailyVolume3Month, setAverageDailyVolume3Month] = useState();
  const [isRequestedDateChanage, setIsRequestedDateChanage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stockDetails, setStockdetails] = useState({});
  const [yahooDataRows, setStsetYahooDataRows] = useState([]);
  const [isYahooDataDisplay, setIsYahooDataDisplay] = useState(false);
  const [showExtremelyBullishStreak, setExtremelyBullishStreak] = useState(false);
  useEffect(() => {
    const fetchYahooOptionsData = async () => {
      try {
        let rows = [];
        setStsetYahooDataRows([])
        setIsYahooDataDisplay(false)
        let stockquote = { earningsTimestamp: '' };
        if (ETF_List.includes(selectedTicker))
          setAssetclass(ETF_ASSETCLASS);
        else
          setAssetclass(STOCKS_ASSETCLASS);
        if (IS_AWS_API) {
          //call from aws api
          const response = await getYahooFinanceData(selectedTicker);
          const responseJson = await response.json();
          rows = await responseJson?.options || [];
          stockquote = await responseJson?.quote || { earningsTimestamp: '' };
        } else {
          //call from local api express server
          const response = await axios.get(`${NASDAQ_TOKEN}/api/yahooFinance/${selectedTicker}`);
          rows = await response?.data?.options || [];
          stockquote = await response?.data?.quote || { earningsTimestamp: '' };
        }
        setStockdetails(stockquote);
        setAverageDailyVolume3Month(stockquote?.averageDailyVolume3Month)
        setStsetYahooDataRows(rows);
        setIsYahooDataDisplay(true)
      } catch (err) {
        console.error('Failed to fetch option data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchYahooOptionsData();

  }, [selectedDayOrMonth, selectedTicker, assetclass, requestedDate]);
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        //if (isWithinMarketHours()) {
        if (isMarketOpenNow()) {
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
    // if (isWithinMarketHours()) {
    if (isMarketOpenNow()) {
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

  //Not needed here as JsonUpdater doing this job
  useEffect(() => {

    setIsYahooDataDisplay(true);
  }, [yahooDataRows]);




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
          if (["SPY", "QQQ", "IWM"].includes(selectedTicker))//day validty tickers
            selectedDate =  getEffectiveDate();
          else// weekly validity tickers
            selectedDate = getComingFriday();
        }
        else if (selectedDayOrMonth === 'day' && assetclass === 'stocks') {
          selectedDate =  getComingFriday();//getFridayOfCurrentWeek();
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
        const tempToken = NASDAQ_TOKEN;//import.meta.env.VITE_STOCK_API_URL;
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

  const handleInputTickerText = async (e) => {
    e.preventDefault();
    const ticker = e.target.value.toUpperCase();
    let selectedAsset = "ETF"
    setInputTickerText(ticker);
    // if (ETF_List.includes(ticker)) {
    //   selectedAsset = 'ETF';
    // }
    // else {
    //   selectedAsset = 'stocks';
    // }
    // setAssetclass(selectedAsset);
  };

  const handleTickerChange = async (e) => {
    e.preventDefault();
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

  const handleOmShantiClick = async (e) => {
    e.preventDefault();
    let selectedAsset = "ETF"
    setData([]);
    setAssetclass('');
    setSelectedTicker(inputTickerText);

    if (ETF_List.includes(inputTickerText)) {
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
              onChange={(e) => handleInputTickerText(e)}
              placeholder="Ticker..."
            />
          </div>
          <div className="common-left-margin">
            <button onClick={(e) => handleOmShantiClick(e)}>Om shanti</button>
          </div>
        </div>


        <div className="vol-or-openinterets">
          <div>
            <DatePicker setRequestedDate={setRequestedDate} setIsRequestedDateChanage={setIsRequestedDateChanage} requestedDate={requestedDate} />
          </div>
          <label className="common-left-margin">
            <input
              type="checkbox"
              checked={showBarChart}
              onChange={() => setShowBarChart(!showBarChart)}
            />
            <span>Chart</span>
          </label>

          <label className="common-left-margin">
            <input
              type="checkbox"
              checked={showStockNews}
              onChange={() => setShowStockNews(!showStockNews)}
            />
            <span>News</span>
          </label>
          <label className="common-left-margin">
            <input
              type="checkbox"
              checked={showQuote}
              onChange={() => setShowQuote(!showQuote)}
            />
            <span>Quote</span>
          </label>
        </div>

      </div>
      <div className="common-left-margin last-trade-price">
        <PriceMarquee lastPrice={lastTrade} selectedTicker={selectedTicker} averageAnalystRating={stockDetails?.averageAnalystRating} />
        {/* Last Price: {lastTrade} */}
      </div>
      {/* <div className="yahoo-data-section">
        <SPXData selectedTicker={selectedTicker} assetclass={assetclass} volumeOrInterest={volumeOrInterest} setAverageDailyVolume3Month={setAverageDailyVolume3Month} />
      </div> */}
      {showStockNews && <StockNewsData selectedTicker={selectedTicker} />}

      <div className="yahoo-data-section">
        {isYahooDataDisplay && <YahooData selectedTicker={selectedTicker} volumeOrInterest={volumeOrInterest} rows={yahooDataRows} isYahooDataDisplay={isYahooDataDisplay} stockDetails={stockDetails} />}
        {(stockDetails && showQuote) && <YahooQuoteDashboard stockDetails={stockDetails} selectedTicker={selectedTicker} />}
      </div>

      {isLoading && <div>
        <h2> Loading....... Please wait</h2>
      </div>}

      <div>
        {!isLoading && <OptionVolumeChart rows={data} volumeOrInterest={volumeOrInterest} selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker}/>}
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
        {averageDailyVolume3Month > 1 && <StockHistoryData selectedTicker={selectedTicker} assetclass={assetclass} averageDailyVolume3Month={averageDailyVolume3Month} />}

      </div>

      <div className="market-data-checkbox">
        <label className="">
          <input
            type="checkbox"
            checked={showHighVolume}
            onChange={() => setShowHighVolume(!showHighVolume)}
          />
          <span>Show High Volume 1.5X</span>
        </label>
      </div>

      {showHighVolume && <HighVolumeBreakoutStocks />}


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

      <div className="market-data-checkbox">
        <label className="">
          <input
            type="checkbox"
            checked={showExtremelyBullishStreak}
            onChange={() => setExtremelyBullishStreak(!showExtremelyBullishStreak)}
          />
          <span>Extreme Bullish</span>
        </label>
      </div>

      <div>
        {showMarketdata && <OptionsChart selectedTicker={selectedTicker} />}
      </div>
      {showExtremelyBullishStreak && <ExtremeBullishClassification />}
      <div className="triend-table-checkbox">
        <label className="">
          <input
            type="checkbox"
            checked={showTrendTable}
            onChange={() => setShowTrendTable(!showTrendTable)}
          />
          <span>100 Day Trend Table</span>
        </label>
      </div>

      <div>
        {showTrendTable && <TrendListDisplay />}
      </div>
      <CboeVolumeChart />
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
