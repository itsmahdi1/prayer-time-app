import React from "react";
function NextPrayerCountdown({ nextPrayer, countDown }) {
    return (
        <div className="mt-6 flex flex-col items-center justify-center mb-3">
            {nextPrayer ? (
                <div className="bg-blue-100 p-4 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-semibold text-center text-blue-800 mb-2">
                        Next Prayer: <span className="text-blue-600">{nextPrayer}</span>
                    </h2>
                    <div className="flex justify-center items-center space-x-2">
                        <p className="text-4xl font-bold text-blue-700">{countDown}</p>
                    </div>
                    <p className="text-center text-blue-500 mt-2">Time until next prayer</p>
                </div>
            ) : (
                <p className="text-center text-lg text-gray-600 mt-4">
                    Calculating next prayer...
                </p>
            )}
        </div>
    );
}


export default NextPrayerCountdown;
