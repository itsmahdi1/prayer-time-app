import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState({ lat: 33.5731, long: -7.5898 });
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countDown, setCountDown] = useState("");

  const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  useEffect(() => {
    fetchPrayerTimes();
  }, [location, month, year]);

  useEffect(() => {
    if (prayerTimes.length > 0) {
      calculateNextPrayer();
      const interval = setInterval(calculateNextPrayer, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const fetchPrayerTimes = async () => {
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
      console.log(response.data);
      setPrayerTimes(response.data.data);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const calculateNextPrayer = () => {
    const todayIndex = new Date().getDate() - 1;
    const timingsToday = prayerTimes[todayIndex]?.timings;
    const timingsTomorrow = prayerTimes[todayIndex + 1]?.timings;

    const now = new Date();
    let next = null;
    let nextPrayerName = "";

    if (timingsToday) {
      mainPrayers.some((prayer) => {
        const time = timingsToday[prayer];
        if (!time) return false;

        const [hours, minutes] = time.split(":").map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0);

        if (prayerTime > now) {
          next = prayerTime;
          nextPrayerName = prayer;
          return true;
        }
        return false;
      });
    }

    if (!next && timingsTomorrow) {
      const [hours, minutes] = timingsTomorrow["Fajr"].split(":").map(Number);
      next = new Date();
      next.setDate(next.getDate() + 1);
      next.setHours(hours, minutes, 0);
      nextPrayerName = "Fajr";
    }

    if (next) {
      setNextPrayer(nextPrayerName);
      const timeDifference = next - now;

      if (timeDifference > 0) {
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDifference / 1000) % 60);
        setCountDown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountDown("It's prayer time now!");
      }
    } else {
      setNextPrayer(null);
      setCountDown("No prayers remaining today.");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl text-center text-gray-800">Prayer Time App</h1>
      {prayerTimes.length > 0 ? (
        <div>
          <h2 className="text-2xl text-center text-gray-700 mt-4">Prayer Times for Today</h2>
          <ul className="mt-4 space-y-4">
            {mainPrayers.map((prayer) => (
              <li key={prayer} className="bg-white p-4 rounded-lg shadow">
                <span className="font-semibold">{prayer}:</span> {prayerTimes[0].timings[prayer]}
              </li>
            ))}
          </ul>
          <h2 className="text-2xl text-center text-gray-700 mt-4">Next Prayer: {nextPrayer}</h2>
          <p className="text-center text-xl mt-2">Time Remaining: {countDown}</p>
        </div>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}

export default App;
