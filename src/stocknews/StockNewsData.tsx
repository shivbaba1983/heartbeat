import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StockNewsData.scss'; // Import the custom CSS

const StockNewsData = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_KEY = '4ZSLH07FO4QPIYE1'; // Replace with your key

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&apikey=${API_KEY}`
        );
        const feed = res.data.feed || [];
        setNews(feed.slice(0, 10));
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '1rem' }}>Loading...</p>;

  return (
    <div className="container">
      <h2 className="news-title">Apple (AAPL) News</h2>
      <div className="grid">
        {news.map((item, idx) => (
          <div key={idx} className="card">
            <div className="card-content">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-title"
              >
                {item.title}
              </a>
              <p className="card-summary">
                {item.summary.length > 100
                  ? item.summary.substring(0, 100) + '...'
                  : item.summary}
              </p>
              <div className="card-date">
                Published: {new Date(item.time_published).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StockNewsData;