//export const NASDAQ_TOKEN ='https://b6a9-2600-1700-6cb0-2a20-6899-3054-f454-356b.ngrok-free.app';// 'http://localhost:5000';//https://main.d1rin969pdam05.amplifyapp.com';//'https://ad7c-2600-1700-6cb0-2a20-5914-66a1-1a7a-435e.ngrok-free.app';
export const NASDAQ_TOKEN ='https://main.d1rin969pdam05.amplifyapp.com';
//export const NASDAQ_TOKEN ='http://localhost:3000';
export const IS_AWS_API =true;
export const JSON_UPDATE_TIME =2;//in minutes
export const YAHOO_VOLUME_LIMIT =1000;
export const LogTickerList = ['AMZN','SPY', 'QQQ', 'IWM','AAPL', 'NVDA', 'GOOG', 'TSLA','SOXL', 'SOFI','SQQQ', 'HUM'];
//export const LogTickerList = ['NVDA'];
export const ETF_List = ['SPY', 'QQQ', 'IWM', 'TQQQ','SOXL', 'TSLL', 'SQQQQ'];
export const tickerListData = [
    { idx: 1, value: "SPY" },
    { idx: 2, value: "QQQ" },
    { idx: 4, value: "IWM" },
    { idx: 10, value: "AAPL" },
    { idx: 11, value: "NVDA" },
    { idx: 12, value: "AMZN" },
    { idx: 13, value: "GOOG" },
    { idx: 20, value: "TSLA" },
    { idx: 21, value: "DAL" },
    { idx: 22, value: "AAL" },
    { idx: 23, value: "Uber" },    
    { idx: 201, value: "GME" },
    { idx: 202, value: "BABA" },
    { idx: 203, value: "SMCI" },
    { idx: 1101, value: "SOXL" },
    { idx: 1102, value: "TSLL" },
    { idx: 1103, value: "TQQQ" },
    { idx: 1104, value: "SQQQ" },
    { idx: 1105, value: "SOFI" },
    { idx: 1106, value: "HUM" },
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
    'MAX': null, // Will be handled specially
  };
