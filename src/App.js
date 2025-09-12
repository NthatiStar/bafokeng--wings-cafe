import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Reporting from './components/Reporting';
import { dbService } from './services/dbService';

function App() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Load all data from JSON database
  useEffect(() => {
    loadAllData();
  }, [dataRefreshTrigger]);

  const loadAllData = async () => {
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
      console.error('Error loading data:', error);
      showNotification('Failed to connect to database. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = useCallback(() => {
    setDataRefreshTrigger(prev => prev + 1);
  }, []);

  // Function to add a new transaction
  const addTransaction = async (transactionData) => {
    try {
      const newTransaction = await dbService.createTransaction(transactionData);
      setTransactions(prev => [...prev, newTransaction]);
      
      if (transactionData.type === 'sale' && transactionData.customer) {
        refreshData();
      }
      
      showNotification('Transaction completed successfully!', 'success');
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      showNotification('Error adding transaction', 'error');
      return null;
    }
  };

  const updateProducts = async (updatedProducts) => {
    try {
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error updating products:', error);
      showNotification('Error updating products', 'error');
    }
  };

  const handleProductUpdate = useCallback((updatedProducts) => {
    setProducts(updatedProducts);
  }, []);

  const handleCustomerUpdate = useCallback((updatedCustomers) => {
    setCustomers(updatedCustomers);
  }, []);

  const renderActiveModule = () => {
    if (loading) {
      return (
        <div style={appStyles.loadingContainer}>
          <div style={appStyles.loadingWrapper}>
            <div style={appStyles.loadingSpinner} />
            <span style={appStyles.loadingText}>Loading application data...</span>
          </div>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return (
          <Dashboard 
            products={products} 
            transactions={transactions}
            customers={customers}
            setActiveModule={setActiveModule} 
            refreshData={refreshData}
          />
        );
      case 'inventory':
        return (
          <InventoryManager 
            products={products} 
            onProductUpdate={handleProductUpdate}
            refreshData={refreshData}
          />
        );
      case 'sales':
        return (
          <Sales
            products={products}
            transactions={transactions}
            customers={customers}
            setProducts={updateProducts}
            addTransaction={addTransaction}
            refreshData={refreshData}
          />
        );
      case 'customers':
        return (
          <Customers 
            transactions={transactions} 
            refreshTrigger={dataRefreshTrigger}
            onCustomerUpdate={handleCustomerUpdate}
          />
        );
      case 'reporting':
        return (
          <Reporting
            products={products}
            transactions={transactions}
            customers={customers}
            refreshData={refreshData}
          />
        );
      default:
        return (
          <Dashboard 
            products={products} 
            transactions={transactions}
            customers={customers}
            setActiveModule={setActiveModule} 
            refreshData={refreshData}
          />
        );
    }
  };

  const appStyles = {
    appContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
    },
    appHeader: {
      backgroundColor: '#ffffff',
      padding: '1.5rem 2rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    refreshButton: {
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
    refreshButtonHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    dataStatus: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
    statusIndicator: {
      marginLeft: '0.5rem',
      fontWeight: 500,
    },
    statusLoading: {
      color: '#e53e3e',
    },
    statusSuccess: {
      color: '#2f855a',
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
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
    notification: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      padding: '1rem 1.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      fontSize: '1rem',
      fontWeight: 500,
    },
    notificationSuccess: {
      backgroundColor: '#c6f6d5',
      color: '#2f855a',
    },
    notificationError: {
      backgroundColor: '#fed7d7',
      color: '#c53030',
    },
  };

  return (
    <div style={appStyles.appContainer}>
      {notification.show && (
        <div
          style={{
            ...appStyles.notification,
            ...(notification.type === 'success' ? appStyles.notificationSuccess : appStyles.notificationError),
          }}
        >
          {notification.message}
        </div>
      )}
      
      <header style={appStyles.appHeader}>
        <div style={appStyles.headerContent}>
          <h1 style={appStyles.title}>Wings Cafe Stock Inventory System</h1>
          <div style={appStyles.headerActions}>
            <button
              onClick={refreshData}
              style={appStyles.refreshButton}
              title="Refresh all data"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = appStyles.refreshButtonHover.backgroundColor;
                e.currentTarget.style.transform = appStyles.refreshButtonHover.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = appStyles.refreshButton.backgroundColor;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>↻</span>
              Refresh Data
            </button>
            <div style={appStyles.dataStatus}>
              <span
                style={{
                  ...appStyles.statusIndicator,
                  ...(loading ? appStyles.statusLoading : appStyles.statusSuccess),
                }}
              >
                {loading ? 'Syncing...' : 'All systems normal'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />

      <main style={appStyles.mainContent}>
        {renderActiveModule()}
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;