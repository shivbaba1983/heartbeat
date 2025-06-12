import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const SentimentClassification = ({ S3JsonFileData }) => {
    // Your full-day JSON data goes here
    const rawData = S3JsonFileData;// [/* paste your data here */];

    // --- 1. Classify sentiment based on call/put ratio
    const classifySentiment = (call, put) => {
        const ratio = call / (put || 1);
        if (ratio >= 2) return "ExtremelyBullish";
        if (ratio >= 1.25) return "Bullish";
        if (ratio >= 0.8) return "Neutral";
        if (ratio >= 0.5) return "Bearish";
        return "ExtremelyBearish";
    };

    // --- 2. Group by minute, then count sentiments
    const processSentimentTimeSeries = () => {
        const map = new Map();

        rawData.forEach(({ timestamp, callVolume, putVolume }) => {
            // Normalize time to "HH:mm"
            const time = new Date(timestamp).toLocaleTimeString("en-US", {
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
}
export default SentimentClassification;