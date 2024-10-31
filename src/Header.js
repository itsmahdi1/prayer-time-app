import React from "react";

function Header({ date, timezone }) {
  return (
    <header className="text-center my-4">
      <h2 className="text-xl font-semibold">{date}</h2>
      <p className="text-sm text-gray-600">{timezone}</p>
    </header>
  );
}

export default Header;
