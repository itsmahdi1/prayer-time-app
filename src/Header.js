import React from "react";

function Header({ date, selectedLocation }) {
  return (
    <header className="text-center my-4">
      <h2 className="text-xl font-semibold">{selectedLocation}</h2>
      <p className="text-sm text-gray-600"></p>
    </header>
  );
}

export default Header;
