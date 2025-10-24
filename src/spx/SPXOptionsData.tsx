import React, { useEffect, useState } from 'react';
import { NASDAQ_TOKEN } from './../constant/HeartbeatConstants';
function SPXOptionsData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchMyData = async () => {
            const tempToken =NASDAQ_TOKEN;// import.meta.env.VITE_STOCK_API_URL;
            // await fetch(`${tempToken}/api/spxoption?symbol=SPX`)
            //     .then(res => res.json())
            //     .then(json => {
            //         setData(json);
            //         console.log('*************8', json);
            //         setLoading(false);
            //     })
            //     .catch(console.error)
            try {
                const tempResp = await fetch(`${tempToken}/api/spxoption?symbol=SPXW`);
                const temp = await tempResp.json();
                console.log('-----------temp------', temp)
            } catch (error) {
                console.log('-----------error------', error)
            } finally {
                setLoading(false);
            }

        };
        fetchMyData();
    }, []);

    if (loading) return <p>Loading options data...</p>;
    if (!data) return <p>No data found.</p>;

    return (
        <div>
            <h2>Options for SPX - Expiration: {data.expiration}</h2>
            <h3>Calls</h3>
            <table border="1" cellPadding="4" style={{ width: '100%', marginBottom: 20 }}>
                <thead>
                    <tr>
                        <th>Strike</th><th>Last Price</th><th>Bid</th><th>Ask</th><th>Volume</th><th>Open Interest</th>
                    </tr>
                </thead>
                <tbody>
                    {data.calls.map(call => (
                        <tr key={call.contractSymbol}>
                            <td>{call.strike}</td>
                            <td>{call.lastPrice}</td>
                            <td>{call.bid}</td>
                            <td>{call.ask}</td>
                            <td>{call.volume}</td>
                            <td>{call.openInterest}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Puts</h3>
            <table border="1" cellPadding="4" style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Strike</th><th>Last Price</th><th>Bid</th><th>Ask</th><th>Volume</th><th>Open Interest</th>
                    </tr>
                </thead>
                <tbody>
                    {data.puts.map(put => (
                        <tr key={put.contractSymbol}>
                            <td>{put.strike}</td>
                            <td>{put.lastPrice}</td>
                            <td>{put.bid}</td>
                            <td>{put.ask}</td>
                            <td>{put.volume}</td>
                            <td>{put.openInterest}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default SPXOptionsData;
