import { TIME_RANGES } from './../constant/HeartbeatConstants';
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

// src/utils/marketHours.ts
// -----------------------------------------------------------
// Utility helpers for U.S. equity market hours and holidays.
// All calculations are done in America/New_York (EST/EDT).
// -----------------------------------------------------------

/**
 * Returns true if now (EST/EDT) is a regular‑session trading minute
 * for NYSE/Nasdaq: 09:30–16:00, Mon–Fri, excluding major U.S. holidays.
 */
// src/utils/marketHours.ts

export const isMarketOpenNow = () => {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const year = est.getFullYear();
  const month = est.getMonth();
  const date = est.getDate();
  const day = est.getDay(); // 0 = Sun, 6 = Sat
  const hours = est.getHours();
  const minutes = est.getMinutes();

  // ---------- 1) Only Monday to Friday ----------
  if (day < 1 || day > 5) return false;

  // ---------- 2) Holiday check ----------
  const nthWeekday = (y, m, wkday, n) => {
    let count = 0;
    for (let d = 1; d <= 31; d++) {
      const t = new Date(y, m, d);
      if (t.getMonth() !== m) break;
      if (t.getDay() === wkday && ++count === n) return t;
    }
    return null;
  };

  const lastWeekday = (y, m, wkday) => {
    for (let d = 31; d >= 1; d--) {
      const t = new Date(y, m, d);
      if (t.getMonth() === m && t.getDay() === wkday) return t;
    }
    return null;
  };

  const easterSunday = (y) => {
    const f = Math.floor;
    const G = y % 19,
      C = f(y / 100),
      H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
      I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
      J = (y + f(y / 4) + I + 2 - C + f(C / 4)) % 7,
      L = I - J,
      m = 3 + f((L + 40) / 44),
      d = L + 28 - 31 * f(m / 4);
    return new Date(y, m - 1, d);
  };

  const goodFriday = (() => {
    const easter = easterSunday(year);
    return new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2);
  })();

  const holidays = [
    new Date(year, 0, 1),
    nthWeekday(year, 0, 1, 3),
    nthWeekday(year, 1, 1, 3),
    goodFriday,
    lastWeekday(year, 4, 1),
    new Date(year, 5, 19),
    new Date(year, 6, 4),
    nthWeekday(year, 8, 1, 1),
    nthWeekday(year, 10, 4, 4),
    new Date(year, 11, 25),
  ];

  const isHoliday = holidays.some(
    (h) =>
      h.getFullYear() === year &&
      h.getMonth() === month &&
      h.getDate() === date
  );

  if (isHoliday) return false;

  // ---------- 3) Market hours: 9:40 AM – 4:15 PM ----------
  const currentMinutes = hours * 60 + minutes;
  const startMinutes = 9 * 60 + 40;  // 9:40 AM
  const endMinutes = 16 * 60 + 15;   // 4:15 PM

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export async function getFromDate(range) {
  const today = new Date();
  if (range === 'MAX') return '1970-01-01'; // or earliest available

  // if(range==='1D'){
  //   return getTodayInEST();
  // }
  const days = TIME_RANGES[range];
  const from = new Date(today);
  from.setDate(from.getDate() - days);

  return from.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

export function getTodayInEST() {
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

export function getDateForatted(inputDate) {
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

  const currentDay = today.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const daysUntilFriday = (5 - currentDay + 7) % 7; // 5 = Friday

  const comingFriday = new Date(today);
  comingFriday.setDate(today.getDate() + daysUntilFriday);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [month, day, year] = formatter.format(comingFriday).split('/');
  const comingFridayDate = `${year}-${month}-${day}`;
  console.log('--comingFridayDate--', comingFridayDate)
  return comingFridayDate;
}

//previous friday date
export function getAdjustedDate() {
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



