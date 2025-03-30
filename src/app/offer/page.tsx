"use client";

import { useState, useEffect } from "react";
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

export default function Store() {
  const { points, setPoints, benefits, setBenefits } = useGame();
  const [products, setProducts] = useState<Benefit[]>([]);
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

  // Fetch products from TheMealDB API on mount
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
      .then((res) => res.json())
      .then((data) => {
        if (data.meals) {
          const fetchedProducts: Benefit[] = data.meals.map((meal: any) => ({
            id: parseInt(meal.idMeal),
            title: meal.strMeal,
            // Generate a random cost between 100 and 300 pts
            cost: Math.floor(Math.random() * 200) + 100,
            redeemed: false,
            image: meal.strMealThumb,
          }));
          setProducts(fetchedProducts);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

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
