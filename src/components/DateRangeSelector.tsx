import React, { useState, useEffect } from 'react';
import{TIME_RANGES} from './../constant/HeartbeatConstants';
import {getFromDate} from './../common/nasdaq.common';

const DateRangeSelector = ({ setRequestedFromDate }) => {
  const [range, setRange] = useState('1M');

  // useEffect(() => {
  //   const toDate = new Date().toISOString().split('T')[0];
  //   const fromDate = await getFromDate(range);
  //   //setRequestedFromDate(fromDate)
  //   //onChange({ fromDate, toDate });
  //   setRequestedFromDate(fromDate);
  // }, [range]);

  useEffect(() => {
    const fetchMyData = async () => {
      const fromDate = await getFromDate(range);
      //setRequestedFromDate(fromDate)
      //onChange({ fromDate, toDate });
      setRequestedFromDate(fromDate);
    };
    fetchMyData();
}, [range]);

  return (
    <select
      value={range}
      onChange={e => setRange(e.target.value)}
      className="border rounded p-2"
    >
      {Object.keys(TIME_RANGES).map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
};

export default DateRangeSelector;