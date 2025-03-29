// src/app/components/UserDashboard.tsx
"use client";

import { useState, useEffect } from "react";

type UserData = {
  username: string;
  totalPoints: number;
  dayStreak: number;
  lastCheckinDate: string | null;
};

type ShopItem = {
  id: number;
  name: string;
  cost: number;
};

type ApiResponse = {
  message: string;
  user?: UserData;
  shopItems?: ShopItem[];
};

export default function UserDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState<string>("");

  const fetchData = async () => {
    const res = await fetch("/api/user");
    const data: ApiResponse = await res.json();
    setUser(data.user || null);
    setShopItems(data.shopItems || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (endpoint: string, params: string = "") => {
    const res = await fetch(endpoint + params);
    const data: ApiResponse = await res.json();
    setMessage(data.message);
    if (data.user) {
      setUser(data.user);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Office Gamification</h1>
        <p>Welcome, {user?.username || "Loading..."}!</p>
      </div>
      <div className="status">
        <p>Total Points: {user?.totalPoints ?? 0}</p>
        <p>Day Streak: {user?.dayStreak ?? 0}</p>
      </div>
      <div className="actions">
        <button onClick={() => handleAction("/api/checkin")}>
          Daily Check-In
        </button>
        <button onClick={() => handleAction("/api/shake")}>
          Clicker Bonus
        </button>
        <button onClick={() => handleAction("/api/reset")}>Reset Points</button>
      </div>
      <div className="shop">
        <h2>Shop</h2>
        <div className="shop-list">
          {shopItems.map((item) => (
            <div key={item.id} className="shop-item">
              <h3>{item.name}</h3>
              <p>Cost: {item.cost} pts</p>
              <button
                onClick={() =>
                  handleAction("/api/redeem", `?itemId=${item.id}`)
                }
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
