"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./ClickerPage.css";

// Utility: returns a random integer between min and max (inclusive)
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Particle = {
  id: number;
  dx: number;
  dy: number;
};

const ParticleEffect: React.FC = () => {
  // Create 20 particles with random direction and distance
  const particles: Particle[] = Array.from({ length: 20 }, (_, i) => {
    const angle = Math.random() * 2 * Math.PI;
    const distance = randomInt(50, 150);
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
    };
  });

  return (
    <div className="particle-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={
            { "--dx": `${p.dx}px`, "--dy": `${p.dy}px` } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

const ClickerPage: React.FC = () => {
  const [progress, setProgress] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [animate, setAnimate] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const router = useRouter();

  // Load points and progress from localStorage on mount
  useEffect(() => {
    const storedPoints = localStorage.getItem("points_clicker");
    const storedProgress = localStorage.getItem("progress_clicker");
    if (storedPoints) setPoints(Number(storedPoints));
    if (storedProgress) setProgress(Number(storedProgress));
  }, []);

  // Save points and progress to localStorage when they change
  useEffect(() => {
    localStorage.setItem("points_clicker", points.toString());
    localStorage.setItem("progress_clicker", progress.toString());
  }, [points, progress]);

  const handleClick = () => {
    if (isComplete) return;

    // Trigger vibration and particle effects
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);

    // Increase progress by a random value between 13% and 25%
    const increment = randomInt(13, 25);
    const newProgress = progress + increment;

    if (newProgress >= 100) {
      // If progress reaches 100%, award bonus points, block further clicks and redirect
      const bonus = randomInt(20, 40);
      const totalPoints = points + bonus;
      setPoints(totalPoints);
      setProgress(100);
      setMessage(
        `+ ${bonus} points!`
      );
      setIsComplete(true);
    } else {
      setProgress(newProgress);
      setMessage(`+${increment}% progress!`);
    }
  };

  const handleReturn = () => {
    router.push("/");
  };

  return (
    <main
      className={`clicker-main-container ${animate ? "animate-vibrate" : ""}`}
    >
      {animate && <ParticleEffect />}
      <div className="clicker-content">
        <div className="clicker-card">
          <div className="clicker-progress">{progress}%</div>
          <p className="clicker-instructions">
            Press the button to increase progress. Reach 100% for a bonus!
          </p>
          <button
            className="clicker-button"
            onClick={handleClick}
            disabled={isComplete}
          >
            Click Me!
          </button>
          {message && <div className="clicker-message">{message}</div>}
        </div>
      </div>
      {isComplete && (
        <div className="overlay">
          <div className="overlay-message">
            {message}
            <button
              className="clicker-button overlay-button"
              onClick={handleReturn}
            >
              Return to Main Page
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClickerPage;
