import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { BarChart, Bar, } from 'recharts';

const PredictionHint = ({ selectedTicker, predectionInput }) => {


    //     const predictionData = predectionInput.map(item => {
    //     const ratio = item.putVolume / item.callVolume;
    //     let prediction = '';

    //     if (ratio < 0.5) prediction = 'ExtremelyBullish';
    //     else if (ratio < 0.7) prediction = 'Bullish';
    //     else if (ratio <= 1.0) prediction = 'Neutral';
    //     else if (ratio <= 1.3) prediction = 'Bearish';
    //     else prediction = 'ExtremelyBearish';

    //     return { ...item, ratio: +ratio.toFixed(2), prediction };
    // });

    // const predictionData = predectionInput.map(item => {
    //     const callVolume = item.callVolume || 0;
    //     const putVolume = item.putVolume || 0;
    //     let prediction = '';

    //     const ratio = callVolume / (putVolume || 1);
    //     if (ratio >= 2) prediction = "ExtremelyBullish";
    //     if (ratio >= 1.25) prediction = "Bullish";
    //     if (ratio >= 0.8) prediction = "Neutral";
    //     if (ratio >= 0.5) prediction = "Bearish";

    //     return { ...item, ratio: +ratio.toFixed(2), prediction };
    // });

    const predictionData = predectionInput.map(item => {
        const callVolume = item.callVolume || 0;
        const putVolume = item.putVolume || 0;

        // Avoid division by 0
        const ratio = callVolume === 0 ? Infinity : putVolume / callVolume;

        let prediction = '';

        if (ratio < 0.5) prediction = 'ExtremelyBullish';
        else if (ratio < 0.7) prediction = 'Bullish';
        else if (ratio <= 1.0) prediction = 'Neutral';
        else if (ratio <= 1.3) prediction = 'Bearish';
        else prediction = 'ExtremelyBearish';

        return { ...item, ratio: +ratio.toFixed(2), prediction };
    });

    return (
        <div>
            <div style={{ marginTop: '1rem', background: 'pink' }}>
                {predictionData?.map((d, i) => (
                    <div key={i} className={d.prediction}>
                        Prediction {selectedTicker} <strong>{d.timestamp}: {d.prediction} (Ratio: {d.ratio})</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PredictionHint;
