// src/app/layout.tsx
import React, { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Global Lottery",
  description: "Office Gamification Proof of Concept",
};

/**
 * The global layout wraps all pages.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-neutral-900 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
