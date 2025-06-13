//export const NASDAQ_TOKEN ='https://b6a9-2600-1700-6cb0-2a20-6899-3054-f454-356b.ngrok-free.app';// 'http://localhost:5000';//https://main.d1rin969pdam05.amplifyapp.com';//'https://ad7c-2600-1700-6cb0-2a20-5914-66a1-1a7a-435e.ngrok-free.app';
export const NASDAQ_TOKEN ='https://main.d1rin969pdam05.amplifyapp.com';
//export const NASDAQ_TOKEN ='http://localhost:3000';
export const IS_AWS_API =true;
export const JSON_UPDATE_TIME =10;//in minutes
export const YAHOO_VOLUME_LIMIT =1000;
export const LogTickerList = ['AAPL', 'NVDA','SPY','QQQ','IWM','AMZN', 'GOOG', 'TSLA','META','MSFT','SOXL'];
//export const LogTickerList = ['NVDA'];
export const ETF_List = ['SPY', 'QQQ', 'IWM', 'TQQQ','SOXL', 'TSLL', 'SQQQQ','AAPU','NVDL','AMDL','BITX','AMZU','GGLL'];
export const INDEXES = ["IWM", "SPY", "QQQ"];
export const MAG7 = ["TSLA", "AAPL", "NVDA", "GOOG", "AMZN", "MSFT","META"];
export const tickerListData = [
     { idx: 11, value: "NVDA" },
    { idx: 1, value: "SPY" },
    { idx: 2, value: "QQQ" },
    { idx: 4, value: "IWM" },
    { idx: 10, value: "AAPL" },
   
    { idx: 12, value: "AMZN" },
    { idx: 13, value: "GOOG" },
    { idx: 20, value: "TSLA" },
     { idx: 1109, value: "MSFT" },
      { idx: 1110, value: "META" },
    { idx: 21, value: "AMD" },
    { idx: 22, value: "AAL" },
    { idx: 23, value: "DAL" },    
    { idx: 201, value: "GME" },
    { idx: 202, value: "BABA" },
    { idx: 203, value: "SMCI" },
    { idx: 1101, value: "SOXL" },
    { idx: 1102, value: "TSLL" },
    { idx: 1103, value: "TQQQ" },
    { idx: 1104, value: "SQQQ" },
    { idx: 1105, value: "SOFI" },
    { idx: 1106, value: "HUM" },
    { idx: 1107, value: "INTC" },
]
export const volumeOrOpenInterest = [
    { idx: 1, value: "volume" },
    { idx: 2, value: "openinterest" },

]
export const dayOrMonthData = [
    { idx: 1, value: "day" },
    { idx: 2, value: "month" },

]
export const TIME_RANGES = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825,
    '10Y': 3650,
    'MAX': null, // Will be handled specially
  };
