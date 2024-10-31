import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "./Header";
import PrayerList from "./PrayerList";
import NextPrayerCountdown from "./NextPrayerCountdown";

function App() {
  const [location] = useState({ lat: 33.5731, long: -7.5898 });
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countDown, setCountDown] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [timezone, setTimezone] = useState("Africa/Casablanca");
  const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const fetchPrayerTimes = useCallback(async () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    const day = targetDate.getDate();

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
      const dataForDay = response.data.data[day - 1];
      const timings = Object.fromEntries(
        Object.entries(dataForDay.timings).map(([key, time]) => [
          key,
          time.split(" ")[0],
        ])
      );
      setPrayerTimes(timings);
      setTimezone(response.data.data[0].meta.timezone || "Unknown timezone");
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  }, [location, dayOffset]);

  const calculateNextPrayer = useCallback(() => {
    const now = new Date();
    let next = null;
    let nextPrayerName = "";

    mainPrayers.some((prayer) => {
      const time = prayerTimes[prayer];
      if (!time) return false;

      const [hours, minutes] = time.split(":").map(Number);
      const prayerTime = new Date(now);
      prayerTime.setHours(hours, minutes, 0);

      if (prayerTime > now) {
        next = prayerTime;
        nextPrayerName = prayer;
        return true;
      }
      return false;
    });

    if (!next) {
      const [hours, minutes] = prayerTimes["Fajr"].split(":").map(Number);
      next = new Date(now);
      next.setDate(now.getDate() + 1);
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
  }, [mainPrayers, prayerTimes]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  useEffect(() => {
    if (Object.keys(prayerTimes).length > 0) {
      calculateNextPrayer();
      const interval = setInterval(calculateNextPrayer, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes, calculateNextPrayer]);

  const handleNextDay = () => setDayOffset(dayOffset + 1);
  const handlePreviousDay = () => setDayOffset(dayOffset - 1);

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <Header timezone={timezone} />
      <h1 className="text-3xl text-center text-gray-800">Prayer Time App</h1>
      <div className="flex justify-between">
        <button onClick={handlePreviousDay}>&#8592; Previous Day</button>
        <span>
          {new Date(
            new Date().setDate(new Date().getDate() + dayOffset)
          ).toDateString()}
        </span>
        <button onClick={handleNextDay}>Next Day &#8594;</button>
      </div>
      {prayerTimes ? (
        <>
          <PrayerList prayerTimes={prayerTimes} mainPrayers={mainPrayers} />
          <NextPrayerCountdown nextPrayer={nextPrayer} countDown={countDown} />
        </>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}

export default App;
