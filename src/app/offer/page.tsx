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

  // Pagination state
  const itemsPerPage = 8;
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

  const handleBuy = (product: Benefit) => {
    if (points < product.cost) {
      setMessage("Not enough points to buy this product!");
      return;
    }
    // Create a redeemed product with a generated code
    const code = generateRandomCode();
    const updatedProduct = { ...product, redeemed: true, code };

    // Deduct points and update redeemed list in GameContext
    setPoints(points - product.cost);
    setBenefits((prevBenefits) => {
      // Update if already exists, or add new if not present
      const exists = prevBenefits.find((b) => b.id === product.id);
      if (exists) {
        return prevBenefits.map((b) =>
          b.id === product.id ? updatedProduct : b
        );
      }
      return [...prevBenefits, updatedProduct];
    });
    setMessage(`You bought "${product.title}" for ${product.cost} pts!`);

    // Update local products state to disable the buy button for this product
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, redeemed: true } : p))
    );
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
        <h1>Office Café Store</h1>
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
              onClick={() => handleBuy(product)}
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
    </main>
  );
}
