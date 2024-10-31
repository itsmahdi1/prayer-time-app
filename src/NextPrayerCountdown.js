import React from "react";

function NextPrayerCountdown({ nextPrayer, countDown }) {
    return (
        <div>
            {nextPrayer ? (
                <>
                    <h2 className="text-2xl text-center text-gray-700 mt-4">Next Prayer: {nextPrayer}</h2>
                    <p className="text-center text-xl mt-2">Time Remaining: {countDown}</p>
                </>
            ) : (
                <p className="text-center text-lg mt-4">Calculating next prayer...</p>
            )}
        </div>
    );
}

export default NextPrayerCountdown;
