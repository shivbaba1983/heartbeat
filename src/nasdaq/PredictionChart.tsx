import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart, ResponsiveContainer
} from 'recharts';

const PredictionChart = ({ data }) => {


    const enrichedData = data.map(item => {
        const ratio = item.putVolume / item.callVolume;
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
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                        formatter={(value, name) => [value, name === 'ratio' ? 'Put/Call Ratio' : name]}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="putVolume" fill="#f44336" name="Puts" />
                    <Bar yAxisId="left" dataKey="callVolume" fill="#2196f3" name="Calls" />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ratio"
                        stroke="#ff9800"
                        strokeWidth={2}
                        name="Put/Call Ratio"
                    />
                </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '1rem' }}>
                {enrichedData.map((d,i) => (
                    <div key={i}>
                        <strong>{d.timestamp}:</strong> {d.prediction} (Ratio: {d.ratio})
                    </div>
                ))}
            </div>

        </div>

    );
};
export default PredictionChart;