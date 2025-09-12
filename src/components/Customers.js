import React, { useState, useEffect } from 'react';
import { 
  updateCustomerStats, 
  calculateCustomerLoyalty,
  getTopCustomers,
  getRecentCustomers
} from '../utils/dataHelpers';
import { dbService } from '../services/dbService';

const Customers = ({ transactions }) => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Currency configuration
  const currencySymbol = 'R';

  // Load customers from JSON database
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await dbService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync customer data with transactions
  useEffect(() => {
    const syncCustomerData = async () => {
      const salesTransactions = transactions.filter(t => t.type === 'sale' && t.customer);
      
      for (const transaction of salesTransactions) {
        const existingCustomer = customers.find(c => 
          c.phone === transaction.customer.phone || 
          c.email === transaction.customer.email
        );

        if (existingCustomer) {
          try {
            const updatedCustomer = updateCustomerStats(existingCustomer, transaction.total);
            await dbService.updateCustomer(updatedCustomer.id, updatedCustomer);
            setCustomers(prev => prev.map(c => 
              c.id === updatedCustomer.id ? updatedCustomer : c
            ));
          } catch (error) {
            console.error('Error updating customer stats:', error);
          }
        }
      }
    };

    if (customers.length > 0 && transactions.length > 0) {
      syncCustomerData();
    }
  }, [transactions, customers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerForm.name.trim()) {
      alert('Please enter customer name');
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomer = await dbService.updateCustomer(editingCustomer.id, customerForm);
        setCustomers(customers.map(c => 
          c.id === editingCustomer.id ? updatedCustomer : c
        ));
        alert('Customer updated successfully!');
      } else {
        // Create new customer
        const newCustomer = await dbService.createCustomer({
          ...customerForm,
          visitCount: 0,
          totalSpent: 0,
          lastVisit: null
        });
        setCustomers([...customers, newCustomer]);
        alert('Customer added successfully!');
      }

      // Reset form
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
      setEditingCustomer(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please try again.');
    }
  };

  const handleEdit = (customer) => {
    setCustomerForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await dbService.deleteCustomer(customerId);
        setCustomers(customers.filter(c => c.id !== customerId));
        alert('Customer deleted successfully!');
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer. Please try again.');
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (customer.phone && customer.phone.includes(searchTerm));
    
    switch (activeTab) {
      case 'regular':
        return matchesSearch && calculateCustomerLoyalty(customer) === 'Regular';
      case 'silver':
        return matchesSearch && calculateCustomerLoyalty(customer) === 'Silver';
      case 'gold':
        return matchesSearch && calculateCustomerLoyalty(customer) === 'Gold';
      default:
        return matchesSearch;
    }
  });

  const getCustomerTransactions = (customer) => {
    return transactions.filter(t => 
      t.type === 'sale' && 
      t.customer && 
      (t.customer.phone === customer.phone || t.customer.email === customer.email)
    );
  };

  const topCustomers = getTopCustomers(customers, 5);
  const recentCustomers = getRecentCustomers(customers, 5);

  const customersStyles = {
    customersModule: {
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
    customerStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      padding: '1.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      transition: 'transform 0.2s ease',
    },
    statCardHover: {
      transform: 'translateY(-4px)',
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
      display: 'block',
    },
    statLabel: {
      fontSize: '1rem',
      color: '#4a5568',
      display: 'block',
    },
    customersLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
    },
    customersLayoutDesktop: {
      gridTemplateColumns: '3fr 1fr',
    },
    customersMain: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
    },
    customersHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    searchBox: {
      flex: 1,
      maxWidth: '400px',
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    searchInputFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    addCustomerButton: {
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
    addCustomerButtonHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    customersTabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
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
    customersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    customerCard: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
      transition: 'transform 0.2s ease',
    },
    customerCardHover: {
      transform: 'translateY(-4px)',
    },
    customerInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    customerName: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2d3748',
    },
    customerDetails: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      fontSize: '0.875rem',
      color: '#4a5568',
    },
    loyaltyBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    loyaltyBadgeRegular: {
      backgroundColor: '#c6f6d5',
      color: '#2f855a',
    },
    loyaltyBadgeSilver: {
      backgroundColor: '#e2e8f0',
      color: '#4a5568',
    },
    loyaltyBadgeGold: {
      backgroundColor: '#fefcbf',
      color: '#975a16',
    },
    customerStats: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      fontSize: '0.875rem',
      color: '#4a5568',
    },
    customerActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      justifyContent: 'center',
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      border: 'none',
    },
    editButton: {
      backgroundColor: '#3182ce',
      color: '#ffffff',
    },
    editButtonHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    deleteButton: {
      backgroundColor: '#e53e3e',
      color: '#ffffff',
    },
    deleteButtonHover: {
      backgroundColor: '#c53030',
      transform: 'translateY(-2px)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    emptyStateTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2d3748',
      marginBottom: '0.5rem',
    },
    emptyStateText: {
      fontSize: '1rem',
      color: '#718096',
    },
    customersSidebar: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
    },
    sidebarSection: {
      marginBottom: '2rem',
    },
    sidebarTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1rem',
    },
    sidebarItem: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '0.5rem',
      padding: '0.75rem',
      backgroundColor: '#edf2f7',
      borderRadius: '0.375rem',
      marginBottom: '0.5rem',
    },
    sidebarCustomerName: {
      fontSize: '1rem',
      color: '#2d3748',
    },
    sidebarCustomerAmount: {
      fontSize: '1rem',
      color: '#2d3748',
      textAlign: 'right',
    },
    sidebarCustomerDate: {
      fontSize: '1rem',
      color: '#4a5568',
      textAlign: 'right',
    },
    noData: {
      fontSize: '1rem',
      color: '#718096',
      textAlign: 'center',
      padding: '1rem',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      padding: '2rem',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    formLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#2d3748',
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
    formTextarea: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      resize: 'vertical',
      minHeight: '80px',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    formTextareaFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1.5rem',
    },
    formButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      border: 'none',
    },
    submitButton: {
      backgroundColor: '#3182ce',
      color: '#ffffff',
    },
    submitButtonHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    cancelButton: {
      backgroundColor: '#e2e8f0',
      color: '#2d3748',
    },
    cancelButtonHover: {
      backgroundColor: '#cbd5e0',
      transform: 'translateY(-2px)',
    },
  };

  // Apply responsive styles conditionally
  const getLayoutStyles = () => {
    return window.innerWidth >= 768
      ? { ...customersStyles.customersLayout, ...customersStyles.customersLayoutDesktop }
      : customersStyles.customersLayout;
  };

  if (loading) {
    return (
      <div style={customersStyles.customersModule}>
        <div style={customersStyles.mainContent}>
          <h2 style={customersStyles.title}>Customer Management</h2>
          <div style={customersStyles.loadingContainer}>
            <div style={customersStyles.loadingWrapper}>
              <div style={customersStyles.loadingSpinner} />
              <span style={customersStyles.loadingText}>Loading customers...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={customersStyles.customersModule}>
      <div style={customersStyles.mainContent}>
        <h2 style={customersStyles.title}>Customer Management</h2>

        {/* Customer Stats */}
        <div style={customersStyles.customerStats}>
          <div
            style={customersStyles.statCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = customersStyles.statCardHover.transform}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <span style={customersStyles.statNumber}>{customers.length}</span>
            <span style={customersStyles.statLabel}>Total Customers</span>
          </div>
          <div
            style={customersStyles.statCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = customersStyles.statCardHover.transform}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <span style={customersStyles.statNumber}>
              {customers.filter(c => calculateCustomerLoyalty(c) === 'Gold').length}
            </span>
            <span style={customersStyles.statLabel}>Gold Members</span>
          </div>
          <div
            style={customersStyles.statCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = customersStyles.statCardHover.transform}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <span style={customersStyles.statNumber}>
              {currencySymbol}{customers.reduce((total, c) => total + (c.totalSpent || 0), 0).toFixed(2)}
            </span>
            <span style={customersStyles.statLabel}>Total Revenue</span>
          </div>
        </div>

        <div style={getLayoutStyles()}>
          {/* Main Content */}
          <div style={customersStyles.customersMain}>
            <div style={customersStyles.customersHeader}>
              <div style={customersStyles.searchBox}>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={customersStyles.searchInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = customersStyles.searchInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = customersStyles.searchInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = customersStyles.searchInput.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                onClick={() => setShowForm(true)}
                style={customersStyles.addCustomerButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customersStyles.addCustomerButtonHover.backgroundColor;
                  e.currentTarget.style.transform = customersStyles.addCustomerButtonHover.transform;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = customersStyles.addCustomerButton.backgroundColor;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span>👤</span>
                <span>Add New Customer</span>
              </button>
            </div>

            <div style={customersStyles.customersTabs}>
              {[
                { id: 'all', label: 'All Customers' },
                { id: 'regular', label: 'Regular' },
                { id: 'silver', label: 'Silver' },
                { id: 'gold', label: 'Gold' }
              ].map(tab => (
                <button
                  key={tab.id}
                  style={{
                    ...customersStyles.tabButton,
                    ...(activeTab === tab.id ? customersStyles.tabButtonActive : {}),
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = customersStyles.tabButtonHover.backgroundColor;
                      e.currentTarget.style.transform = customersStyles.tabButtonHover.transform;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = customersStyles.tabButton.backgroundColor;
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Customers List */}
            <div style={customersStyles.customersList}>
              {filteredCustomers.length === 0 ? (
                <div style={customersStyles.emptyState}>
                  <h3 style={customersStyles.emptyStateTitle}>No customers found</h3>
                  <p style={customersStyles.emptyStateText}>
                    {searchTerm ? 'Try a different search term' : 'Add your first customer to get started'}
                  </p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    style={customersStyles.customerCard}
                    onMouseEnter={(e) => e.currentTarget.style.transform = customersStyles.customerCardHover.transform}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={customersStyles.customerInfo}>
                      <h4 style={customersStyles.customerName}>{customer.name}</h4>
                      <div style={customersStyles.customerDetails}>
                        {customer.phone && (
                          <span>
                            <span style={{ marginRight: '0.25rem' }}>📱</span>
                            {customer.phone}
                          </span>
                        )}
                        {customer.email && (
                          <span>
                            <span style={{ marginRight: '0.25rem' }}>📧</span>
                            {customer.email}
                          </span>
                        )}
                        <span
                          style={{
                            ...customersStyles.loyaltyBadge,
                            ...(calculateCustomerLoyalty(customer) === 'Regular' ? customersStyles.loyaltyBadgeRegular : {}),
                            ...(calculateCustomerLoyalty(customer) === 'Silver' ? customersStyles.loyaltyBadgeSilver : {}),
                            ...(calculateCustomerLoyalty(customer) === 'Gold' ? customersStyles.loyaltyBadgeGold : {}),
                          }}
                        >
                          {calculateCustomerLoyalty(customer)}
                        </span>
                      </div>
                      <div style={customersStyles.customerStats}>
                        <span>Visits: {customer.visitCount || 0}</span>
                        <span>Spent: {currencySymbol}{(customer.totalSpent || 0).toFixed(2)}</span>
                        {customer.lastVisit && (
                          <span>Last visit: {new Date(customer.lastVisit).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div style={customersStyles.customerActions}>
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{ ...customersStyles.actionButton, ...customersStyles.editButton }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = customersStyles.editButtonHover.backgroundColor;
                          e.currentTarget.style.transform = customersStyles.editButtonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = customersStyles.editButton.backgroundColor;
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        style={{ ...customersStyles.actionButton, ...customersStyles.deleteButton }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = customersStyles.deleteButtonHover.backgroundColor;
                          e.currentTarget.style.transform = customersStyles.deleteButtonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = customersStyles.deleteButton.backgroundColor;
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={customersStyles.customersSidebar}>
            {/* Top Customers */}
            <div style={customersStyles.sidebarSection}>
              <h4 style={customersStyles.sidebarTitle}>Top Customers</h4>
              {topCustomers.length > 0 ? (
                topCustomers.map(customer => (
                  <div key={customer.id} style={customersStyles.sidebarItem}>
                    <span style={customersStyles.sidebarCustomerName}>{customer.name}</span>
                    <span style={customersStyles.sidebarCustomerAmount}>{currencySymbol}{(customer.totalSpent || 0).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p style={customersStyles.noData}>No customer data available</p>
              )}
            </div>

            {/* Recent Customers */}
            <div style={customersStyles.sidebarSection}>
              <h4 style={customersStyles.sidebarTitle}>Recent Activity</h4>
              {recentCustomers.length > 0 ? (
                recentCustomers.map(customer => (
                  <div key={customer.id} style={customersStyles.sidebarItem}>
                    <span style={customersStyles.sidebarCustomerName}>{customer.name}</span>
                    <span style={customersStyles.sidebarCustomerDate}>
                      {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'No visits'}
                    </span>
                  </div>
                ))
              ) : (
                <p style={customersStyles.noData}>No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Form Modal */}
        {showForm && (
          <div style={customersStyles.modalOverlay}>
            <div style={customersStyles.modalContent}>
              <h3 style={customersStyles.modalTitle}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div style={customersStyles.formGroup}>
                  <label style={customersStyles.formLabel}>Name *</label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    required
                    style={customersStyles.formInput}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formInputFocus.borderColor;
                      e.currentTarget.style.boxShadow = customersStyles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formInput.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={customersStyles.formGroup}>
                  <label style={customersStyles.formLabel}>Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    style={customersStyles.formInput}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formInputFocus.borderColor;
                      e.currentTarget.style.boxShadow = customersStyles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formInput.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={customersStyles.formGroup}>
                  <label style={customersStyles.formLabel}>Phone</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    style={customersStyles.formInput}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formInputFocus.borderColor;
                      e.currentTarget.style.boxShadow = customersStyles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formInput.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={customersStyles.formGroup}>
                  <label style={customersStyles.formLabel}>Address</label>
                  <textarea
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    rows="3"
                    style={customersStyles.formTextarea}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formTextareaFocus.borderColor;
                      e.currentTarget.style.boxShadow = customersStyles.formTextareaFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formTextarea.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={customersStyles.formGroup}>
                  <label style={customersStyles.formLabel}>Notes</label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    rows="2"
                    style={customersStyles.formTextarea}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formTextareaFocus.borderColor;
                      e.currentTarget.style.boxShadow = customersStyles.formTextareaFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = customersStyles.formTextarea.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={customersStyles.formActions}>
                  <button
                    type="submit"
                    style={{ ...customersStyles.formButton, ...customersStyles.submitButton }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = customersStyles.submitButtonHover.backgroundColor;
                      e.currentTarget.style.transform = customersStyles.submitButtonHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = customersStyles.submitButton.backgroundColor;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {editingCustomer ? 'Update' : 'Add'} Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCustomer(null);
                      setCustomerForm({
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                        notes: ''
                      });
                    }}
                    style={{ ...customersStyles.formButton, ...customersStyles.cancelButton }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = customersStyles.cancelButtonHover.backgroundColor;
                      e.currentTarget.style.transform = customersStyles.cancelButtonHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = customersStyles.cancelButton.backgroundColor;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
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

export default Customers;