import React from 'react';

export default function CartBar({ totalItems, totalPrice, goToBill }) {
  if (totalItems === 0) return null;

  return (
    <div className="cart-bar" style={{ display: 'flex' }}>
      <div>
        <span>{totalItems}</span> items | ₹<span>{totalPrice}</span>
      </div>
      <button onClick={goToBill}>Submit</button>
    </div>
  );
}