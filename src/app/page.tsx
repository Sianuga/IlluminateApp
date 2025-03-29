"use client";
import { useState } from "react";
import Link from "next/link";
import { useGame, Benefit } from "@/lib/GameContext";

// Helper functions remain unchanged...
const getTodayString = (): string => new Date().toISOString().split("T")[0];
const getYesterdayString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};
const isFriday = (): boolean => new Date().getDay() === 5;
function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function Dashboard() {
  // Use context values instead of individual local state
  const {
    points,
    setPoints,
    dayStreak,
    setDayStreak,
    lastCheckIn,
    setLastCheckIn,
    benefits,
    setBenefits,
  } = useGame();

  const [clickCounter, setClickCounter] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  // Daily check-in
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
    const dailyDrop = Math.floor(Math.random() * 16) + 5;
    const fridayBonus = isFriday() ? 10 : 0;
    const totalBonus = basePoints + streakBonus + dailyDrop + fridayBonus;
    setPoints(points + totalBonus);
    setLastCheckIn(today);
    setMessage(
      `Checked in! +${totalBonus} points (Base: 10, Streak: ${streakBonus}, Drop: ${dailyDrop}${
        isFriday() ? ", Fri: 10" : ""
      }). Keep it going!`
    );
  };

  // Clicker bonus
  const handleClicker = () => {
    const newCount = clickCounter + 1;
    if (newCount < 10) {
      setClickCounter(newCount);
      setMessage(`Click count: ${newCount} / 10`);
    } else {
      const clickBonus = Math.floor(Math.random() * 11) + 12220;
      setPoints(points + clickBonus);
      setClickCounter(0);
      setMessage(`Clicker activated! +${clickBonus} points.`);
    }
  };

  // Redeem a benefit
  const handleRedeemBenefit = (id: number) => {
    const benefit = benefits.find((b) => b.id === id);
    if (!benefit) return;
    if (benefit.redeemed) {
      setMessage(`You have already redeemed "${benefit.title}".`);
      return;
    }
    if (points < benefit.cost) {
      setMessage(`Not enough points for "${benefit.title}"!`);
      return;
    }
    const code = generateRandomCode();
    setPoints(points - benefit.cost);
    setBenefits(
      benefits.map((b) => (b.id === id ? { ...b, redeemed: true, code } : b))
    );
    setMessage(`You redeemed "${benefit.title}".`);
  };

  const handleCollectStreak = () => {
    handleCheckIn();
  };

  // Monthly reset
  const handleReset = () => {
    setPoints(0);
    setDayStreak(0);
    setLastCheckIn(null);
    setClickCounter(0);
    setBenefits(
      benefits.map((b) => ({
        ...b,
        redeemed: false,
        code: undefined,
      }))
    );
    localStorage.removeItem("points");
    localStorage.removeItem("dayStreak");
    localStorage.removeItem("lastCheckIn");
    localStorage.removeItem("benefits");
    setMessage(
      "Monthly reset complete. Points, streak, and benefits restored."
    );
  };

  return (
    <main className="main-container">
      {/* Your existing JSX remains unchanged */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Hello, good to see you!</h1>
          <span>Dashboard</span>
        </div>
        <div className="top-bar-right">{points} pts</div>
      </div>
      {/* Render available benefits */}
      <div className="section-title">On-site benefits</div>
      <div className="benefits-container">
        {benefits
          .filter((b) => !b.redeemed)
          .map((b) => (
            <div key={b.id} className="benefit-card">
              <div className="benefit-title">{b.title}</div>
              <div className="benefit-cost">{b.cost} pts</div>
              <button
                className="benefit-button"
                onClick={() => handleRedeemBenefit(b.id)}
              >
                Redeem
              </button>
            </div>
          ))}
      </div>
      {/* Additional sections remain the same */}
      <div className="streak-section">
        <div className="streak-highlight">
          <div className="streak-text">
            Streak: {dayStreak} {dayStreak === 1 ? "day" : "days"}
          </div>
          <div className="streak-subtext">
            Don’t break it! Check in daily for bonus points.
          </div>
        </div>
        <div className="daily-streak-container">
          <div className="streak-card">
            <p>Day {dayStreak - 1}</p>
            <p>+75 pts</p>
          </div>
          <div className="streak-card">
            <p>Today</p>
            <p>+100 pts</p>
            <button
              className="streak-collect-button"
              onClick={handleCollectStreak}
            >
              Collect
            </button>
          </div>
          <div className="streak-card">
            <p>Day {dayStreak + 1}</p>
            <p>+125 pts</p>
          </div>
        </div>
      </div>
      {/* News Section */}
      <div className="section-title">News</div>
      <div className="news-container">{/* ... news cards as before ... */}</div>
      {message && <div className="message">{message}</div>}
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
      <div className="bottom-nav">
        <Link href="/" className="nav-item">
          {/* Dashboard icon */}
          <svg width="20" height="20" fill="currentColor">
            <circle cx="10" cy="10" r="9" />
          </svg>
          <span>Dashboard</span>
        </Link>
        <Link href="/redeemed" className="nav-item">
          {/* Redeemed icon */}
          <svg width="20" height="20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="2" />
          </svg>
          <span>Redeemed</span>
        </Link>
        <Link href="/history" className="nav-item">
          {/* History icon */}
          <svg width="20" height="20" fill="currentColor">
            <path d="M3 10h14M3 6h14M3 14h14" />
          </svg>
          <span>History</span>
        </Link>
      </div>
    </main>
  );
}
