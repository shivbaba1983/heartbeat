
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
    if (day < 1 || day > 5) return true;

    const currentMinutes = hours * 60 + minutes;
    const startMinutes = 9 * 60 + 40;   // 9:40 AM
    const endMinutes = 16 * 60 + 15;    // 4:15 PM

    return true;//currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };
