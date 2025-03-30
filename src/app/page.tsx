"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useGame, Benefit } from "@/lib/GameContext";
import "./dashboard.css"; // Import your CSS here

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
    // ,
    // setBenefits,
  } = useGame();

  const [benefits, setBenefits] = useState<Benefit[]>([
    {
      id: 1,
      title: "Tea/Coffee",
      cost: 300,
      redeemed: false,

      image: "/hamburger.jpeg",
    },
    {
      id: 2,
      title: "Movie Tickets",
      cost: 700,
      redeemed: false,
      image: "/coffee.jpg",
    },
    {
      id: 3,
      title: "Dinner Voucher",
      cost: 4500,
      redeemed: false,
      image: "/sandwitch.jpg",
    },
  ]);

  const [message, setMessage] = useState<string>("");
  const [dailyPriceLocked, setDailyPriceLocked] = useState<boolean>(true);
  const [dailyPrizeCollected, setDailyPrizeCollected] =
    useState<boolean>(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>("");
  const [showStreakModal, setShowStreakModal] = useState(false);

  // For the success modal after redemption
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemedBenefit, setRedeemedBenefit] = useState<Benefit | null>(null);

  // For the confirmation modal before redeeming
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

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

  /**
   * Daily check-in logic
   */
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
    setShowStreakModal(true);

    setPoints(points + totalBonus);
    setLastCheckIn(today);
    setMessage(
      `Checked in! +${totalBonus} points (Base: 10, Streak: ${streakBonus}, Drop: ${dailyDrop}${
        isFriday() ? ", Fri: 10" : ""
      }). Keep it going!`
    );

    return true;
  };

  /**
   * Handle daily prize
   */
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

  /**
   * Called when user clicks "Redeem" for a benefit
   * -> Open a confirmation modal first
   */
  const openConfirmModal = (id: number) => {
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
    // Store in state to confirm
    setSelectedBenefit(benefit);
    setShowConfirmModal(true);
  };

  /**
   * If user confirms, we redeem the benefit
   */
  const handleConfirmRedeem = () => {
    if (!selectedBenefit) return;
    const code = generateRandomCode();
    const updatedBenefit = { ...selectedBenefit, redeemed: true, code };

    setPoints(points - selectedBenefit.cost);
    setBenefits(
      benefits.map((b) => (b.id === selectedBenefit.id ? updatedBenefit : b))
    );

    // Show success modal
    setRedeemedBenefit(updatedBenefit);
    setShowRedeemModal(true);

    // Hide confirmation
    setShowConfirmModal(false);
    setSelectedBenefit(null);
  };

  /**
   * If user cancels, just close confirmation
   */
  const handleCancelRedeem = () => {
    setShowConfirmModal(false);
    setSelectedBenefit(null);
  };

  /**
   * Monthly reset (for debugging)
   */
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

  const todayString = getTodayString();

  return (
    <main className="main-container">
      <div className="top-bar">
        <div className="top-bar-left">
          {/* Add Hamburger Menu Button */}
          <button className="hamburger-menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 6H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {/* Existing Content */}
          <div>
            <h1>Hello, good to see you!</h1>
            <span>Dashboard</span>
          </div>
        </div>
        <div className="top-bar-right">{points} pts</div>
      </div>

      <div className="section-title-container">
        <div className="section-title">On-site benefits</div>
        <Link href="/offer">
          <div className="section-store-route">Go to the shop</div>
        </Link>
      </div>

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
              <p className="daily-prize-label">Daily Prize</p>
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
              <p className="daily-prize-label">Daily prize</p>
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
                    <img
                      src="https://media.istockphoto.com/id/682380852/photo/takeaway-coffee-cup-with-clipping-path.jpg?s=612x612&w=0&k=20&c=5J2XuihC3L58BqtPqfO8USOTGgouxuXO-452KqtFol8="
                      alt=""
                    />
                  </span>
                )}
                <div className="benefit-title">{b.title}</div>
              </div>
              <div className="benefit-cost">{b.cost} pts</div>
              <button
                className="benefit-button"
                onClick={() => openConfirmModal(b.id)}
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
            <p className="streak-day">Day {dayStreak - 1}</p>
            <p>+75 pts</p>
            <button
              className="streak-collected-button"
              onClick={handleDailyPriceCheckIn}
            >
              ✔️ Collected
            </button>
          </div>
          <div className="streak-card">
            <p className="streak-day">Today</p>
            <p>+100 pts</p>
            <button
              className={
                lastCheckIn === todayString
                  ? "streak-collected-button"
                  : "streak-collect-button"
              }
              onClick={handleDailyPriceCheckIn}
              disabled={lastCheckIn === todayString}
            >
              {lastCheckIn === todayString ? "✔️ Collected" : "Collect"}
            </button>
          </div>
          <div className="streak-card">
            <p className="streak-day">Day {dayStreak + 1}</p>
            <p>+125 pts</p>
          </div>
        </div>
      </div>
      {/*
      <div className="button-row">
        <button className="button" onClick={handleReset}>
          Reset
        </button>
      </div>
      */}
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

      {/* Updated Bottom Nav */}
      <div className="bottom-nav">
        <Link href="/" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9.5L12 2L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12H15V22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link href="/redeemed" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 12V22H4V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 7H2V12H22V7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 22V7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Redeemed</span>
        </Link>

        <Link href="/" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 6V12L16 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>History</span>
        </Link>
      </div>

      {/* Confirmation Modal for benefit redemption */}
      {showConfirmModal && selectedBenefit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Redemption</h3>
            <p>
              Are you sure you want to redeem "
              <strong>{selectedBenefit.title}</strong>" for{" "}
              <strong>{selectedBenefit.cost} pts</strong>?
            </p>
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={handleConfirmRedeem}>
                Yes
              </button>
              <button className="modal-cancel" onClick={handleCancelRedeem}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal after redeem */}
      {showRedeemModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Successfully redeemed {redeemedBenefit?.title}!</h3>
            <p>Your unique code:</p>
            <div className="code-area">{redeemedBenefit?.code}</div>
            <div className="modal-button-group">
              <button
                className="modal-close-button"
                onClick={() => setShowRedeemModal(false)}
              >
                Close
              </button>
              <a className="modal-show-redeemed-button" href="/redeemed">
                Redeemed
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Streak Updated Modal */}
      {showStreakModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔥 Streak Updated!</h3>
            <p>Your current streak is now {dayStreak} days!</p>
            <button
              className="modal-close-button"
              onClick={() => setShowStreakModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
