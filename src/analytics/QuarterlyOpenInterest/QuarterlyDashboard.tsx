import React, { useState } from 'react';
import { TWOQuarterlyOpenInterest } from './TWOQuarterlyOpenInterest';
import { DynamicTickerOptionTable } from './DynamicTickerOptionTable';
import './QuarterlyDashboard.scss';

const QuarterlyDashboard = () => {
  const [showTwoQuarterly, setShowTwoQuarterly] = useState(false);

  return (
    <div className="quarterly-dashboard-container">
      <p className="dashboard-header">Welcome, This is the Analytics Dashboard page</p>

      <div className="section">
        <DynamicTickerOptionTable />
      </div>

      <div className="checkbox-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showTwoQuarterly}
            onChange={(e) => setShowTwoQuarterly(e.target.checked)}
          />
          &nbsp; Display TWO Quarterly Open Interest
        </label>
      </div>

      {showTwoQuarterly && (
        <div className="section">
          <TWOQuarterlyOpenInterest />
        </div>
      )}
    </div>
  );
};

export default QuarterlyDashboard;
