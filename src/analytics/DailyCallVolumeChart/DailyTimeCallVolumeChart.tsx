import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { LogTickerList } from "./../../constant/HeartbeatConstants"; // make sure you have this
import "./DailyCallVolumeChart.scss";

interface ApiTimeData {
  time: string;
  callVolume: number;
  lstPrice?: string;
}

interface TimeData {
  time: string;
  callVolume: number;
  lstPrice: number;
}

const VOLUME_THRESHOLD = 500000;

const DailyTimeCallVolumeChart = () => {
  const [ticker, setTicker] = useState<string>("SPY");
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);
  const [data, setData] = useState<TimeData[]>([]);

  const fetchData = async (selectedTicker: string, selectedDate: string) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/daily-time-call-volume/${selectedTicker}/${selectedDate}`
      );

      const apiData: ApiTimeData[] = res.data.data || [];
      let prevPrice = 0;

      const chartData: TimeData[] = apiData.map((d) => {
        let price = prevPrice;
        if (d.lstPrice && d.lstPrice.trim() !== "") {
          price = Number(d.lstPrice.replace(/[^0-9.]/g, ""));
        }
        prevPrice = price;

        return {
          time: d.time,
          callVolume: d.callVolume,
          lstPrice: price
        };
      });

      setData(chartData);
    } catch (err) {
      console.error(err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData(ticker, date);
  }, [ticker, date]);

  const priceValues = data.map((d) => d.lstPrice);
  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 1;

  return (
    <div className="daily-chart-container">
      <h2>Daily Time Call Volume Chart</h2>

      {/* Controls */}
      <div className="controls">
        <label>
          Ticker:
          <select value={ticker} onChange={(e) => setTicker(e.target.value)}>
            {LogTickerList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} />
        </label>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />

            {/* Left Y-axis → Call Volume */}
            <YAxis yAxisId="volume" tickFormatter={(v) => v.toLocaleString()} />

            {/* Right Y-axis → Price */}
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={[minPrice * 0.995, maxPrice * 1.005]}
              tickFormatter={(v) => `$${v}`}
            />

            <Tooltip
              formatter={(value, name) =>
                name === "Price"
                  ? [`$${value.toFixed(2)}`, "Price"]
                  : [value.toLocaleString(), "Call Volume"]
              }
              labelFormatter={(label) => `Time: ${label}`}
            />

            {/* Bar for callVolume */}
            <Bar yAxisId="volume" dataKey="callVolume" fill="#4a90e2" name="Call Volume" />

            {/* Line for lstPrice */}
            <Line yAxisId="price" dataKey="lstPrice" stroke="#e11d48" type="monotone" dot={false} name="Price" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyTimeCallVolumeChart;
