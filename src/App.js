import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import PrayerList from "./PrayerList";
import NextPrayerCountdown from "./NextPrayerCountdown";

function App() {
  const [location, setLocation] = useState({ lat: 33.5731, long: -7.5898 });
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countDown, setCountDown] = useState("");
  const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  useEffect(() => {
    fetchPrayerTimes();
  }, [location]);

  useEffect(() => {
    if (Object.keys(prayerTimes).length > 0) {
      calculateNextPrayer();
      const interval = setInterval(calculateNextPrayer, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const fetchPrayerTimes = async () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are 0-based
    const year = today.getFullYear();

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
      console.log(response.data.data);
      // Get today's prayer times
      const todaysData = response.data.data.find(
        (entry) => parseInt(entry.date.gregorian.day) === day
      );

      if (todaysData) {
        const timings = Object.fromEntries(
          Object.entries(todaysData.timings).map(([key, time]) => [
            key,
            time.split(" ")[0], // Remove timezone offset
          ])
        );

        setPrayerTimes({
          date: todaysData.date.readable,
          timings,
        });
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const calculateNextPrayer = () => {
    const now = new Date();
    let next = null;
    let nextPrayerName = "";

    for (const prayer of mainPrayers) {
      const time = prayerTimes.timings?.[prayer];
      if (!time) continue;

      const [hours, minutes] = time.split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0);

      if (prayerTime > now) {
        next = prayerTime;
        nextPrayerName = prayer;
        break;
      }
    }

    if (!next && prayerTimes.timings) {
      const [hours, minutes] = prayerTimes.timings["Fajr"]?.split(":").map(Number) || [5, 0];
      next = new Date();
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
      <Header date={prayerTimes.date} />
      <h1 className="text-3xl text-center text-gray-800">Prayer Time</h1>
      {Object.keys(prayerTimes).length > 0 ? (
        <>
          <PrayerList prayerTimes={prayerTimes.timings} mainPrayers={mainPrayers} />
          <NextPrayerCountdown nextPrayer={nextPrayer} countDown={countDown} />
        </>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}

export default App;
