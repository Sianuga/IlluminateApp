"use client";

import { useState } from "react";
import Link from "next/link";
import { useGame, Benefit } from "@/lib/GameContext";
import "./store.css";

function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Hardcoded list of rewards based on your requirements
const hardcodedRewards: Benefit[] = [
  // Small Benefits (easily achievable)
  {
    id: 1,
    title: "Free Coffee or Tea at a Local Cafe",
    cost: 300,
    redeemed: false,
    image: "/images/free_coffee.jpg",
  },
  {
    id: 2,
    title: "Fresh Pastry or Doughnut",
    cost: 300,
    redeemed: false,
    image: "/images/pastry.jpg",
  },
  {
    id: 3,
    title: "10-20% Discount at a Restaurant or Salad Bar",
    cost: 350,
    redeemed: false,
    image: "/images/discount.jpg",
  },
  {
    id: 4,
    title: "Voucher for Smoothie or Freshly Squeezed Juice",
    cost: 350,
    redeemed: false,
    image: "/images/smoothie.jpg",
  },
  // Medium Benefits
  {
    id: 5,
    title: "Cinema Ticket for a Selected Movie",
    cost: 700,
    redeemed: false,
    image: "/images/cinema.jpg",
  },
  {
    id: 6,
    title: "Lunch Voucher at a Nearby Restaurant",
    cost: 700,
    redeemed: false,
    image: "/images/lunch.jpg",
  },
  {
    id: 7,
    title: "One-day Gym/Fitness Class Entry",
    cost: 1000,
    redeemed: false,
    image: "/images/gym_day.jpg",
  },
  {
    id: 8,
    title: "Shopping Gift Card (e.g. Empik, Rossmann)",
    cost: 1000,
    redeemed: false,
    image: "/images/giftcard.jpg",
  },
  {
    id: 9,
    title: "Voucher for Audiobook or Ebook",
    cost: 700,
    redeemed: false,
    image: "/images/ebook.jpg",
  },
  // Large Benefits
  {
    id: 10,
    title: "Monthly Gym/Fitness Club Membership",
    cost: 3000,
    redeemed: false,
    image: "/images/gym_membership.jpg",
  },
  {
    id: 11,
    title: "Language Course or Development Workshop",
    cost: 4000,
    redeemed: false,
    image: "/images/language_course.jpg",
  },
  {
    id: 12,
    title: "Dinner Voucher for Two at a Restaurant",
    cost: 4500,
    redeemed: false,
    image: "/images/dinner.jpg",
  },
  {
    id: 13,
    title: "Concert or Cultural Event Tickets",
    cost: 4500,
    redeemed: false,
    image: "/images/concert.jpg",
  },
];

export default function Store() {
  const { points, setPoints, benefits, setBenefits } = useGame();
  // Initialize products with the hardcoded rewards
  const [products, setProducts] = useState<Benefit[]>(hardcodedRewards);
  const [message, setMessage] = useState("");

  // For confirmation modal (asking "Yes"/"No" before buying)
  const [selectedProduct, setSelectedProduct] = useState<Benefit | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // For success modal (show code right after buying)
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemedProduct, setRedeemedProduct] = useState<Benefit | null>(null);

  // Pagination state
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Called when user clicks "Buy" on a product
  const handleBuyClick = (product: Benefit) => {
    if (points < product.cost) {
      setMessage("Not enough points to buy this product!");
      return;
    }
    // Open confirmation modal
    setSelectedProduct(product);
    setShowConfirmationModal(true);
  };

  // If user confirms purchase in the modal
  const handleConfirmBuy = () => {
    if (!selectedProduct) return;

    // Generate a code and mark the product as redeemed
    const code = generateRandomCode();
    const updatedProduct = { ...selectedProduct, redeemed: true, code };

    // Deduct points and update in GameContext
    setPoints(points - selectedProduct.cost);
    setBenefits((prevBenefits) => {
      const exists = prevBenefits.find((b) => b.id === selectedProduct.id);
      if (exists) {
        return prevBenefits.map((b) =>
          b.id === selectedProduct.id ? updatedProduct : b
        );
      }
      return [...prevBenefits, updatedProduct];
    });

    // Update local store products so we disable the "Buy" button
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
    );

    // Show success modal with the code
    setRedeemedProduct(updatedProduct);
    setShowRedeemModal(true);

    // Close confirmation modal
    setShowConfirmationModal(false);
    setSelectedProduct(null);
  };

  // If user cancels purchase in the modal
  const handleCancelBuy = () => {
    setShowConfirmationModal(false);
    setSelectedProduct(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <main className="store-container">
      <header className="store-header">
        <div className="header-top">
          <Link href="/" className="back-to-dashboard">
            ← Dashboard
          </Link>
          <div className="points-display">{points} pts</div>
        </div>
        <h1>Points Store</h1>
        <p>Redeem your points for tasty office treats!</p>
      </header>

      <section className="products-grid">
        {displayedProducts.map((product) => (
          <div key={product.id} className="product-tile">
            <img
              src={product.image}
              alt={product.title}
              className="product-image"
            />
            <div className="product-title" title={product.title}>
              {product.title}
            </div>
            <div className="product-cost">{product.cost} pts</div>
            <button
              className="product-buy-button"
              onClick={() => handleBuyClick(product)}
              disabled={product.redeemed}
            >
              {product.redeemed ? "Redeemed" : "Buy"}
            </button>
          </div>
        ))}
      </section>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {message && <div className="store-message">{message}</div>}

      {/* Confirmation Modal */}
      {showConfirmationModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Purchase</h3>
            <p>
              Buy <strong>{selectedProduct.title}</strong> for{" "}
              <strong>{selectedProduct.cost} pts</strong>?
            </p>
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={handleConfirmBuy}>
                Yes
              </button>
              <button className="modal-cancel" onClick={handleCancelBuy}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal: show code right away */}
      {showRedeemModal && redeemedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Successfully redeemed {redeemedProduct.title}!</h3>
            <p>Your unique code:</p>
            <div className="code-area">{redeemedProduct.code}</div>
            <button
              className="modal-close-button"
              onClick={() => setShowRedeemModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
