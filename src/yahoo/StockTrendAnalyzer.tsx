import React, { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { RSI, MACD, SMA, BollingerBands } from "technicalindicators";
import "./StockTrendAnalyzer.scss";
import { NASDAQ_TOKEN } from '../constant/HeartbeatConstants';

const StockTrendAnalyzer = ({ selectedTicker }) => {
    const [historicalData, setHistoricalData] = useState([]);
    const [trend, setTrend] = useState("Neutral");
    const [indicators, setIndicators] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const requestedFromDate = getPastDate(100);
            const res = await fetch(`${NASDAQ_TOKEN}/api/yahooFinanceStockData/${selectedTicker}/${requestedFromDate}/1d`);
            const data = await res.json();
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
        const bbands = BollingerBands.calculate({
            period: 20,
            values: prices,
            stdDev: 2
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

        // Attach indicator values to chartData
        const enrichedData = historicalData.map((item, index) => ({
            date: item.date.split("T")[0],
            close: parseFloat(item.close.toFixed(2)),
            sma: index >= 49 ? parseFloat(sma50[index - 49]?.toFixed(2)) : null,
            upper: index >= 19 ? parseFloat(bbands[index - 19]?.upper.toFixed(2)) : null,
            lower: index >= 19 ? parseFloat(bbands[index - 19]?.lower.toFixed(2)) : null,
        }));

        setIndicators({
            currentPrice,
            currentRSI,
            currentSMA,
            currentMACD
        });
        setHistoricalData(enrichedData);
    }, [historicalData]);

    const getPastDate = (daysAgo) => {
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        return new Date(Date.now() - daysAgo * MS_PER_DAY);
    };

    return (
        <div className={`trend-container ${trend.toLowerCase()}`}>
            <h2>Trend for {selectedTicker}: <span>{trend}</span></h2>
            {indicators && (
                <div className="trend-indicators">
                    <span>Current Price: ${indicators.currentPrice.toFixed(2)}</span> <span>RSI: {indicators.currentRSI.toFixed(2)}</span>
      
                    <p><span>  SMA(50): { indicators.currentSMA.toFixed(2)}</span>            <span>MACD: {indicators.currentMACD.MACD.toFixed(2)} / Signal: {indicators.currentMACD.signal.toFixed(2)}</span></p>
                </div>
            )}

           {historicalData && <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="close" stroke="#8884d8" name="Close" dot={false} />
                    <Line type="monotone" dataKey="sma" stroke="#FF8C00" name="SMA(50)" dot={false} />
                    <Line type="monotone" dataKey="upper" stroke="#00C49F" name="Upper Band" dot={false} />
                    <Line type="monotone" dataKey="lower" stroke="#FF4444" name="Lower Band" dot={false} />
                </LineChart>
            </ResponsiveContainer>}
        </div>
    );
};

export default StockTrendAnalyzer;
