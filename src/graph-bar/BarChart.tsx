import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
//import CustomTooltip from './CustomTooltip'
const rawData = [
    {
        strike: "454.00",
        c_Volume: "17",
        p_Volume: "1958"
    },
    {
        strike: "455.00",
        c_Volume: "54",
        p_Volume: "8174"
    },
    {
        strike: "456.00",
        c_Volume: "32",
        p_Volume: "6443"
    }
];

// Convert volume strings to numbers
// const chartData = rawData.map(row => ({
//   strike: row.strike,
//   callVolume: Number(row.c_Volume),
//   putVolume: Number(row.p_Volume)
// }));

const BarGraphChart = ({ rows, selectedTicker, volumeOrInterest }) => {

    const [chartCallData, setChartCallData] = useState([]);
    const [chartPutData, setChartPutData] = useState([]);
    let tempc = 0;
    let tempp = 0;
    useEffect(() => {
        const tempCallData = rows?.map(row => ({
            strike: row.strike,
            callVolume: Number(volumeOrInterest === 'volume' ? row.c_Volume : row.c_Openinterest),
            expiryDate: row.expiryDate,
            c_Last: row.c_Last
            //putVolume: Number(row.p_Volume)
            //tempc: tempc + Number(row.c_Volume)
        }))
        const tempPutData = rows?.map(row => ({
            strike: row.strike,
            putVolume: Number(volumeOrInterest === 'volume' ? row.p_Volume : row.p_Openinterest),
            expiryDate: row.expiryDate,
            p_Last: row.p_Last
            //tempp: tempp + Number(row.p_Volume)
        }))
        setChartCallData(tempCallData);
        setChartPutData(tempPutData);
    }, [rows, volumeOrInterest])
    // Convert volume strings to numbers
    chartCallData.forEach((row) => {
        row.callVolume > 0 ? tempc += row.callVolume : tempc += 0
    });
    chartPutData.forEach((row) => {
        row.putVolume > 0 ? tempp += row.putVolume : tempp += 0
    });
    const formattedCall = new Intl.NumberFormat('en-IN').format(tempc);
    const formattedPut = new Intl.NumberFormat('en-IN').format(tempp);



    return (<div>
        <h2>{selectedTicker} {volumeOrInterest}  :  {formattedCall}</h2>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartCallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strike" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="callVolume" fill="#8884d8" name="Call Volume" />
                <Bar dataKey="expiryDate" fill="#8884d8" name="expiryDate" />
                <Bar dataKey="c_Last" fill="#8884d8" name="c_Last" />
                {/* <Bar dataKey="putVolume" fill="#82ca9d" name="Put Volume" /> */}
            </BarChart>
        </ResponsiveContainer>

        <h2>{selectedTicker} {volumeOrInterest} :  {formattedPut}</h2>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartPutData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strike" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="putVolume" fill="#Ff0000" name="Put Volume" />
                <Bar dataKey="expiryDate" fill="#82ca9d" name="expiryDate" />
                <Bar dataKey="p_Last" fill="#8884d8" name="p_Last" />
            </BarChart>
        </ResponsiveContainer>
    </div>)

}

export default BarGraphChart;
