
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