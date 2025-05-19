// React component
import { useEffect, useState } from "react";
import SpyYahooChart from './SpyYahoo';

const SPXData = ({selectedTicker, assetclass, volumeOrInterest, setAverageDailyVolume3Month}) => {
    const [spx, setSpx] = useState(null);

    // useEffect(() => {
    //     fetch("http://localhost:3000/api/spx")
    //         .then((res) => res.json())
    //         .then(setSpx)
    //         .catch(console.error);
    // }, []);

    return (
        <div>
            <SpyYahooChart selectedTicker={selectedTicker} volumeOrInterest={volumeOrInterest} setAverageDailyVolume3Month={setAverageDailyVolume3Month}/>
            {/* {spx ? (
                <>
                    <h2>S&P 500 Index (^GSPC)</h2>
                    <p>Price: {spx.regularMarketPrice}</p>
                    
                </>
            ) : (
                <p>Loading...</p>
            )} */}
        </div>
    );
}
export default SPXData;