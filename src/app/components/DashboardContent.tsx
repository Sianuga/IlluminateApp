// src/app/components/DashboardContent.tsx
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

export default function DashboardContent() {
  const [user, setUser] = useState<UserData | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState("");

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
    setMessage(data.message || "");
    if (data.user) {
      setUser(data.user);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="header">
        <h1>Hello, good to see you!</h1>
        <span className="subtitle">Dashboard</span>
      </div>

      {/* On-site benefits */}
      <div className="benefits">
        <div className="benefits-header">
          <h2>On-site benefits</h2>
          <div className="points">{user?.totalPoints ?? 0} points</div>
        </div>
        <div className="benefits-cards">
          {shopItems.map((item) => (
            <div className="benefit-card" key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.cost} pkt</p>
              {/* Could be "Collect" if it's a free daily item, or "Redeem" if it costs points */}
              <button
                onClick={() =>
                  handleAction("/api/redeem", `?itemId=${item.id}`)
                }
              >
                {item.name === "Daily price" ? "Collect" : "Redeem"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Daily streak */}
      <div className="streak-section">
        <h2>Daily streak</h2>
        <div className="streak-cards">
          {/* Example “Day 2” card */}
          <div className="streak-card">
            <span>Day {user?.dayStreak ?? 1}</span>
            <p>+ {5 * (user?.dayStreak ?? 1)} pts</p>
            <button onClick={() => handleAction("/api/checkin")}>
              Collect
            </button>
          </div>
          {/* Just show next 2 days as placeholders */}
          <div className="streak-card disabled">
            <span>Day {(user?.dayStreak ?? 1) + 1}</span>
            <p>+ {5 * ((user?.dayStreak ?? 1) + 1)} pts</p>
          </div>
          <div className="streak-card disabled">
            <span>Day {(user?.dayStreak ?? 1) + 2}</span>
            <p>+ {5 * ((user?.dayStreak ?? 1) + 2)} pts</p>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="quick-access">
        <h2>Quick access</h2>
        <div className="qa-cards">
          <div className="qa-card">Parking</div>
          <div className="qa-card">Meeting rooms</div>
          <div className="qa-card" onClick={() => handleAction("/api/shake")}>
            Shake
          </div>
        </div>
      </div>

      {/* Example event card */}
      <div className="event-card">
        <h3>Organizatorzy wydarzenia</h3>
        <p>2023/08/28, 16:27</p>
        <img
          src="https://via.placeholder.com/80"
          alt="Event"
          className="event-img"
        />
      </div>

      {/* Display any messages */}
      {message && <div className="message">{message}</div>}
    </div>
  );
}
