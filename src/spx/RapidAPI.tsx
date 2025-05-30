// React component
import { useEffect, useState } from "react";
import axios from "axios";

const RapidAPI = ({ selectedTicker, volumeOrInterest, setAverageDailyVolume3Month }) => {
    const [spx, setSpx] = useState([]);
    const YOUR_API_KEY = 'd82b06c44bmshdbe3922e87c0a04p14aff9jsn4d5122d48986';
    let result;
// const expiration = Math.floor(new Date("2025-06-21").getTime() / 1000);
// const url = `https://yahoo-finance166.p.rapidapi.com/api/news/list-by-symbol?s=SPX&region=US&snippetCount=500&date=${expiration}`;

const testDate = Math.floor(new Date("2025-06-20").getTime() / 1000);
//const url = `https://yahoo-finance166.p.rapidapi.com/api/news/list-by-symbol?s=SPX&region=US&snippetCount=500&date=${testDate}`;
const url ='https://yahoo-finance166.p.rapidapi.com/api/news/list-by-symbol?s=AAPL&region=US&snippetCount=500&date=1750377600';
//const url ='https://yahoo-finance166.p.rapidapi.com/api/news/list-by-symbol?s=SPX&region=US&snippetCount=500';

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': YOUR_API_KEY,
            'x-rapidapi-host': 'yahoo-finance166.p.rapidapi.com'
        }
    };

    useEffect(() => {
        const fetchMyData = async () => {

            try {
                // await fetch('https://yahoo-finance15.p.rapidapi.com/api/yahoo/stock/v2/get-options?symbol=SPX&date=1750464000', {
                //     headers: {
                //         'X-RapidAPI-Key': YOUR_API_KEY,
                //         'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
                //     }
                // })
                //     .then(res => res.json())
                //     .then(data => {
                //         console.log(data);
                //     })
                //     .catch(err => console.error(err));


                const response = await fetch(url, options);
                 result = await response.json();
                console.log('---rapid---',result?.data);
                //setSpx(result)
            } catch (error) {
                console.error(error);
            }
        };
        fetchMyData();
    }, [selectedTicker, volumeOrInterest]);

    return (
        <div>
            <p> recived the - {result}</p>
        </div>
    );
}
export default RapidAPI;