
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const { router: authRoutes, verifyToken } = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/budget-buddy';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1); // Exit if can't connect to database
  });

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/transactions', verifyToken, transactionRoutes);
app.use('/api/savings', verifyToken, savingsRoutes);
app.use('/api/assistant', verifyToken, aiAssistantRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Budget Buddy API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
