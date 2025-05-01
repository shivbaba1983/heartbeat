import React, { useEffect, useState } from 'react';
import { isWithinMarketHours, getFridayOfCurrentWeek, getTodayInEST } from './../common/nasdaq.common';
function getCurrentWeekFriday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const fridayOffset = 5 - dayOfWeek;
    const friday = new Date(today);
    friday.setDate(today.getDate() + fridayOffset);
    return friday.toISOString().split('T')[0]; // returns 'yyyy-mm-dd'
}

const DatePicker = ({setRequestedDate}) => {

    const [selectedDate, setSelectedDate] = useState(getTodayInEST());
    useEffect(()=>{
        setRequestedDate(selectedDate);
    },[selectedDate])

    const handleChange = (e) => {
        setSelectedDate(e.target.value);
        console.log('------date------', e.target.value)
    };

    return (
        <div>
            <label htmlFor="date">Select Date:</label>
            <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={handleChange}
            />
            {/* <p>Selected Date: {selectedDate}</p> */}
        </div>
    );
}

export default DatePicker;
