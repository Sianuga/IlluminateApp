// src/app/clicker/page.tsx
"use client";

import React, { useState, useEffect } from "react";

/**
 * This page simulates the "once-per-day" clicker, with a
 * mock "vibration" or animation. We'll just show a button
 * that triggers a fetch to /api/points?action=clicker.
 */
export default function ClickerPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [shakeActive, setShakeActive] = useState(false);

  async function fetchUserData() {
    const res = await fetch("/api/points");
    const data = await res.json();
    setUserData(data.userData);
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleClicker() {
    // Trigger "shake" animation
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 700);

    const res = await fetch("/api/points?action=clicker");
    const data = await res.json();
    setMessage(data.message);
    setUserData(data.userData);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Daily Clicker</h1>
      <p className="text-sm text-gray-400">Available once per day</p>

      {message && (
        <div className="bg-pink-800 text-white p-2 rounded">{message}</div>
      )}

      <div className="relative w-40 h-40 mx-auto">
        {/* Mock image (replace with your custom image) */}
        <img
          src="/mock-clicker.svg"
          alt="Clicker"
          className={`w-full h-full object-contain transition-transform duration-200
            ${shakeActive ? "animate-[wiggle_0.7s_ease-in-out]" : ""}
          `}
        />
        {/* 
          The 'animate-[wiggle_0.7s_ease-in-out]' is a custom Tailwind animation.
          You can define it in your tailwind.config if you want a custom keyframe:
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          
          Then in tailwind.config.js:
          theme: {
            extend: {
              keyframes: {
                wiggle: {
                  '0%, 100%': { transform: 'rotate(-3deg)' },
                  '50%': { transform: 'rotate(3deg)' },
                },
              },
              animation: {
                wiggle: 'wiggle 0.7s ease-in-out',
              },
            },
          },
        */}
      </div>

      <button
        onClick={handleClicker}
        className="bg-pink-600 px-4 py-2 rounded text-white"
      >
        Use Clicker
      </button>

      <div className="mt-4">
        <p>Username: {userData?.username}</p>
        <p>Total Points: {userData?.totalPoints}</p>
        <p>Day Streak: {userData?.dayStreak}</p>
      </div>
    </div>
  );
}
