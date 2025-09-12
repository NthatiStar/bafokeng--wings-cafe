import React from 'react';
import { calculateTotalInventoryValue } from '../utils/dataHelpers';

const Dashboard = ({ products, setActiveModule }) => {
  const totalProducts = products.length;
  const totalValue = calculateTotalInventoryValue(products);
  const lowStockCount = products.filter(p => p.quantity <= p.minStockLevel).length;

  const modules = [
    { id: 'inventory', name: 'Inventory Management', description: 'Add, edit, and manage product inventory', icon: '📋' },
    { id: 'sales', name: 'Sales Module', description: 'Process sales and transactions', icon: '🛒' },
    { id: 'customers', name: 'Customer Management', description: 'Manage customer information', icon: '👤' },
    { id: 'reporting', name: 'Reporting & Analytics', description: 'Generate reports and insights', icon: '📈' }
  ];

  const dashboardStyles = {
    dashboard: {
      padding: '2rem',
      backgroundColor: '#f7fafc',
      minHeight: '100vh',
    },
    dashboardTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1.5rem',
    },
    dashboardCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    card: {
      padding: '1.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'transform 0.2s ease',
    },
    cardInfo: {
      backgroundColor: '#e2e8f0',
    },
    cardSuccess: {
      backgroundColor: '#c6f6d5',
    },
    cardWarning: {
      backgroundColor: '#feebc8',
    },
    cardHover: {
      transform: 'translateY(-4px)',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
      color: '#2d3748',
    },
    cardValue: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    modulesTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      margin: '2rem 0 1rem 0',
    },
    modulesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    moduleCard: {
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
    moduleCardHover: {
      backgroundColor: '#edf2f7',
      transform: 'translateY(-4px)',
    },
    moduleIcon: {
      fontSize: '2rem',
      marginBottom: '1rem',
      color: '#3182ce',
    },
    moduleTitle: {
      fontSize: '1.125rem',
      fontWeight: 500,
      color: '#2d3748',
      marginBottom: '0.5rem',
    },
    moduleDescription: {
      fontSize: '0.875rem',
      color: '#718096',
    }
  };

  return (
    <div style={dashboardStyles.dashboard}>
      <h2 style={dashboardStyles.dashboardTitle}>Dashboard Overview</h2>
      
      <div style={dashboardStyles.dashboardCards}>
        <div
          style={{ ...dashboardStyles.card, ...dashboardStyles.cardInfo }}
          onMouseEnter={(e) => e.currentTarget.style.transform = dashboardStyles.cardHover.transform}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <h3 style={dashboardStyles.cardTitle}>Total Products</h3>
          <p style={dashboardStyles.cardValue}>{totalProducts}</p>
        </div>
        <div
          style={{ ...dashboardStyles.card, ...dashboardStyles.cardSuccess }}
          onMouseEnter={(e) => e.currentTarget.style.transform = dashboardStyles.cardHover.transform}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <h3 style={dashboardStyles.cardTitle}>Inventory Value</h3>
          <p style={dashboardStyles.cardValue}>R{totalValue.toFixed(2)}</p>
        </div>
        <div
          style={{ ...dashboardStyles.card, ...dashboardStyles.cardWarning }}
          onMouseEnter={(e) => e.currentTarget.style.transform = dashboardStyles.cardHover.transform}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <h3 style={dashboardStyles.cardTitle}>Low Stock Items</h3>
          <p style={dashboardStyles.cardValue}>{lowStockCount}</p>
        </div>
      </div>

      <h3 style={dashboardStyles.modulesTitle}>System Modules</h3>
      <div style={dashboardStyles.modulesGrid}>
        {modules.map(module => (
          <div
            key={module.id}
            style={dashboardStyles.moduleCard}
            onClick={() => setActiveModule(module.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = dashboardStyles.moduleCardHover.backgroundColor;
              e.currentTarget.style.transform = dashboardStyles.moduleCardHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = dashboardStyles.moduleCard.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={dashboardStyles.moduleIcon}>{module.icon}</span>
            <h3 style={dashboardStyles.moduleTitle}>{module.name}</h3>
            <p style={dashboardStyles.moduleDescription}>{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;