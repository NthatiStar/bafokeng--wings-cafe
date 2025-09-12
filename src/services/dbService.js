// src/services/dbService.js
const API_BASE = 'http://localhost:3001/api';

export const dbService = {
  // Products
  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to localStorage if server is unavailable
      try {
        const localData = localStorage.getItem('wingsCafeProducts');
        return localData ? JSON.parse(localData) : [];
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
        return [];
      }
    }
  },

  createProduct: async (product) => {
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to create product');
      const newProduct = await response.json();
      
      // Update localStorage as backup
      try {
        const localProducts = JSON.parse(localStorage.getItem('wingsCafeProducts') || '[]');
        localProducts.push(newProduct);
        localStorage.setItem('wingsCafeProducts', JSON.stringify(localProducts));
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, product) => {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to update product');
      const updatedProduct = await response.json();
      
      // Update localStorage as backup
      try {
        const localProducts = JSON.parse(localStorage.getItem('wingsCafeProducts') || '[]');
        const index = localProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          localProducts[index] = updatedProduct;
          localStorage.setItem('wingsCafeProducts', JSON.stringify(localProducts));
        }
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      
      // Update localStorage as backup
      try {
        const localProducts = JSON.parse(localStorage.getItem('wingsCafeProducts') || '[]');
        const filteredProducts = localProducts.filter(p => p.id !== id);
        localStorage.setItem('wingsCafeProducts', JSON.stringify(filteredProducts));
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Customers
  getCustomers: async () => {
    try {
      const response = await fetch(`${API_BASE}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching customers:', error);
      try {
        const localData = localStorage.getItem('wingsCafeCustomers');
        return localData ? JSON.parse(localData) : [];
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
        return [];
      }
    }
  },

  createCustomer: async (customer) => {
    try {
      const response = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (!response.ok) throw new Error('Failed to create customer');
      const newCustomer = await response.json();
      
      try {
        const localCustomers = JSON.parse(localStorage.getItem('wingsCafeCustomers') || '[]');
        localCustomers.push(newCustomer);
        localStorage.setItem('wingsCafeCustomers', JSON.stringify(localCustomers));
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
      
      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const response = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (!response.ok) throw new Error('Failed to update customer');
      const updatedCustomer = await response.json();
      
      try {
        const localCustomers = JSON.parse(localStorage.getItem('wingsCafeCustomers') || '[]');
        const index = localCustomers.findIndex(c => c.id === id);
        if (index !== -1) {
          localCustomers[index] = updatedCustomer;
          localStorage.setItem('wingsCafeCustomers', JSON.stringify(localCustomers));
        }
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
      
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete customer');
      
      try {
        const localCustomers = JSON.parse(localStorage.getItem('wingsCafeCustomers') || '[]');
        const filteredCustomers = localCustomers.filter(c => c.id !== id);
        localStorage.setItem('wingsCafeCustomers', JSON.stringify(filteredCustomers));
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Transactions
  getTransactions: async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      try {
        const localData = localStorage.getItem('wingsCafeTransactions');
        return localData ? JSON.parse(localData) : [];
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
        return [];
      }
    }
  },

  createTransaction: async (transaction) => {
    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      const newTransaction = await response.json();
      
      try {
        const localTransactions = JSON.parse(localStorage.getItem('wingsCafeTransactions') || '[]');
        localTransactions.push(newTransaction);
        localStorage.setItem('wingsCafeTransactions', JSON.stringify(localTransactions));
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
}; 


