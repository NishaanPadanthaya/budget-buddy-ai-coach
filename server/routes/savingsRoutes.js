
const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');

// Get all savings goals
router.get('/:userId', async (req, res) => {
  try {
    const savingsGoals = await SavingsGoal.find({ userId: req.params.userId });
    res.json(savingsGoals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new savings goal
router.post('/', async (req, res) => {
  const savingsGoal = new SavingsGoal({
    name: req.body.name,
    targetAmount: req.body.targetAmount,
    currentAmount: req.body.currentAmount || 0,
    date: req.body.date,
    color: req.body.color,
    userId: req.body.userId
  });

  try {
    const newSavingsGoal = await savingsGoal.save();
    res.status(201).json(newSavingsGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a savings goal
router.patch('/:id', async (req, res) => {
  try {
    const updatedGoal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      { $set: { currentAmount: req.body.amount } },
      { new: true }
    );
    res.json(updatedGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
