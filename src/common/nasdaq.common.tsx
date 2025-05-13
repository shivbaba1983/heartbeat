import {TIME_RANGES} from './../constant/HeartbeatConstants';
  // Helper to check if it's between 9:40 AM and 4:15 PM EST, Monday–Friday
  export function isWithinMarketHours() {
    const now = new Date();

    // Convert to EST (New York timezone)
    const estNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/New_York' })
    );

    const day = estNow.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = estNow.getHours();
    const minutes = estNow.getMinutes();

    // Check for Monday to Friday
    if (day < 1 || day > 5) return false;

    const currentMinutes = hours * 60 + minutes;
    const startMinutes = 9 * 60 + 40;   // 9:40 AM
    const endMinutes = 16 * 60 + 15;    // 4:15 PM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  export async function  getFromDate(range) {
    const today = new Date();
    if (range === 'MAX') return '2000-01-01'; // or earliest available
  
    // if(range==='1D'){
    //   return getTodayInEST();
    // }
    const days = TIME_RANGES[range];
    const from = new Date(today);
    from.setDate(from.getDate() - days);
  
    return from.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  export function  getTodayInEST () {
    const estDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York"
    });
  
    const date = new Date(estDate);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
  
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  };

  export function getFridayOfCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - Saturday : 0 - 6
    const diffToFriday = 5 - dayOfWeek;
    const friday = new Date(today);
    friday.setDate(today.getDate() + diffToFriday);
    return friday.toISOString().slice(0, 10);;
  }

  export function getDateForatted(inputDate){
    return inputDate?.split("T")[0]
  }

  export function getEffectiveDate() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 6 = Saturday

  if (day === 6) {
    today.setDate(today.getDate() + 2); // Saturday → Monday
  } else if (day === 0) {
    today.setDate(today.getDate() + 1); // Sunday → Monday
  }

  // Format as 'yyyy-mm-dd'
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

export function getComingFriday() {
  const today = new Date();

  // Get current day (0 = Sunday, ..., 6 = Saturday)
  const currentDay = today.getDay();

  // Calculate how many days to add to reach next Friday (5)
  const daysUntilFriday = (5 - currentDay + 7) % 7 || 7;

  // Calculate next Friday's date
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);

  // Format for America/New_York timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [month, day, year] = formatter.format(nextFriday).split('/');

  return `${year}-${month}-${day}`; // e.g., 2025-05-16
}

//previous friday date
export  function getAdjustedDate() {
const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 6 = Saturday

  const result = new Date(today);

  if (day === 6) {
    // Saturday → go back 1 day
    result.setDate(today.getDate() - 1);
  } else if (day === 0) {
    // Sunday → go back 2 days
    result.setDate(today.getDate() - 2);
  }

  // Format as 'YYYY-mm-dd'
  const yyyy = result.getFullYear();
  const mm = String(result.getMonth() + 1).padStart(2, '0');
  const dd = String(result.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}



