import React from 'react'

function PrayerList({ prayerTimes, mainPrayers, selectedLocation }) {
    return (
        <div>
            <h2 className="text-2xl text-center text-gray-700 mt-4">{selectedLocation}</h2>
            <ul className="mt-4 space-y-4">
                {mainPrayers.map((prayer) => (
                    <li key={prayer} className="bg-white p-4 rounded-lg shadow">
                        <span className="font-semibold">{prayer}:</span> {prayerTimes[prayer]}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default PrayerList