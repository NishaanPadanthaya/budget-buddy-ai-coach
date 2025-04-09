
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions for a user
router.get('/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// Add new transaction
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date, userId } = req.body;
    
    const newTransaction = new Transaction({
      amount,
      category,
      description,
      date: date || new Date(),
      userId
    });
    
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
