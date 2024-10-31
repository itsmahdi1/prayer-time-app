import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "./Header";
import PrayerList from "./PrayerList";
import NextPrayerCountdown from "./NextPrayerCountdown";

const locations = [
  { name: "Casablanca", lat: 33.5731, long: -7.5898 },
  { name: "Marrakech", lat: 31.6295, long: -7.9811 },
  // Add more locations as needed
];

function App() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countDown, setCountDown] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [timezone, setTimezone] = useState("Africa/Casablanca");
  const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const fetchPrayerTimes = useCallback(async () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset); // Adjust date based on offset
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    // Create a unique key for this month and location
    const monthKey = `${year}-${month}-${selectedLocation.name}`;

    // 1. Check local storage for saved data for the entire month
    const cachedData = localStorage.getItem(monthKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const day = targetDate.getDate();
      setPrayerTimes(parsedData[day - 1].timings); // Get timings for the specific day
      console.log("Loaded data from local storage for month:", monthKey);
      return;
    }

    // 2. If not found in local storage, make an API request
    try {
      const response = await axios.get("http://api.aladhan.com/v1/calendar", {
        params: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.long,
          method: 21,
          month: month,
          year: year,
        },
      });
      const monthlyData = response.data.data.map((data) => {
        const timings = Object.fromEntries(
          Object.entries(data.timings).map(([key, time]) => [
            key,
            time.split(" ")[0],
          ])
        );

        return {
          timings,
        };
      });

      setPrayerTimes(monthlyData[dayOffset].timings); // Get timings for the specific day

      // 3. Save the entire month's data to local storage for future access
      localStorage.setItem(monthKey, JSON.stringify(monthlyData));
      console.log(
        "Fetched data from API and saved to local storage for month:",
        monthKey
      );
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  }, [selectedLocation, dayOffset]);

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

  const handleLocationChange = (event) => {
    const selected = locations.find(
      (location) => location.name === event.target.value
    );
    setSelectedLocation(selected);
    setDayOffset(0); // Reset day offset when location changes
    setPrayerTimes({}); // Clear prayer times to trigger loading state
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <Header timezone={timezone} />
      <h1 className="text-3xl text-center text-gray-800">Prayer Time App</h1>
      <div className="flex justify-between">
        <select onChange={handleLocationChange} value={selectedLocation.name}>
          {locations.map((location) => (
            <option key={location.name} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
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
          <PrayerList
            prayerTimes={prayerTimes}
            mainPrayers={mainPrayers}
            selectedLocation={selectedLocation.name}
          />
          <NextPrayerCountdown nextPrayer={nextPrayer} countDown={countDown} />
        </>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}

export default App;
