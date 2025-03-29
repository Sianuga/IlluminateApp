// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";

/**
 * This is the main dashboard page:
 * - Displays user info, day streak, total points
 * - Buttons to checkin, redeem items, reset, etc.
 */
export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchData() {
    const res = await fetch("/api/points");
    const data = await res.json();
    if (data.success) {
      setUserData(data.userData);
      setShopItems(data.shopItems);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCheckin() {
    const res = await fetch("/api/points?action=checkin");
    const data = await res.json();
    setMessage(data.message);
    setUserData(data.userData);
  }

  async function handleRedeem(itemId: number) {
    const res = await fetch(`/api/points?action=redeem&itemId=${itemId}`);
    const data = await res.json();
    setMessage(data.message);
    setUserData(data.userData);
  }

  async function handleReset() {
    const res = await fetch("/api/points?action=reset");
    const data = await res.json();
    setMessage(data.message);
    setUserData(data.userData);
  }

  if (!userData) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Hello, good to see you!</h1>
      <p className="text-sm text-gray-400">Dashboard</p>

      {message && (
        <div className="bg-pink-800 text-white p-2 rounded">{message}</div>
      )}

      <div className="mt-4 bg-neutral-800 p-4 rounded">
        <h2 className="text-lg font-semibold">User Info</h2>
        <p>Username: {userData.username}</p>
        <p>Total Points: {userData.totalPoints}</p>
        <p>Day Streak: {userData.dayStreak}</p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={handleCheckin}
          className="bg-pink-600 px-4 py-2 rounded text-white"
        >
          Daily Check-In
        </button>

        <a
          href="/clicker"
          className="bg-pink-600 px-4 py-2 rounded text-white text-center"
        >
          Go to Daily Clicker
        </a>

        <button
          onClick={handleReset}
          className="bg-pink-600 px-4 py-2 rounded text-white"
        >
          Reset Points (Monthly)
        </button>
      </div>

      <div className="mt-4 bg-neutral-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">McDonald’s Store</h2>
        <ul className="space-y-2">
          {shopItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-neutral-700 p-2 rounded"
            >
              <span>
                {item.name} - Cost: {item.cost}
              </span>
              <button
                onClick={() => handleRedeem(item.id)}
                className="bg-pink-600 px-2 py-1 rounded text-sm text-white"
              >
                Redeem
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <p className="text-gray-400 text-sm">News</p>
        <div className="bg-neutral-800 p-4 rounded mt-2">
          <p className="text-white">Organizatorzy wydarzenia ...</p>
        </div>
      </div>
    </div>
  );
}
