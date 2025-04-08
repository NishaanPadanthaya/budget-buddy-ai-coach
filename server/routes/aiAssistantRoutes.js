
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const SavingsGoal = require('../models/SavingsGoal');
const { ChatOpenAI } = require('@langchain/openai');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');

// Initialize the OpenAI chat model
const chatModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Get messages for a user
router.get('/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message and get AI response
router.post('/', async (req, res) => {
  try {
    const { content, userId } = req.body;
    
    // Save user message
    const userMessage = new Message({
      content,
      sender: 'user',
      userId
    });
    await userMessage.save();
    
    // Get user's financial data for context
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(10);
    const savingsGoals = await SavingsGoal.find({ userId });
    
    // Calculate total balance
    const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    
    // Prepare context for the AI
    const financialContext = `
      User's current balance: $${balance.toFixed(2)}
      Recent transactions: ${JSON.stringify(transactions.map(t => ({
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date
      })))}
      Savings goals: ${JSON.stringify(savingsGoals.map(g => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        date: g.date
      })))}
    `;
    
    // Generate AI response using the chat model
    const response = await chatModel.invoke([
      { role: "system", content: `You are Budget Buddy, an AI financial assistant. Your goal is to help users manage their finances, provide insights on spending habits, and offer savings advice. Here is the user's current financial context: ${financialContext}` },
      { role: "user", content }
    ]);
    
    // Save AI response
    const aiMessage = new Message({
      content: response.content,
      sender: 'assistant',
      userId
    });
    await aiMessage.save();
    
    // Return both messages
    res.status(201).json({
      userMessage,
      aiMessage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
