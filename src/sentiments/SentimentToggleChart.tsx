import React, { useState } from "react";
import AllSentimentClassification from './AllSentimentClassification';
import LineSentimentAreaChart from './LineSentimentAreaChart';
import SentimentAreaChartByTicker from './SentimentAreaChartByTicker';
import './SentimentToggleChart.scss';


const SentimentToggleChart=({completeFileData, selectedTicker})=>{

const [selected, setSelected] = useState("all");
  return (
    <>
      { (
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

          <div className="chart-section">
            {selected === "all" && (
              <AllSentimentClassification S3JsonFileData={completeFileData} />
            )}
            {selected === "line" && (
              <LineSentimentAreaChart S3JsonFileData={completeFileData} />
            )}
            {selected === "single" && (
              <SentimentAreaChartByTicker S3JsonFileData={completeFileData} selectedTicker={selectedTicker}/>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default  SentimentToggleChart;