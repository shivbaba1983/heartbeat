import { useEffect, useState } from "react";
import axios from "axios";

import axiosInstance from './axiosInstance';
import OptionsChart from './OptionsChart';
const MarketDataMain = ({selectedTicker}) => {

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
  

 

    return (
        <div>
            <OptionsChart selectedTicker={selectedTicker}/>
        </div>
    );
}

export default MarketDataMain;
