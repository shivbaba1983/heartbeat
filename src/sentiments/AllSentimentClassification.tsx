import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import { MAG7, INDEXES, LogTickerList } from '../constant/HeartbeatConstants';
import './AllSentimentClassification.scss'
const AllSentimentClassification = ({ S3JsonFileData }) => {
    const rawData = S3JsonFileData;

    // --- State to control selected ticker group
    const [tickerSet, setTickerSet] = useState("all"); // 'all', 'indices', or 'stocks'

    // --- Determine tickers to include based on radio selection
    const getSelectedTickers = () => {
        switch (tickerSet) {
            case "indices":
                return INDEXES;
            case "stocks":
                return MAG7;
            default:
                return LogTickerList;
        }
    };

    const TICKERS = getSelectedTickers();

    // --- Classify sentiment based on call/put ratio
    const classifySentiment = (call, put) => {
        const ratio = call / (put || 1);
        if (ratio >= 2) return "ExtremelyBullish";
        if (ratio >= 1.25) return "Bullish";
        if (ratio >= 0.8) return "Neutral";
        if (ratio >= 0.5) return "Bearish";
        return "ExtremelyBearish";
    };

    // --- Group by minute, then count sentiments
    const processSentimentTimeSeries = () => {
        const map = new Map();

        rawData
            .filter(d => TICKERS.includes(d.selectedTicker))
            .forEach(({ timestamp, callVolume, putVolume }) => {
                const date = new Date(timestamp);
                const minutes = date.getMinutes();
                date.setMinutes(minutes - (minutes % 10), 0, 0); // ⏰ Round to 10-min bucket
                const time = date.toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit"
                });

                const sentiment = classifySentiment(callVolume, putVolume);
                if (!map.has(time)) {
                    map.set(time, {
                        time,
                        ExtremelyBullish: 0,
                        Bullish: 0,
                        Neutral: 0,
                        Bearish: 0,
                        ExtremelyBearish: 0
                    });
                }

                map.get(time)[sentiment]++;
            });

        return Array.from(map.values()).sort((a, b) =>
            a.time.localeCompare(b.time)
        );
    };

    const data = processSentimentTimeSeries();

    return (
        <div>
            {/* 🚀 Radio Button Controls */}
            <div className="sentiment-radio-options">
                <label>
                    <input
                        type="radio"
                        name="tickerSet"
                        value="all"
                        checked={tickerSet === "all"}
                        onChange={() => setTickerSet("all")}
                    />
                    All
                </label>
                <label>
                    <input
                        type="radio"
                        name="tickerSet"
                        value="indices"
                        checked={tickerSet === "indices"}
                        onChange={() => setTickerSet("indices")}
                    />
                    Only Indices
                </label>
                <label>
                    <input
                        type="radio"
                        name="tickerSet"
                        value="stocks"
                        checked={tickerSet === "stocks"}
                        onChange={() => setTickerSet("stocks")}
                    />
                    Only Stocks-MAG7
                </label>
            </div>

            {/* 📈 Sentiment Chart */}
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <XAxis dataKey="time" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ExtremelyBullish" stroke="#00b300" />
                    <Line type="monotone" dataKey="Bullish" stroke="#66cc66" />
                    <Line type="monotone" dataKey="Neutral" stroke="#999999" />
                    <Line type="monotone" dataKey="Bearish" stroke="#ff6666" />
                    <Line type="monotone" dataKey="ExtremelyBearish" stroke="#cc0000" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AllSentimentClassification;
