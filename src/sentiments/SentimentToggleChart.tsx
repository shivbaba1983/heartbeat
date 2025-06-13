import React, { useState, useEffect } from "react";
import AllSentimentClassification from './AllSentimentClassification';
import LineSentimentAreaChart from './LineSentimentAreaChart';
import SentimentAreaChartByTicker from './SentimentAreaChartByTicker';
import './SentimentToggleChart.scss';


const SentimentToggleChart = ({ completeFileData, selectedTicker }) => {
  const [selected, setSelected] = useState("all");
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchFiles() {
      setData(completeFileData);

      try {

      } catch (error) {
        console.error("Error fetching S3 files:", error);
      }
    }

    fetchFiles();
  }, [completeFileData]);

  return (
    <>
      {(
        <div className="sentiment-toggle-wrapper">
          <div className="toggle-buttons">
            <label>
              <input
                type="radio"
                name="sentimentView"
                value="all"
                checked={selected === "all"}
                onChange={() => setSelected("all")}
              />
              All
            </label>
            <label>
              <input
                type="radio"
                name="sentimentView"
                value="line"
                onChange={() => setSelected("line")}
                checked={selected === "line"}
              />
              Line
            </label>
            <label>
              <input
                type="radio"
                name="sentimentView"
                value="single"
                onChange={() => setSelected("single")}
                checked={selected === "single"}
              />
              Single
            </label>
          </div>

          {data?.length > 0 && <div className="chart-section">
            {selected === "all" && (
              <AllSentimentClassification S3JsonFileData={data} />
            )}
            {selected === "line" && (
              <LineSentimentAreaChart S3JsonFileData={data} />
            )}
            {selected === "single" && (
              <SentimentAreaChartByTicker S3JsonFileData={data} selectedTicker={selectedTicker} />
            )}
          </div>}
        </div>
      )}
    </>
  );
}
export default SentimentToggleChart;