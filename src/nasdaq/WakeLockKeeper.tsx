import React, { useEffect, useRef, useState } from "react";

const WakeLockKeeper = () => {
  const wakeLockRef = useRef<any>(null);
  const [active, setActive] = useState(false);

  // Check if current time is Mon–Fri, 6:00 AM–4:30 PM EST
  const isWithinAllowedHours = () => {
    const now = new Date();

    // Convert to EST/EDT time
    const estTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    const day = estTime.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    const hour = estTime.getHours();
    const minute = estTime.getMinutes();

    const workingDay = day >= 1 && day <= 5; // Mon–Fri

    const afterStart = hour > 6 || (hour === 6 && minute >= 0);
    const beforeEnd = hour < 16 || (hour === 16 && minute <= 30);

    return workingDay && afterStart && beforeEnd;
  };

  const requestWakeLock = async () => {
    try {
      if (!isWithinAllowedHours()) {
        console.log("Outside allowed working hours — Wake Lock disabled.");
        releaseWakeLock();
        return;
      }

      if (document.visibilityState !== "visible") {
        console.log("Tab not visible — Wake Lock request skipped.");
        return;
      }

      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        setActive(true);

        wakeLockRef.current.addEventListener("release", () => {
          console.log("Wake Lock was released by the browser.");
          setActive(false);
        });

        console.log("Wake Lock acquired.");
      }
    } catch (err) {
      console.error("Wake Lock Error:", err);
      setActive(false);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setActive(false);
      console.log("Wake Lock manually released.");
    }
  };

  useEffect(() => {
    // Try to acquire on mount
    requestWakeLock();

    // Re-request when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      } else {
        releaseWakeLock();
      }
    };

    // Check every minute — automatically enable/disable by time
    const interval = setInterval(() => {
      requestWakeLock();
    }, 60_000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  return (
    <div
      style={{
        background: active ? "#1dbf73" : "#d9534f",
        padding: "8px",
        color: "#fff",
        borderRadius: "8px",
        marginBottom: "10px",
        textAlign: "center",
      }}
    >
      {active
        ? "🟢 Screen Wake Lock Active (Working Hours)"
        : "🔴 Wake Lock Inactive (Off-hours or Browser Restricted)"}
    </div>
  );
};

export default WakeLockKeeper;





// import React, { useEffect, useRef, useState } from "react";

// const WakeLockKeeper  = () => {
//   const wakeLockRef = useRef<any>(null);
//   const [active, setActive] = useState(false);

//   const requestWakeLock = async () => {
//     try {
//       if (document.visibilityState !== "visible") {
//         console.log("Tab not visible — Wake Lock request skipped.");
//         return;
//       }

//       if ("wakeLock" in navigator) {
//         wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
//         setActive(true);

//         // If browser releases wake lock automatically
//         wakeLockRef.current.addEventListener("release", () => {
//           console.log("Wake Lock was released by the browser.");
//           setActive(false);
//         });

//         console.log("Wake Lock acquired.");
//       }
//     } catch (err) {
//       console.error("Wake Lock Error:", err);
//       setActive(false);
//     }
//   };

//   useEffect(() => {
//     // Request on mount (if visible)
//     requestWakeLock();

//     // When tab becomes visible again, re-request
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         console.log("Tab visible again — re-requesting Wake Lock...");
//         requestWakeLock();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     return () =>
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);

//   return (
//     <div
//       style={{
//         background: active ? "#1dbf73" : "#d9534f",
//         padding: "8px",
//         color: "#fff",
//         borderRadius: "8px",
//         marginBottom: "10px",
//         textAlign: "center",
//       }}
//     >
//       {active ? "🟢 Screen Wake Lock Active" : "🔴 Wake Lock Inactive"}
//     </div>
//   );
// };

// export default WakeLockKeeper;
