// src/lib/userData.ts

export type UserData = {
  username: string;
  totalPoints: number;
  dayStreak: number;
  lastCheckinDate: string | null;
};

export const userData: UserData = {
  username: "Ernest Gupik",
  totalPoints: 566,
  dayStreak: 2,
  lastCheckinDate: null,
};

export type ShopItem = {
  id: number;
  name: string;
  cost: number;
};

export const shopItems: ShopItem[] = [
  { id: 1, name: "Daily price", cost: 10 },
  { id: 2, name: "Hamburger", cost: 1000 },
];
