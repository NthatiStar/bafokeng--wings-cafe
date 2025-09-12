import React from 'react';


const ProductList = ({ products, onEditProduct, onDeleteProduct }) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Products Found</h3>
        <p>Add your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <h3>Product Inventory ({products.length} items)</h3>
      
      <table className="products-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Stock Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => {
            const isLowStock = product.quantity <= product.minStockLevel;
            const isOutOfStock = product.quantity === 0;

            return (
              <tr key={product.id} className={isLowStock ? 'low-stock' : ''}>
                <td>
                  <strong>{product.name}</strong>
                  {product.description && (
                    <div className="product-description">
                      {product.description}
                    </div>
                  )}
                </td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <strong>{product.quantity}</strong>
                  <div className="min-stock-info">
                    Min: {product.minStockLevel}
                  </div>
                </td>
                <td>
                  {isOutOfStock ? (
                    <span className="stock-warning">⚠️ Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="stock-warning">⚠️ Low Stock</span>
                  ) : (
                    <span className="stock-ok">✓ In Stock</span>
                  )}
                </td>
                <td>
                  {product.lastUpdated || 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => onEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;