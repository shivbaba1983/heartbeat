import React, { useState } from 'react';
import SequentialTickerCharts from './../analytics/expirationBarChart/SequentialTickerCharts';
import { expirationDates, LogTickerList } from './../constant/HeartbeatConstants';
import TickerChartDashboard from './../analytics/expirationBarChart/TickerChartDashboard';
import TrendListDisplay from './trendtable/TrendListDisplay';
import OptionTrendChart from './trendtable/OptionTrendChart';
import RSIChart from "./../analytics/rsi/RSIChart";
import { TWOQuarterlyOpenInterest } from './QuarterlyOpenInterest/TWOQuarterlyOpenInterest';
import { DynamicTickerOptionTable } from './QuarterlyOpenInterest/DynamicTickerOptionTable'
const AnalyticsDashboard = () => {
  const [showQuarterly, setShowQuarterly] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowQuarterly(e.target.checked);
  };

  return (
    <div>
      <p>Welcome, This Analytics Dashboard page</p>
      
      <div>
        <TickerChartDashboard />
        <TrendListDisplay />
        <OptionTrendChart />
        <RSIChart />

        <div style={{ margin: '20px 0' }}>
          <label>
            <input
              type="checkbox"
              checked={showQuarterly}
              onChange={handleCheckboxChange}
            />
            {' '}Load Quarterly Open Interest
          </label>
        </div>

        {showQuarterly && <TWOQuarterlyOpenInterest showQuarterly={showQuarterly} />}

        <DynamicTickerOptionTable/>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
