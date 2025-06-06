import React, { useEffect, useState } from 'react';
import { MagnificentSevenStockList } from '../constant/HeartbeatConstants';
import './DisplayPredictionHistory.scss';
function DisplayPredictionHistory({ selectedTicker, stockData }) {
    const [tickerData, setTickerData] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(prev => !prev);
    };
    useEffect(() => {
        //only read the local store, writing local stoage is in json upadter
        const savedDate = localStorage.getItem('marketDataDate');
        const today = new Date().toISOString().slice(0, 10);
        if (savedDate !== today) {
            localStorage.removeItem('marketData');
            localStorage.setItem('marketDataDate', today);
        }
        const existing = localStorage.getItem('marketData');
        const existingData = existing ? JSON.parse(existing) : {};
        // if (MagnificentSevenStockList.includes(selectedTicker)) {
        //     existingData[selectedTicker] = stockData;
        //     localStorage.setItem('marketData', JSON.stringify(existingData));
        //     localStorage.setItem('marketDataDate', today);
        // }
        // Update React state
        setTickerData(existingData);
    }, [selectedTicker, stockData]);


    return (
        <div>
            <div className='sentimate-history-data'>
                <h2 onClick={toggleExpanded} className="link-like-header">
                    {isExpanded
                        ? "▼ Magnificent Seven Sentiments (Click to Collapse)"
                        : "► Magnificent Seven Sentiments (Click to Expand)"}
                </h2>

                {isExpanded && (
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ticker</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Last Price</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Call</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Put</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trend</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(tickerData)
                                .sort(([, a], [, b]) => {
                                    const ratioA = (a.selectedTicker ?? a)?.ratio ?? 0;
                                    const ratioB = (b.selectedTicker ?? b)?.ratio ?? 0;
                                    return ratioB - ratioA; // Descending
                                })
                                .map(([ticker, data]) => {
                                    const stats = data?.selectedTicker ?? data;
                                    if (!stats) return null;

                                    return (
                                        <tr key={ticker} className={stats.prediction}>
                                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stats.ticker}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stats.lstPrice}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stats.callVolume?.toLocaleString?.() ?? 'N/A'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stats.putVolume?.toLocaleString?.() ?? 'N/A'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stats.prediction}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stats.ratio?.toLocaleString?.() ?? 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
export default DisplayPredictionHistory;