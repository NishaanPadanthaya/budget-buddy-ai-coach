
const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const { verifyToken } = require('./authRoutes');

// Get all savings goals for a user (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.id });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching savings goals:', err);
    res.status(500).json({ message: 'Server error fetching savings goals' });
  }
});

// Add new savings goal (protected route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, date, color } = req.body;
    
    const newGoal = new SavingsGoal({
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      date: date || new Date(),
      color,
      userId: req.user.id
    });
    
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    console.error('Error adding savings goal:', err);
    res.status(500).json({ message: 'Server error adding savings goal' });
  }
});

// Update savings goal amount (protected route)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const goal = await SavingsGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Verify user owns this goal
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this goal' });
    }
    
    goal.currentAmount = amount;
    
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (err) {
    console.error('Error updating savings goal:', err);
    res.status(500).json({ message: 'Server error updating savings goal' });
  }
});

// Delete savings goal (protected route)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Verify user owns this goal
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this goal' });
    }
    
    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Savings goal deleted' });
  } catch (err) {
    console.error('Error deleting savings goal:', err);
    res.status(500).json({ message: 'Server error deleting savings goal' });
  }
});

module.exports = router;
