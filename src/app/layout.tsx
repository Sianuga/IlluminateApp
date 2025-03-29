// RootLayout.tsx
"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { GameProvider } from "@/lib/GameContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
