
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { verifyToken } = require('./authRoutes');

// Get all transactions for a user (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// Add new transaction (protected route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    const newTransaction = new Transaction({
      amount,
      category,
      description,
      date: date || new Date(),
      userId: req.user.id
    });
    
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
});

// Delete transaction (protected route)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Verify user owns this transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }
    
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
