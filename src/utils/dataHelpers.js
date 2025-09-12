// Helper functions for data calculations

// Calculate total inventory value
export const calculateTotalInventoryValue = (products) => {
  return products.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);
};

// Generate a unique ID
export const generateId = () => {
  return Date.now().toString();
};

// Customer loyalty calculation
export const calculateCustomerLoyalty = (customer) => {
  if (!customer.totalSpent) return 'New';
  if (customer.totalSpent >= 500) return 'Gold';
  if (customer.totalSpent >= 200) return 'Silver';
  return 'Regular';
};

// Update customer stats
export const updateCustomerStats = (customer, transactionTotal) => {
  return {
    ...customer,
    visitCount: (customer.visitCount || 0) + 1,
    totalSpent: (customer.totalSpent || 0) + transactionTotal,
    lastVisit: new Date().toISOString()
  };
};

// Get top customers
export const getTopCustomers = (customers, limit = 5) => {
  return [...customers]
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    .slice(0, limit);
};

// Get recent customers
export const getRecentCustomers = (customers, limit = 5) => {
  return [...customers]
    .sort((a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0))
    .slice(0, limit);
};

// Report generation functions
export const generateSalesReport = (transactions, startDate, endDate) => {
  const filteredTransactions = transactions.filter(t => 
    t.type === 'sale' && 
    new Date(t.date) >= new Date(startDate) && 
    new Date(t.date) <= new Date(endDate)
  );
  
  const totalSales = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalItemsSold = filteredTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
  
  return {
    totalSales,
    totalTransactions: filteredTransactions.length,
    totalItemsSold,
    averageTransaction: filteredTransactions.length > 0 ? totalSales / filteredTransactions.length : 0
  };
};

export const generateInventoryReport = (products) => {
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel);
  const outOfStockItems = products.filter(p => p.quantity === 0);
  
  return {
    totalProducts: products.length,
    totalValue: calculateTotalInventoryValue(products),
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    lowStockItems,
    outOfStockItems
  };
};

export const generateCustomerReport = (customers) => {
  const loyaltyStats = {
    new: customers.filter(c => calculateCustomerLoyalty(c) === 'New').length,
    regular: customers.filter(c => calculateCustomerLoyalty(c) === 'Regular').length,
    silver: customers.filter(c => calculateCustomerLoyalty(c) === 'Silver').length,
    gold: customers.filter(c => calculateCustomerLoyalty(c) === 'Gold').length
  };
  
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  
  return {
    totalCustomers: customers.length,
    totalRevenue,
    averageSpend: customers.length > 0 ? totalRevenue / customers.length : 0,
    loyaltyStats,
    topCustomers: getTopCustomers(customers, 10)
  };
};

export const generateStockMovementReport = (transactions, products, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return products.map(product => {
    const productTransactions = transactions.filter(t => 
      t.productId === product.id && 
      new Date(t.date) >= cutoffDate
    );
    
    const totalIn = productTransactions
      .filter(t => t.type === 'restock')
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
      
    const totalOut = productTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
    
    return {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      minStockLevel: product.minStockLevel,
      totalIn,
      totalOut,
      netMovement: totalIn - totalOut
    };
  });
};

export const getDailySalesData = (transactions, days = 7) => {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dailySales = transactions
      .filter(t => t.type === 'sale' && t.date.includes(dateString))
      .reduce((sum, t) => sum + (t.total || 0), 0);
    
    result.push({
      date: dateString,
      sales: dailySales
    });
  }
  
  return result;
};

export const getTopSellingProducts = (transactions, products, limit = 10) => {
  const productSales = {};
  
  transactions
    .filter(t => t.type === 'sale')
    .forEach(t => {
      if (!productSales[t.productId]) {
        productSales[t.productId] = {
          quantity: 0,
          revenue: 0
        };
      }
      
      productSales[t.productId].quantity += t.quantity || 0;
      productSales[t.productId].revenue += t.total || 0;
    });
  
  return Object.entries(productSales)
    .map(([productId, sales]) => {
      const product = products.find(p => p.id === productId) || { name: 'Unknown Product' };
      return {
        id: productId,
        name: product.name,
        quantity: sales.quantity,
        revenue: sales.revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};
// Add this function to your existing dataHelpers.js file
export const exportCustomerData = (customers) => {
  const csvContent = [
    ['Name', 'Email', 'Phone', 'Address', 'Total Spent', 'Visit Count', 'Last Visit', 'Loyalty Tier'],
    ...customers.map(customer => [
      customer.name,
      customer.email || '',
      customer.phone || '',
      customer.address || '',
      customer.totalSpent || 0,
      customer.visitCount || 0,
      customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '',
      calculateCustomerLoyalty(customer)
    ])
  ].map(e => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};                                           



