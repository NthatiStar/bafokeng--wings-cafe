const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json'); // Fixed: Changed from 'database.json' to 'db.json'

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database if it doesn't exist
const initializeDatabase = async () => {
  try {
    await fs.access(DB_FILE);
    console.log('Database file exists');
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ products: [], customers: [], transactions: [] }, null, 2));
    console.log('Created new database file');
  }
};
initializeDatabase();

// Helper function to read database
const readDB = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { products: [], customers: [], transactions: [] };
  }
};

// Helper function to write to database
const writeDB = async (data) => {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
  }
};

// Root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is running successfully!',
    endpoints: [
      '/api/products - GET, POST, PUT, DELETE',
      '/api/customers - GET, POST, PUT, DELETE', 
      '/api/transactions - GET, POST'
    ],
    instructions: 'Use Postman or browser to test API endpoints'
  });
});

// Routes for Products
app.get('/api/products', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const db = await readDB();
    const newProduct = {
      id: Date.now().toString(),
      ...req.body,
      lastUpdated: new Date().toLocaleDateString(),
    };
    db.products.push(newProduct);
    await writeDB(db);
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    db.products[index] = { 
      ...db.products[index], 
      ...req.body, 
      lastUpdated: new Date().toLocaleDateString() 
    };
    await writeDB(db);
    res.json(db.products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.products = db.products.filter((p) => p.id !== req.params.id);
    await writeDB(db);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Routes for Customers
app.get('/api/customers', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const db = await readDB();
    const newCustomer = {
      id: Date.now().toString(),
      ...req.body,
      visitCount: req.body.visitCount || 0,
      totalSpent: req.body.totalSpent || 0,
      lastVisit: req.body.lastVisit || null,
    };
    db.customers.push(newCustomer);
    await writeDB(db);
    res.json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.customers.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    db.customers[index] = { ...db.customers[index], ...req.body };
    await writeDB(db);
    res.json(db.customers[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.customers = db.customers.filter((c) => c.id !== req.params.id);
    await writeDB(db);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Routes for Transactions - FIXED to match frontend data structure
app.get('/api/transactions', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const db = await readDB();
    
    const newTransaction = {
      id: Date.now().toString(),
      ...req.body,
      date: new Date().toISOString()
    };
    
    db.transactions.push(newTransaction);
    await writeDB(db);
    res.json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   - GET/POST/PUT/DELETE /api/products`);
  console.log(`   - GET/POST/PUT/DELETE /api/customers`);
  console.log(`   - GET/POST /api/transactions`);
  console.log(`   - GET /api/health (health check)`);
});