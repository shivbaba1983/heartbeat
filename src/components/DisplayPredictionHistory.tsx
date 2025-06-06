import React, { useEffect, useState } from 'react';
import { MagnificentSevenStockList } from '../constant/HeartbeatConstants';
import './DisplayPredictionHistory.scss';
const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    cursor: "pointer",
};

function DisplayPredictionHistory({ selectedTicker, stockData }) {
    const [tickerData, setTickerData] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortKey, setSortKey] = useState("ratio");
    const [sortDirection, setSortDirection] = useState("desc");

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


    const handleSort = (key) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };
    const toggleExpanded = () => {
        setIsExpanded(prev => !prev);
    };
    const sortedData = Object.entries(tickerData).sort(([, a], [, b]) => {
        const statsA = a.selectedTicker ?? a;
        const statsB = b.selectedTicker ?? b;

        const valA = statsA?.[sortKey] ?? 0;
        const valB = statsB?.[sortKey] ?? 0;

        if (typeof valA === "string") {
            return sortDirection === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }

        return sortDirection === "asc" ? valA - valB : valB - valA;
    });

    const renderSortIcon = (key) =>
        sortKey === key ? (sortDirection === "asc" ? " ▲" : " ▼") : "";


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
                                <th style={cellStyle} onClick={() => handleSort("ticker")}>Ticker{renderSortIcon("ticker")}</th>
                                <th style={cellStyle} onClick={() => handleSort("lstPrice")}>Last Price{renderSortIcon("lstPrice")}</th>
                                <th style={cellStyle} onClick={() => handleSort("callVolume")}>Call{renderSortIcon("callVolume")}</th>
                                <th style={cellStyle} onClick={() => handleSort("putVolume")}>Put{renderSortIcon("putVolume")}</th>
                                <th style={cellStyle} onClick={() => handleSort("prediction")}>Trend{renderSortIcon("prediction")}</th>
                                <th style={cellStyle} onClick={() => handleSort("ratio")}>Ratio{renderSortIcon("ratio")}</th>

                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map(([ticker, data]) => {
                                const stats = data?.selectedTicker ?? data;
                                if (!stats) return null;

                                return (
                                    <tr key={ticker} className={stats.prediction}>
                                        <td style={cellStyle}>{stats.ticker}</td>
                                        <td style={cellStyle}>{stats.lstPrice}</td>
                                        <td style={cellStyle}>{stats.callVolume?.toLocaleString?.() ?? "N/A"}</td>
                                        <td style={cellStyle}>{stats.putVolume?.toLocaleString?.() ?? "N/A"}</td>
                                        <td style={cellStyle}>{stats.prediction}</td>
                                        <td style={cellStyle}>{stats.ratio?.toLocaleString?.() ?? "N/A"}</td>
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