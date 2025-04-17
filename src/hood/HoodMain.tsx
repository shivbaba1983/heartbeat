

import { useEffect, useState } from "react";
import axios from "axios";




const HoodMain = () => {

  //const [data, setData] = useState(null);
  const [calls, setCalls] = useState([]);
  const [puts, setPuts] = useState([]);

  //const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [assetclass, setAssetclass] = useState('ETF');
  const [volumeOrInterest, setVolumeOrInterest] = useState('volume');
  const [lastTrade, setLastTrade] = useState('');
  const [selectedDayOrMonth, setSelectedDayOrMonth] = useState('day'); // 'day' | 'month' | null
  const [showBarChart, setShowBarChart] = useState(true);

  const [optionChartData, setOPtionChartData] = useState([]);

  const [show, setShow] = useState(false);
  const username = 'waditake@gmail.com';
  const password = 'anilwaditake'

  const handleHoodClick = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/hoodtest')

      console.log('Access Token:', response.data.access_token);
      return response.data.access_token;
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      return null;
    }
  };

  return (
    <div>
      <button>Hood</button>
    </div>
  );
}

export default HoodMain;
