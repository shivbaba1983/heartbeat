import React from 'react';
import './YahooQuoteDashboard.scss';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';



const YahooQuoteDashboard = ({ stockDetails }) => {

  const quote = stockDetails;//{ /* your full quote JSON here */ };

  const formatNumber = (num, decimals = 2) => {
    if (typeof num !== 'number') return 'N/A';
    return num.toFixed(decimals);
  };

  const formatMillions = (num) => {
    if (typeof num !== 'number') return 'N/A';
    return `${formatNumber(num / 1e6)}M`;
  };

  const PriceCard = ({ title, value }) => (
    <div className="price-card">
      <h3 className="price-card-title">{title}</h3>
      <p className="price-card-value">{value}</p>
    </div>
  );

  const RangeBar = ({ low, high, current }) => {
    const percentage = (typeof low === 'number' && typeof high === 'number' && typeof current === 'number')
      ? ((current - low) / (high - low)) * 100 : 0;

    return (
      <div className="range-bar">
        <div className="range-label">Day Range</div>
        <div className="range-container">
          <div className="range-fill" style={{ width: `${percentage}%` }}></div>
          <span className="range-low">{low}</span>
          <span className="range-high">{high}</span>
        </div>
      </div>
    );
  };

  const MetricsTable = ({ data }) => (
    <table className="metrics-table">
      <tbody>
        {data.map(({ label, value }) => (
          <tr key={label}>
            <td>{label}</td>
            <td className="value">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const BarVolumeChart = () => {
    const data = [
      { name: 'Today', volume: quote.regularMarketVolume / 1e6 },
      { name: '10D Avg', volume: quote.averageDailyVolume10Day / 1e6 },
      { name: '3M Avg', volume: quote.averageDailyVolume3Month / 1e6 }
    ];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${formatNumber(value)}M`} />
          <Bar dataKey="volume" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const EarningsBlock = ({ lastEarnings, nextEarningsStart, nextEarningsEnd }) => (
    <div className="earnings-block">
      <h3>Earnings</h3>
      <p>Last Earnings: {new Date(lastEarnings).toLocaleDateString()}</p>
      <p>Next Expected: {new Date(nextEarningsStart).toLocaleDateString()} - {new Date(nextEarningsEnd).toLocaleDateString()}</p>
    </div>
  );

  return (
    <div className="quote-dashboard">
      <header className="dashboard-header">
        <h1>{quote.displayName} ({quote.symbol})</h1>
        <p>{quote.fullExchangeName} | {quote.currency}</p>
      </header>

      <div className="stats-grid">
        <PriceCard title="Price" value={`$${quote.regularMarketPrice}`} />
        <PriceCard title="Change (%)" value={`${formatNumber(quote.regularMarketChange)} (${formatNumber(quote.regularMarketChangePercent * 100)}%)`} />
        <PriceCard title="Post-Market" value={`$${quote.postMarketPrice}`} />
        <PriceCard title="Volume" value={formatMillions(quote.regularMarketVolume)} />
        <PriceCard title="Market Cap" value={quote.marketCap ? `$${formatNumber(quote.marketCap / 1e9)}B` : 'N/A'} />
        <PriceCard title="52W Range" value={`$${quote.fiftyTwoWeekLow} - $${quote.fiftyTwoWeekHigh}`} />
      </div>

      <RangeBar
        low={quote.regularMarketDayLow}
        high={quote.regularMarketDayHigh}
        current={quote.regularMarketPrice}
      />

      <MetricsTable data={[
        { label: 'P/E (Trailing)', value: formatNumber(quote.trailingPE) },
        { label: 'P/E (Forward)', value: formatNumber(quote.forwardPE) },
        { label: 'EPS (TTM)', value: formatNumber(quote.epsTrailingTwelveMonths) },
        { label: 'EPS (Current Year)', value: formatNumber(quote.epsCurrentYear) },
        { label: 'Price/Book', value: formatNumber(quote.priceToBook) },
        { label: 'Rating', value: typeof quote.averageAnalystRating === 'string' ? quote.averageAnalystRating : 'N/A' }
      ]} />

      <BarVolumeChart />

      <EarningsBlock
        lastEarnings={quote.earningsTimestamp}
        nextEarningsStart={quote.earningsTimestampStart}
        nextEarningsEnd={quote.earningsTimestampEnd}
      />
    </div>
  );

}
export default YahooQuoteDashboard;