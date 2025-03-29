"use client";
import React, { createContext, useState, useEffect, useContext } from "react";

export type Benefit = {
  id: number;
  title: string;
  cost: number;
  redeemed: boolean;
  image: string;
  code?: string;
};

type GameContextType = {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  dayStreak: number;
  setDayStreak: React.Dispatch<React.SetStateAction<number>>;
  lastCheckIn: string | null;
  setLastCheckIn: React.Dispatch<React.SetStateAction<string | null>>;
  benefits: Benefit[];
  setBenefits: React.Dispatch<React.SetStateAction<Benefit[]>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state with default values
  const [points, setPoints] = useState<number>(0);
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([
    {
      id: 3,
      title: "Hamburger",
      cost: 1000,
      redeemed: false,
      image: "https://via.placeholder.com/120x80.png?text=Hamburger",
    },
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

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("points", points.toString());
    localStorage.setItem("dayStreak", dayStreak.toString());
    if (lastCheckIn) localStorage.setItem("lastCheckIn", lastCheckIn);
    localStorage.setItem("benefits", JSON.stringify(benefits));
  }, [points, dayStreak, lastCheckIn, benefits]);

  return (
    <GameContext.Provider
      value={{
        points,
        setPoints,
        dayStreak,
        setDayStreak,
        lastCheckIn,
        setLastCheckIn,
        benefits,
        setBenefits,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
