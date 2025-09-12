import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import LowStockAlert from './LowStockAlert';
import { dbService } from '../services/dbService';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Currency configuration
  const currencySymbol = 'R';

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await dbService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      const newProduct = await dbService.createProduct(productData);
      setProducts([...products, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const result = await dbService.updateProduct(editingProduct.id, updatedProduct);
      setProducts(products.map(p => p.id === editingProduct.id ? result : p));
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dbService.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const inventoryStyles = {
    inventoryManager: {
      padding: '2rem',
      backgroundColor: '#f7fafc',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
    },
    mainContent: {
      maxWidth: '1200px',
      width: '100%',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '2rem',
      textAlign: 'center',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50vh',
    },
    loadingWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e2e8f0',
      borderTop: '4px solid #3182ce',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '1.25rem',
      color: '#4a5568',
    },
    responsiveContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
    },
    responsiveContainerDesktop: {
      gridTemplateColumns: '1fr 2fr',
    },
    formSection: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '2rem',
      transition: 'transform 0.2s ease',
    },
    formSectionHover: {
      transform: 'translateY(-4px)',
    },
    alertsSection: {
      marginBottom: '2rem',
    },
    listSection: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      overflowX: 'auto',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1rem',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '0.5rem',
    },
  };

  // Apply responsive styles conditionally
  const getResponsiveContainerStyles = () => {
    return window.innerWidth >= 768
      ? { ...inventoryStyles.responsiveContainer, ...inventoryStyles.responsiveContainerDesktop }
      : inventoryStyles.responsiveContainer;
  };

  if (loading) {
    return (
      <div style={inventoryStyles.inventoryManager}>
        <div style={inventoryStyles.loadingContainer}>
          <div style={inventoryStyles.loadingWrapper}>
            <div style={inventoryStyles.loadingSpinner} />
            <span style={inventoryStyles.loadingText}>Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={inventoryStyles.inventoryManager}>
      <div style={inventoryStyles.mainContent}>
        <h2 style={inventoryStyles.title}>Inventory Management</h2>
        
        <div style={getResponsiveContainerStyles()}>
          <div
            style={inventoryStyles.formSection}
            onMouseEnter={(e) => e.currentTarget.style.transform = inventoryStyles.formSectionHover.transform}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <h3 style={inventoryStyles.sectionHeader}>Product Form</h3>
            <ProductForm
              product={editingProduct}
              onSubmit={editingProduct ? updateProduct : addProduct}
              onCancel={() => setEditingProduct(null)}
              currencySymbol={currencySymbol}
            />
          </div>
          
          <div>
            <div style={inventoryStyles.alertsSection}>
              <LowStockAlert products={products} />
            </div>
            
            <div style={inventoryStyles.listSection}>
              <h3 style={inventoryStyles.sectionHeader}>Products List</h3>
              <ProductList
                products={products}
                onEditProduct={setEditingProduct}
                onDeleteProduct={deleteProduct}
                currencySymbol={currencySymbol}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InventoryManager;