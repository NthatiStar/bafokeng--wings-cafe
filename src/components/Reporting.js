import React, { useState, useEffect } from 'react';
import {
  generateSalesReport,
  generateInventoryReport,
  generateCustomerReport,
  generateStockMovementReport,
  getDailySalesData,
  getTopSellingProducts
} from '../utils/dataHelpers';
import { dbService } from '../services/dbService';

const Reporting = () => {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Currency configuration
  const currencySymbol = 'R';

  // Load all data needed for reporting
  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [productsData, transactionsData, customersData] = await Promise.all([
        dbService.getProducts(),
        dbService.getTransactions(),
        dbService.getCustomers()
      ]);
      
      setProducts(productsData);
      setTransactions(transactionsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate reports
  const salesReport = generateSalesReport(transactions, dateRange.start, dateRange.end);
  const inventoryReport = generateInventoryReport(products);
  const customerReport = generateCustomerReport(customers);
  const stockMovementReport = generateStockMovementReport(transactions, products, 30);
  const dailySalesData = getDailySalesData(transactions, 7);
  const topSellingProducts = getTopSellingProducts(transactions, products, 10);

  const exportReport = () => {
    let content = '';
    
    switch (activeReport) {
      case 'sales':
        content = `Sales Report (${dateRange.start} to ${dateRange.end})
Total Sales: ${currencySymbol}${salesReport.totalSales.toFixed(2)}
Total Transactions: ${salesReport.totalTransactions}
Total Items Sold: ${salesReport.totalItemsSold}
Average Transaction: ${currencySymbol}${salesReport.averageTransaction.toFixed(2)}`;
        break;
      
      case 'inventory':
        content = `Inventory Report
Total Products: ${inventoryReport.totalProducts}
Total Inventory Value: ${currencySymbol}${inventoryReport.totalValue.toFixed(2)}
Low Stock Items: ${inventoryReport.lowStockCount}
Out of Stock Items: ${inventoryReport.outOfStockCount}`;
        break;
      
      case 'customers':
        content = `Customer Report
Total Customers: ${customerReport.totalCustomers}
Total Revenue: ${currencySymbol}${customerReport.totalRevenue.toFixed(2)}
Average Spend: ${currencySymbol}${customerReport.averageSpend.toFixed(2)}
New Customers: ${customerReport.loyaltyStats.new}
Regular: ${customerReport.loyaltyStats.regular}
Silver: ${customerReport.loyaltyStats.silver}
Gold: ${customerReport.loyaltyStats.gold}`;
        break;
    }

    if (exportFormat === 'pdf') {
      alert('PDF export functionality would be implemented here with a proper PDF library');
      console.log('PDF Content:', content);
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeReport}_report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const reportingStyles = {
    reportingModule: {
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
    reportTabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    tabButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: 500,
      color: '#e2e8f0',
      backgroundColor: '#4a5568',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    tabButtonActive: {
      backgroundColor: '#3182ce',
      color: '#ffffff',
      fontWeight: 600,
    },
    tabButtonHover: {
      backgroundColor: '#2d3748',
      transform: 'translateY(-2px)',
    },
    dateFilter: {
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    dateFilterTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1rem',
    },
    dateInputs: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    dateInput: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    dateInputFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    dateSeparator: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    exportControls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      backgroundColor: '#fff',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    selectFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    exportButton: {
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
    },
    exportButtonHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    reportContent: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
    },
    reportHeader: {
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    reportTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '0.5rem',
    },
    reportSubtitle: {
      fontSize: '1rem',
      color: '#718096',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    metricCard: {
      padding: '1.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'transform 0.2s ease',
    },
    metricCardPrimary: {
      backgroundColor: '#c6f6d5',
    },
    metricCardWarning: {
      backgroundColor: '#feebc8',
    },
    metricCardDanger: {
      backgroundColor: '#fed7d7',
    },
    metricCardHover: {
      transform: 'translateY(-4px)',
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
      display: 'block',
    },
    metricLabel: {
      fontSize: '1rem',
      color: '#4a5568',
      display: 'block',
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
    },
    chartContainer: {
      padding: '1rem',
    },
    chartTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1rem',
    },
    barChart: {
      display: 'flex',
      gap: '0.5rem',
      height: '200px',
      alignItems: 'flex-end',
    },
    barItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    },
    bar: {
      backgroundColor: '#3182ce',
      width: '100%',
      borderRadius: '0.25rem 0.25rem 0 0',
      position: 'relative',
      transition: 'background-color 0.2s ease',
    },
    barValue: {
      position: 'absolute',
      top: '-1.5rem',
      fontSize: '0.875rem',
      color: '#2d3748',
    },
    barLabel: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
    productRanking: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    rankingItem: {
      display: 'grid',
      gridTemplateColumns: '50px 1fr 100px 100px',
      gap: '0.5rem',
      padding: '0.75rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
    },
    rank: {
      fontWeight: 600,
      color: '#2d3748',
    },
    productName: {
      fontSize: '1rem',
      color: '#2d3748',
    },
    productSales: {
      fontSize: '1rem',
      color: '#2d3748',
      textAlign: 'right',
    },
    productQuantity: {
      fontSize: '1rem',
      color: '#4a5568',
      textAlign: 'right',
    },
    inventoryDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
    inventorySection: {
      padding: '1rem',
    },
    itemList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    inventoryItem: {
      display: 'grid',
      gridTemplateColumns: '1fr 150px 100px',
      gap: '0.5rem',
      padding: '0.75rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
    },
    inventoryItemOutOfStock: {
      backgroundColor: '#fed7d7',
    },
    itemName: {
      fontSize: '1rem',
      color: '#2d3748',
    },
    itemStock: {
      fontSize: '1rem',
      color: '#4a5568',
      textAlign: 'center',
    },
    itemValue: {
      fontSize: '1rem',
      color: '#2d3748',
      textAlign: 'right',
    },
    noItems: {
      fontSize: '1rem',
      color: '#718096',
      textAlign: 'center',
      padding: '1rem',
    },
    loyaltyChart: {
      display: 'flex',
      height: '50px',
      borderRadius: '0.375rem',
      overflow: 'hidden',
      marginTop: '1rem',
    },
    loyaltySegment: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      color: '#ffffff',
    },
    loyaltySegmentGold: {
      backgroundColor: '#d69e2e',
    },
    loyaltySegmentSilver: {
      backgroundColor: '#a0aec0',
    },
    loyaltySegmentRegular: {
      backgroundColor: '#4a5568',
    },
    loyaltySegmentNew: {
      backgroundColor: '#3182ce',
    },
    customerRanking: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    customerItem: {
      display: 'grid',
      gridTemplateColumns: '50px 1fr 100px 100px',
      gap: '0.5rem',
      padding: '0.75rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
    },
    customerRank: {
      fontWeight: 600,
      color: '#2d3748',
    },
    customerName: {
      fontSize: '1rem',
      color: '#2d3748',
    },
    customerRevenue: {
      fontSize: '1rem',
      color: '#2d3748',
      textAlign: 'right',
    },
    customerVisits: {
      fontSize: '1rem',
      color: '#4a5568',
      textAlign: 'right',
    },
    movementTable: {
      overflowX: 'auto',
    },
    table: {
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
    positive: {
      color: '#2f855a',
    },
    negative: {
      color: '#c53030',
    },
    status: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
    },
    statusGood: {
      backgroundColor: '#c6f6d5',
      color: '#2f855a',
    },
    statusWarning: {
      backgroundColor: '#feebc8',
      color: '#c05621',
    },
  };

  if (loading) {
    return (
      <div style={reportingStyles.reportingModule}>
        <div style={reportingStyles.loadingContainer}>
          <div style={reportingStyles.loadingWrapper}>
            <div style={reportingStyles.loadingSpinner} />
            <span style={reportingStyles.loadingText}>Loading report data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={reportingStyles.reportingModule}>
      <div style={reportingStyles.mainContent}>
        <h2 style={reportingStyles.title}>Reporting & Analytics</h2>

        {/* Report Selection */}
        <div style={reportingStyles.reportTabs}>
          {[
            { id: 'sales', label: 'Sales Report', icon: '📈' },
            { id: 'inventory', label: 'Inventory Report', icon: '📋' },
            { id: 'customers', label: 'Customer Report', icon: '👤' },
            { id: 'movement', label: 'Stock Movement', icon: '🔄' }
          ].map(report => (
            <button
              key={report.id}
              style={{
                ...reportingStyles.tabButton,
                ...(activeReport === report.id ? reportingStyles.tabButtonActive : {}),
              }}
              onClick={() => setActiveReport(report.id)}
              onMouseEnter={(e) => {
                if (activeReport !== report.id) {
                  e.currentTarget.style.backgroundColor = reportingStyles.tabButtonHover.backgroundColor;
                  e.currentTarget.style.transform = reportingStyles.tabButtonHover.transform;
                }
              }}
              onMouseLeave={(e) => {
                if (activeReport !== report.id) {
                  e.currentTarget.style.backgroundColor = reportingStyles.tabButton.backgroundColor;
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <span>{report.icon}</span>
              <span>{report.label}</span>
            </button>
          ))}
        </div>

        {/* Date Range Filter */}
        {activeReport === 'sales' && (
          <div style={reportingStyles.dateFilter}>
            <h4 style={reportingStyles.dateFilterTitle}>Date Range</h4>
            <div style={reportingStyles.dateInputs}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={reportingStyles.dateInput}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = reportingStyles.dateInputFocus.borderColor;
                  e.currentTarget.style.boxShadow = reportingStyles.dateInputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = reportingStyles.dateInput.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <span style={reportingStyles.dateSeparator}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={reportingStyles.dateInput}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = reportingStyles.dateInputFocus.borderColor;
                  e.currentTarget.style.boxShadow = reportingStyles.dateInputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = reportingStyles.dateInput.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Export Controls */}
        <div style={reportingStyles.exportControls}>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={reportingStyles.select}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = reportingStyles.selectFocus.borderColor;
              e.currentTarget.style.boxShadow = reportingStyles.selectFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = reportingStyles.select.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="pdf">PDF</option>
            <option value="text">Text File</option>
          </select>
          <button
            onClick={exportReport}
            style={reportingStyles.exportButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = reportingStyles.exportButtonHover.backgroundColor;
              e.currentTarget.style.transform = reportingStyles.exportButtonHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = reportingStyles.exportButton.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span>📥</span>
            <span>Export Report</span>
          </button>
        </div>

        {/* Sales Report */}
        {activeReport === 'sales' && (
          <div style={reportingStyles.reportContent}>
            <div style={reportingStyles.reportHeader}>
              <h3 style={reportingStyles.reportTitle}>Sales Report</h3>
              <p style={reportingStyles.reportSubtitle}>{dateRange.start} to {dateRange.end}</p>
            </div>

            <div style={reportingStyles.metricsGrid}>
              <div
                style={{ ...reportingStyles.metricCard, ...reportingStyles.metricCardPrimary }}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{currencySymbol}{salesReport.totalSales.toFixed(2)}</span>
                <span style={reportingStyles.metricLabel}>Total Sales</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{salesReport.totalTransactions}</span>
                <span style={reportingStyles.metricLabel}>Transactions</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{salesReport.totalItemsSold}</span>
                <span style={reportingStyles.metricLabel}>Items Sold</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{currencySymbol}{salesReport.averageTransaction.toFixed(2)}</span>
                <span style={reportingStyles.metricLabel}>Avg. Transaction</span>
              </div>
            </div>

            <div style={reportingStyles.chartsGrid}>
              <div style={reportingStyles.chartContainer}>
                <h4 style={reportingStyles.chartTitle}>Daily Sales (Last 7 Days)</h4>
                <div style={reportingStyles.barChart}>
                  {dailySalesData.map(day => (
                    <div key={day.date} style={reportingStyles.barItem}>
                      <div
                        style={{
                          ...reportingStyles.bar,
                          height: `${(day.sales / Math.max(...dailySalesData.map(d => d.sales)) || 1) * 150}px`
                        }}
                      >
                        <span style={reportingStyles.barValue}>{currencySymbol}{day.sales.toFixed(0)}</span>
                      </div>
                      <span style={reportingStyles.barLabel}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={reportingStyles.chartContainer}>
                <h4 style={reportingStyles.chartTitle}>Top Selling Products</h4>
                <div style={reportingStyles.productRanking}>
                  {topSellingProducts.map((product, index) => (
                    <div key={product.id} style={reportingStyles.rankingItem}>
                      <span style={reportingStyles.rank}>#{index + 1}</span>
                      <span style={reportingStyles.productName}>{product.name}</span>
                      <span style={reportingStyles.productSales}>{currencySymbol}{product.revenue.toFixed(2)}</span>
                      <span style={reportingStyles.productQuantity}>{product.quantity} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Report */}
        {activeReport === 'inventory' && (
          <div style={reportingStyles.reportContent}>
            <div style={reportingStyles.reportHeader}>
              <h3 style={reportingStyles.reportTitle}>Inventory Report</h3>
              <p style={reportingStyles.reportSubtitle}>Current Stock Status</p>
            </div>

            <div style={reportingStyles.metricsGrid}>
              <div
                style={{ ...reportingStyles.metricCard, ...reportingStyles.metricCardPrimary }}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{currencySymbol}{inventoryReport.totalValue.toFixed(2)}</span>
                <span style={reportingStyles.metricLabel}>Total Value</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{inventoryReport.totalProducts}</span>
                <span style={reportingStyles.metricLabel}>Products</span>
              </div>
              <div
                style={{ ...reportingStyles.metricCard, ...reportingStyles.metricCardWarning }}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{inventoryReport.lowStockCount}</span>
                <span style={reportingStyles.metricLabel}>Low Stock</span>
              </div>
              <div
                style={{ ...reportingStyles.metricCard, ...reportingStyles.metricCardDanger }}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{inventoryReport.outOfStockCount}</span>
                <span style={reportingStyles.metricLabel}>Out of Stock</span>
              </div>
            </div>

            <div style={reportingStyles.inventoryDetails}>
              <div style={reportingStyles.inventorySection}>
                <h4 style={reportingStyles.chartTitle}>Low Stock Items ({inventoryReport.lowStockCount})</h4>
                {inventoryReport.lowStockItems.length > 0 ? (
                  <div style={reportingStyles.itemList}>
                    {inventoryReport.lowStockItems.map(product => (
                      <div key={product.id} style={reportingStyles.inventoryItem}>
                        <span style={reportingStyles.itemName}>{product.name}</span>
                        <span style={reportingStyles.itemStock}>{product.quantity} left (min: {product.minStockLevel})</span>
                        <span style={reportingStyles.itemValue}>{currencySymbol}{(product.price * product.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={reportingStyles.noItems}>No low stock items</p>
                )}
              </div>

              <div style={reportingStyles.inventorySection}>
                <h4 style={reportingStyles.chartTitle}>Out of Stock Items ({inventoryReport.outOfStockCount})</h4>
                {inventoryReport.outOfStockItems.length > 0 ? (
                  <div style={reportingStyles.itemList}>
                    {inventoryReport.outOfStockItems.map(product => (
                      <div key={product.id} style={{ ...reportingStyles.inventoryItem, ...reportingStyles.inventoryItemOutOfStock }}>
                        <span style={reportingStyles.itemName}>{product.name}</span>
                        <span style={reportingStyles.itemStock}>0 in stock</span>
                        <span style={reportingStyles.itemValue}>{currencySymbol}{product.price.toFixed(2)} each</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={reportingStyles.noItems}>No out of stock items</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Report */}
        {activeReport === 'customers' && (
          <div style={reportingStyles.reportContent}>
            <div style={reportingStyles.reportHeader}>
              <h3 style={reportingStyles.reportTitle}>Customer Analytics</h3>
              <p style={reportingStyles.reportSubtitle}>Customer Performance Metrics</p>
            </div>

            <div style={reportingStyles.metricsGrid}>
              <div
                style={{ ...reportingStyles.metricCard, ...reportingStyles.metricCardPrimary }}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{customerReport.totalCustomers}</span>
                <span style={reportingStyles.metricLabel}>Total Customers</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{currencySymbol}{customerReport.totalRevenue.toFixed(2)}</span>
                <span style={reportingStyles.metricLabel}>Total Revenue</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{currencySymbol}{customerReport.averageSpend.toFixed(2)}</span>
                <span style={reportingStyles.metricLabel}>Avg. Spend</span>
              </div>
              <div
                style={reportingStyles.metricCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = reportingStyles.metricCardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <span style={reportingStyles.metricValue}>{customerReport.loyaltyStats.gold}</span>
                <span style={reportingStyles.metricLabel}>Gold Members</span>
              </div>
            </div>

            <div style={reportingStyles.chartsGrid}>
              <div style={reportingStyles.chartContainer}>
                <h4 style={reportingStyles.chartTitle}>Customer Loyalty Distribution</h4>
                <div style={reportingStyles.loyaltyChart}>
                  <div style={{ ...reportingStyles.loyaltySegment, ...reportingStyles.loyaltySegmentGold, flex: customerReport.loyaltyStats.gold }}>
                    <span>Gold: {customerReport.loyaltyStats.gold}</span>
                  </div>
                  <div style={{ ...reportingStyles.loyaltySegment, ...reportingStyles.loyaltySegmentSilver, flex: customerReport.loyaltyStats.silver }}>
                    <span>Silver: {customerReport.loyaltyStats.silver}</span>
                  </div>
                  <div style={{ ...reportingStyles.loyaltySegment, ...reportingStyles.loyaltySegmentRegular, flex: customerReport.loyaltyStats.regular }}>
                    <span>Regular: {customerReport.loyaltyStats.regular}</span>
                  </div>
                  <div style={{ ...reportingStyles.loyaltySegment, ...reportingStyles.loyaltySegmentNew, flex: customerReport.loyaltyStats.new }}>
                    <span>New: {customerReport.loyaltyStats.new}</span>
                  </div>
                </div>
              </div>

              <div style={reportingStyles.chartContainer}>
                <h4 style={reportingStyles.chartTitle}>Top Customers by Revenue</h4>
                <div style={reportingStyles.customerRanking}>
                  {customerReport.topCustomers.map((customer, index) => (
                    <div key={customer.id} style={reportingStyles.customerItem}>
                      <span style={reportingStyles.customerRank}>#{index + 1}</span>
                      <span style={reportingStyles.customerName}>{customer.name}</span>
                      <span style={reportingStyles.customerRevenue}>{currencySymbol}{customer.totalSpent.toFixed(2)}</span>
                      <span style={reportingStyles.customerVisits}>{customer.visitCount} visits</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Movement Report */}
        {activeReport === 'movement' && (
          <div style={reportingStyles.reportContent}>
            <div style={reportingStyles.reportHeader}>
              <h3 style={reportingStyles.reportTitle}>Stock Movement Analysis</h3>
              <p style={reportingStyles.reportSubtitle}>Last 30 Days</p>
            </div>

            <div style={reportingStyles.movementTable}>
              <table style={reportingStyles.table}>
                <thead>
                  <tr>
                    <th style={reportingStyles.th}>Product</th>
                    <th style={reportingStyles.th}>Current Stock</th>
                    <th style={reportingStyles.th}>Stock In</th>
                    <th style={reportingStyles.th}>Stock Out</th>
                    <th style={reportingStyles.th}>Net Movement</th>
                    <th style={reportingStyles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovementReport.map(product => (
                    <tr key={product.id}>
                      <td style={reportingStyles.td}>{product.name}</td>
                      <td style={reportingStyles.td}>{product.quantity}</td>
                      <td style={{ ...reportingStyles.td, ...reportingStyles.positive }}>+{product.totalIn}</td>
                      <td style={{ ...reportingStyles.td, ...reportingStyles.negative }}>-{product.totalOut}</td>
                      <td style={{ ...reportingStyles.td, ...(product.netMovement >= 0 ? reportingStyles.positive : reportingStyles.negative) }}>
                        {product.netMovement >= 0 ? '+' : ''}{product.netMovement}
                      </td>
                      <td style={reportingStyles.td}>
                        <span
                          style={{
                            ...reportingStyles.status,
                            ...(product.quantity <= product.minStockLevel ? reportingStyles.statusWarning : reportingStyles.statusGood)
                          }}
                        >
                          {product.quantity <= product.minStockLevel ? 'Low Stock' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

export default Reporting;