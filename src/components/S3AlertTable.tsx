import React, { useEffect, useState } from 'react';
import "./S3AlertTable.scss";

const S3AlertTable = ({ alertTickers }) => {

    const [alertData, setAlertData] = useState(alertTickers);
    useEffect(() => {

        setAlertData(alertTickers);

    }, [alertTickers]);


    return (
        <div className='s3-alert-table-section'>
            {alertData.length > 0 && (
                <div className="alert-blink-table">
                    <h3>⚠️ High Call Volume Tickers (Call ≥ 2 × Put)</h3>
                    <table className="blink-table">
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Call Volume</th>
                                <th>Put Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alertTickers.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.selectedTicker}</td>
                                    <td>{item.callVolume}</td>
                                    <td>{item.putVolume}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default S3AlertTable;
