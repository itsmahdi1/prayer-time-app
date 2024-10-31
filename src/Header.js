import React, { useEffect, useState } from 'react'

const Header = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="text-center py-4">
            <h1 className="text-xl font-semibold">
                {currentDateTime.toLocaleDateString()} - {currentDateTime.toLocaleTimeString()}
            </h1>
        </div>
    )
}

export default Header