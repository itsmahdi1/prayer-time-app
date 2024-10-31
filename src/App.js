import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import PrayerList from "./PrayerList";
import NextPrayerCountdown from "./NextPrayerCountdown";

function App() {
  const [location, setLocation] = useState({ lat: 33.5731, long: -7.5898 });
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countDown, setCountDown] = useState("");
  const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  useEffect(() => {
    fetchPrayerTimes();
  }, [location]);

  useEffect(() => {
    if (prayerTimes.length > 0) {
      calculateNextPrayer();
      const interval = setInterval(calculateNextPrayer, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const fetchPrayerTimes = async () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    try {
      const response = await axios.get("http://api.aladhan.com/v1/calendar", {
        params: {
          latitude: location.lat,
          longitude: location.long,
          method: 21,
          month: month,
          year: year,
        },
      });
      setPrayerTimes(response.data.data);
      console.log("Fetched Prayer Times:", response.data.data);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const calculateNextPrayer = () => {
    console.log("Running calculateNextPrayer...");

    const todayIndex = new Date().getDate() - 1;
    const timingsToday = prayerTimes[todayIndex]?.timings || {};
    const timingsTomorrow = prayerTimes[todayIndex + 1]?.timings || {};
    
    const now = new Date();
    let next = null;
    let nextPrayerName = "";

    // Loop through mainPrayers to find the next prayer today
    for (const prayer of mainPrayers) {
        let time = timingsToday[prayer];
        
        if (time) {
            // Remove the offset part (e.g., " (+01)") from the time string
            time = time.split(" ")[0];
            
            const [hours, minutes] = time.split(":").map(Number);
            const prayerTime = new Date();
            prayerTime.setHours(hours, minutes, 0);

            if (prayerTime > now) {
                next = prayerTime;
                nextPrayerName = prayer;
                break;
            }
        }
    }

    if (!next && timingsTomorrow["Fajr"]) {  // Fallback for Fajr tomorrow
        let time = timingsTomorrow["Fajr"].split(" ")[0]; // Strip offset
        const [hours, minutes] = time.split(":").map(Number);
        next = new Date(now);
        next.setDate(next.getDate() + 1);
        next.setHours(hours, minutes, 0);
        nextPrayerName = "Fajr";
    }

    if (next) {
        setNextPrayer(nextPrayerName);
        const timeDifference = next - now;
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDifference / 1000) % 60);
        setCountDown(`${hours}h ${minutes}m ${seconds}s`);
    }
};


  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <Header />
      <h1 className="text-3xl text-center text-gray-800">Prayer Time App</h1>
      {prayerTimes.length > 0 ? (
        <>
          <PrayerList prayerTimes={prayerTimes[0]?.timings} mainPrayers={mainPrayers} />
          <NextPrayerCountdown nextPrayer={nextPrayer} countDown={countDown} />
        </>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}

export default App;
