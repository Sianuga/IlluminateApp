"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Benefit = {
  id: number;
  title: string;
  cost: number;
  redeemed: boolean;
  image: string;
  code?: string;
};

export default function RedeemedPage() {
  const [redeemedBenefits, setRedeemedBenefits] = useState<Benefit[]>([]);
  const [showCode, setShowCode] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const savedBenefits = localStorage.getItem("benefits");
    if (savedBenefits) {
      const benefits = JSON.parse(savedBenefits) as Benefit[];
      const redeemed = benefits.filter((b) => b.redeemed);
      setRedeemedBenefits(redeemed);
    }
  }, []);

  const toggleCode = (id: number) => {
    setShowCode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="main-container">
      <div className="redeemed-container">
        <div className="section-title">Redeemed Items</div>
        {redeemedBenefits.length === 0 ? (
          <p className="empty-message">No redeemed items yet.</p>
        ) : (
          <div className="benefits-container">
            {redeemedBenefits.map((b) => (
              <div key={b.id} className="benefit-card">
                <img
                  src={b.image}
                  alt={b.title}
                  className="redeemed-item-img"
                />
                <div className="benefit-header">
                  <div className="benefit-title">{b.title}</div>
                  <div className="benefit-cost">{b.cost} pts</div>
                </div>
                <button
                  className="benefit-button"
                  onClick={() => toggleCode(b.id)}
                >
                  {showCode[b.id] ? "Hide Code" : "View Code"}
                </button>
                {showCode[b.id] && b.code && (
                  <div className="code-area">
                    Your code: <strong>{b.code}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="navigation-link">
          <Link href="/">← Back to Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
