"use client";

import React, { useState } from "react";

const ClickerPage: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Clicker App</h1>
      <p>You have clicked the button {count} times.</p>
      <button
        onClick={handleClick}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Click Me!
      </button>
    </div>
  );
};

export default ClickerPage;
