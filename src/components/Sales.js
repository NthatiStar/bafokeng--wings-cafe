import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

const Sales = ({ products, setProducts, addTransaction }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterProduct, setFilterProduct] = useState('');

  // Currency configuration
  const currencySymbol = 'R';

  // Load sales from database
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const transactions = await dbService.getTransactions();
      const salesData = transactions.filter(t => t.type === 'sale');
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSale = async () => {
    if (!selectedProduct || quantity <= 0) {
      alert('Please select a product and valid quantity');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      alert('Product not found!');
      return;
    }
    if (product.quantity < quantity) {
      alert(`Not enough stock! Only ${product.quantity} available.`);
      return;
    }

    try {
      // Update product quantity
      const updatedProduct = { 
        ...product, 
        quantity: product.quantity - quantity,
        lastSold: new Date().toISOString()
      };
      await dbService.updateProduct(product.id, updatedProduct);
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));

      // Record sale
      const saleRecord = {
        type: 'sale',
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity,
        total: quantity * product.price,
        date: new Date().toISOString(),
        customer: { 
          email: customerEmail, 
          phone: customerPhone,
          name: customerEmail.split('@')[0] // Simple name extraction
        }
      };

      const newSale = await dbService.createTransaction(saleRecord);
      setSales([...sales, newSale]);

      if (addTransaction) {
        addTransaction(saleRecord);
      }

      // Reset form
      setQuantity(1);
      setSelectedProduct('');
      setCustomerEmail('');
      setCustomerPhone('');
      
      // Show success message
      alert(`Sale successful! ${quantity} ${product.name}(s) sold for ${currencySymbol}${(quantity * product.price).toFixed(2)}`);
      
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    }
  };

  // Filter sales based on date and product
  const filteredSales = sales.filter(sale => {
    const matchesDate = filterDate ? sale.date.includes(filterDate) : true;
    const matchesProduct = filterProduct ? 
      sale.productName.toLowerCase().includes(filterProduct.toLowerCase()) : true;
    return matchesDate && matchesProduct;
  });

  // Calculate total sales amount
  const totalSales = filteredSales.reduce((total, sale) => total + (sale.total || 0), 0);

  // Calculate total if it doesn't exist (for existing data)
  const calculateTotal = (sale) => {
    if (sale.total !== undefined) return sale.total;
    if (sale.quantity && sale.productPrice) {
      return sale.quantity * sale.productPrice;
    }
    return 0;
  };

  const salesStyles = {
    salesModule: {
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
    salesHeader: {
      marginBottom: '2rem',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1.5rem',
    },
    salesSummary: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    summaryCard: {
      padding: '1.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      textAlign: 'center',
      transition: 'transform 0.2s ease',
    },
    summaryCardHover: {
      transform: 'translateY(-4px)',
    },
    summaryLabel: {
      fontSize: '1rem',
      color: '#4a5568',
      display: 'block',
    },
    summaryValue: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
      display: 'block',
    },
    salesContent: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
    },
    salesContentDesktop: {
      gridTemplateColumns: '1fr 2fr',
    },
    salesFormSection: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1rem',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    formLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#2d3748',
    },
    formSelect: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      backgroundColor: '#fff',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    formSelectFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    formInput: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    formInputFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    salePreview: {
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
    },
    previewTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2d3748',
      marginBottom: '0.75rem',
    },
    previewDetails: {
      display: 'grid',
      gap: '0.5rem',
      fontSize: '1rem',
      color: '#4a5568',
    },
    previewTotal: {
      fontWeight: 600,
      color: '#1a202c',
    },
    saleButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: 500,
      color: '#ffffff',
      backgroundColor: '#3182ce',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
      justifyContent: 'center',
    },
    saleButtonDisabled: {
      backgroundColor: '#a0aec0',
      cursor: 'not-allowed',
    },
    saleButtonHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    salesHistorySection: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    filterInput: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      minWidth: '150px',
    },
    filterInputFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
    },
    emptyStateText: {
      fontSize: '1rem',
      color: '#718096',
      marginBottom: '0.5rem',
    },
    emptyStateSmall: {
      fontSize: '0.875rem',
      color: '#718096',
    },
    salesTableContainer: {
      overflowX: 'auto',
    },
    salesTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '0.75rem',
      backgroundColor: '#2d3748',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: 600,
      textAlign: 'left',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '1rem',
      color: '#2d3748',
    },
    tdSmall: {
      fontSize: '0.875rem',
      color: '#4a5568',
      display: 'block',
    },
    amountCell: {
      fontWeight: 600,
      color: '#1a202c',
    },
    summaryFooter: {
      fontWeight: 600,
      color: '#2d3748',
    },
    totalAmount: {
      fontWeight: 600,
      color: '#1a202c',
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
  };

  // Apply responsive styles conditionally
  const getContentStyles = () => {
    return window.innerWidth >= 768
      ? { ...salesStyles.salesContent, ...salesStyles.salesContentDesktop }
      : salesStyles.salesContent;
  };

  if (loading) {
    return (
      <div style={salesStyles.salesModule}>
        <div style={salesStyles.mainContent}>
          <div style={salesStyles.loadingContainer}>
            <div style={salesStyles.loadingWrapper}>
              <div style={salesStyles.loadingSpinner} />
              <span style={salesStyles.loadingText}>Loading sales data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={salesStyles.salesModule}>
      <div style={salesStyles.mainContent}>
        <header style={salesStyles.salesHeader}>
          <h2 style={salesStyles.title}>Sales Dashboard</h2>
          <div style={salesStyles.salesSummary}>
            <div
              style={salesStyles.summaryCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = salesStyles.summaryCardHover.transform}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <span style={salesStyles.summaryLabel}>Total Sales</span>
              <span style={salesStyles.summaryValue}>{currencySymbol}{totalSales.toFixed(2)}</span>
            </div>
            <div
              style={salesStyles.summaryCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = salesStyles.summaryCardHover.transform}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <span style={salesStyles.summaryLabel}>Transactions</span>
              <span style={salesStyles.summaryValue}>{filteredSales.length}</span>
            </div>
          </div>
        </header>

        <div style={getContentStyles()}>
          {/* Sales Form Section */}
          <section style={salesStyles.salesFormSection}>
            <h3 style={salesStyles.sectionTitle}>Process New Sale</h3>
            <div style={salesStyles.formGrid}>
              <div style={salesStyles.formGroup}>
                <label style={salesStyles.formLabel} htmlFor="product-select">Select Product</label>
                <select
                  id="product-select"
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  style={salesStyles.formSelect}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formSelectFocus.borderColor;
                    e.currentTarget.style.boxShadow = salesStyles.formSelectFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formSelect.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} - {currencySymbol}{p.price} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={salesStyles.formGroup}>
                <label style={salesStyles.formLabel} htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  min="1"
                  style={salesStyles.formInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = salesStyles.formInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formInput.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={salesStyles.formGroup}>
                <label style={salesStyles.formLabel} htmlFor="customer-email">Customer Email</label>
                <input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="Optional"
                  style={salesStyles.formInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = salesStyles.formInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formInput.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={salesStyles.formGroup}>
                <label style={salesStyles.formLabel} htmlFor="customer-phone">Customer Phone</label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Optional"
                  style={salesStyles.formInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = salesStyles.formInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.formInput.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {selectedProduct && (
              <div style={salesStyles.salePreview}>
                <h4 style={salesStyles.previewTitle}>Sale Preview</h4>
                <div style={salesStyles.previewDetails}>
                  <span>Product: {products.find(p => p.id === selectedProduct)?.name}</span>
                  <span>Quantity: {quantity}</span>
                  <span>Unit Price: {currencySymbol}{products.find(p => p.id === selectedProduct)?.price}</span>
                  <span style={salesStyles.previewTotal}>
                    Total: {currencySymbol}{(quantity * (products.find(p => p.id === selectedProduct)?.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSale}
              disabled={!selectedProduct}
              style={{
                ...salesStyles.saleButton,
                ...(!selectedProduct ? salesStyles.saleButtonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (selectedProduct) {
                  e.currentTarget.style.backgroundColor = salesStyles.saleButtonHover.backgroundColor;
                  e.currentTarget.style.transform = salesStyles.saleButtonHover.transform;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProduct) {
                  e.currentTarget.style.backgroundColor = salesStyles.saleButton.backgroundColor;
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <span>🛒</span>
              Process Sale
            </button>
          </section>

          {/* Sales History Section */}
          <section style={salesStyles.salesHistorySection}>
            <div style={salesStyles.sectionHeader}>
              <h3 style={salesStyles.sectionTitle}>Sales History</h3>
              <div style={salesStyles.filters}>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  placeholder="Filter by date"
                  style={salesStyles.filterInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.filterInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = salesStyles.filterInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.filterInput.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <input
                  type="text"
                  value={filterProduct}
                  onChange={e => setFilterProduct(e.target.value)}
                  placeholder="Filter by product"
                  style={salesStyles.filterInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.filterInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = salesStyles.filterInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = salesStyles.filterInput.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {filteredSales.length === 0 ? (
              <div style={salesStyles.emptyState}>
                <p style={salesStyles.emptyStateText}>No sales records found</p>
                <small style={salesStyles.emptyStateSmall}>
                  {filterDate || filterProduct ? 'Try adjusting your filters' : 'Process your first sale to get started'}
                </small>
              </div>
            ) : (
              <div style={salesStyles.salesTableContainer}>
                <table style={salesStyles.salesTable}>
                  <thead>
                    <tr>
                      <th style={salesStyles.th}>Date & Time</th>
                      <th style={salesStyles.th}>Product</th>
                      <th style={salesStyles.th}>Quantity</th>
                      <th style={salesStyles.th}>Unit Price</th>
                      <th style={salesStyles.th}>Total</th>
                      <th style={salesStyles.th}>Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map(sale => (
                      <tr key={sale.id}>
                        <td style={salesStyles.td}>
                          {new Date(sale.date).toLocaleDateString()}
                          <br />
                          <small style={salesStyles.tdSmall}>{new Date(sale.date).toLocaleTimeString()}</small>
                        </td>
                        <td style={salesStyles.td}>{sale.productName || 'Unknown Product'}</td>
                        <td style={salesStyles.td}>{sale.quantity || 0}</td>
                        <td style={salesStyles.td}>{currencySymbol}{sale.productPrice?.toFixed(2) || '0.00'}</td>
                        <td style={{ ...salesStyles.td, ...salesStyles.amountCell }}>
                          {currencySymbol}{calculateTotal(sale).toFixed(2)}
                        </td>
                        <td style={salesStyles.td}>
                          {sale.customer?.email || sale.customer?.phone || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" style={{ ...salesStyles.td, ...salesStyles.summaryFooter }}>Total</td>
                      <td colSpan="2" style={{ ...salesStyles.td, ...salesStyles.totalAmount }}>
                        {currencySymbol}{totalSales.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
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

export default Sales;