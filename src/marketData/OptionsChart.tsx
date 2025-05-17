import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import {getComingFriday} from './../common/nasdaq.common';
import { BarChart, Bar, } from 'recharts';
import PredictionHint from './../components/PredictionHint';
import axiosInstance from './axiosInstance';
let totalCallVolume = 0;
let totalPutVolume = 0;
let exDate;
const validityData = [
    { idx: 1, value: "day" },
    { idx: 2, value: "weekly" },
    { idx: 3, value: "monthly" },
    { idx: 4, value: "quarterly" },
]

const transformOptionData = async (data) => {
    const resultMap = {};
    totalCallVolume = 0;
    totalPutVolume = 0;
    data.strike.forEach((strike, i) => {
        if (!resultMap[strike]) {
            resultMap[strike] = {
                strike,
                callOpenInterest: 0,
                putOpenInterest: 0,
                callVolume: 0,
                putVolume: 0,
                callBidPrice: 0,
                putBidPrice: 0,
                expirationDate: ''
            };
        }

        const side = data.side[i];
        const openInterest = data.openInterest[i];
        const volume = data.volume[i];
        const bid = data.bid[i];
        // const exDate = convertGMTtoEST(data.expiration[i]);
        if (side === 'call') {
            resultMap[strike].callOpenInterest = openInterest;
            totalCallVolume += resultMap[strike].callVolume = volume;
            resultMap[strike].callBidPrice = bid;
            //resultMap[strike].expirationDate =exDate;

        } else {
            resultMap[strike].putOpenInterest = openInterest;
            totalPutVolume += resultMap[strike].putVolume = volume;
            resultMap[strike].putBidPrice = bid;
            //resultMap[strike].expirationDate =exDate;
        }
    });

    // Convert to sorted array
    return Object.values(resultMap).sort((a, b) => a.strike - b.strike);
};


async function getFridayOfCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - Saturday : 0 - 6
    const diffToFriday = 3 - dayOfWeek;
    const friday = new Date(today);
    friday.setDate(today.getDate() + diffToFriday);
    return friday.toISOString().slice(0, 10);;
}

const OptionsChart = ({ selectedTicker }) => {
    const [graphData, setGraphData] = useState([]);
    const [selectedValidity, setSelectedValidity] = useState('day');
    const [lineGraphData, setLineGraphData] = useState([]);
    const [tempTicker, setTempTicker] = useState(selectedTicker);
    useEffect(() => {
        const fetchOptionsData = async () => {
            setTempTicker(selectedTicker)
            const expirationDate = getComingFriday();//"2025-04-25";// await getFridayOfCurrentWeek();//"2025-04-15";// getUnixTimeNow();
            try {
                // Replace with your actual fetch call
                //const response = await fetch('/v1/options/chain/AAPL/'); // your endpoint
                let response;
                if (selectedTicker === "QQQ" || selectedTicker === "SPY" || selectedTicker === "IWM") {
                    const today = new Date();
                    let todayDate = today.toISOString().slice(0, 10);
                    response = await axiosInstance.get(`/v1/options/chain/${selectedTicker}?strikeLimit=20&expiration=${todayDate}`);
                }
                else {
                    if (selectedValidity === 'day') {
                        response = await axiosInstance.get(`/v1/options/chain/${selectedTicker}?strikeLimit=20&expiration=${expirationDate}`);
                    } else {
                        response = await axiosInstance.get(`/v1/options/chain/${selectedTicker}?strikeLimit=20&${selectedValidity}=true`);
                    }
                }

                const optionsData = response?.data;

                const data = await transformOptionData(optionsData);
                setGraphData(data)

                // const combinedData = optionsData.strike.map((strike, index) => ({
                //     strike,
                //     callBid: optionsData.side[index] === 'call' ? optionsData.bid[index] : null,
                //     putBid: optionsData.side[index] === 'put' ? optionsData.bid[index] : null,
                //     volume: optionsData.volume[index]
                // }));

                // const mergedData = Object.values(
                //     combinedData.reduce((acc, item) => {
                //         const key = item.strike;
                //         if (!acc[key]) {
                //             acc[key] = { strike: item.strike, volume:null,callBid: null, putBid: null };
                //         }
                //         if (item.callBid != null) acc[key].callBid = item.callBid;
                //         if (item.putBid != null) acc[key].putBid = item.putBid;
                //         if (item.volume != null) acc[key].volume = item.volume;
                //         return acc;
                //     }, {})
                // ).sort((a, b) => a.strike - b.strike);

                //setLineGraphData(mergedData);
            } catch (err) {
                console.error('Failed to fetch option data:', err);
            }
        };

        fetchOptionsData();
    }, [selectedValidity, selectedTicker, tempTicker]);




    const handleValidtyChange = async (e) => {
        const valdity = e.target.value || 'day';
        setSelectedValidity(valdity);
        //await getmydata(ticker, selectedAsset);
    };
    const formattedCall = new Intl.NumberFormat('en-IN').format(totalCallVolume);
    const formattedPut = new Intl.NumberFormat('en-IN').format(totalPutVolume);
    const data = [
        { name: `Call ${''}`, value: totalCallVolume, clssName: 'call-style' },
        { name: `Put ${''}`, value: totalPutVolume, clssName: 'put-style' },
    ];

    const predectionInput = [
        {
            "id": 1,
            "timestamp": '',
            "callVolume": totalCallVolume,
            "putVolume": totalPutVolume,
            "selectedTicker": selectedTicker
        },
    ]

    return (

        <div>
            <div> call:{formattedCall} , put:{formattedPut}</div>
            <div className="common-left-margin">
                <label htmlFor="validity-select">Validty: </label>
                <select id="validity-select" value={selectedValidity} onChange={(e) => handleValidtyChange(e)}>
                    <option value="">-- Choose Validty --</option>
                    {validityData.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                            {opt.value}
                        </option>
                    ))}
                </select>
            </div>


            {selectedValidity && <ResponsiveContainer width="100%" height={500}>
                <BarChart data={graphData}>
                    <XAxis dataKey="strike" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* <Bar dataKey="callOpenInterest" fill="#4caf50" name="Call OI" />
        <Bar dataKey="putOpenInterest" fill="#f44336" name="Put OI" /> */}
                    <Bar dataKey="callVolume" fill="#4caf50" name="Call volume" />
                    <Bar dataKey="putVolume" fill="#f44336" name="Put volume" />
                    {/* <Bar dataKey="callBidPrice" fill="#f47836" name="Call Bid" />
                    <Bar dataKey="putBidPrice" fill="#f41636" name="Put Bid" /> */}
                    {/* <Bar dataKey="expirationDate" fill="#f12636" name="Expiration Date" /> */}
                </BarChart>
            </ResponsiveContainer>}

            {/* <ResponsiveContainer width="100%" height={500}>
                <LineChart data={lineGraphData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="strike" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="callBid" name="Call Bid" stroke="#8884d8" dot={false} />
                    <Line type="monotone" dataKey="putBid" name="Put Bid" stroke="#82ca9d" dot={false} />
                    <Line type="monotone" dataKey="volume" name="volume" stroke="#8jja9d" dot={false} />
                </LineChart>
            </ResponsiveContainer> */}

            {totalCallVolume >0 && <PredictionHint selectedTicker={selectedTicker} predectionInput={predectionInput} />}
            {totalCallVolume > 0 && <div style={{ width: '20%', height: 200 }}>
                <h3>Total Call vs Put </h3>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>}

        </div>

    );
};

export default OptionsChart;
