import React from 'react';


const LowStockAlert = ({ products }) => {
  const lowStockProducts = products.filter(p => p.quantity <= p.minStockLevel && p.quantity > 0);
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="low-stock-alert">
      <h3>⚠️ Stock Alerts</h3>
      
      {outOfStockProducts.length > 0 && (
        <div>
          <h4>Out of Stock:</h4>
          {outOfStockProducts.map(product => (
            <div key={product.id} className="alert-item">
              <span>{product.name}</span>
              <span>0 left</span>
            </div>
          ))}
        </div>
      )}
      
      {lowStockProducts.length > 0 && (
        <div>
          <h4>Low Stock:</h4>
          {lowStockProducts.map(product => (
            <div key={product.id} className="alert-item">
              <span>{product.name}</span>
              <span>Only {product.quantity} left (min: {product.minStockLevel})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;