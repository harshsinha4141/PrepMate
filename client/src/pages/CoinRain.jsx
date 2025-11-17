import React, { useEffect, useState } from "react";

const CoinRain = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const numCoins = 25; // number of coins falling
    const newCoins = Array.from({ length: numCoins }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // random horizontal position
      delay: Math.random() * 2, // random start delay
      size: 30 + Math.random() * 20, // random size
    }));
    setCoins(newCoins);

    // cleanup after 5s to match reward overlay duration
    const timeout = setTimeout(() => setCoins([]), 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute animate-fall"
          style={{
            left: `${coin.left}%`,
            top: `-50px`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${2 + Math.random() * 1.5}s`,
          }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/138/138281.png"
            alt="coin"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ))}
    </div>
  );
};

export default CoinRain;
