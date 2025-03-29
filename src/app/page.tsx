"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Helper functions
const getTodayString = (): string => new Date().toISOString().split("T")[0];
const getYesterdayString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};
const isFriday = (): boolean => new Date().getDay() === 5;

function generateRandomCode() {
  // e.g. 8-char code from A-Z/0-9
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

type Benefit = {
  id: number;
  title: string;
  cost: number;
  redeemed: boolean;
  image: string;
  code?: string; // assigned upon redemption
};

export default function Dashboard() {
  const [points, setPoints] = useState<number>(0);
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [clickCounter, setClickCounter] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  // On-site benefits (mock). Each can be redeemed once.
  // Use your own images or placeholders
  const [benefits, setBenefits] = useState<Benefit[]>([
    {
      id: 1,
      title: "Mala Chicken McCrispy (2pc)",
      cost: 900,
      redeemed: false,
      image: "https://via.placeholder.com/120x80.png?text=Mala+McCrispy",
    },
    {
      id: 2,
      title: "Chicken McNuggets (20pc)",
      cost: 1800,
      redeemed: false,
      image: "https://via.placeholder.com/120x80.png?text=McNuggets",
    },
    {
      id: 3,
      title: "Hamburger",
      cost: 1000,
      redeemed: false,
      image: "https://via.placeholder.com/120x80.png?text=Hamburger",
    },
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem("points");
    const savedStreak = localStorage.getItem("dayStreak");
    const savedLastCheckIn = localStorage.getItem("lastCheckIn");
    const savedBenefits = localStorage.getItem("benefits");

    if (savedPoints) setPoints(Number(savedPoints));
    if (savedStreak) setDayStreak(Number(savedStreak));
    if (savedLastCheckIn) setLastCheckIn(savedLastCheckIn);
    if (savedBenefits) setBenefits(JSON.parse(savedBenefits));
  }, []);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem("points", points.toString());
    localStorage.setItem("dayStreak", dayStreak.toString());
    if (lastCheckIn) localStorage.setItem("lastCheckIn", lastCheckIn);
    localStorage.setItem("benefits", JSON.stringify(benefits));
  }, [points, dayStreak, lastCheckIn, benefits]);

  // Daily check-in
  const handleCheckIn = () => {
    const today = getTodayString();
    if (lastCheckIn === today) {
      setMessage("You have already checked in today!");
      return;
    }

    // Update streak
    const newStreak = lastCheckIn === getYesterdayString() ? dayStreak + 1 : 1;
    setDayStreak(newStreak);

    // Calculate daily points
    const basePoints = 10;
    const streakBonus = newStreak * 5;
    const dailyDrop = Math.floor(Math.random() * 16) + 5; // random 5..20
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

  // Clicker bonus (10 clicks)
  const handleClicker = () => {
    const newCount = clickCounter + 1;
    if (newCount < 10) {
      setClickCounter(newCount);
      setMessage(`Click count: ${newCount} / 10`);
    } else {
      const clickBonus = Math.floor(Math.random() * 11) + 12220; // 10..20
      setPoints(points + clickBonus);
      setClickCounter(0);
      setMessage(`Clicker activated! +${clickBonus} points.`);
    }
  };

  // Redeem a benefit (one-time)
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
    // Deduct cost and mark as redeemed, generate code
    const code = generateRandomCode();
    setPoints(points - benefit.cost);
    setBenefits(
      benefits.map((b) => (b.id === id ? { ...b, redeemed: true, code } : b))
    );
    setMessage(`You redeemed "${benefit.title}".`);
  };

  // (Optional) Collect from daily streak card for “Today”
  const handleCollectStreak = () => {
    // You could define a separate small bonus or simply call handleCheckIn
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
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Hello, good to see you!</h1>
          <span>Dashboard</span>
        </div>
        <div className="top-bar-right">{points} pts</div>
      </div>

      {/* On-site benefits */}
      <div className="section-title">Rewards</div>
      <div className="benefits-container">
        {benefits
          .filter((b) => !b.redeemed)
          .map((b) => (
            <div key={b.id} className="benefit-card">
              <img src={b.image} alt={b.title} className="benefit-image" />
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

      {/* Day Streak */}
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
          {/* Example squares for visual effect. The “Today” card includes a collect button. */}
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

      {/* News */}
      <div className="section-title">News</div>
      <div className="news-container">
        <div className="news-card">
          <img
            src="https://placekitten.com/60/60"
            alt="News 1"
            className="news-image"
          />
          <div className="news-text">
            <div className="news-title">Office Update</div>
            <div>3/28/2025, 16:27</div>
            <div>Check out upcoming events in the office!</div>
          </div>
        </div>
        <div className="news-card">
          <img
            src="https://placekitten.com/61/61"
            alt="News 2"
            className="news-image"
          />
          <div className="news-text">
            <div className="news-title">Cafe Specials</div>
            <div>3/29/2025, 10:00</div>
            <div>New menu items & Friday promotions!</div>
          </div>
        </div>
      </div>

      {/* Show messages */}
      {message && <div className="message">{message}</div>}

      {/* Buttons row */}
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

      {/* Bottom nav */}
      <div className="bottom-nav">
        <Link href="/" className="nav-item">
          <svg width="20" height="20" fill="currentColor">
            <circle cx="10" cy="10" r="9" />
          </svg>
          <span>Dashboard</span>
        </Link>
        <Link href="/redeemed" className="nav-item">
          <svg width="20" height="20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="2" />
          </svg>
          <span>Redeemed</span>
        </Link>
        <Link href="/history" className="nav-item">
          <svg width="20" height="20" fill="currentColor">
            <path d="M3 10h14M3 6h14M3 14h14" />
          </svg>
          <span>History</span>
        </Link>
      </div>
    </main>
  );
}
