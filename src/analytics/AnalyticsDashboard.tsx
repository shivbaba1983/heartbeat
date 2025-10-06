import TickerChartDashboard from './../analytics/expirationBarChart/TickerChartDashboard';
import TrendListDisplay from './trendtable/TrendListDisplay';
import OptionTrendChart from './trendtable/OptionTrendChart';
import RSIChart from "./../analytics/rsi/RSIChart";

const AnalyticsDashboard = () => {
  return (
    <div>
      <p>Welcome, This Analytics Dashboard page</p>

      <div>
        <TickerChartDashboard />
        <TrendListDisplay />
        <OptionTrendChart />
        <RSIChart />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
