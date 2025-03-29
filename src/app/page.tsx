"use client";

import { useState, useEffect } from "react";

// Helper functions to work with dates
const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

const getYesterdayString = (): string => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return y.toISOString().split("T")[0];
};

const isFriday = (): boolean => {
  return new Date().getDay() === 5; // 5 => Friday
};

type Reward = {
  id: number;
  name: string;
  cost: number;
};

const rewards: Reward[] = [
  { id: 1, name: "Coffee Voucher", cost: 10 },
  { id: 2, name: "Free Snack", cost: 20 },
  { id: 3, name: "Office Merchandise", cost: 50 },
];

export default function Home() {
  const [points, setPoints] = useState<number>(0);
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [clickCounter, setClickCounter] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const savedPoints = localStorage.getItem("points");
    const savedStreak = localStorage.getItem("dayStreak");
    const savedLastCheckIn = localStorage.getItem("lastCheckIn");
    if (savedPoints) setPoints(Number(savedPoints));
    if (savedStreak) setDayStreak(Number(savedStreak));
    if (savedLastCheckIn) setLastCheckIn(savedLastCheckIn);
  }, []);

  useEffect(() => {
    localStorage.setItem("points", points.toString());
    localStorage.setItem("dayStreak", dayStreak.toString());
    if (lastCheckIn) localStorage.setItem("lastCheckIn", lastCheckIn);
  }, [points, dayStreak, lastCheckIn]);

  // Daily check-in logic
  const handleCheckIn = () => {
    const today = getTodayString();
    if (lastCheckIn === today) {
      setMessage("You have already checked in today!");
      return;
    }
    const newStreak = lastCheckIn === getYesterdayString() ? dayStreak + 1 : 1;
    setDayStreak(newStreak);

    const basePoints = 10;
    const streakBonus = newStreak * 5;
    const dailyDrop = Math.floor(Math.random() * 16) + 5; // random 5..20
    const fridayBonus = isFriday() ? 10 : 0;
    const totalBonus = basePoints + streakBonus + dailyDrop + fridayBonus;

    setPoints(points + totalBonus);
    setLastCheckIn(today);
    setMessage(
      `Checked in! +${totalBonus} points (Base: 10, Streak: ${streakBonus}, Daily Drop: ${dailyDrop}${
        isFriday() ? ", Friday Bonus: 10" : ""
      }).`
    );
  };

  // Clicker bonus logic (requires 10 clicks)
  const handleClicker = () => {
    const newCount = clickCounter + 1;
    if (newCount < 10) {
      setClickCounter(newCount);
      setMessage(`Click count: ${newCount} / 10`);
    } else {
      const clickBonus = Math.floor(Math.random() * 11) + 10; // 10..20
      setPoints(points + clickBonus);
      setClickCounter(0);
      setMessage(`Clicker activated! +${clickBonus} points.`);
    }
  };

  // Redeem a reward
  const handleRedeem = (reward: Reward) => {
    if (points < reward.cost) {
      setMessage(`Not enough points for ${reward.name}!`);
      return;
    }
    setPoints(points - reward.cost);
    setMessage(`You redeemed: ${reward.name}.`);
  };

  // Reset points and streak (simulate monthly reset)
  const handleReset = () => {
    setPoints(0);
    setDayStreak(0);
    setLastCheckIn(null);
    setClickCounter(0);
    localStorage.removeItem("points");
    localStorage.removeItem("dayStreak");
    localStorage.removeItem("lastCheckIn");
    setMessage("Monthly reset complete. Points and streak are now zero.");
  };

  return (
    <main className="main-container">
      {/* Top Bar */}
      <div className="top-bar">
        <h1>Hello, good to see you!</h1>
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="points-info">{points} points</div>
        <div>Day streak: {dayStreak}</div>
      </div>

      {/* On-site benefits */}
      <div className="section-title">On-site benefits</div>
      <div className="benefits-container">
        {/* Just placeholder cards to mirror your mockup style */}
        <div className="benefit-card">
          <p>Hamburger</p>
          <p>100 pts</p>
          <button
            className="collect-button"
            onClick={() => setMessage("Example benefit clicked!")}
          >
            Collect
          </button>
        </div>
        <div className="benefit-card">
          <p>Snack</p>
          <p>200 pts</p>
          <button
            className="collect-button"
            onClick={() => setMessage("Example benefit clicked!")}
          >
            Collect
          </button>
        </div>
        <div className="benefit-card">
          <p>Premium Seat</p>
          <p>500 pts</p>
          <button
            className="collect-button"
            onClick={() => setMessage("Example benefit clicked!")}
          >
            Collect
          </button>
        </div>
      </div>

      {/* Daily streak */}
      <div className="section-title">Daily streak</div>
      <div className="daily-streak-container">
        <div className="streak-card">
          <p>Day 1</p>
          <p>+125 pts</p>
        </div>
        <div className="streak-card">
          <p>Day 2</p>
          <p>+?? pts</p>
        </div>
        <div className="streak-card">
          <p>Day 3</p>
          <p>+?? pts</p>
        </div>
        <div className="streak-card">
          <p>Day 4</p>
          <p>+?? pts</p>
        </div>
      </div>

      {/* News */}
      <div className="section-title">News</div>
      <div className="news-container">
        <div className="news-item">
          <img src="https://placekitten.com/100/100" alt="News 1" />
          <div>Headline #1: Office updates, events, etc.</div>
        </div>
        <div className="news-item">
          <img src="https://placekitten.com/101/101" alt="News 2" />
          <div>Headline #2: New cafe opening in the building.</div>
        </div>
      </div>

      {/* Display messages */}
      {message && <div className="message">{message}</div>}

      {/* Buttons row (Check In, Clicker, Reset) */}
      <div className="button-row">
        <button className="button" onClick={handleCheckIn}>
          Check In
        </button>
        <button className="button" onClick={handleClicker}>
          Click (10x)
        </button>
        <button className="button" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Shop */}
      <div className="section-title">Shop</div>
      <ul className="shop-list">
        {rewards.map((r) => (
          <li className="shop-item" key={r.id}>
            {r.name} - Cost: {r.cost} pts
            <button className="button" onClick={() => handleRedeem(r)}>
              Redeem
            </button>
          </li>
        ))}
      </ul>

      {/* Bottom navigation */}
      <div className="bottom-nav">
        <div className="bottom-nav-item">
          <svg width="20" height="20" fill="currentColor">
            <circle cx="10" cy="10" r="9" />
          </svg>
          <span>Dashboard</span>
        </div>
        <div className="bottom-nav-item">
          <svg width="20" height="20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="2" />
          </svg>
          <span>Manage</span>
        </div>
        <div className="bottom-nav-item">
          <svg width="20" height="20" fill="currentColor">
            <path d="M3 10h14M3 6h14M3 14h14" />
          </svg>
          <span>History</span>
        </div>
      </div>
    </main>
  );
}
