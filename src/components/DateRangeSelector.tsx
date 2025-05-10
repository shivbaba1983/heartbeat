import React, { useState, useEffect } from 'react';
import { TIME_RANGES } from './../constant/HeartbeatConstants';
import { getFromDate } from './../common/nasdaq.common';

const DateRangeSelector = ({ setRequestedFromDate }) => {
  // const [range, setRange] = useState('1Y');
  const [selectedRange, setSelectedRange] = useState('6M');
  useEffect(() => {
    const fetchMyData = async () => {
      const fromDate = await getFromDate(selectedRange);
      setRequestedFromDate(fromDate);
    };
    fetchMyData();
  }, []);

  useEffect(() => {
    const fetchMyData = async () => {
      const fromDate = await getFromDate(selectedRange);
      //setRequestedFromDate(fromDate)
      //onChange({ fromDate, toDate });
      setRequestedFromDate(fromDate);
    };
    fetchMyData();
  }, [selectedRange]);

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {Object.keys(TIME_RANGES).map((range) => (
        <label key={range}>
          <input
            type="radio"
            name="timeRange"
            value={range}
            checked={selectedRange === range}
            onChange={() => setSelectedRange(range)}
          />
          {range}
        </label>
      ))}
    </div>
  );
};

export default DateRangeSelector;