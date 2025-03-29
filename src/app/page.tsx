"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useGame, Benefit } from "@/lib/GameContext";

// Helper functions
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
  // Use context values from your GameContext
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

  // For the “daily price” click count
  const [clickCounter, setClickCounter] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  // Track whether “daily price” is locked (i.e., user hasn't checked in today)
  const [dailyPriceLocked, setDailyPriceLocked] = useState<boolean>(true);

  // Whenever `lastCheckIn` changes, decide if the “daily price” is locked
  useEffect(() => {
    const today = getTodayString();
    setDailyPriceLocked(lastCheckIn !== today);
  }, [lastCheckIn]);

  /**
   * Daily check-in logic.
   * Called when user tries to “Check In” to unlock the daily price box.
   */
  const handleCheckIn = () => {
    const today = getTodayString();

    // If user has already checked in today
    if (lastCheckIn === today) {
      setMessage("You have already checked in today!");
      return false; // No new check-in
    }

    // Determine if we should increment or reset streak
    const newStreak = lastCheckIn === getYesterdayString() ? dayStreak + 1 : 1;
    setDayStreak(newStreak);

    // Calculate points from check-in
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

    return true; // Successful check-in
  };

  /**
   * Handle the user pressing the “Daily price” box.
   * Once pressed 10 times, awards points.
   */
  const handleDailyPriceClick = () => {
    if (dailyPriceLocked) {
      setMessage("You need to check in before receiving the reward!");
      return;
    }

    const newCount = clickCounter + 1;
    if (newCount < 10) {
      setClickCounter(newCount);
      setMessage(`Daily price tapped: ${newCount} / 10`);
    } else {
      const clickBonus = Math.floor(Math.random() * 11) + 12220;
      setPoints(points + clickBonus);
      setClickCounter(0);
      setMessage(`Daily price activated! +${clickBonus} points.`);
    }
  };

  /**
   * Called by the “Check In” button inside the daily price box
   * and also from the daily streak "Collect" button.
   */
  const handleDailyPriceCheckIn = () => {
    const success = handleCheckIn();
    if (success) {
      setDailyPriceLocked(false);
    }
  };

  /**
   * Redeem a benefit.
   */
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

  /**
   * Monthly reset (for debugging).
   */
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
    setMessage("Monthly reset complete. Points, streak, and benefits restored.");
  };

  return (
    <main className="main-container">
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Hello, good to see you!</h1>
          <span>Dashboard</span>
        </div>
        <div className="top-bar-right">{points} pts</div>
      </div>

      {/* On-site benefits section */}
      <div className="section-title">On-site benefits</div>
      <div className="benefits-container">
        {/* Daily price box placed first so that it appears on the left */}
        <div className="benefit-card daily-price-card">
          <div className="emoji">
            <span role="img" aria-label="Daily Price">
              🎁
            </span>
          </div>
          {dailyPriceLocked ? (
            <>
              <p>You need to check in before receiving the reward</p>
              <button onClick={handleDailyPriceCheckIn}>Check In</button>
            </>
          ) : (
            <>
              <p>Daily price</p>
              <button onClick={handleDailyPriceClick}>Collect</button>
            </>
          )}
        </div>

        {/* Render remaining benefits */}
        {benefits
          .filter((b) => !b.redeemed)
          .map((b) => (
            <div key={b.id} className="benefit-card">
              <div className="benefit-header">
                {/* If this benefit costs 1000 pts, show the hamburger emoji */}
                {b.cost === 1000 && (
                  <span role="img" aria-label="Hamburger" className="emoji">
                    🍔
                  </span>
                )}
                <div className="benefit-title">{b.title}</div>
              </div>
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

      {/* Daily streak display */}
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
            <button className="streak-collect-button" onClick={handleDailyPriceCheckIn}>
              Collect
            </button>
          </div>
          <div className="streak-card">
            <p>Day {dayStreak + 1}</p>
            <p>+125 pts</p>
          </div>
        </div>
      </div>

      {/* News Section (placeholder) */}
      <div className="section-title">News</div>
      <div className="news-container">
        {/* ... news cards ... */}
      </div>

      {/* Message / status */}
      {message && <div className="message">{message}</div>}

      {/* Debug button row */}
      <div className="button-row">
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
