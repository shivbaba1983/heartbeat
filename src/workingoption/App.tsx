import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import OptionPage from './OptionPage';

const Home = () => {
  const [symbol, setSymbol] = React.useState('');
  const navigate = useNavigate();

  const goToOptions = () => {
    if (symbol) navigate(`/options/${symbol.toUpperCase()}`);
  };

  return (
    <div className="p-4">
      <h2>NASDAQ Options Viewer</h2>
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Enter NASDAQ symbol"
      />
      <button onClick={goToOptions}>View Options</button>
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/options/:symbol" element={<OptionPage />} />
    </Routes>
  </Router>
);

export default App;
