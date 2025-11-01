import { NASDAQ_TOKEN, LogTickerList, JSON_UPDATE_TIME, tickerListData, volumeOrOpenInterest, dayOrMonthData } from '../constant/HeartbeatConstants';

export async function getYahooFinanceData(selectedTicker) {
  const url = `https://07tps3arid.execute-api.us-east-1.amazonaws.com/welcome/yahooFinanceResource?selectedTicker=${selectedTicker}`;
  let resp;
  try {
    resp = await fetch(url)
  } catch (err) {
    console.error('Failed to fetch yahoo finace  data:', err);
  }
  return resp;
}

export async function getYahooFinanceQuaterlyDynamicData(ticker: string) {
  const url = `${NASDAQ_TOKEN}/api/fetchQuaterOptionData`;
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker }),
    });

    if (!resp.ok) {
      throw new Error(`Server error: ${resp.status}`);
    }
  } catch (err) {
    console.error('Failed to fetch yahoo finance data:', err);
    throw err;
  }
  return resp;
}

export async function getYahooFinanceQuaterlyOptionData(QuarterlyTickerList: string[]) {
  const url = `http://localhost:3000/api/fetchDailyOptions`;
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // ✅ Send both values in one JSON object
      body: JSON.stringify({ QuarterlyTickerList }),
    });
    if (!resp.ok) {
      throw new Error(`Server error: ${resp.status}`);
    }
  } catch (err) {
    console.error('Failed to fetch yahoo finance data:', err);
    throw err;
  }
  return resp;
}

export async function getServerSavedData(ticker: string) {
  const url = `http://localhost:3000/api/ticker`;
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker }),
    });

    if (!resp.ok) {
      throw new Error(`Server error: ${resp.status}`);
    }
  } catch (err) {
    console.error('Failed to fetch yahoo finance data:', err);
    throw err;
  }
  return resp;
}
export async function clearExpiredData() {
  const url = `http://localhost:3000/api/cleanExpiredData`;
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({  }),
    });

    if (!resp.ok) {
      throw new Error(`Server error: ${resp.status}`);
    }
  } catch (err) {
    console.error('Failed to fetch yahoo finance data:', err);
    throw err;
  }
  return resp;
}