import React, { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { RSI, MACD, SMA } from "technicalindicators";
import "./StockTrendAnalyzer.scss";
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';

const StockTrendAnalyzer = ({ selectedTicker }) => {
    const [historicalData, setHistoricalData] = useState([]);
    const [trend, setTrend] = useState("Neutral");
    const [indicators, setIndicators] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const requestedFromDate = getPastDate(100);
            const timeInterval = '1d'
            const res = await fetch(`${NASDAQ_TOKEN}/api/yahooFinanceStockData/${selectedTicker}/${requestedFromDate}/${timeInterval}`);
            const data = await res.json(); // Works only with native fetch
            setHistoricalData(data.slice(-60));
        };
        fetchData();
    }, [selectedTicker]);

    useEffect(() => {
        if (historicalData.length < 50) return;

        const prices = historicalData.map(d => d.close);
        const rsiValues = RSI.calculate({ values: prices, period: 14 });
        const sma50 = SMA.calculate({ values: prices, period: 50 });
        const macdValues = MACD.calculate({
            values: prices,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });

        const currentPrice = prices[prices.length - 1];
        const currentRSI = rsiValues[rsiValues.length - 1];
        const currentSMA = sma50[sma50.length - 1];
        const currentMACD = macdValues[macdValues.length - 1];

        let trendValue = "Neutral";
        if (currentPrice > currentSMA && currentRSI > 60 && currentMACD.MACD > currentMACD.signal) {
            trendValue = "Bullish";
        } else if (currentPrice < currentSMA && currentRSI < 40 && currentMACD.MACD < currentMACD.signal) {
            trendValue = "Bearish";
        }

        setTrend(trendValue);
        setIndicators({
            currentPrice,
            currentRSI,
            currentSMA,
            currentMACD
        });
    }, [historicalData]);

    const chartData = historicalData.map(d => ({
        date: d.date.split("T")[0],
        close: d.close,
    }));

    const getPastDate = (daysAgo) => {
        const MS_PER_DAY = 24 * 60 * 60 * 1000;   // # of ms in one day
        return new Date(Date.now() - daysAgo * MS_PER_DAY);
    };

    return (
        <div className={`trend-container ${trend.toLowerCase()}`}>
            <h2>Trend for {selectedTicker}: <span>{trend}</span></h2>
            {indicators && (
                <div className="trend-indicators">
                    <p>Current Price: ${indicators.currentPrice.toFixed(2)}</p>
                    <p>RSI: {indicators.currentRSI.toFixed(2)}</p>
                    <p>SMA(50): {indicators.currentSMA.toFixed(2)}</p>
                    <p>MACD: {indicators.currentMACD.MACD.toFixed(2)} / Signal: {indicators.currentMACD.signal.toFixed(2)}</p>
                </div>
            )}

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="close" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockTrendAnalyzer;
