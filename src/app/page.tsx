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

  const [message, setMessage] = useState<string>("");
  const [dailyPriceLocked, setDailyPriceLocked] = useState<boolean>(true);
  const [dailyPrizeCollected, setDailyPrizeCollected] =
    useState<boolean>(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>("");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemedBenefit, setRedeemedBenefit] = useState<Benefit | null>(null);

  useEffect(() => {
    const lastDailyPrize = localStorage.getItem("lastDailyPrize");
    if (lastDailyPrize === getTodayString()) {
      setDailyPrizeCollected(true);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (dailyPrizeCollected) {
      interval = setInterval(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight.getTime() - now.getTime();
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(
          2,
          "0"
        );
        const minutes = String(
          Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        ).padStart(2, "0");
        const seconds = String(
          Math.floor((diff % (1000 * 60)) / 1000)
        ).padStart(2, "0");
        setTimeUntilMidnight(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dailyPrizeCollected]);

  useEffect(() => {
    const today = getTodayString();
    setDailyPriceLocked(lastCheckIn !== today);
  }, [lastCheckIn]);

  const handleCheckIn = () => {
    const today = getTodayString();

    if (lastCheckIn === today) {
      setMessage("You have already checked in today!");
      return false;
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

    return true;
  };

  const handleDailyPriceClick = () => {
    if (dailyPriceLocked) {
      setMessage("You need to check in before receiving the reward!");
      return;
    }
    if (dailyPrizeCollected) {
      setMessage("Daily prize already collected. Please wait until midnight.");
      return;
    }
    const bonus = Math.floor(Math.random() * 11) + 12220;
    setPoints(points + bonus);
    setMessage(`Daily prize activated! +${bonus} points.`);
    setDailyPrizeCollected(true);
    localStorage.setItem("lastDailyPrize", getTodayString());
  };

  const handleDailyPriceCheckIn = () => {
    const success = handleCheckIn();
    if (success) {
      setDailyPriceLocked(false);
    }
  };

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
    const updatedBenefit = { ...benefit, redeemed: true, code };

    setPoints(points - benefit.cost);
    setBenefits(benefits.map((b) => (b.id === id ? updatedBenefit : b)));
    setRedeemedBenefit(updatedBenefit);
    setShowRedeemModal(true);
  };

  const handleReset = () => {
    setPoints(0);
    setDayStreak(0);
    setLastCheckIn(null);
    setDailyPrizeCollected(false);
    setDailyPriceLocked(true);
    localStorage.removeItem("points");
    localStorage.removeItem("dayStreak");
    localStorage.removeItem("lastCheckIn");
    localStorage.removeItem("benefits");
    localStorage.removeItem("lastDailyPrize");
    setMessage(
      "Monthly reset complete. Points, streak, and benefits restored."
    );
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

      <div className="section-title">On-site benefits</div>
      <div className="benefits-container">
        <div
          className={`benefit-card daily-price-card ${
            dailyPrizeCollected ? "disabled" : ""
          }`}
        >
          <div className="emoji">
            <span role="img" aria-label="Daily Prize">
              🎁
            </span>
          </div>
          {dailyPriceLocked ? (
            <>
              <p>Daily Prize</p>
              <Link href="/clicker" className="nav-item">
                <button
                  onClick={handleDailyPriceCheckIn}
                  className="benefit-button"
                >
                  Check In
                </button>
              </Link>
            </>
          ) : (
            <>
              <p>Daily prize</p>
              <button
                className="benefit-button"
                onClick={handleDailyPriceClick}
                disabled={dailyPrizeCollected}
              >
                {dailyPrizeCollected ? "Collected" : "Collect"}
              </button>
              {dailyPrizeCollected && (
                <p className="timer">Available in: {timeUntilMidnight}</p>
              )}
            </>
          )}
        </div>

        {benefits
          .filter((b) => !b.redeemed)
          .map((b) => (
            <div key={b.id} className="benefit-card">
              <div className="benefit-header">
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
              onClick={handleDailyPriceCheckIn}
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
      <div className="news-container">
        <div className="news-box">
          <img
            src="https://images.unsplash.com/photo-1624996379697-f01d168b1a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Office event"
            className="news-image"
          />
          <div className="news-content">
            <h3 className="news-title">Summer Team Building Event</h3>
            <p className="news-date">2023/08/28, 16:27</p>
            <p className="news-excerpt">
              Join us for an exciting afternoon of team activities and
              networking. Free snacks and drinks provided for all participants!
            </p>
          </div>
        </div>
      </div>
      <div className="news-container"></div>

      {message && <div className="message">{message}</div>}

      <div className="button-row">
        <button className="button" onClick={handleReset}>
          Reset
        </button>
      </div>

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

      {showRedeemModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Successfully redeemed {redeemedBenefit?.title}!</h3>
            <p>Your unique code:</p>
            <div className="code-area">{redeemedBenefit?.code}</div>
            <button
              className="modal-close-button"
              onClick={() => setShowRedeemModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
