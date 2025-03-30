"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./redeemed.css";

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
  // Pagination state: show 9 items per page (3 columns x 3 rows)
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  // Modal state for displaying a benefit’s code
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

  useEffect(() => {
    const savedBenefits = localStorage.getItem("benefits");
    if (savedBenefits) {
      // Load benefits from localStorage
      const benefits = JSON.parse(savedBenefits) as Benefit[];
      // Only show redeemed ones
      const redeemed = benefits.filter((b) => b.redeemed);
      setRedeemedBenefits(redeemed);
    }
  }, []);

  // Calculate total pages and get only the redeemed items for this page
  const totalPages = Math.ceil(redeemedBenefits.length / itemsPerPage);
  const displayedRedeemed = redeemedBenefits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Open modal to show product code
  const openModal = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
  };

  // Close the code modal
  const closeModal = () => {
    setSelectedBenefit(null);
  };

  return (
    <main className="main-container">
      <div className="redeemed-container">
        <div className="section-title">Redeemed Items</div>
        {redeemedBenefits.length === 0 ? (
          <p className="empty-message">No redeemed items yet.</p>
        ) : (
          <div className="redeemed-grid">
            {displayedRedeemed.map((b) => (
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
                <button className="benefit-button" onClick={() => openModal(b)}>
                  View Code
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {redeemedBenefits.length > itemsPerPage && (
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        <div className="navigation-link">
          <Link href="/">← Back to Dashboard</Link>
        </div>
      </div>

      {/* Modal for displaying the code & image */}
      {selectedBenefit && selectedBenefit.code && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedBenefit.image}
              alt={selectedBenefit.title}
              className="modal-image"
            />
            <h3>{selectedBenefit.title}</h3>
            <p>Cost: {selectedBenefit.cost} pts</p>
            <div className="code-area">
              Your code: <strong>{selectedBenefit.code}</strong>
            </div>
            <button className="modal-close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
