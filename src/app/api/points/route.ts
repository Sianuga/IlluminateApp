// src/app/api/points/route.ts
import { NextResponse } from "next/server";
import { addDays, formatISO, parseISO } from "date-fns";

interface UserData {
  username: string;
  totalPoints: number;
  dayStreak: number;
  lastCheckinDate: string | null; // ISO date string or null
  lastClickerDate: string | null; // ISO date string or null
}

const userData: UserData = {
  username: "demo_user",
  totalPoints: 0,
  dayStreak: 0,
  lastCheckinDate: null,
  lastClickerDate: null,
};

// Example store items
const shopItems = [
  { id: 1, name: "Coffee Voucher", cost: 10 },
  { id: 2, name: "Free Snack", cost: 20 },
  { id: 3, name: "Office Merchandise", cost: 50 },
];

/**
 * Helper to handle daily check-in logic
 */
function handleCheckin() {
  const now = new Date();
  const todayStr = formatISO(
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );

  if (userData.lastCheckinDate === todayStr) {
    return { success: false, message: "Already checked in today" };
  }

  // Check if user is continuing a streak (yesterday)
  if (userData.lastCheckinDate) {
    const lastCheckin = parseISO(userData.lastCheckinDate);
    const dayAfterLast = addDays(lastCheckin, 1);
    const isStreakContinuing =
      dayAfterLast.getFullYear() === now.getFullYear() &&
      dayAfterLast.getMonth() === now.getMonth() &&
      dayAfterLast.getDate() === now.getDate();

    if (isStreakContinuing) {
      userData.dayStreak += 1;
    } else {
      userData.dayStreak = 1;
    }
  } else {
    userData.dayStreak = 1;
  }

  // Calculate points
  const basePoints = 10;
  const streakBonus = userData.dayStreak * 5;
  const dailyDrop = Math.floor(Math.random() * 20) + 1; // 1 to 20
  const isFriday = now.getDay() === 5; // Sunday=0, Monday=1, ... Friday=5
  const fridayBonus = isFriday ? 10 : 0;

  const awarded = basePoints + streakBonus + dailyDrop + fridayBonus;
  userData.totalPoints += awarded;
  userData.lastCheckinDate = todayStr;

  return {
    success: true,
    message: `Check-in successful! You earned ${awarded} points.`,
    awarded,
  };
}

/**
 * Helper to handle once-per-day clicker
 */
function handleClicker() {
  const now = new Date();
  const todayStr = formatISO(
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );

  if (userData.lastClickerDate === todayStr) {
    return {
      success: false,
      message: "You have already used the clicker today",
    };
  }

  const bonus = Math.floor(Math.random() * 11) + 5; // 5 to 15
  userData.totalPoints += bonus;
  userData.lastClickerDate = todayStr;

  return {
    success: true,
    message: `Clicker used! You earned ${bonus} bonus points.`,
    bonus,
  };
}

/**
 * Helper to redeem an item
 */
function handleRedeem(itemId: number) {
  const item = shopItems.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, message: "Invalid item" };
  }
  if (userData.totalPoints < item.cost) {
    return { success: false, message: "Not enough points" };
  }
  userData.totalPoints -= item.cost;
  return {
    success: true,
    message: `You redeemed ${item.name} for ${item.cost} points.`,
  };
}

/**
 * Helper to reset points (simulating monthly reset)
 */
function handleReset() {
  userData.totalPoints = 0;
  userData.dayStreak = 0;
  userData.lastCheckinDate = null;
  userData.lastClickerDate = null;
  return { success: true, message: "Points and streak have been reset." };
}

/**
 * Route handler:
 * We’ll interpret query params or JSON to figure out the action:
 *   /api/points?action=checkin
 *   /api/points?action=clicker
 *   /api/points?action=redeem&itemId=1
 *   /api/points?action=reset
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "checkin") {
    const res = handleCheckin();
    return NextResponse.json({ ...res, userData });
  }
  if (action === "clicker") {
    const res = handleClicker();
    return NextResponse.json({ ...res, userData });
  }
  if (action === "redeem") {
    const itemIdStr = searchParams.get("itemId");
    if (!itemIdStr) {
      return NextResponse.json({ success: false, message: "Missing itemId" });
    }
    const itemId = parseInt(itemIdStr, 10);
    const res = handleRedeem(itemId);
    return NextResponse.json({ ...res, userData });
  }
  if (action === "reset") {
    const res = handleReset();
    return NextResponse.json({ ...res, userData });
  }

  // Default: return user data
  return NextResponse.json({ success: true, userData, shopItems });
}
