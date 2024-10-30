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
    const timings = prayerTimes[todayIndex]?.timings;
    if (!timings) return;

    const now = new Date();
    let next = null;
    let nextPrayerName = "";

    mainPrayers.some((prayer) => {
      const time = timings[prayer];
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

    if (next) {
      setNextPrayer(nextPrayerName);
      const timeDifference = next - now;
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDifference / 1000) % 60);
      setCountDown(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setNextPrayer("Fajr");
      setCountDown("Tomorrow");
    }
  };

  return (
    <div>
      <h1>Prayer Time App</h1>
      {prayerTimes.length > 0 ? (
        <div>
          <h2>Prayer times for Today</h2>
          <ul>
            {mainPrayers.map((prayer) => (
              <li key={prayer}>
                {prayer}: {prayerTimes[0].timings[prayer]}
              </li>
            ))}
          </ul>
          <h2>Next Prayer: {nextPrayer}</h2>
          <p>Time Remaining:{countDown}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
