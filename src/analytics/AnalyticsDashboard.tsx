import React from 'react';
import SequentialTickerCharts from './../analytics/expirationBarChart/SequentialTickerCharts';
import { expirationDates, LogTickerList } from './../constant/HeartbeatConstants'
import TickerChartDashboard from './../analytics/expirationBarChart/TickerChartDashboard'
import TrendListDisplay from './trendtable/TrendListDisplay';
const AnalyticsDashboard = ({ }) => {

  return (<div>
    <p> Welcome, This Analytics Dashboard page</p>
        <div>
          <TickerChartDashboard     />
<TrendListDisplay/>
    </div>

  </div>)
}

export default AnalyticsDashboard;